import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, DollarSign, Fuel, Wrench, Truck, Users, CheckCircle, Activity, Calendar } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PERIODS = [
  { key: "1m", label: "1M" },
  { key: "3m", label: "3M" },
  { key: "1y", label: "1Y" },
  { key: "5y", label: "5Y" },
  { key: "10y", label: "10Y" },
  { key: "all", label: "All Time" },
];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(false);
  const { darkMode } = useTheme();

  const fetchData = (p) => {
    setLoading(true);
    fetch(`${API_URL}/analytics?period=${p}`)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error("Error:", err); setLoading(false); });
  };

  useEffect(() => { fetchData(period); }, [period]);

  const financialCards = data ? [
    { label: "Revenue", value: data.revenue, icon: TrendingUp, color: "text-green-500", bgIcon: darkMode ? "bg-green-500/20" : "bg-green-50" },
    { label: "Fuel Cost", value: data.fuelCost, icon: Fuel, color: "text-red-500", bgIcon: darkMode ? "bg-red-500/20" : "bg-red-50" },
    { label: "Maintenance", value: data.maintenance, icon: Wrench, color: "text-orange-500", bgIcon: darkMode ? "bg-orange-500/20" : "bg-orange-50" },
    { label: "Misc Expenses", value: data.miscExpenses, icon: DollarSign, color: "text-purple-500", bgIcon: darkMode ? "bg-purple-500/20" : "bg-purple-50" },
    { label: "Total Expenses", value: data.totalExpenses, icon: Activity, color: "text-red-400", bgIcon: darkMode ? "bg-red-400/20" : "bg-red-50" },
    { label: "Net Profit", value: data.netProfit, icon: TrendingUp, color: "text-brand-teal", bgIcon: darkMode ? "bg-brand-teal/20" : "bg-brand-teal/5" },
  ] : [];

  const operationalCards = data ? [
    { label: "Total Vehicles", value: data.totalVehicles, icon: Truck, color: "text-blue-500" },
    { label: "Total Drivers", value: data.totalDrivers, icon: Users, color: "text-brand-teal" },
    { label: "Total Trips", value: data.totalTrips, icon: Activity, color: "text-purple-500" },
    { label: "Completed", value: data.completedTrips, icon: CheckCircle, color: "text-green-500" },
    { label: "Completion Rate", value: `${data.completionRate}%`, icon: BarChart3, color: "text-orange-500" },
  ] : [];

  // Calculate bar widths from raw data
  const getBarWidth = (idx) => {
    if (!data || !data.raw) return 0;
    const values = [data.raw.revenue, data.raw.fuelCost, data.raw.maintenance, data.raw.miscExpenses, data.raw.totalExpenses, Math.abs(data.raw.netProfit)];
    const max = Math.max(...values, 1);
    return Math.max(5, (values[idx] / max) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Financial Analytics</h1>
          <p className={`font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Revenue, costs, and profitability analysis.</p>
        </div>
        {/* Period Selector */}
        <div className={`flex items-center gap-1 p-1.5 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
          <Calendar size={16} className={`mx-2 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`} />
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${period === p.key
                  ? 'bg-brand-teal text-white shadow-md'
                  : darkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-slate-500 hover:text-brand-dark hover:bg-slate-50'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!data || loading ? (
        <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-slate-200 text-slate-400'}`}>
          {loading ? '⏳ Loading analytics...' : 'Loading analytics data...'}
        </div>
      ) : (
        <>
          {/* Operational Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {operationalCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-5 rounded-2xl border text-center ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
                <card.icon size={20} className={`${card.color} mx-auto mb-2`} />
                <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-brand-dark'}`}>{card.value}</p>
                <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialCards.map((card, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}
              >
                <div className={`${card.bgIcon} ${card.color} p-3 rounded-xl w-fit mb-4`}>
                  <card.icon size={24} />
                </div>
                <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{card.label}</p>
                <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-brand-dark'}`}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Cost Breakdown Chart */}
          <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Cost Breakdown</h2>
            <div className="space-y-4">
              {financialCards.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-28 truncate ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{c.label}</span>
                  <div className={`flex-1 h-5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-slate-100'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getBarWidth(i)}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                      className={`h-full rounded-full ${c.color.replace("text-", "bg-")}`}
                    />
                  </div>
                  <span className={`text-sm font-black w-20 text-right ${darkMode ? 'text-white' : ''}`}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profit Summary */}
          <div className={`p-8 rounded-2xl border ${data.raw.netProfit >= 0
            ? darkMode ? 'bg-green-500/10 border-green-800' : 'bg-green-50 border-green-200'
            : darkMode ? 'bg-red-500/10 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${data.raw.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.raw.netProfit >= 0 ? '📈 Profitable' : '📉 Loss'}
                </p>
                <p className={`text-4xl font-black ${data.raw.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.netProfit}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Revenue: {data.revenue}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Expenses: {data.totalExpenses}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Trips Completed: {data.completedTrips}/{data.totalTrips}</p>
                <p className={`text-xs font-bold mt-2 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  Period: {PERIODS.find(p => p.key === period)?.label}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}