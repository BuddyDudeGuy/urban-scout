const express = require('express');
const router = express.Router();
const pool = require('../db');

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