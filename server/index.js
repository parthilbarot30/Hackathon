const express = require('express');
const cors = require('cors');
require('dotenv').config();
console.log("Checking DB URL:", process.env.DATABASE_URL ? "URL is loaded!" : "URL IS MISSING!");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware so React can talk to this backend
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'IT is running' });
});
// A simple test route
app.get('/api/health', (req, res) => {
  res.json({ message: 'FleetFlow Backend is running smoothly! 🚀' });
});

app.use('/api/vehicles', require('./routes/vehicles')); 

// THIS is the line that keeps the server awake!
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});