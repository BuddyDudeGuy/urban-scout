const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireUser } = require('../middleware/auth');

/*
 * get all itineraries for the logged-in user
 */
router.get('/', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Itinerary WHERE UserID = ? ORDER BY start_date DESC',
      [req.session.user.UserID]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * get a single itinerary with all its items and the places they reference
 * this is the big join - Itinerary -> ItineraryItem -> References -> Place
 */
router.get('/:id', requireUser, async (req, res) => {
  try {
    const [itineraries] = await pool.execute(
      'SELECT * FROM Itinerary WHERE ItineraryID = ? AND UserID = ?',
      [req.params.id, req.session.user.UserID]
    );

    if (itineraries.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    /* grab all items with their referenced place info */
    const [items] = await pool.execute(`
      SELECT ii.ItemNo, ii.planned_time, ii.notes,
        p.PlaceID, p.name AS place_name, p.address, p.coordinates
      FROM ItineraryItem ii
      LEFT JOIN \`References\` r ON ii.ItineraryID = r.ItineraryID AND ii.ItemNo = r.ItemNo
      LEFT JOIN Place p ON r.PlaceID = p.PlaceID
      WHERE ii.ItineraryID = ?
      ORDER BY ii.planned_time
    `, [req.params.id]);

    res.json({ ...itineraries[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * create a new itinerary
 */
router.post('/', requireUser, async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO Itinerary (title, start_date, end_date, UserID) VALUES (?, ?, ?, ?)',
      [title, start_date, end_date, req.session.user.UserID]
    );
    res.status(201).json({ ItineraryID: result.insertId, message: 'Itinerary created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * delete an itinerary (cascades to items and references)
 */
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM Itinerary WHERE ItineraryID = ? AND UserID = ?',
      [req.params.id, req.session.user.UserID]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.json({ message: 'Itinerary deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * add an item to an itinerary
 * figures out the next ItemNo automatically so we don't have to track it manually
 * also links it to a place via the References table if placeId is provided
 */
router.post('/:id/items', requireUser, async (req, res) => {
  try {
    const itineraryId = req.params.id;
    const { planned_time, notes, placeId } = req.body;

    /* make sure this itinerary belongs to the user */
    const [owns] = await pool.execute(
      'SELECT ItineraryID FROM Itinerary WHERE ItineraryID = ? AND UserID = ?',
      [itineraryId, req.session.user.UserID]
    );
    if (owns.length === 0) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    /* figure out the next item number */
    const [maxItem] = await pool.execute(
      'SELECT COALESCE(MAX(ItemNo), 0) + 1 AS nextNo FROM ItineraryItem WHERE ItineraryID = ?',
      [itineraryId]
    );
    const itemNo = maxItem[0].nextNo;

    /* insert the item */
    await pool.execute(
      'INSERT INTO ItineraryItem (ItineraryID, ItemNo, planned_time, notes) VALUES (?, ?, ?, ?)',
      [itineraryId, itemNo, planned_time || null, notes || null]
    );

    /* if they picked a place, link it in the References table */
    if (placeId) {
      await pool.execute(
        'INSERT INTO `References` (PlaceID, ItineraryID, ItemNo) VALUES (?, ?, ?)',
        [placeId, itineraryId, itemNo]
      );
    }

    res.status(201).json({ ItemNo: itemNo, message: 'Item added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * update an itinerary item's notes or planned time
 */
router.put('/:id/items/:itemNo', requireUser, async (req, res) => {
  try {
    const { planned_time, notes } = req.body;
    const [result] = await pool.execute(
      'UPDATE ItineraryItem SET planned_time = ?, notes = ? WHERE ItineraryID = ? AND ItemNo = ?',
      [planned_time || null, notes, req.params.id, req.params.itemNo]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
 * remove an item from an itinerary (cascades to References)
 */
router.delete('/:id/items/:itemNo', requireUser, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM ItineraryItem WHERE ItineraryID = ? AND ItemNo = ?',
      [req.params.id, req.params.itemNo]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
