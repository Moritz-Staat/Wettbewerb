const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../db');
const auth = require('../middleware/auth');
const { sendPushToUser } = require('../push');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Scoring rules
function calculatePoints(disc, value) {
  const v = Number(value);
  switch (disc) {
    case 'steps': return v >= 4000 ? Math.floor(v / 100) : 0;
    case 'run': return Math.round(v * 5 * 10) / 10;
    case 'bike': return Math.round(v * 2 * 10) / 10;
    case 'ebike': return Math.round(v * 1 * 10) / 10;
    case 'gym': return 30;
    case 'physio': return Math.floor(v / 15) * 10;
    case 'circus': return Math.floor(v / 30) * 15;
    case 'free': return v || 0;
    default: return 0;
  }
}

function formatActivity(row) {
  return {
    id: row.id,
    user: row.username,
    displayName: row.display_name,
    disc: row.disc,
    value: Number(row.value),
    pts: Number(row.points),
    date: row.date,
    note: row.note || '',
    photo: row.photo,
    together: row.together,
    initiator: row.initiator,
    status: row.status,
    createdAt: row.created_at,
  };
}

router.use(auth);

// GET / — list activities
router.get('/', async (req, res) => {
  try {
    const { period } = req.query;
    let query = `
      SELECT a.*, u.username, u.display_name
      FROM activities a
      JOIN users u ON u.id = a.user_id
    `;

    if (period === 'month') {
      query += ` WHERE a.date >= date_trunc('month', CURRENT_DATE)`;
    }

    query += ' ORDER BY a.date DESC, a.created_at DESC';

    const result = await pool.query(query);
    res.json(result.rows.map(formatActivity));
  } catch (err) {
    console.error('List activities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST / — create activity
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { disc, value, date, note, together, initiator } = req.body;
    if (!disc) {
      return res.status(400).json({ error: 'disc is required' });
    }

    const points = calculatePoints(disc, value || 0);
    const isTogether = together === 'true' || together === true;
    const isInitiator = initiator === 'true' || initiator === 'me' || initiator === true;
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
    const status = disc === 'steps' ? 'approved' : 'pending';

    // Bonus points if together and user is initiator
    const bonusPoints = isTogether && isInitiator ? 2 : 0;
    const totalPoints = points + bonusPoints;

    const result = await pool.query(
      `INSERT INTO activities (user_id, disc, value, points, date, note, photo, status, together, initiator, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        req.user.id,
        disc,
        Number(value) || 0,
        totalPoints,
        date || new Date().toISOString().slice(0, 10),
        note || '',
        photoPath,
        status,
        isTogether,
        isInitiator,
      ]
    );

    // If together and the rival initiated (not the current user), create bonus entry for rival
    if (isTogether && !isInitiator) {
      const rivalResult = await pool.query(
        'SELECT id FROM users WHERE id != $1 LIMIT 1',
        [req.user.id]
      );
      if (rivalResult.rows.length) {
        const rivalId = rivalResult.rows[0].id;
        await pool.query(
          `INSERT INTO activities (user_id, disc, value, points, date, note, photo, status, together, initiator, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            rivalId,
            disc,
            Number(value) || 0,
            points + 2,
            date || new Date().toISOString().slice(0, 10),
            note ? `[together] ${note}` : '[together]',
            photoPath,
            disc === 'steps' ? 'approved' : 'pending',
            true,
            true,
          ]
        );
      }
    }

    // Send push notification to rival
    if (status === 'pending') {
      const rivalResult2 = await pool.query('SELECT id, display_name FROM users WHERE id != $1 LIMIT 1', [req.user.id]);
      if (rivalResult2.rows.length) {
        const meResult = await pool.query('SELECT display_name FROM users WHERE id = $1', [req.user.id]);
        const meName = meResult.rows[0]?.display_name || 'Jemand';
        sendPushToUser(pool, rivalResult2.rows[0].id, {
          title: 'Neue Aktivität!',
          body: `${meName} hat eine Aktivität eingetragen. Bestätigen?`,
          url: '/'
        });
      }
    }

    // Return with username joined
    const full = await pool.query(
      `SELECT a.*, u.username, u.display_name FROM activities a JOIN users u ON u.id = a.user_id WHERE a.id = $1`,
      [result.rows[0].id]
    );
    res.status(201).json(formatActivity(full.rows[0]));
  } catch (err) {
    console.error('Create activity error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const actResult = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (!actResult.rows.length) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = actResult.rows[0];

    // Allow self-approval only when no rival exists (single-user mode)
    if (activity.user_id === req.user.id) {
      const userCount = await pool.query('SELECT COUNT(*)::int AS cnt FROM users');
      if (userCount.rows[0].cnt >= 2) {
        return res.status(403).json({ error: 'Cannot approve your own activity' });
      }
    }

    const result = await pool.query(
      'UPDATE activities SET status = $1 WHERE id = $2 RETURNING *',
      ['approved', id]
    );

    // Send push notification to activity owner
    const meResult = await pool.query('SELECT display_name FROM users WHERE id = $1', [req.user.id]);
    const meName = meResult.rows[0]?.display_name || 'Dein Gegner';
    sendPushToUser(pool, activity.user_id, {
      title: 'Aktivität bestätigt!',
      body: `${meName} hat deine Aktivität bestätigt. +${activity.points} Punkte!`,
      url: '/'
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const actResult = await pool.query('SELECT * FROM activities WHERE id = $1', [id]);
    if (!actResult.rows.length) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = actResult.rows[0];

    if (activity.user_id === req.user.id) {
      const userCount = await pool.query('SELECT COUNT(*)::int AS cnt FROM users');
      if (userCount.rows[0].cnt >= 2) {
        return res.status(403).json({ error: 'Cannot reject your own activity' });
      }
    }

    await pool.query('DELETE FROM activities WHERE id = $1', [id]);

    // Send push notification to activity owner
    const meResult = await pool.query('SELECT display_name FROM users WHERE id = $1', [req.user.id]);
    const meName = meResult.rows[0]?.display_name || 'Dein Gegner';
    sendPushToUser(pool, activity.user_id, {
      title: 'Aktivität abgelehnt',
      body: `${meName} hat deine Aktivität abgelehnt.`,
      url: '/'
    });

    res.json({ message: 'Activity rejected and deleted' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
