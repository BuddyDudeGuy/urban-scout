const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

/*
  get all transit routes with their service hours
*/
router.get('/routes', async(req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM TransitRoute');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  admin only - add a new transit route
  inserts a row into TransitRoute and returns the newly created RouteID
*/
router.post('/routes', requireAdmin, async(req, res) => {
    try {
        const { route_name, service_hours } = req.body;

        if (!route_name || !route_name.trim()) {
            return res.status(400).json({ error: 'Route name is required' });
        }

        const [result] = await pool.execute(
            `INSERT INTO TransitRoute (route_name, service_hours) VALUES (?, ?)`,
            [route_name.trim(), service_hours ? service_hours.trim() : null]
        );

        res.status(201).json({
            message: 'Route created successfully',
            RouteID: result.insertId,
            route_name: route_name.trim(),
            service_hours: service_hours ? service_hours.trim() : null,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  admin only - delete a transit route
  cascades to Serves through the FK constraint so any route stops also get cleaned up
*/
router.delete('/routes/:id', requireAdmin, async(req, res) => {
    try {
        const routeId = req.params.id;

        const [result] = await pool.execute(
            `DELETE FROM TransitRoute WHERE RouteID = ?`,
            [routeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }

        res.json({ message: 'Route deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  admin only - link a station and a transit vehicle to a route
  inserts a row into Serves (RouteID, StationID, TransitID)
  this is how we say "transit X stops at station Y as part of route Z"
*/
router.post('/routes/:id/stations', requireAdmin, async(req, res) => {
    try {
        const routeId = req.params.id;
        const { StationID, TransitID } = req.body;

        if (!StationID || !TransitID) {
            return res.status(400).json({ error: 'StationID and TransitID are required' });
        }

        await pool.execute(
            `INSERT INTO Serves (RouteID, StationID, TransitID) VALUES (?, ?, ?)`,
            [routeId, StationID, TransitID]
        );

        res.status(201).json({ message: 'Stop added to route successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  admin only - remove a stop (station + transit) from a route
*/
router.delete('/routes/:id/stations', requireAdmin, async(req, res) => {
    try {
        const routeId = req.params.id;
        const { StationID, TransitID } = req.body;

        if (!StationID || !TransitID) {
            return res.status(400).json({ error: 'StationID and TransitID are required' });
        }

        const [result] = await pool.execute(
            `DELETE FROM Serves WHERE RouteID = ? AND StationID = ? AND TransitID = ?`,
            [routeId, StationID, TransitID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Stop not found on this route' });
        }

        res.json({ message: 'Stop removed from route successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  get the list of stops (station + transit vehicle pairs) that belong to a route
  joins through Serves to grab the station name and vehicle label
*/
router.get('/routes/:id/stations', async(req, res) => {
    try {
        const routeId = req.params.id;

        const [rows] = await pool.execute(`
            SELECT sv.StationID, sv.TransitID,
                   p.name AS station_name, ts.station_code,
                   pt.route_label, pt.vehicle_type
            FROM Serves sv
            JOIN TransitStation ts ON sv.StationID = ts.StationID
            JOIN Place p ON ts.StationID = p.PlaceID
            JOIN PublicTransit pt ON sv.TransitID = pt.TransitID
            WHERE sv.RouteID = ?
            ORDER BY p.name
        `, [routeId]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  get all public transit vehicles, optionally filtered by vehicle type
  e.g. GET /api/transit/vehicles?type=Bus
*/
router.get('/vehicles', async(req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM PublicTransit';
        let params = [];

        if (type) {
            query += ' WHERE vehicle_type = ?';
            params.push(type);
        }

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  get the full schedule for a specific transit station
  joins a bunch of tables to show what transit lines stop there
  and their arrival/departure times - this is the big showcase query
*/
router.get('/stations/:id/schedule', async(req, res) => {
    try {
        const stationId = req.params.id;

        /*
          first get the station info
        */
        const [station] = await pool.execute(`
      SELECT p.name, p.address, p.coordinates, ts.station_code
      FROM Place p
      JOIN TransitStation ts ON p.PlaceID = ts.StationID
      WHERE ts.StationID = ?
    `, [stationId]);

        if (station.length === 0) {
            return res.status(404).json({ error: 'Station not found' });
        }

        /*
          get all arrivals at this station with the transit vehicle info
        */
        const [arrivals] = await pool.execute(`
      SELECT at.arrival_time, pt.route_label, pt.vehicle_type, pt.TransitID
      FROM Arrival_times at
      JOIN PublicTransit pt ON at.TransitID = pt.TransitID
      WHERE at.StationID = ?
      ORDER BY at.arrival_time
    `, [stationId]);

        /*
          get all departures at this station
        */
        const [departures] = await pool.execute(`
      SELECT dt.departure_time, pt.route_label, pt.vehicle_type, pt.TransitID
      FROM Departure_times dt
      JOIN PublicTransit pt ON dt.TransitID = pt.TransitID
      WHERE dt.StationID = ?
      ORDER BY dt.departure_time
    `, [stationId]);

        /*
          get which routes serve this station
        */
        const [routes] = await pool.execute(`
      SELECT DISTINCT tr.RouteID, tr.route_name, tr.service_hours
      FROM Serves sv
      JOIN TransitRoute tr ON sv.RouteID = tr.RouteID
      WHERE sv.StationID = ?
    `, [stationId]);

        res.json({
            station: station[0],
            routes,
            arrivals,
            departures,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/*
  get all places within walking distance of a transit station
  calls the sp_nearby_places stored procedure to find places near a station
*/
router.get('/stations/:id/nearby', async(req, res) => {
    try {
        const stationId = req.params.id;
        const maxDistance = req.query.maxDistance || 5000;
        const [rows] = await pool.execute('CALL sp_nearby_places(?, ?)', [stationId, maxDistance]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;