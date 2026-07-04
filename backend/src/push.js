const webpush = require('web-push');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:sportduel@example.com',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

async function sendPushToUser(pool, userId, payload) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  try {
    const result = await pool.query(
      'SELECT subscription FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    const message = JSON.stringify(payload);

    for (const row of result.rows) {
      try {
        await webpush.sendNotification(row.subscription, message);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired, remove it
          await pool.query(
            'DELETE FROM push_subscriptions WHERE user_id = $1 AND subscription = $2',
            [userId, JSON.stringify(row.subscription)]
          );
        }
        console.error('Push send error:', err.statusCode || err.message);
      }
    }
  } catch (err) {
    console.error('sendPushToUser error:', err);
  }
}

module.exports = { sendPushToUser, VAPID_PUBLIC };
