const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const expenses = await db.query("SELECT fuel_cost, misc_expense FROM expenses");
    const maintenance = await db.query("SELECT cost FROM maintenance");
    const trips = await db.query("SELECT COUNT(*) FROM trips");

    // Helper to turn "19k" into 19000 for math
    const parseMoney = (val) => {
      if (!val) return 0;
      const cleanVal = String(val).replace(/[^0-9.]/g, ''); 
      let num = parseFloat(cleanVal) || 0;
      if (String(val).toLowerCase().includes('k')) num *= 1000;
      if (String(val).toLowerCase().includes('l')) num *= 100000;
      return num;
    };

    let totalFuel = 0;
    expenses.rows.forEach(exp => { totalFuel += parseMoney(exp.fuel_cost); });

    let totalMaintenance = 0;
    maintenance.rows.forEach(m => { totalMaintenance += parseMoney(m.cost); });

    // Hackathon simulation: Assume every trip brings in Rs. 40,000 revenue
    const totalTripsCount = parseInt(trips.rows[0].count) || 0;
    const totalRevenue = totalTripsCount * 40000; 
    
    const totalCost = totalFuel + totalMaintenance;
    const netProfit = totalRevenue - totalCost;

    // Convert back to "Lakhs" (L) for a beautiful UI display
    const formatToLakhs = (num) => "Rs. " + (num / 100000).toFixed(2) + "L";

    res.json({
      revenue: formatToLakhs(totalRevenue),
      fuelCost: formatToLakhs(totalFuel),
      maintenance: formatToLakhs(totalMaintenance),
      netProfit: formatToLakhs(netProfit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;