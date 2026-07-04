const pool = require('./db');
const { sendPushToUser } = require('./push');

async function sendWeeklyDigest() {
  console.log('Running weekly digest...');

  try {
    // Get all users
    const usersResult = await pool.query('SELECT id, display_name FROM users');
    const users = usersResult.rows;

    if (users.length < 2) return;

    // Get last 7 days stats for each user
    const statsResult = await pool.query(`
      SELECT
        user_id,
        COUNT(*) AS activity_count,
        COALESCE(SUM(points), 0) AS total_points,
        disc,
        COALESCE(SUM(points), 0) AS disc_points
      FROM activities
      WHERE status = 'approved'
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY user_id, disc
    `);

    // Aggregate per user
    const userStats = {};
    for (const user of users) {
      userStats[user.id] = { points: 0, activities: 0, topDisc: null, topDiscPoints: 0 };
    }

    for (const row of statsResult.rows) {
      const uid = row.user_id;
      if (!userStats[uid]) continue;
      userStats[uid].points += Number(row.total_points);
      userStats[uid].activities += Number(row.activity_count);
      if (Number(row.disc_points) > userStats[uid].topDiscPoints) {
        userStats[uid].topDisc = row.disc;
        userStats[uid].topDiscPoints = Number(row.disc_points);
      }
    }

    const DISC_LABEL = {
      steps: 'Schritte', run: 'Joggen', bike: 'Fahrrad', ebike: 'E-Bike',
      gym: 'Gym', physio: 'Physio', circus: 'Zirkus', free: 'Freies Training'
    };

    // Send digest to each user
    for (const user of users) {
      const me = userStats[user.id];
      const rival = users.find(u => u.id !== user.id);
      const rivalStats = rival ? userStats[rival.id] : { points: 0, activities: 0 };

      let body = '';
      if (me.points === 0 && rivalStats.points === 0) {
        body = 'Diese Woche war es ruhig. Zeit loszulegen!';
      } else if (me.points > rivalStats.points) {
        body = `Du fuehrst! ${me.points} vs ${rivalStats.points} Punkte. ${me.activities} Aktivitaeten.`;
      } else if (me.points < rivalStats.points) {
        body = `${rival?.display_name || 'Rival'} fuehrt mit ${rivalStats.points} vs deine ${me.points} Punkte. Aufholen!`;
      } else {
        body = `Gleichstand! Beide bei ${me.points} Punkten diese Woche.`;
      }

      if (me.topDisc) {
        body += ` Top: ${DISC_LABEL[me.topDisc] || me.topDisc}.`;
      }

      sendPushToUser(pool, user.id, {
        title: 'Wochen-Recap',
        body,
        url: '/'
      });
    }

    console.log('Weekly digest sent to', users.length, 'users');
  } catch (err) {
    console.error('Weekly digest error:', err);
  }
}

module.exports = { sendWeeklyDigest };
