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
    const { vehicle_id, fuel_cost, misc_expense, notes } = req.body;
    const newExpense = await db.query(
      `INSERT INTO expenses (vehicle_id, fuel_cost, misc_expense, notes) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicle_id, fuel_cost, misc_expense, notes]
    );
    res.json(newExpense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;