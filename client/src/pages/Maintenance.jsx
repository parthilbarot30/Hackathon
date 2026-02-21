import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wrench, Plus, X, CheckCircle, Clock, DollarSign, 
  Calendar, User, Search, Filter, Truck, Save 
} from "lucide-react";

// Use the API URL from your environment or default to local port 5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showLogModal, setShowLogModal] = useState(false);

  // 1. Initialize empty states for database data
  const [vehicles, setVehicles] = useState([]);
  const [serviceLogs, setServiceLogs] = useState([]);

  const [newLog, setNewLog] = useState({
    vehicleId: "", 
    type: "General Repair", 
    description: "", 
    date: new Date().toISOString().split('T')[0], 
    cost: "", 
    technician: ""
  });

  // 2. Fetch real data from PostgreSQL via Express on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch existing maintenance logs
        const logsRes = await fetch(`${API_URL}/maintenance`);
        const logsData = await logsRes.json();
        setServiceLogs(logsData);

        // Fetch all vehicles for the assignment dropdown
        const vehiclesRes = await fetch(`${API_URL}/vehicles`);
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
      } catch (err) {
        console.error("Database Connection Error:", err);
      }
    };
    fetchData();
  }, []);

  // Helper to clean numeric strings from the DB (removes "Rs.", ",", etc.)
  const cleanAmount = (val) => Number(val?.toString().replace(/[^0-9.-]+/g, "")) || 0;

  const filteredLogs = useMemo(() => {
    return serviceLogs.filter(log => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = searchLower === "" || 
                            log.vehicle_id?.toLowerCase().includes(searchLower) || 
                            log.technician?.toLowerCase().includes(searchLower) ||
                            log.description?.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "All" || log.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, serviceLogs]);

  // 3. Save new service record to Database
  const handleCreateLog = async (e) => {
    e.preventDefault();
    if (!newLog.vehicleId || !newLog.description || !newLog.cost) return;

    try {
      const response = await fetch(`${API_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: newLog.vehicleId,
          type: newLog.type,
          description: newLog.description,
          cost: Number(newLog.cost), // Ensures numeric format for DB
          technician: newLog.technician,
          date: newLog.date,
          status: "In Shop" // Automatically marks vehicle as In Shop
        })
      });

      if (response.ok) {
        const savedLog = await response.json();
        setServiceLogs([savedLog, ...serviceLogs]);
        
        // Refresh vehicles to show the updated 'In Shop' status across the system
        const vehiclesRes = await fetch(`${API_URL}/vehicles`);
        setVehicles(await vehiclesRes.json());

        setShowLogModal(false);
        setNewLog({ 
          vehicleId: "", type: "General Repair", description: "", 
          date: new Date().toISOString().split('T')[0], cost: "", technician: "" 
        });
      }
    } catch (err) {
      console.error("Failed to save record:", err);
    }
  };

  const handleCompleteService = async (logId, vehiclePlate) => {
    try {
      const response = await fetch(`${API_URL}/maintenance/${logId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" })
      });

      if (response.ok) {
        // Update local state to reflect completion
        setServiceLogs(serviceLogs.map(log => log.id === logId ? { ...log, status: "Completed" } : log));
        // Reset vehicle to Available
        setVehicles(vehicles.map(v => v.license_plate === vehiclePlate ? { ...v, status: "Available" } : v));
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">Maintenance Logs</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time asset health synchronized with PostgreSQL.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowLogModal(true)}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-black transition-all flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> Log Service Event
        </motion.button>
      </div>

      {/* KPI Cards mapping directly to database state */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-red-500/10 p-4 rounded-xl text-red-500 shadow-inner">
            <Wrench size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Repairs</p>
            <p className="text-3xl font-black text-brand-dark leading-none">
              {serviceLogs.filter(l => l.status === "In Shop" || l.status === "New").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-brand-teal/10 p-4 rounded-xl text-brand-teal shadow-inner">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed Logs</p>
            <p className="text-3xl font-black text-brand-dark leading-none">
              {serviceLogs.filter(l => l.status === "Completed").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-brand-orange/10 p-4 rounded-xl text-brand-orange shadow-inner">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Expense</p>
            <p className="text-3xl font-black text-brand-dark leading-none">
              ${serviceLogs.reduce((acc, log) => acc + cleanAmount(log.cost), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Vehicle or Tech..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {["All", "In Shop", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                statusFilter === status 
                  ? "bg-brand-dark text-white shadow-md" 
                  : "bg-slate-50 text-slate-600 border border-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredLogs.map((log) => (
            <motion.div 
              key={log.id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${log.status === 'In Shop' || log.status === 'New' ? 'bg-red-50 text-red-500' : 'bg-brand-teal/10 text-brand-teal'}`}>
                    <Wrench size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-brand-dark">{log.vehicle_id}</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{log.type || 'Repair'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${log.status === 'In Shop' || log.status === 'New' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600'}`}>
                  {log.status}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{log.description || log.issue}</p>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm bg-slate-50/50 p-4 rounded-xl border">
                <div className="flex items-center gap-2 font-medium">
                   <Calendar size={16} className="text-slate-400" /> {log.date || log.service_date}
                </div>
                <div className="flex items-center gap-2 font-bold text-brand-dark">
                   <DollarSign size={16} className="text-brand-orange" /> ${cleanAmount(log.cost).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 col-span-2 text-slate-500 font-bold">
                   <User size={16} /> Tech: {log.technician || 'General Tech'}
                </div>
              </div>
              {(log.status === "In Shop" || log.status === "New") && (
                <button 
                  onClick={() => handleCompleteService(log.id, log.vehicle_id)}
                  className="w-full py-2.5 bg-brand-teal text-white font-bold rounded-xl text-sm shadow-sm hover:bg-brand-teal/90 transition-all"
                >
                  Mark as Completed
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 overflow-hidden">
              <h2 className="text-2xl font-black mb-6">Log Service Event</h2>
              <form onSubmit={handleCreateLog} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Asset</label>
                  <select required value={newLog.vehicleId} onChange={e => setNewLog({...newLog, vehicleId: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl">
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.license_plate}>{v.license_plate} - {v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required placeholder="Service Type" value={newLog.type} onChange={e => setNewLog({...newLog, type: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                  <input type="number" required placeholder="Cost ($)" value={newLog.cost} onChange={e => setNewLog({...newLog, cost: e.target.value})} className="p-3 bg-slate-50 border rounded-xl" />
                </div>
                <textarea required placeholder="Repair Description" rows="3" value={newLog.description} onChange={e => setNewLog({...newLog, description: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl resize-none" />
                <input type="text" required placeholder="Technician Name" value={newLog.technician} onChange={e => setNewLog({...newLog, technician: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl" />
                <button type="submit" className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black shadow-lg hover:bg-black transition-all">Save Record</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}