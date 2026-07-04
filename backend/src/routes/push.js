const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { VAPID_PUBLIC } = require('../push');

const router = express.Router();

// GET /vapid-key — return public VAPID key
router.get('/vapid-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// POST /subscribe — save push subscription
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    await pool.query(
      `INSERT INTO push_subscriptions (user_id, subscription)
       VALUES ($1, $2)
       ON CONFLICT (user_id, subscription) DO NOTHING`,
      [req.user.id, JSON.stringify(subscription)]
    );

    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /subscribe — unsubscribe
router.delete('/subscribe', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ message: 'Unsubscribed' });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
