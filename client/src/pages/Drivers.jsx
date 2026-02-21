import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, Shield, Phone, MapPin, CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: "", phone: "", license_no: "", expiry_date: ""
  });

  useEffect(() => {
    fetch(`${API_URL}/drivers`)
      .then(res => res.json())
      .then(data => setDrivers(data))
      .catch(err => console.error("Error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.license_no) return;
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/drivers`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const newDriver = await response.json();
        setDrivers([newDriver, ...drivers]);
        setShowForm(false);
        setFormData({ name: "", phone: "", license_no: "", expiry_date: "" });
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "On Duty" ? "Off Duty" : "On Duty";
    try {
      const res = await fetch(`${API_URL}/drivers/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setDrivers(drivers.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("on duty") || s.includes("available")) return "bg-green-100 text-green-700 border-green-200";
    if (s.includes("on trip")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (s.includes("off duty")) return "bg-slate-100 text-slate-600 border-slate-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  // Safety Score: calculated from completion_rate and complaints
  // Formula: completion_rate - (complaints * 5), clamped to 0-100
  const calculateSafety = (d) => {
    const completionRate = parseInt(d.completion_rate) || 80;
    const complaints = parseInt(d.complaints) || 0;
    return Math.max(0, Math.min(100, completionRate - (complaints * 5)));
  };

  const getSafetyColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getSafetyBg = (score) => {
    if (score >= 80) return darkMode ? "bg-green-500/20" : "bg-green-50";
    if (score >= 60) return darkMode ? "bg-yellow-500/20" : "bg-yellow-50";
    return darkMode ? "bg-red-500/20" : "bg-red-50";
  };

  // License expiry color coding
  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return { color: "text-gray-400", label: "No Expiry", status: "unknown" };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - today;
    const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30);

    if (diffMs < 0) return { color: "text-red-500", label: "EXPIRED", status: "expired" };
    if (diffMonths < 6) return { color: "text-yellow-500", label: `Expires ${expiry.toLocaleDateString('en-IN')}`, status: "warning" };
    return { color: "text-green-500", label: `Valid till ${expiry.toLocaleDateString('en-IN')}`, status: "valid" };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Driver Management</h1>
          <p className={`font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>View and manage your driver workforce.</p>
        </div>
        <button onClick={() => setShowForm(true)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md text-white ${darkMode ? 'bg-brand-teal' : 'bg-brand-dark'}`}>
          <Plus size={18} /> Add Driver
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Drivers", value: drivers.length, color: "text-brand-teal" },
          { label: "On Duty", value: drivers.filter(d => String(d.status || "").toLowerCase().includes("on duty")).length, color: "text-green-500" },
          { label: "On Trip", value: drivers.filter(d => String(d.status || "").toLowerCase().includes("on trip")).length, color: "text-blue-500" },
          { label: "Expired License", value: drivers.filter(d => getLicenseStatus(d.expiry_date).status === "expired").length, color: "text-red-500" },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.length === 0 ? (
          <div className={`col-span-3 p-12 text-center rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-white border-slate-200 text-slate-400'}`}>
            No drivers registered yet.
          </div>
        ) : drivers.map(d => {
          const safetyScore = calculateSafety(d);
          const licenseInfo = getLicenseStatus(d.expiry_date);

          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-brand-dark'}`}>{d.name}</h3>
                  <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>ID #{d.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(d.status)}`}>{d.status || "On Duty"}</span>
              </div>

              {/* Details */}
              <div className={`space-y-2.5 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {/* Phone */}
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-brand-teal" /> {d.phone || "N/A"}
                </p>

                {/* License Number — Color coded */}
                <p className="flex items-center gap-2">
                  <CreditCard size={14} className={licenseInfo.color} />
                  <span className={`font-bold ${licenseInfo.color}`}>{d.license_no || "N/A"}</span>
                </p>

                {/* License Expiry */}
                <p className="flex items-center gap-2">
                  <Calendar size={14} className={licenseInfo.color} />
                  <span className={`text-xs font-bold ${licenseInfo.color}`}>
                    {licenseInfo.status === "expired" && <AlertTriangle size={12} className="inline mr-1" />}
                    {licenseInfo.label}
                  </span>
                </p>

                {/* Trips completed */}
                {d.trips !== undefined && d.trips !== null && (
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> Trips: {d.trips}
                  </p>
                )}
              </div>

              {/* Safety Score Bar */}
              <div className={`mt-4 p-3 rounded-xl ${getSafetyBg(safetyScore)}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Shield size={12} /> Safety Score
                  </span>
                  <span className={`text-lg font-black ${getSafetyColor(safetyScore)}`}>{safetyScore}%</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-slate-200'}`}>
                  <div className={`h-full rounded-full transition-all ${safetyScore >= 80 ? 'bg-green-500' : safetyScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${safetyScore}%` }} />
                </div>
                <p className={`text-[10px] mt-1 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                  Completion: {d.completion_rate || 80}% | Complaints: {d.complaints || 0}
                </p>
              </div>

              <button onClick={() => toggleStatus(d.id, d.status)}
                className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                Toggle Status
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Add Driver Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { if (!saving) setShowForm(false); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : ''}`}>Register New Driver</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required disabled={saving} placeholder="Full Name" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input required disabled={saving} placeholder="Phone Number" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                <input required disabled={saving} placeholder="License Number" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                  value={formData.license_no} onChange={e => setFormData({ ...formData, license_no: e.target.value })} />
                <div>
                  <label className={`text-xs font-bold block mb-1 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>License Expiry Date</label>
                  <input required disabled={saving} type="date" className={`w-full p-3 border rounded-xl ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-slate-50'}`}
                    value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" disabled={saving} onClick={() => { if (!saving) setShowForm(false); }} className={`flex-1 py-3 border rounded-xl font-bold ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'border-gray-700 text-gray-300' : 'border-slate-200 text-slate-600'}`}>Cancel</button>
                  <button type="submit" disabled={saving} className={`flex-1 py-3 bg-brand-teal text-white rounded-xl font-bold shadow-md transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>{saving ? '⏳ Registering...' : 'Register'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}