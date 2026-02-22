import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, TrendingDown, TrendingUp, X, Wrench, Fuel } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { darkMode } = useTheme();

  // Form matches DB columns: trip_id, driver_name, fuel_cost, misc_expense, distance, status
  const [formData, setFormData] = useState({
    driver_name: "", fuel_cost: "", misc_expense: "", distance: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/expenses`);
        setExpenses(await res.json());
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, []);

  const cleanAmount = (val) => {
    if (!val) return 0;
    const s = String(val).replace(/[^0-9.kKlL]/g, "");
    let n = parseFloat(s) || 0;
    if (s.toLowerCase().includes("k")) n *= 1000;
    if (s.toLowerCase().includes("l")) n *= 100000;
    return n;
  };

  const totalFuel = expenses.reduce((sum, e) => sum + cleanAmount(e.fuel_cost), 0);
  const totalMisc = expenses.reduce((sum, e) => sum + cleanAmount(e.misc_expense), 0);
  const totalBurn = totalFuel + totalMisc;
  const formatCurrency = (n) => "₹" + n.toLocaleString("en-IN");

  // Check if an expense is from maintenance (by driver_name containing "Maintenance")
  const isMaintenanceExpense = (exp) => String(exp.driver_name || "").toLowerCase().includes("maintenance");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.driver_name || !formData.fuel_cost) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "Recorded" })
      });
      if (response.ok) {
        const newExp = await response.json();
        setExpenses([newExp, ...expenses]);
        setShowForm(false);
        setFormData({ driver_name: "", fuel_cost: "", misc_expense: "", distance: "" });
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Financial Ledger</h1>
          <p className={`font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Track fuel, maintenance, and operational costs.</p>
        </div>
        <button onClick={() => setShowForm(true)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md text-white ${darkMode ? 'bg-brand-teal' : 'bg-brand-dark'}`}>
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-brand-teal" />
            <p className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Total Burn</p>
          </div>
          <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-brand-dark'}`}>{formatCurrency(totalBurn)}</p>
        </div>
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Fuel size={18} className="text-red-500" />
            <p className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Fuel Costs</p>
          </div>
          <p className="text-3xl font-black text-red-500">{formatCurrency(totalFuel)}</p>
        </div>
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={18} className="text-orange-500" />
            <p className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Misc & Maintenance</p>
          </div>
          <p className="text-3xl font-black text-orange-500">{formatCurrency(totalMisc)}</p>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`text-xs uppercase tracking-wider border-b ${darkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
              <th className="p-4 font-bold">ID</th><th className="p-4 font-bold">Driver</th>
              <th className="p-4 font-bold">Fuel Cost</th><th className="p-4 font-bold">Misc.</th>
              <th className="p-4 font-bold">Distance</th><th className="p-4 font-bold">Type</th>
            </tr>
          </thead>
          <tbody className={darkMode ? 'divide-y divide-gray-800' : 'divide-y divide-slate-50'}>
            {expenses.length === 0 ? (
              <tr><td colSpan="6" className={`p-6 text-center ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>No expenses recorded.</td></tr>
            ) : expenses.map(exp => (
              <tr key={exp.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-slate-50'}`}>
                <td className={`p-4 font-bold ${darkMode ? 'text-white' : 'text-brand-dark'}`}>#{exp.id}</td>
                <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>{exp.driver_name || "—"}</td>
                <td className="p-4 text-red-500 font-bold">{formatCurrency(cleanAmount(exp.fuel_cost))}</td>
                <td className="p-4 text-orange-500 font-bold">{formatCurrency(cleanAmount(exp.misc_expense))}</td>
                <td className={`p-4 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{exp.distance || "—"}</td>
                <td className="p-4">
                  {isMaintenanceExpense(exp) ? (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200">MAINT.</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200">FUEL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { if (!saving) setShowForm(false); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : ''}`}>Record Expense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required disabled={saving} placeholder="Driver Name" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.driver_name} onChange={e => setFormData({ ...formData, driver_name: e.target.value })} />
                <input required disabled={saving} placeholder="Fuel Cost" type="number" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.fuel_cost} onChange={e => setFormData({ ...formData, fuel_cost: e.target.value })} />
                <input disabled={saving} placeholder="Miscellaneous" type="number" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.misc_expense} onChange={e => setFormData({ ...formData, misc_expense: e.target.value })} />
                <input disabled={saving} placeholder="Distance (e.g. 300 km)" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.distance} onChange={e => setFormData({ ...formData, distance: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <button type="button" disabled={saving} onClick={() => { if (!saving) setShowForm(false); }} className={`flex-1 py-3 border rounded-xl font-bold ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
                  <button type="submit" disabled={saving} className={`flex-1 py-3 bg-brand-teal text-white rounded-xl font-bold shadow-md transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>{saving ? '⏳ Saving...' : 'Save'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}