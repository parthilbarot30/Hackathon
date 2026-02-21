import { useState, useEffect } from "react";
import { Search, Plus, X, CheckCircle2 } from "lucide-react";

// The Fallback URL trick for easy deployment!
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function VehicleRegistry() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    plate: "", payload: "", odometer: "", type: "", model: ""
  });

  // FETCH FROM DATABASE ON LOAD
  useEffect(() => {
    fetch(`${API_URL}/vehicles`)
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error("Error fetching vehicles:", err));
  }, []);

  // SEND NEW VEHICLE TO DATABASE ON SAVE
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Map your form data to match the database column names
    const newVehicleData = {
      name: formData.model, 
      license_plate: formData.plate,
      max_capacity: formData.payload,
      odometer: formData.odometer,
      type: formData.type // This is the new field we added to the DB!
    };

    try {
      const response = await fetch(`${API_URL}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicleData),
      });

      if (response.ok) {
        const addedVehicle = await response.json(); 
        
        setVehicles([addedVehicle, ...vehicles]); 
        setShowForm(false);
        setFormData({ plate: "", payload: "", odometer: "", type: "", model: "" });
        
        setSuccessMessage(`Vehicle ${addedVehicle.license_plate} registered successfully!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        console.error("Failed to save vehicle to database.");
      }
    } catch (error) {
      console.error("Server connection error:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Success Notification */}
      {successMessage && (
        <div className="bg-brand-teal/10 text-brand-teal p-4 rounded-xl flex items-center gap-3 border border-brand-teal/20 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-bold">{successMessage}</p>
        </div>
      )}

      <div className="flex gap-6 h-full">
        {/* FORM SECTION */}
        {showForm && (
          <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col h-fit">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-brand-dark text-white rounded-t-xl">
              <h2 className="font-bold text-lg text-white">New Vehicle Registration</h2>
              <button onClick={() => setShowForm(false)} className="hover:text-brand-orange transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Plate:</label>
                <input type="text" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal bg-gray-50" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Payload (kg):</label>
                <input type="number" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal bg-gray-50" value={formData.payload} onChange={e => setFormData({...formData, payload: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Odometer:</label>
                <input type="number" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal bg-gray-50" value={formData.odometer} onChange={e => setFormData({...formData, odometer: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type:</label>
                <input type="text" placeholder="e.g. Mini, Truck" className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal bg-gray-50" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model Name:</label>
                <input type="text" required placeholder="e.g. TATA Ace" className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal bg-gray-50" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-teal hover:bg-teal-600 text-white font-bold rounded-md transition-colors">Save Vehicle</button>
              </div>
            </form>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className={`flex-1 flex flex-col space-y-4 transition-all duration-300 ${showForm ? 'w-2/3' : 'w-full'}`}>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search vehicles..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-teal bg-gray-50" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(true)} className="ml-2 flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-md font-medium transition-colors hover:bg-teal-600 shadow-sm">
                <Plus className="w-4 h-4" /> New Vehicle
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-dark text-white border-b border-gray-200 text-sm">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Plate</th>
                    <th className="p-4 font-medium">Model</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Capacity (kg)</th>
                    <th className="p-4 font-medium">Odometer</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.length === 0 ? (
                    <tr><td colSpan="7" className="p-4 text-center text-gray-500">No vehicles found in database. Add one!</td></tr>
                  ) : (
                    vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-gray-600">#{v.id}</td>
                        <td className="p-4 font-bold text-gray-900">{v.license_plate}</td>
                        <td className="p-4 text-gray-600">{v.name}</td>
                        <td className="p-4 text-gray-600">{v.type || "N/A"}</td>
                        <td className="p-4 text-gray-600">{v.max_capacity}</td>
                        <td className="p-4 text-gray-600">{v.odometer}</td>
                        <td className="p-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            v.status === 'Available' ? 'bg-green-100 text-green-800 border border-green-200' : 
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