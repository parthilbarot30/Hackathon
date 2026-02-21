const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT maintenance.*, vehicles.name AS vehicle 
      FROM maintenance 
      LEFT JOIN vehicles ON maintenance.vehicle_id = vehicles.id
      ORDER BY maintenance.id DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vehicleId, issue, date, cost } = req.body;
    
    const newLog = await db.query(
      `INSERT INTO maintenance (vehicle_id, issue, service_date, cost) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicleId, issue, date, cost]
    );

    // CORE LOGIC: Auto-hide the vehicle from the Dispatcher!
    await db.query(`UPDATE vehicles SET status = 'In Shop' WHERE id = $1`, [vehicleId]);

    res.json(newLog.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;