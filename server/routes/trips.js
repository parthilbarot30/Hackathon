const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT trips.*, vehicles.name AS type 
      FROM trips 
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
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
    const { vehicleId, driverId, cargoWeight, origin, destination, fuelCost } = req.body;
    const newTrip = await db.query(
      `INSERT INTO trips (vehicle_id, driver_id, cargo_weight, origin, destination, estimated_fuel_cost) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicleId, driverId, cargoWeight, origin, destination, fuelCost]
    );
    
    // Auto-update the vehicle and driver status to "On Trip"
    await db.query(`UPDATE vehicles SET status = 'On Trip' WHERE id = $1`, [vehicleId]);
    await db.query(`UPDATE drivers SET status = 'On Trip' WHERE id = $1`, [driverId]);

    res.json(newTrip.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;