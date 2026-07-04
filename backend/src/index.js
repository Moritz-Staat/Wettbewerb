require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const userRoutes = require('./routes/users');
const pushRoutes = require('./routes/push');
const { sendWeeklyDigest } = require('./digest');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/push', pushRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SportDuel backend listening on port ${PORT}`);

  // Weekly digest - check every hour if it's Monday 9:00
  function scheduleDigest() {
    const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
    let lastSent = null;

    setInterval(() => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun, 1=Mon
      const hour = now.getHours();
      const dateKey = now.toISOString().slice(0, 10);

      if (day === 1 && hour === 9 && lastSent !== dateKey) {
        lastSent = dateKey;
        sendWeeklyDigest();
      }
    }, CHECK_INTERVAL);

    console.log('Weekly digest scheduler started (Monday 9:00)');
  }

  scheduleDigest();
});
