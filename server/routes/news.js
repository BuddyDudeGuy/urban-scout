const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

/*
  get news posts, optionally filtered by region
  LEFT JOINs with SafetyAlert so we can show alerts alongside the post
  e.g. GET /api/news?regionId=1
*/
router.get('/', async (req, res) => {
  try {
    const { regionId } = req.query;
    let query = `
      SELECT np.*, r.name AS region_name, a.name AS admin_name,
        sa.AlertNo, sa.alert_type, sa.area_text, sa.severity_override
      FROM NewsPost np
      JOIN Region r ON np.RegionID = r.RegionID
      JOIN Admin a ON np.AdminID = a.AdminID
      LEFT JOIN SafetyAlert sa ON np.NewsID = sa.NewsID
    `;
    let params = [];

    if (regionId) {
      query += ' WHERE np.RegionID = ?';
      params.push(regionId);
    }

    query += ' ORDER BY np.time_stamp DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  get a single news post by id with its safety alerts
*/
router.get('/:id', async (req, res) => {
  try {
    const [posts] = await pool.execute(`
      SELECT np.*, r.name AS region_name, a.name AS admin_name
      FROM NewsPost np
      JOIN Region r ON np.RegionID = r.RegionID
      JOIN Admin a ON np.AdminID = a.AdminID
      WHERE np.NewsID = ?
    `, [req.params.id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'News post not found' });
    }

    /*
      grab all safety alerts attached to this post
    */
    const [alerts] = await pool.execute(
      'SELECT * FROM SafetyAlert WHERE NewsID = ?',
      [req.params.id]
    );

    res.json({ ...posts[0], alerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  admin creates a new news post, optionally with a safety alert
  only admins can do this (requireAdmin middleware)
*/
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, severity, body_text, regionId, alert } = req.body;
    const adminId = req.session.admin.AdminID;

    /*
      insert the news post
    */
    const [result] = await pool.execute(
      'INSERT INTO NewsPost (title, severity, body_text, RegionID, AdminID) VALUES (?, ?, ?, ?, ?)',
      [title, severity, body_text, regionId, adminId]
    );

    const newsId = result.insertId;

    /*
      if they also want to attach a safety alert, insert that too
    */
    if (alert) {
      await pool.execute(
        'INSERT INTO SafetyAlert (NewsID, AlertNo, alert_type, area_text, severity_override) VALUES (?, 1, ?, ?, ?)',
        [newsId, alert.alert_type, alert.area_text, alert.severity_override || null]
      );
    }

    res.status(201).json({ NewsID: newsId, message: 'News post created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  track that a user viewed a news post (inserts into Views table)
  uses IGNORE so it doesn't error if they already viewed it
*/
router.post('/:id/view', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Must be logged in' });
    }
    await pool.execute(
      'INSERT IGNORE INTO Views (UserID, NewsID) VALUES (?, ?)',
      [req.session.user.UserID, req.params.id]
    );
    res.json({ message: 'View recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
