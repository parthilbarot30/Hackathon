import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, Users, AlertCircle, CheckCircle, Clock, Send, Plus, X, Weight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dispatcher() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);

  const [newTrip, setNewTrip] = useState({
    origin: "", destination: "", cargoDesc: "", weight: "", vehicleId: "", driverId: "", date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState(null);
  const [showDispatchForm, setShowDispatchForm] = useState(false);

  // 1. Fetch data from PostgreSQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
          fetch(`${API_URL}/trips`),
          fetch(`${API_URL}/vehicles`),
          fetch(`${API_URL}/drivers`)
        ]);

        setTrips(await tripsRes.json());
        setVehicles(await vehiclesRes.json());
        setDrivers(await driversRes.json());
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchData();
  }, []);

  const availableVehicles = vehicles.filter(v => v.status === "Available");
  const validDrivers = drivers.filter(d => d.status === "On Duty" || d.status === "Available");

  // 2. Handle Dispatch / Draft Creation
  const handleDispatch = async (e, saveAsDraft = false) => {
    if (e) e.preventDefault();
    setError(null);

    if (!newTrip.vehicleId || !newTrip.driverId || !newTrip.origin) {
      setError("Please fill in basic trip details.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTrip,
          // ✅ CRITICAL: This ensures the status is exactly 'Draft' in the DB
          status: saveAsDraft ? "Draft" : "On Trip"
        })
      });

      if (response.ok) {
        const savedTrip = await response.json();
        setTrips([savedTrip, ...trips]);
        setShowDispatchForm(false);
        setNewTrip({ origin: "", destination: "", cargoDesc: "", weight: "", vehicleId: "", driverId: "", date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-0">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-brand-dark tracking-tight">Trip Dispatcher</h1>
        <button onClick={() => setShowDispatchForm(true)} className="bg-brand-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md">
          <Plus size={18} /> New Dispatch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ FIXED COLUMNS: Explicitly filtering by exact DB status strings */}
        {["Draft", "On Trip", "Completed"].map((colStatus) => (
          <div key={colStatus} className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col h-[70vh]">
            <h2 className="font-bold text-slate-700 uppercase tracking-wider text-sm mb-4 px-2">{colStatus}</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {trips.filter(t => t.status === colStatus).length > 0 ? (
                trips.filter(t => t.status === colStatus).map(trip => (
                  <div key={trip.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between mb-3"><span className="font-black">#{trip.id}</span></div>
                    <div className="text-sm text-slate-600 mb-2">{trip.origin} → {trip.destination}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trip.vehicle_id} • {trip.driver_name || 'Assigned'}</div>
                  </div>
                ))
              ) : (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                  NO {colStatus.toUpperCase()} RECORDS
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showDispatchForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDispatchForm(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl p-8 overflow-hidden">
                <h2 className="text-2xl font-black mb-6">Route New Dispatch</h2>
                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Origin Hub" className="p-4 bg-slate-50 border rounded-2xl" value={newTrip.origin} onChange={e => setNewTrip({...newTrip, origin: e.target.value})} />
                        <input placeholder="Destination Hub" className="p-4 bg-slate-50 border rounded-2xl" value={newTrip.destination} onChange={e => setNewTrip({...newTrip, destination: e.target.value})} />
                    </div>
                    {/* ✅ DROPDOWN FIX: Using fetched vehicle/driver data */}
                    <select className="w-full p-4 bg-slate-50 border rounded-2xl" value={newTrip.vehicleId} onChange={e => setNewTrip({...newTrip, vehicleId: e.target.value})}>
                        <option value="">Select Available Vehicle</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} - {v.name}</option>)}
                    </select>
                    <select className="w-full p-4 bg-slate-50 border rounded-2xl" value={newTrip.driverId} onChange={e => setNewTrip({...newTrip, driverId: e.target.value})}>
                        <option value="">Select On Duty Driver</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <button type="button" onClick={(e) => handleDispatch(null, true)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black">Save as Draft</button>
                        <button type="button" onClick={(e) => handleDispatch(null, false)} className="w-full py-4 bg-brand-orange text-white rounded-2xl font-black shadow-lg">Confirm Dispatch</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}