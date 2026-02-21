import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Activity, AlertTriangle, DollarSign, MapPin, TrendingUp, Clock, FileText, Download, X, Loader2 } from "lucide-react";

// The Fallback URL trick for easy deployment!
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // 1. Initialize empty states for DB data
  const [statsData, setStatsData] = useState({
    activeFleet: 0,
    maintenanceAlert: 0,
    pendingCargo: 0,
    recentTrips: []
  });

  // 2. Fetch real data on load
  useEffect(() => {
    fetch(`${API_URL}/dashboard`)
      .then(res => res.json())
      .then(data => setStatsData(data))
      .catch(err => console.error("Dashboard Fetch Error:", err));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // Map real database values to the UI cards
  const stats = [
    { title: "Active Fleet", value: statsData.activeFleet, change: "+12%", icon: Truck, color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { title: "In Transit", value: statsData.recentTrips.length, change: "+5%", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Maintenance Alert", value: statsData.maintenanceAlert, change: "-2%", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "Weekly Revenue", value: "Rs. 4.5L", change: "+18%", icon: DollarSign, color: "text-brand-orange", bg: "bg-brand-orange/10" },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowReportModal(true);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative z-0">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-dark tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time metrics for your logistics network.</p>
        </div>
        <motion.button 
          whileHover={{ scale: isGenerating ? 1 : 1.05 }}
          whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex justify-center items-center gap-2 ${
            isGenerating 
              ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300" 
              : "bg-brand-dark text-white hover:shadow-lg hover:bg-black"
          }`}
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
          {isGenerating ? "Compiling Data..." : "Generate Report"}
        </motion.button>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            variants={itemVariants}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-sm font-bold ${stat.change.startsWith('+') ? 'text-brand-teal' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
            <p className="text-3xl font-black text-brand-dark">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-brand-dark">Live Trip Tracking</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4 font-bold">Trip ID</th>
                  <th className="p-4 font-bold">Vehicle</th>
                  <th className="p-4 font-bold">Driver</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-slate-700">
                {statsData.recentTrips.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-400 font-normal">No active trips found.</td></tr>
                ) : (
                  statsData.recentTrips.map((trip, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-brand-dark font-bold">#{trip.id}</td>
                      <td className="p-4">{trip.vehicle || "N/A"}</td>
                      <td className="p-4">{trip.driver || "N/A"}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          trip.status === 'On Trip' ? 'bg-blue-500/10 text-blue-500' : 'bg-brand-teal/10 text-brand-teal'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-brand-dark rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-brand-teal/20 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Clock size={20} className="text-brand-teal" /> 
            Dispatcher Priority
          </h2>
          <div className="space-y-4 relative z-10">
            <div className="bg-white/10 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Critical</span>
                <span className="text-white/50 text-xs">Now</span>
              </div>
              <p className="font-medium text-sm">{statsData.maintenanceAlert} Vehicles require immediate maintenance clearance.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowReportModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[110] overflow-hidden flex flex-col" >
              <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm"><FileText size={28} className="text-brand-dark" /></div>
                  <div><h2 className="text-xl font-black text-brand-dark">Executive Summary</h2><p className="text-slate-500 text-sm font-medium">Generated just now</p></div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors border border-slate-200 text-slate-500" ><X size={20} /></button>
              </div>
              <div className="p-6">
                <div className="bg-brand-teal/5 border border-brand-teal/20 p-5 rounded-2xl mb-6">
                  <h4 className="font-bold text-brand-dark mb-2">Report Ready for Download</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Weekly summary compiled for {statsData.activeFleet} active vehicles.</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-brand-dark rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors flex justify-center items-center gap-2" ><Download size={18} /> Export CSV</button>
                <button onClick={() => setShowReportModal(false)} className="flex-1 py-3 bg-brand-dark text-white rounded-xl font-bold shadow-md hover:bg-black transition-colors flex justify-center items-center gap-2" ><Download size={18} /> Download PDF</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}