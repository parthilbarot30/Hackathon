const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, mobile, address, password } = req.body;

    // Check if user already exists
    const userExists = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Username or Email already exists!' });
    }

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save to Database
    const newUser = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, mobile, address, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, first_name`,
      [firstName, lastName, username, email, mobile, address, hashedPassword]
    );

    res.json({ message: "Registration successful!", user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. LOGIN ROUTE
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid Username or Password' });
    }

    // Compare the typed password with the encrypted password in the DB
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid Username or Password' });
    }

    // Success! Send back basic user info (Do NOT send the password back)
    res.json({ 
      message: "Login successful!", 
      user: { id: user.rows[0].id, username: user.rows[0].username, name: user.rows[0].first_name } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;