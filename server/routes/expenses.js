const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM expenses ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new expense
// DB columns: trip_id, driver_name, fuel_cost, misc_expense, distance, status, created_at
router.post('/', async (req, res) => {
  try {
    const { trip_id, driver_name, fuel_cost, misc_expense, distance, status } = req.body;
    const newExpense = await db.query(
      `INSERT INTO expenses (trip_id, driver_name, fuel_cost, misc_expense, distance, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [trip_id || null, driver_name || '', fuel_cost || 0, misc_expense || 0, distance || '', status || 'Recorded']
    );
    res.json(newExpense.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;