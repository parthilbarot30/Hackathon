import { useState, useEffect } from "react";
import { Search, Plus, X, CheckCircle2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function VehicleRegistry() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const { darkMode } = useTheme();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    plate: "", payload: "", odometer: "", type: "", model: ""
  });

  useEffect(() => {
    fetch(`${API_URL}/vehicles`)
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.plate || !formData.model) return;
    setSaving(true);
    const newVehicleData = {
      name: formData.model, license_plate: formData.plate,
      max_capacity: formData.payload, odometer: formData.odometer, type: formData.type
    };
    try {
      const response = await fetch(`${API_URL}/vehicles`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicleData),
      });
      if (response.ok) {
        const addedVehicle = await response.json();
        setVehicles([addedVehicle, ...vehicles]);
        setShowForm(false);
        setFormData({ plate: "", payload: "", odometer: "", type: "", model: "" });
        setSuccessMessage(`Vehicle ${addedVehicle.license_plate} registered successfully!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (error) {
      console.error("Server connection error:", error);
    } finally {
      setSaving(false);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const q = searchQuery.toLowerCase();
    return !q || v.license_plate?.toLowerCase().includes(q) || v.name?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      {successMessage && (
        <div className="bg-brand-teal/10 text-brand-teal p-4 rounded-xl flex items-center gap-3 border border-brand-teal/20 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold">{successMessage}</p>
        </div>
      )}

      {/* Title bar */}
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-brand-dark'}`}>Vehicle Registry</h1>
      </div>

      <div className="flex gap-6 h-full">
        {showForm && (
          <div className={`w-1/3 border rounded-xl shadow-lg flex flex-col h-fit ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b flex justify-between items-center rounded-t-xl text-white ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-brand-dark border-gray-100'}`}>
              <h2 className="font-bold text-lg text-white">New Vehicle Registration</h2>
              <button onClick={() => { if (!saving) setShowForm(false); }} className="hover:text-brand-orange transition-colors"><X className="w-5 h-5 text-white" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label: "License Plate:", key: "plate", type: "text" },
                { label: "Max Payload (kg):", key: "payload", type: "number" },
                { label: "Initial Odometer:", key: "odometer", type: "number" },
                { label: "Type:", key: "type", type: "text", placeholder: "e.g. Mini, Truck" },
                { label: "Model Name:", key: "model", type: "text", placeholder: "e.g. TATA Ace" },
              ].map(f => (
                <div key={f.key}>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{f.label}</label>
                  <input type={f.type} required={f.key !== 'type'} disabled={saving} placeholder={f.placeholder || ""} className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-brand-teal ${saving ? 'opacity-50' : ''} ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 bg-gray-50'}`} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
                </div>
              ))}
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" disabled={saving} onClick={() => { if (!saving) setShowForm(false); }} className={`px-4 py-2 border rounded-md transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''} ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                <button type="submit" disabled={saving} className={`px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white font-bold rounded-md transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}>{saving ? '⏳ Saving...' : 'Save Vehicle'}</button>
              </div>
            </form>
          </div>
        )}

        <div className={`flex-1 flex flex-col space-y-4 transition-all duration-300 ${showForm ? 'w-2/3' : 'w-full'}`}>
          <div className={`flex justify-between items-center p-4 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="relative w-full max-w-sm">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="text" placeholder="Search vehicles..." className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-200 bg-gray-50'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={() => setShowForm(true)} className="ml-2 flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-md font-medium transition-colors hover:bg-teal-600 shadow-sm">
              <Plus className="w-4 h-4" /> New Vehicle
            </button>
          </div>

          <div className={`rounded-xl shadow-sm border overflow-hidden flex-1 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-sm border-b ${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-brand-dark text-white border-gray-200'}`}>
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Plate</th>
                    <th className="p-4 font-medium">Model</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Capacity (kg)</th>
                    <th className="p-4 font-medium">Odometer</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className={darkMode ? 'divide-y divide-gray-800' : 'divide-y divide-gray-100'}>
                  {filteredVehicles.length === 0 ? (
                    <tr><td colSpan="7" className={`p-4 text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No vehicles found. Add one!</td></tr>
                  ) : (
                    filteredVehicles.map((v) => (
                      <tr key={v.id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>#{v.id}</td>
                        <td className={`p-4 font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{v.license_plate}</td>
                        <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{v.name}</td>
                        <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{v.type || "N/A"}</td>
                        <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{v.max_capacity}</td>
                        <td className={`p-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{v.odometer}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${v.status === 'Available' ? 'bg-green-100 text-green-800 border border-green-200' :
                            v.status === 'In Shop' ? 'bg-red-50 text-red-600 border border-red-200' :
                              'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                            {v.status || "Available"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}