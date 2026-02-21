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
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/auth', require('./routes/auth'));

// THIS is the line that keeps the server awake!
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});