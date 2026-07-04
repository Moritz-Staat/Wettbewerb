const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /me — get current user
router.get('/me', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, display_name FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = result.rows[0];
    res.json({ id: u.id, username: u.username, displayName: u.display_name });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /rival — get the other player
router.get('/rival', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, display_name FROM users WHERE id != $1 LIMIT 1',
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'No rival found' });
    }
    const u = result.rows[0];
    res.json({ id: u.id, username: u.username, displayName: u.display_name });
  } catch (err) {
    console.error('Rival error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /scores — get point totals
router.get('/scores', auth, async (req, res) => {
  try {
    const { period } = req.query;
    let query = `
      SELECT user_id, COALESCE(SUM(points), 0) AS points
      FROM activities
      WHERE status = 'approved'
    `;

    if (period === 'month') {
      query += ` AND date >= date_trunc('month', CURRENT_DATE)`;
    }

    query += ' GROUP BY user_id';

    const result = await pool.query(query);

    // Find rival
    const rivalResult = await pool.query(
      'SELECT id FROM users WHERE id != $1 LIMIT 1',
      [req.user.id]
    );
    const rivalId = rivalResult.rows[0]?.id;

    const scores = { me: 0, rival: 0 };
    for (const row of result.rows) {
      if (row.user_id === req.user.id) {
        scores.me = Number(row.points);
      } else if (row.user_id === rivalId) {
        scores.rival = Number(row.points);
      }
    }

    res.json(scores);
  } catch (err) {
    console.error('Scores error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /stats — monthly point totals + discipline breakdown
router.get('/stats', auth, async (req, res) => {
  try {
    const months = parseInt(req.query.months, 10) || 6;

    // Find rival
    const rivalResult = await pool.query(
      'SELECT id FROM users WHERE id != $1 LIMIT 1',
      [req.user.id]
    );
    const rivalId = rivalResult.rows[0]?.id;

    // Monthly points for both users
    const monthlyResult = await pool.query(`
      SELECT
        to_char(date, 'YYYY-MM') AS month,
        user_id,
        COALESCE(SUM(points), 0) AS points
      FROM activities
      WHERE status = 'approved'
        AND date >= (date_trunc('month', CURRENT_DATE) - ($1 - 1) * interval '1 month')
      GROUP BY month, user_id
      ORDER BY month
    `, [months]);

    // Build month list
    const monthSet = new Set();
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      monthSet.add(key);
    }
    const monthList = [...monthSet].sort();

    const meByMonth = {};
    const rivalByMonth = {};
    for (const row of monthlyResult.rows) {
      if (row.user_id === req.user.id) {
        meByMonth[row.month] = Number(row.points);
      } else if (row.user_id === rivalId) {
        rivalByMonth[row.month] = Number(row.points);
      }
    }

    const me = monthList.map(m => meByMonth[m] || 0);
    const rival = monthList.map(m => rivalByMonth[m] || 0);

    // Points by discipline for current user
    const discResult = await pool.query(`
      SELECT disc, COALESCE(SUM(points), 0) AS points
      FROM activities
      WHERE status = 'approved' AND user_id = $1
      GROUP BY disc
    `, [req.user.id]);

    const byDisc = {};
    for (const row of discResult.rows) {
      byDisc[row.disc] = Number(row.points);
    }

    res.json({ months: monthList, me, rival, byDisc });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
