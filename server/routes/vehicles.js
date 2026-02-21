const express = require('express');
const router = express.Router();
const db = require('../config/db'); // This imports your database connection!

// 1. GET ALL VEHICLES
// This is what your React frontend will call to populate the Vehicle Registry table
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM vehicles ORDER BY id DESC');
    res.json(result.rows); // Sends the data back as an array of objects
  } catch (err) {
    console.error('❌ Error fetching vehicles:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 2. ADD A NEW VEHICLE
// This is what your "New Vehicle Registration" form will trigger
router.post('/', async (req, res) => {
  try {
    // We added 'type' here!
    const { name, license_plate, max_capacity, odometer, type } = req.body;
    
    const newVehicle = await db.query(
      `INSERT INTO vehicles (name, license_plate, max_capacity, odometer, type) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, license_plate, max_capacity, odometer, type]
    );
    
    res.json(newVehicle.rows[0]); 
  } catch (err) {
    console.error('❌ Error adding vehicle:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;