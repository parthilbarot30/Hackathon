import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, Search, Filter, Fuel, Receipt, AlertCircle, X, Save, Calendar, MapPin, Truck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [newExpense, setNewExpense] = useState({
    tripId: "", type: "Fuel", amount: "", description: "", date: new Date().toISOString().split('T')[0]
  });

  // ✅ FIX: Utility to strip symbols like "Rs.", "$", and commas to prevent NaN errors
  const cleanAmount = (val) => {
    if (!val) return 0;
    const numeric = val.toString().replace(/[^0-9.-]+/g, "");
    return parseFloat(numeric) || 0;
  };

  useEffect(() => {
    fetch(`${API_URL}/expenses`)
      .then(res => res.json())
      .then(data => setExpenses(data))
      .catch(err => console.error("Expense Fetch Error:", err));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower === "" || 
                            exp.trip_id?.toString().includes(searchLower) || 
                            exp.driver_name?.toLowerCase().includes(searchLower);
      const matchesType = typeFilter === "All" || exp.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, typeFilter, expenses]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: newExpense.tripId,
          // We send clean numbers to the DB to prevent future errors
          fuel_cost: newExpense.type === "Fuel" ? cleanAmount(newExpense.amount) : 0,
          misc_expense: newExpense.type !== "Fuel" ? cleanAmount(newExpense.amount) : 0,
          description: newExpense.description,
          date: newExpense.date
        })
      });

      if (response.ok) {
        const saved = await response.json();
        setExpenses([saved, ...expenses]);
        setShowAddModal(false);
        setNewExpense({ tripId: "", type: "Fuel", amount: "", description: "", date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) {
      console.error("Save Expense Error:", err);
    }
  };

  const totalBurn = expenses.reduce((acc, exp) => {
    // Summing both potential columns using the cleaning utility
    const fuel = cleanAmount(exp.fuel_cost);
    const misc = cleanAmount(exp.misc_expense);
    return acc + fuel + misc;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Financial Logs</h1>
          <p className="text-slate-500 font-medium mt-1">Live trip expenses synchronized with PostgreSQL.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          onClick={() => setShowAddModal(true)} 
          className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2"
        >
          <Plus size={18} /> Log Expense
        </motion.button>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 w-full max-w-sm">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Burn</p>
        <p className="text-5xl font-black text-brand-dark leading-none">
          ${totalBurn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <th className="p-6">Details</th>
              <th className="p-6">Type</th>
              <th className="p-6">Trip</th>
              <th className="p-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm font-bold text-slate-600">
            {filteredExpenses.map((exp) => {
              const amount = cleanAmount(exp.fuel_cost) + cleanAmount(exp.misc_expense);
              return (
                <tr key={exp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="text-brand-dark">{exp.description || "Trip Expense"}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{exp.driver_name || "Staff"}</div>
                  </td>
                  <td className="p-6">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/5 flex items-center justify-center border border-brand-teal/10">
                      <DollarSign size={16} className="text-brand-teal" />
                    </div>
                  </td>
                  <td className="p-6 text-slate-400 font-black">#{exp.trip_id}</td>
                  <td className="p-6 text-right text-brand-dark text-lg font-black">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-black mb-6">Log New Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <input type="text" required placeholder="Trip ID (e.g. 1)" value={newExpense.tripId} onChange={e => setNewExpense({...newExpense, tripId: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                <select value={newExpense.type} onChange={e => setNewExpense({...newExpense, type: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl">
                  <option value="Fuel">Fuel Cost</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
                <input type="text" required placeholder="Amount (e.g. 4500)" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-black text-xl" />
                <textarea placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                <button type="submit" className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black shadow-lg">Save Record</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}