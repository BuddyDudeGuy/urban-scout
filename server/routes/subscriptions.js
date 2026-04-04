const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireUser } = require('../middleware/auth');

/*
  get all regions the logged-in user is subscribed to
  joins with Region to get the full region info, not just the IDs
*/
router.get('/', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT r.*
      FROM Subscribes_to st
      JOIN Region r ON st.RegionID = r.RegionID
      WHERE st.UserID = ?
    `, [req.session.user.UserID]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  subscribe to a region - just inserts into the junction table
  uses IGNORE so it doesn't blow up if they're already subscribed
*/
router.post('/', requireUser, async (req, res) => {
  try {
    const { regionId } = req.body;
    await pool.execute(
      'INSERT IGNORE INTO Subscribes_to (UserID, RegionID) VALUES (?, ?)',
      [req.session.user.UserID, regionId]
    );
    res.status(201).json({ message: 'Subscribed to region' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  unsubscribe from a region
*/
router.delete('/:regionId', requireUser, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM Subscribes_to WHERE UserID = ? AND RegionID = ?',
      [req.session.user.UserID, req.params.regionId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    res.json({ message: 'Unsubscribed from region' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
