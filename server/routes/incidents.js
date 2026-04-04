const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireUser, requireAdmin } = require('../middleware/auth');

/* get all incident reports submitted by the logged-in user
   shows them the status of their reports so they know if an admin verified them */
router.get('/mine', requireUser, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT ir.*, r.name AS region_name,
        v.Status AS verification_status, a.name AS verifier_name
      FROM IncidentReport ir
      JOIN Region r ON ir.RegionID = r.RegionID
      LEFT JOIN Verifies v ON ir.Report_ID = v.ReportID
      LEFT JOIN Admin a ON v.AdminID = a.AdminID
      WHERE ir.UserID = ?
      ORDER BY ir.timestamp DESC
    `, [req.session.user.UserID]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  get incident reports, optionally filtered by region
  joins with User to show who reported it, and Verifies to show verification status
*/
router.get('/', async (req, res) => {
  try {
    const { regionId } = req.query;
    let query = `
      SELECT ir.*, u.name AS reporter_name,
        v.AdminID AS verifier_id, v.Status AS verification_status,
        a.name AS verifier_name
      FROM IncidentReport ir
      JOIN User u ON ir.UserID = u.UserID
      LEFT JOIN Verifies v ON ir.Report_ID = v.ReportID
      LEFT JOIN Admin a ON v.AdminID = a.AdminID
    `;
    let params = [];

    if (regionId) {
      query += ' WHERE ir.RegionID = ?';
      params.push(regionId);
    }

    query += ' ORDER BY ir.timestamp DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  user submits a new incident report
  category should be one of: theft, road_hazard, crowd, safety, other
  severity should be: low, medium, high
*/
router.post('/', requireUser, async (req, res) => {
  try {
    const { category, description, severity, coordinates, regionId } = req.body;
    const userId = req.session.user.UserID;

    const [result] = await pool.execute(
      'INSERT INTO IncidentReport (category, description, severity, coordinates, UserID, RegionID) VALUES (?, ?, ?, ?, ?, ?)',
      [category, description, severity, coordinates, userId, regionId]
    );

    res.status(201).json({ Report_ID: result.insertId, message: 'Incident reported' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  admin verifies (confirms or rejects) an incident report
  creates or updates a row in the Verifies junction table
  use REPLACE so it works whether there's already a row or not
*/
router.put('/:reportId/verify', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const adminId = req.session.admin.AdminID;
    const reportId = req.params.reportId;

    await pool.execute(
      'REPLACE INTO Verifies (AdminID, ReportID, Status) VALUES (?, ?, ?)',
      [adminId, reportId, status]
    );

    res.json({ message: `Report ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
