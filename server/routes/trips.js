const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT trips.*, vehicles.name AS type, drivers.name AS driver_name
      FROM trips 
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
      LEFT JOIN drivers ON trips.driver_id = drivers.id
      ORDER BY trips.id DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vehicleId, driverId, origin, destination, cargoDesc, weight, status } = req.body;
    const tripStatus = status || 'On Trip';

    const newTrip = await db.query(
      `INSERT INTO trips (vehicle_id, driver_id, origin, destination, cargo_weight, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicleId, driverId, origin, destination, weight || 0, tripStatus]
    );

    // Auto-update vehicle and driver status to "On Trip" if dispatched (not draft)
    if (tripStatus === 'On Trip') {
      if (vehicleId) await db.query(`UPDATE vehicles SET status = 'On Trip' WHERE id = $1`, [vehicleId]);
      if (driverId) await db.query(`UPDATE drivers SET status = 'On Trip' WHERE id = $1`, [driverId]);
    }

    res.json(newTrip.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT — Change trip status (Draft→On Trip, On Trip→Completed, any→Cancelled)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const tripId = req.params.id;

    // Get current trip data first
    const currentTrip = await db.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (currentTrip.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const trip = currentTrip.rows[0];
    const oldStatus = trip.status;

    // Update trip status
    const result = await db.query(
      'UPDATE trips SET status = $1 WHERE id = $2 RETURNING *',
      [status, tripId]
    );

    // Handle vehicle and driver status changes
    if (status === 'On Trip' && oldStatus === 'Draft') {
      // Draft → Dispatched: mark vehicle & driver as On Trip
      if (trip.vehicle_id) await db.query(`UPDATE vehicles SET status = 'On Trip' WHERE id = $1`, [trip.vehicle_id]);
      if (trip.driver_id) await db.query(`UPDATE drivers SET status = 'On Trip' WHERE id = $1`, [trip.driver_id]);
    } else if (status === 'Completed' || status === 'Cancelled') {
      // Completed or Cancelled: free up vehicle & driver
      if (trip.vehicle_id) await db.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [trip.vehicle_id]);
      if (trip.driver_id) await db.query(`UPDATE drivers SET status = 'On Duty' WHERE id = $1`, [trip.driver_id]);

      // If completed, increment driver's completion_rate
      if (status === 'Completed' && trip.driver_id) {
        await db.query(`UPDATE drivers SET completion_rate = LEAST(100, COALESCE(completion_rate, 80) + 1), trips = COALESCE(trips, 0) + 1 WHERE id = $1`, [trip.driver_id]);
      }
    }

    // Return trip with joined names
    const updated = await db.query(`
      SELECT trips.*, vehicles.name AS type, drivers.name AS driver_name
      FROM trips LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
      LEFT JOIN drivers ON trips.driver_id = drivers.id
      WHERE trips.id = $1
    `, [tripId]);

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;