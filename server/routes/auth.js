const express = require('express');
const router = express.Router();
const pool = require('../db');

// register a new user - takes name, email, home_city in the request body
// inserts into User table and auto-logs them in by saving to session
router.post('/register', async (req, res) => {
  try {
    const { name, email, home_city } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO User (name, email, home_city) VALUES (?, ?, ?)',
      [name, email, home_city]
    );
    const user = { UserID: result.insertId, name, email, home_city };
    req.session.user = user;
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: err.message });
  }
});

// user login - looks up by email, if found saves user to session
// no password for now since this is a school project demo
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.execute('SELECT * FROM User WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No user found with that email' });
    }
    req.session.user = rows[0];
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin login - same idea but checks the Admin table
router.post('/admin-login', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.execute('SELECT * FROM Admin WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'No admin found with that email' });
    }
    req.session.admin = rows[0];
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// logout - destroys the session so the user/admin is no longer authenticated
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Failed to logout' });
    res.json({ message: 'Logged out' });
  });
});

// returns whoever is currently logged in (user or admin or neither)
// the frontend calls this on page load to check if there's an active session
router.get('/me', (req, res) => {
  if (req.session.user) {
    return res.json({ role: 'user', data: req.session.user });
  }
  if (req.session.admin) {
    return res.json({ role: 'admin', data: req.session.admin });
  }
  res.json({ role: null, data: null });
});

module.exports = router;
