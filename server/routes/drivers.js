const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all drivers
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM drivers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available drivers for dispatch (not expired license + not already on trip)
router.get('/available', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM drivers 
      WHERE status != 'On Trip' 
        AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new driver (DB columns: name, license_no, expiry_date, status)
router.post('/', async (req, res) => {
  try {
    const { name, license_no, expiry_date } = req.body;
    const newDriver = await db.query(
      `INSERT INTO drivers (name, license_no, expiry_date, status, completion_rate, safety_score, complaints, trips) 
       VALUES ($1, $2, $3, 'On Duty', 80, 80, 0, 0) RETURNING *`,
      [name, license_no, expiry_date]
    );
    res.json(newDriver.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT toggle driver status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.query(
      'UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update safety score (calculated from completion_rate and complaints)
router.put('/:id/calculate-safety', async (req, res) => {
  try {
    // Safety Score = completion_rate - (complaints * 5), clamped to 0-100
    const result = await db.query(`
      UPDATE drivers 
      SET safety_score = GREATEST(0, LEAST(100, COALESCE(completion_rate, 80) - (COALESCE(complaints, 0) * 5)))
      WHERE id = $1 RETURNING *
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT recalculate ALL driver safety scores
router.put('/recalculate-all/safety', async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE drivers 
      SET safety_score = GREATEST(0, LEAST(100, COALESCE(completion_rate, 80) - (COALESCE(complaints, 0) * 5)))
      RETURNING *
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;