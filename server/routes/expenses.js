const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { tripId, driver, fuelCost, miscExpense } = req.body;
    const newExpense = await db.query(
      `INSERT INTO expenses (trip_id, driver_name, fuel_cost, misc_expense) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [tripId, driver, fuelCost, miscExpense]
    );
    res.json(newExpense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;