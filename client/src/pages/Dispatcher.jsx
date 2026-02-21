import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, Users, CheckCircle, Clock, Plus, X, Weight, Play, XCircle } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dispatcher() {
  const [vehicles, setVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const { darkMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // trip id being acted on

  const [newTrip, setNewTrip] = useState({
    origin: "", destination: "", cargoDesc: "", weight: "", vehicleId: "", driverId: ""
  });

  const [error, setError] = useState(null);
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null); // clicked trip card

  const fetchData = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch(`${API_URL}/trips`),
        fetch(`${API_URL}/vehicles`),
        fetch(`${API_URL}/drivers/available`)
      ]);
      setTrips(await tripsRes.json());
      setVehicles(await vehiclesRes.json());
      setAvailableDrivers(await driversRes.json());
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const availableVehicles = vehicles.filter(v => v.status === "Available");

  const handleDispatch = async (e, saveAsDraft = false) => {
    if (e) e.preventDefault();
    setError(null);
    if (!newTrip.vehicleId || !newTrip.driverId || !newTrip.origin || !newTrip.destination) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTrip, status: saveAsDraft ? "Draft" : "On Trip" })
      });
      if (response.ok) {
        setShowDispatchForm(false);
        setNewTrip({ origin: "", destination: "", cargoDesc: "", weight: "", vehicleId: "", driverId: "" });
        setError(null);
        await fetchData();
      } else {
        const errData = await response.json();
        setError(errData.error || "Failed to dispatch trip.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setSaving(false);
    }
  };

  // Change trip status (Draft→On Trip, On Trip→Completed, any→Cancelled)
  const handleTripAction = async (tripId, newStatus) => {
    setActionLoading(tripId);
    try {
      const response = await fetch(`${API_URL}/trips/${tripId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setSelectedTrip(null);
        await fetchData();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-0">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Trip Dispatcher</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDispatchForm(true)} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md text-white ${darkMode ? 'bg-brand-teal' : 'bg-brand-dark'}`}>
            <Plus size={18} /> New Dispatch
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {["Draft", "On Trip", "Completed"].map((colStatus) => (
          <div key={colStatus} className={`rounded-3xl p-4 flex flex-col h-[70vh] border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 mb-4 px-2">
              {colStatus === "Draft" && <Clock size={16} className="text-yellow-500" />}
              {colStatus === "On Trip" && <Truck size={16} className="text-blue-500" />}
              {colStatus === "Completed" && <CheckCircle size={16} className="text-green-500" />}
              <h2 className={`font-bold uppercase tracking-wider text-sm ${darkMode ? 'text-gray-400' : 'text-slate-700'}`}>{colStatus}</h2>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-slate-200 text-slate-500'}`}>
                {trips.filter(t => t.status === colStatus).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {trips.filter(t => t.status === colStatus).length > 0 ? (
                trips.filter(t => t.status === colStatus).map(trip => (
                  <motion.div key={trip.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => {
                      if (colStatus !== "Completed") setSelectedTrip(selectedTrip === trip.id ? null : trip.id);
                    }}
                    className={`p-5 rounded-2xl border shadow-sm cursor-pointer transition-all ${selectedTrip === trip.id
                      ? darkMode ? 'bg-gray-700 border-brand-teal ring-2 ring-brand-teal/30' : 'bg-blue-50 border-brand-teal ring-2 ring-brand-teal/20'
                      : darkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-slate-200 hover:border-slate-300'
                      } ${colStatus === "Completed" ? 'cursor-default' : ''}`}>
                    <div className="flex justify-between mb-3">
                      <span className={`font-black ${darkMode ? 'text-white' : ''}`}>#{trip.id}</span>
                      {trip.cargo_weight > 0 && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                          <Weight size={12} /> {trip.cargo_weight} kg
                        </span>
                      )}
                    </div>
                    <div className={`text-sm font-medium mb-2 flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                      <MapPin size={14} className="text-brand-teal" /> {trip.origin} → {trip.destination}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      {trip.type || `Vehicle #${trip.vehicle_id}`} • {trip.driver_name || `Driver #${trip.driver_id}`}
                    </div>

                    {/* Action Buttons — show when card is selected */}
                    <AnimatePresence>
                      {selectedTrip === trip.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="flex gap-2 mt-4 pt-3 border-t border-dashed" style={{ borderColor: darkMode ? '#374151' : '#e2e8f0' }}>
                            {colStatus === "Draft" && (
                              <button disabled={actionLoading === trip.id}
                                onClick={(e) => { e.stopPropagation(); handleTripAction(trip.id, "On Trip"); }}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 text-white transition-colors ${actionLoading === trip.id ? 'opacity-50 cursor-not-allowed bg-green-400' : 'bg-green-500 hover:bg-green-600'}`}>
                                <Play size={12} /> {actionLoading === trip.id ? 'Dispatching...' : 'Dispatch Now'}
                              </button>
                            )}
                            {colStatus === "On Trip" && (
                              <button disabled={actionLoading === trip.id}
                                onClick={(e) => { e.stopPropagation(); handleTripAction(trip.id, "Completed"); }}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 text-white transition-colors ${actionLoading === trip.id ? 'opacity-50 cursor-not-allowed bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}>
                                <CheckCircle size={12} /> {actionLoading === trip.id ? 'Completing...' : 'Mark Complete'}
                              </button>
                            )}
                            <button disabled={actionLoading === trip.id}
                              onClick={(e) => { e.stopPropagation(); handleTripAction(trip.id, "Cancelled"); }}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${actionLoading === trip.id ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                              <XCircle size={12} /> Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className={`h-32 flex items-center justify-center border-2 border-dashed rounded-2xl text-xs font-bold ${darkMode ? 'border-gray-700 text-gray-500' : 'border-slate-200 text-slate-400'}`}>
                  NO {colStatus.toUpperCase()} RECORDS
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Form Modal */}
      <AnimatePresence>
        {showDispatchForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { if (!saving) setShowDispatchForm(false); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`relative w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : ''}`}>Route New Dispatch</h2>
                <button onClick={() => { if (!saving) setShowDispatchForm(false); }} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                  <X size={20} />
                </button>
              </div>

              {error && <div className={`mb-4 p-3 rounded-xl text-sm font-bold border ${darkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-100'}`}>{error}</div>}

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Origin Hub *" className={`p-4 border rounded-2xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                    value={newTrip.origin} onChange={e => setNewTrip({ ...newTrip, origin: e.target.value })} disabled={saving} />
                  <input placeholder="Destination Hub *" className={`p-4 border rounded-2xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                    value={newTrip.destination} onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })} disabled={saving} />
                </div>

                <select className={`w-full p-4 border rounded-2xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-slate-50'}`}
                  value={newTrip.vehicleId} onChange={e => setNewTrip({ ...newTrip, vehicleId: e.target.value })} disabled={saving}>
                  <option value="">Select Available Vehicle *</option>
                  {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} - {v.name} ({v.type || 'Vehicle'})</option>)}
                </select>

                <select className={`w-full p-4 border rounded-2xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-slate-50'}`}
                  value={newTrip.driverId} onChange={e => setNewTrip({ ...newTrip, driverId: e.target.value })} disabled={saving}>
                  <option value="">Select Available Driver * (Valid License Only)</option>
                  {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name} — {d.license_no || 'N/A'}</option>)}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Cargo Description" className={`p-4 border rounded-2xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                    value={newTrip.cargoDesc} onChange={e => setNewTrip({ ...newTrip, cargoDesc: e.target.value })} disabled={saving} />
                  <input placeholder="Weight (kg)" type="number" className={`p-4 border rounded-2xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-slate-50'}`}
                    value={newTrip.weight} onChange={e => setNewTrip({ ...newTrip, weight: e.target.value })} disabled={saving} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: darkMode ? '#374151' : '#e2e8f0' }}>
                  <button type="button" disabled={saving} onClick={() => handleDispatch(null, true)}
                    className={`w-full py-4 rounded-2xl font-black transition-all ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {saving ? '⏳ Saving...' : 'Save as Draft'}
                  </button>
                  <button type="button" disabled={saving} onClick={() => handleDispatch(null, false)}
                    className={`w-full py-4 bg-brand-orange text-white rounded-2xl font-black shadow-lg transition-all ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'}`}>
                    {saving ? '⏳ Dispatching...' : 'Confirm Dispatch'}
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