const express = require('express');
const router = express.Router();
const pool = require('../db');

/*
  get all places, optionally filtered by regionId and type (landmark, eatery, transit)
  joins with the specialization table to get the extra fields
  e.g. GET /api/places?regionId=1&type=landmark
*/
router.get('/', async(req, res) => {
    try {
        const { regionId, type } = req.query;
        let query = '';
        let params = [];

        if (type === 'landmark') {
            query = `
        SELECT p.*, l.landmark_type, l.hours
        FROM Place p
        JOIN Landmark l ON p.PlaceID = l.LandmarkID
        WHERE 1=1
      `;
        } else if (type === 'eatery') {
            query = `
        SELECT p.*, e.avg_cost_per_person
        FROM Place p
        JOIN Eatery e ON p.PlaceID = e.EateryID
        WHERE 1=1
      `;
        } else if (type === 'transit') {
            query = `
        SELECT p.*, ts.station_code
        FROM Place p
        JOIN TransitStation ts ON p.PlaceID = ts.StationID
        WHERE 1=1
      `;
        } else {
            /*
              no type filter - return all places with a "placeType" field
              uses LEFT JOINs to figure out what kind of place each one is
            */
            query = `
        SELECT p.*,
          CASE
            WHEN l.LandmarkID IS NOT NULL THEN 'landmark'
            WHEN e.EateryID IS NOT NULL THEN 'eatery'
            WHEN ts.StationID IS NOT NULL THEN 'transit'
            ELSE 'other'
          END AS placeType,
          l.landmark_type, l.hours,
          e.avg_cost_per_person,
          ts.station_code
        FROM Place p
        LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
        LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
        LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
        WHERE 1=1
      `;
        }

        if (regionId) {
            query += ' AND p.RegionID = ?';
            params.push(regionId);
        }

        query += ' ORDER BY p.name';
        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  get a single place by id with all its details
  figures out what type it is and includes specialization data
  also grabs nearby transit stations from the Services table
*/
router.get('/:id', async(req, res) => {
    try {
        const placeId = req.params.id;

        /*
          get the base place info with specialization data
        */
        const [places] = await pool.execute(`
      SELECT p.*,
        l.landmark_type, l.hours,
        e.avg_cost_per_person,
        ts.station_code,
        CASE
          WHEN l.LandmarkID IS NOT NULL THEN 'landmark'
          WHEN e.EateryID IS NOT NULL THEN 'eatery'
          WHEN ts.StationID IS NOT NULL THEN 'transit'
          ELSE 'other'
        END AS placeType
      FROM Place p
      LEFT JOIN Landmark l ON p.PlaceID = l.LandmarkID
      LEFT JOIN Eatery e ON p.PlaceID = e.EateryID
      LEFT JOIN TransitStation ts ON p.PlaceID = ts.StationID
      WHERE p.PlaceID = ?
    `, [placeId]);

        if (places.length === 0) {
            return res.status(404).json({ error: 'Place not found' });
        }

        /*
          find nearby transit stations using the Services table (sorted by distance)
        */
        const [nearbyStations] = await pool.execute(`
      SELECT s.distance_m, p.name AS station_name, ts.station_code, p.PlaceID AS StationPlaceID
      FROM Services s
      JOIN Place p ON s.StationID = p.PlaceID
      JOIN TransitStation ts ON s.StationID = ts.StationID
      WHERE s.PlaceID = ?
      ORDER BY s.distance_m ASC
    `, [placeId]);

        res.json({...places[0], nearbyStations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', requireAdmin, async(req, res) => {
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const {
            name,
            address,
            coordinates,
            RegionID,
            type,
            landmark_type,
            hours,
            avg_cost_per_person,
            station_code
        } = req.body;

        const [placeResult] = await conn.execute(
            `INSERT INTO Place (name, address, coordinates, RegionID)
       VALUES (?, ?, ?, ?)`, [name, address, coordinates, RegionID]
        );

        const placeId = placeResult.insertId;

        if (type === 'landmark') {
            await conn.execute(
                `INSERT INTO Landmark (LandmarkID, landmark_type, hours)
         VALUES (?, ?, ?)`, [placeId, landmark_type, hours]
            );
        } else if (type === 'eatery') {
            await conn.execute(
                `INSERT INTO Eatery (EateryID, avg_cost_per_person)
         VALUES (?, ?)`, [placeId, avg_cost_per_person]
            );
        } else if (type === 'transit_station') {
            await conn.execute(
                `INSERT INTO TransitStation (StationID, station_code)
         VALUES (?, ?)`, [placeId, station_code]
            );
        } else {
            throw new Error('Invalid place type');
        }

        await conn.commit();
        res.status(201).json({ message: 'Place created successfully', placeId });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;