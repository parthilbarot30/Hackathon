const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper: get date cutoff from period string
function getDateCutoff(period) {
  if (!period || period === 'all') return null;
  const now = new Date();
  switch (period) {
    case '1m': now.setMonth(now.getMonth() - 1); break;
    case '3m': now.setMonth(now.getMonth() - 3); break;
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
    case '5y': now.setFullYear(now.getFullYear() - 5); break;
    case '10y': now.setFullYear(now.getFullYear() - 10); break;
    default: return null;
  }
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

router.get('/', async (req, res) => {
  try {
    const period = req.query.period || 'all';
    const cutoff = getDateCutoff(period);

    // Build WHERE clause for time filtering
    const dateFilter = cutoff ? `WHERE created_at >= '${cutoff}'` : '';
    const dateFilterAnd = cutoff ? `AND created_at >= '${cutoff}'` : '';

    const [expensesRes, maintenanceRes, tripsRes, completedTripsRes, vehiclesRes, driversRes] = await Promise.all([
      db.query(`SELECT fuel_cost, misc_expense FROM expenses ${dateFilter}`),
      db.query(`SELECT cost FROM maintenance ${dateFilter}`),
      db.query(`SELECT COUNT(*) FROM trips ${dateFilter}`),
      db.query(`SELECT COUNT(*) FROM trips WHERE status = 'Completed' ${dateFilterAnd}`),
      db.query("SELECT COUNT(*) FROM vehicles"),  // Current inventory, no time filter
      db.query("SELECT COUNT(*) FROM drivers")     // Current headcount, no time filter
    ]);

    // Helper to parse money strings like "19k" → 19000
    const parseMoney = (val) => {
      if (!val) return 0;
      const cleanVal = String(val).replace(/[^0-9.]/g, '');
      let num = parseFloat(cleanVal) || 0;
      if (String(val).toLowerCase().includes('k')) num *= 1000;
      if (String(val).toLowerCase().includes('l')) num *= 100000;
      return num;
    };

    let totalFuel = 0;
    let totalMisc = 0;
    expensesRes.rows.forEach(exp => {
      totalFuel += parseMoney(exp.fuel_cost);
      totalMisc += parseMoney(exp.misc_expense);
    });

    let totalMaintenance = 0;
    maintenanceRes.rows.forEach(m => {
      totalMaintenance += parseMoney(m.cost);
    });

    const totalTripsCount = parseInt(tripsRes.rows[0].count) || 0;
    const completedTripsCount = parseInt(completedTripsRes.rows[0].count) || 0;
    const totalVehicles = parseInt(vehiclesRes.rows[0].count) || 0;
    const totalDrivers = parseInt(driversRes.rows[0].count) || 0;

    // Revenue: Rs. 40,000 per completed trip
    const totalRevenue = completedTripsCount * 40000;

    const totalExpenses = totalFuel + totalMisc + totalMaintenance;
    const netProfit = totalRevenue - totalExpenses;
    const completionRate = totalTripsCount > 0 ? Math.round((completedTripsCount / totalTripsCount) * 100) : 0;

    // Format numbers to Indian rupee display
    const formatCurrency = (num) => {
      if (Math.abs(num) >= 100000) return "₹" + (num / 100000).toFixed(2) + "L";
      if (Math.abs(num) >= 1000) return "₹" + (num / 1000).toFixed(1) + "K";
      return "₹" + num.toLocaleString("en-IN");
    };

    res.json({
      period,
      revenue: formatCurrency(totalRevenue),
      fuelCost: formatCurrency(totalFuel),
      miscExpenses: formatCurrency(totalMisc),
      maintenance: formatCurrency(totalMaintenance),
      totalExpenses: formatCurrency(totalExpenses),
      netProfit: formatCurrency(netProfit),
      totalTrips: totalTripsCount,
      completedTrips: completedTripsCount,
      completionRate,
      totalVehicles,
      totalDrivers,
      // Raw numbers for chart calculations
      raw: {
        revenue: totalRevenue,
        fuelCost: totalFuel,
        miscExpenses: totalMisc,
        maintenance: totalMaintenance,
        totalExpenses,
        netProfit
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;