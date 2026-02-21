const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT maintenance.*, vehicles.name AS vehicle_name, vehicles.license_plate 
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
    const { vehicle_id, service_type, cost, notes } = req.body;

    const newLog = await db.query(
      `INSERT INTO maintenance (vehicle_id, service_type, cost, notes) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicle_id, service_type, cost, notes]
    );

    // Auto-update vehicle status to 'In Shop'
    await db.query(`UPDATE vehicles SET status = 'In Shop' WHERE id = $1`, [vehicle_id]);

    // Also auto-create an expense entry for this maintenance cost
    if (cost) {
      await db.query(
        `INSERT INTO expenses (vehicle_id, fuel_cost, misc_expense, notes) 
         VALUES ($1, 0, $2, $3)`,
        [vehicle_id, cost, `Maintenance: ${service_type || 'Service'}`]
      );
    }

    res.json(newLog.rows[0]);
  } catch (err) {
    console.error('Maintenance POST error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Mark maintenance as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE maintenance SET status = 'Completed' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    // Set vehicle back to Available
    if (result.rows[0].vehicle_id) {
      await db.query(`UPDATE vehicles SET status = 'Available' WHERE id = $1`, [result.rows[0].vehicle_id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;