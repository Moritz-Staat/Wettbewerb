require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const userRoutes = require('./routes/users');
const pushRoutes = require('./routes/push');

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
});
