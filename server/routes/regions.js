const express = require('express');
const router = express.Router();
const pool = require('../db');

// get all regions - used on the home page to show region cards
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM Region');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get a single region by id with some extra stats
// counts how many places and news posts are in that region
router.get('/:id', async (req, res) => {
  try {
    const [regions] = await pool.execute('SELECT * FROM Region WHERE RegionID = ?', [req.params.id]);
    if (regions.length === 0) {
      return res.status(404).json({ error: 'Region not found' });
    }

    // also grab a count of places and news posts for this region
    const [placeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM Place WHERE RegionID = ?',
      [req.params.id]
    );
    const [newsCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM NewsPost WHERE RegionID = ?',
      [req.params.id]
    );

    res.json({
      ...regions[0],
      placeCount: placeCount[0].count,
      newsCount: newsCount[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
