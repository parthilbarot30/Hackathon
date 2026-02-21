const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    // Count active fleet ("On Trip")
    const activeReq = await db.query("SELECT COUNT(*) FROM vehicles WHERE status = 'On Trip'");
    // Count maintenance ("In Shop")
    const maintenanceReq = await db.query("SELECT COUNT(*) FROM vehicles WHERE status = 'In Shop'");
    // Count pending cargo (Trips just created)
    const pendingReq = await db.query("SELECT COUNT(*) FROM trips WHERE status = 'Dispatched'");

    // Get the 5 most recent trips for the table, joining the vehicle and driver names!
    const tripsReq = await db.query(`
      SELECT trips.id, vehicles.name AS vehicle, drivers.name AS driver, trips.status 
      FROM trips 
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id 
      LEFT JOIN drivers ON trips.driver_id = drivers.id 
      ORDER BY trips.id DESC LIMIT 5
    `);

    res.json({
      activeFleet: activeReq.rows[0].count,
      maintenanceAlert: maintenanceReq.rows[0].count,
      pendingCargo: pendingReq.rows[0].count,
      recentTrips: tripsReq.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Extended stats for the Home page stats band
router.get('/stats', async (req, res) => {
  try {
    const [vehiclesRes, driversRes, tripsRes, completedRes] = await Promise.all([
      db.query("SELECT COUNT(*) FROM vehicles"),
      db.query("SELECT COUNT(*) FROM drivers"),
      db.query("SELECT COUNT(*) FROM trips"),
      db.query("SELECT COUNT(*) FROM trips WHERE status = 'Completed'")
    ]);

    res.json({
      totalVehicles: parseInt(vehiclesRes.rows[0].count) || 0,
      totalDrivers: parseInt(driversRes.rows[0].count) || 0,
      totalTrips: parseInt(tripsRes.rows[0].count) || 0,
      completedTrips: parseInt(completedRes.rows[0].count) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;