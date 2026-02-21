import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Plus, X, CheckCircle, Clock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState(null);
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    vehicle_id: "", service_type: "", cost: "", notes: ""
  });

  const fetchAll = async () => {
    try {
      const [mRes, vRes] = await Promise.all([
        fetch(`${API_URL}/maintenance`),
        fetch(`${API_URL}/vehicles`)
      ]);
      setLogs(await mRes.json());
      setVehicles(await vRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const cleanAmount = (val) => {
    if (!val) return "N/A";
    const s = String(val).replace(/[^0-9.kKlL]/g, "");
    let n = parseFloat(s) || 0;
    if (s.toLowerCase().includes("k")) n *= 1000;
    if (s.toLowerCase().includes("l")) n *= 100000;
    return "₹" + n.toLocaleString("en-IN");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.service_type || !formData.cost) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({ vehicle_id: "", service_type: "", cost: "", notes: "" });
        setError(null);
        await fetchAll();
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Failed to save. Check if maintenance table has columns: vehicle_id, service_type, cost, notes, status");
      }
    } catch (err) {
      setError("Server connection failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id) => {
    setCompletingId(id);
    try {
      const response = await fetch(`${API_URL}/maintenance/${id}/complete`, { method: "PUT" });
      if (response.ok) {
        setLogs(logs.map(l => l.id === id ? { ...l, status: "Completed" } : l));
        await fetchAll();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setCompletingId(null);
    }
  };

  const getStatusStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("completed") || s.includes("done")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("progress") || s.includes("active")) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Maintenance Center</h1>
          <p className={`font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Track and manage vehicle service records.</p>
        </div>
        <button onClick={() => setShowForm(true)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md text-white ${darkMode ? 'bg-brand-teal' : 'bg-brand-dark'}`}>
          <Plus size={18} /> Add Service Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Records", value: logs.length, icon: Wrench, color: "text-brand-teal" },
          { label: "In Progress", value: logs.filter(l => !String(l.status || "").toLowerCase().includes("completed")).length, icon: Clock, color: "text-blue-500" },
          { label: "Completed", value: logs.filter(l => String(l.status || "").toLowerCase().includes("completed")).length, icon: CheckCircle, color: "text-green-500" },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            <s.icon size={20} className={s.color} />
            <p className={`text-2xl font-black mt-2 ${darkMode ? 'text-white' : 'text-brand-dark'}`}>{s.value}</p>
            <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-xs uppercase tracking-wider border-b ${darkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                <th className="p-4 font-bold">ID</th><th className="p-4 font-bold">Vehicle</th>
                <th className="p-4 font-bold">Service Type</th><th className="p-4 font-bold">Cost</th>
                <th className="p-4 font-bold">Status</th><th className="p-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className={darkMode ? 'divide-y divide-gray-800' : 'divide-y divide-slate-50'}>
              {logs.length === 0 ? (
                <tr><td colSpan="6" className={`p-6 text-center ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>No maintenance records.</td></tr>
              ) : logs.map(l => (
                <tr key={l.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-slate-50'}`}>
                  <td className={`p-4 font-bold ${darkMode ? 'text-white' : 'text-brand-dark'}`}>#{l.id}</td>
                  <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>{l.vehicle_name || l.license_plate || `#${l.vehicle_id}`}</td>
                  <td className={`p-4 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>{l.service_type || "—"}</td>
                  <td className={`p-4 font-bold ${darkMode ? 'text-white' : ''}`}>{cleanAmount(l.cost)}</td>
                  <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(l.status)}`}>{l.status || "In Progress"}</span></td>
                  <td className="p-4">
                    {!String(l.status || "").toLowerCase().includes("completed") && (
                      <button disabled={completingId === l.id} onClick={() => handleComplete(l.id)}
                        className={`text-xs font-bold transition-colors ${completingId === l.id ? 'text-gray-400 cursor-not-allowed' : 'text-brand-teal hover:underline'}`}>
                        {completingId === l.id ? '⏳ Completing...' : 'Mark Complete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { if (!saving) { setShowForm(false); setError(null); } }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-black ${darkMode ? 'text-white' : ''}`}>New Maintenance Log</h2>
                <button onClick={() => { if (!saving) { setShowForm(false); setError(null); } }} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-bold border ${darkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <select required disabled={saving} className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-slate-50'}`} value={formData.vehicle_id} onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} - {v.name}</option>)}
                </select>
                <input required disabled={saving} placeholder="Service Type (e.g. Oil Change)" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`} value={formData.service_type} onChange={e => setFormData({ ...formData, service_type: e.target.value })} />
                <input required disabled={saving} placeholder="Cost (₹)" type="number" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`} value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                <textarea disabled={saving} placeholder="Notes (optional)" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <button type="button" disabled={saving} onClick={() => { if (!saving) { setShowForm(false); setError(null); } }} className={`flex-1 py-3 border rounded-xl font-bold ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
                  <button type="submit" disabled={saving} className={`flex-1 py-3 bg-brand-teal text-white rounded-xl font-bold shadow-md transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {saving ? '⏳ Saving...' : 'Save Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}