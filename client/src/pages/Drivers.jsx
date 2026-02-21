import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, Filter, Shield, AlertTriangle, X, Save, FileText, UserMinus, Activity } from "lucide-react";

// Fallback URL for your PostgreSQL backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // 1. Initialize state for database data
  const [drivers, setDrivers] = useState([]);

  const [newDriver, setNewDriver] = useState({
    name: "", license: "", category: "Truck", expiry: "", status: "Off Duty"
  });

  const today = new Date().toISOString().split('T')[0];

  // 2. FETCH DRIVERS FROM DATABASE ON LOAD
  useEffect(() => {
    fetch(`${API_URL}/drivers`)
      .then(res => res.json())
      .then(data => setDrivers(data))
      .catch(err => console.error("Error fetching drivers:", err));
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower === "" || 
                            d.name.toLowerCase().includes(searchLower) || 
                            d.id.toString().includes(searchLower) ||
                            d.license.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, drivers]);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showAddModal]);

  // 3. SAVE NEW DRIVER TO POSTGRESQL
  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.license || !newDriver.expiry) return;
    
    try {
      const response = await fetch(`${API_URL}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriver),
      });

      if (response.ok) {
        const addedDriver = await response.json();
        setDrivers([addedDriver, ...drivers]);
        setShowAddModal(false);
        setNewDriver({ name: "", license: "", category: "Truck", expiry: "", status: "Off Duty" });
      }
    } catch (err) {
      console.error("Save Driver Error:", err);
    }
  };

  // 4. UPDATE STATUS IN DATABASE
  const handleToggleStatus = async (id, currentStatus) => {
    let nextStatus = "On Duty";
    if (currentStatus === "On Duty") nextStatus = "Off Duty";
    if (currentStatus === "Off Duty") nextStatus = "Suspended";
    if (currentStatus === "Suspended") nextStatus = "On Duty";

    try {
      const response = await fetch(`${API_URL}/drivers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setDrivers(drivers.map(d => d.id === id ? { ...d, status: nextStatus } : d));
      }
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  // UI Helper functions
  const getStatusColor = (status) => {
    switch(status) {
      case "On Duty": return "bg-brand-teal/10 text-brand-teal border-brand-teal/20";
      case "Off Duty": return "bg-slate-100 text-slate-500 border-slate-200";
      case "Suspended": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getSafetyColor = (score) => {
    if (score >= 90) return "text-brand-teal";
    if (score >= 70) return "text-brand-orange";
    return "text-red-500";
  };

  const isExpired = (expiryDate) => expiryDate < today;

  const expiredCount = drivers.filter(d => isExpired(d.expiry)).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Personnel Network</h1>
          <p className="text-slate-500 font-medium mt-1">Live driver tracking and compliance metrics from PostgreSQL.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAddModal(true)}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> Onboard Driver
        </motion.button>
      </div>

      {/* KPI Cards mapping directly to database state */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-brand-dark/10 p-4 rounded-xl text-brand-dark"><Users size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Total Workforce</p><p className="text-3xl font-black text-brand-dark">{drivers.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-brand-teal/10 p-4 rounded-xl text-brand-teal"><Activity size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Active Duty</p><p className="text-3xl font-black text-brand-dark">{drivers.filter(d => d.status === "On Duty").length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 text-red-500">
          <div className="bg-red-500/10 p-4 rounded-xl"><AlertTriangle size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">License Alerts</p><p className="text-3xl font-black">{expiredCount}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-brand-orange/10 p-4 rounded-xl text-brand-orange"><UserMinus size={24} /></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Suspended</p><p className="text-3xl font-black text-brand-dark">{drivers.filter(d => d.status === "Suspended").length}</p></div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {["All", "On Duty", "Off Duty", "Suspended"].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${statusFilter === status ? "bg-brand-dark text-white shadow-md" : "bg-slate-50 text-slate-600 border"}`}>{status}</button>
          ))}
        </div>
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDrivers.map((driver) => (
            <motion.div key={driver.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
              {isExpired(driver.expiry) && (
                <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] font-black text-center py-1 uppercase tracking-widest">Compliance Alert: Expired</div>
              )}
              <div className={`flex justify-between items-start mb-6 ${isExpired(driver.expiry) ? 'mt-4' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="bg-brand-dark w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg">{driver.name.charAt(0)}</div>
                  <div><h3 className="text-lg font-black text-brand-dark">{driver.name}</h3><p className="text-slate-500 text-xs font-bold uppercase tracking-wider">ID: {driver.id}</p></div>
                </div>
                <button onClick={() => handleToggleStatus(driver.id, driver.status)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-colors ${getStatusColor(driver.status)}`}>{driver.status}</button>
              </div>

              <div className="space-y-4 flex-grow mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-sm font-bold">
                  <div className="flex items-center gap-2 text-slate-500"><FileText size={16} /> License</div>
                  <div className="text-right text-brand-dark">{driver.license}<br/><span className="text-[10px] text-slate-400">Exp: {driver.expiry}</span></div>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                   <span className="text-slate-500 flex items-center gap-1"><Shield size={14}/> Safety Rating</span>
                   <span className={getSafetyColor(driver.safety_score || 95)}>{driver.safety_score || 95}/100</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${getSafetyColor(driver.safety_score || 95).replace('text-', 'bg-')}`} style={{ width: `${driver.safety_score || 95}%` }}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8">
              <h2 className="text-2xl font-black mb-6">Onboard New Driver</h2>
              <form onSubmit={handleAddDriver} className="space-y-4">
                <input type="text" required placeholder="Full Name" value={newDriver.name} onChange={e => setNewDriver({...newDriver, name: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="License #" value={newDriver.license} onChange={e => setNewDriver({...newDriver, license: e.target.value})} className="p-3 bg-slate-50 border rounded-xl uppercase" />
                  <input type="date" required value={newDriver.expiry} onChange={e => setNewDriver({...newDriver, expiry: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                </div>
                <select value={newDriver.category} onChange={e => setNewDriver({...newDriver, category: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                  <option value="Truck">Class A: Truck</option>
                  <option value="Van">Class B: Van</option>
                  <option value="Bike">Class C: Motor</option>
                </select>
                <button type="submit" className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all">Complete Verification</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}