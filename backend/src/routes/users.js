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

module.exports = router;
