const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM drivers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, license, expiry } = req.body;
    const newDriver = await db.query(
      `INSERT INTO drivers (name, license_no, expiry_date) VALUES ($1, $2, $3) RETURNING *`,
      [name, license, expiry]
    );
    res.json(newDriver.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;