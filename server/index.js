// main entry point for the express server
// sets up middleware (cors, json parsing, sessions) and mounts all route files
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// middleware setup - cors lets our react frontend talk to this server
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// session config - stores login state server-side so we know who's logged in
app.use(session({
  secret: process.env.SESSION_SECRET || 'urban-scout-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// mount all our route files under /api
const authRoutes = require('./routes/auth');
const regionRoutes = require('./routes/regions');
const placeRoutes = require('./routes/places');
const transitRoutes = require('./routes/transit');
const newsRoutes = require('./routes/news');
const incidentRoutes = require('./routes/incidents');
const itineraryRoutes = require('./routes/itineraries');
const subscriptionRoutes = require('./routes/subscriptions');

app.use('/api/auth', authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/transit', transitRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Urban Scout server running on port ${PORT}`);
});
