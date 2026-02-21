import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, TrendingUp, Fuel, DollarSign, Activity, 
  ShieldCheck, Download, Calendar, ArrowUpRight, 
  ArrowDownRight, PieChart, FileText, Globe
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("This Month");
  const [isExporting, setIsExporting] = useState(false);
  
  // ✅ FIX 1: Initialize with full empty structures to prevent .map() crashes
  const [analyticsData, setAnalyticsData] = useState({
    metrics: [],
    vehicleROI: [],
    monthlyBreakdown: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    efficiencyScore: 0
  });

  useEffect(() => {
    fetch(`${API_URL}/analytics?range=${dateRange}`)
      .then(res => res.json())
      .then(data => {
        // ✅ FIX 2: Only set state if data is valid
        if (data) setAnalyticsData(data);
      })
      .catch(err => console.error("Analytics Fetch Error:", err));
  }, [dateRange]);

  const metrics = useMemo(() => {
    const config = [
      { title: "Fuel Efficiency", icon: Fuel, color: "text-brand-orange", bg: "bg-brand-orange/10" },
      { title: "Cost per km", icon: DollarSign, color: "text-brand-teal", bg: "bg-brand-teal/10" },
      { title: "Fleet Utilization", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
      { title: "Avg. Safety Score", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" }
    ];

    // ✅ FIX 3: Use optional chaining (?.) so it doesn't crash if metrics is missing
    return (analyticsData?.metrics || []).map((m, i) => ({
      ...m,
      ...config[i]
    }));
  }, [analyticsData.metrics]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-brand-dark">Operational Analytics</h1>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-transparent text-sm font-bold outline-none">
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ✅ FIX 4: Safety check before mapping cards */}
        {metrics?.length > 0 ? metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
             <div className={`${metric.bg} ${metric.color} p-3 rounded-2xl w-fit mb-4`}>
                <metric.icon size={24} />
             </div>
             <h3 className="text-slate-400 text-xs font-black uppercase mb-1">{metric.title}</h3>
             <p className="text-3xl font-black text-brand-dark">{metric.value}</p>
          </div>
        )) : <div className="col-span-4 py-10 text-center text-slate-400">Synchronizing with Database...</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-brand-dark mb-8">Vehicle ROI Analysis</h2>
          <div className="space-y-6">
            {/* ✅ FIX 5: Use optional chaining on vehicleROI */}
            {(analyticsData?.vehicleROI || []).map((v, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-black text-brand-dark">{v.id}</span>
                  <span className="text-sm font-black text-brand-teal">{v.roi}% ROI</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${v.roi}%` }} className="h-full bg-brand-teal" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
           <PieChart className="text-brand-teal mb-6" size={40} />
           <h2 className="text-3xl font-black mb-2">Fleet Pulse</h2>
           <p className="text-slate-400 text-sm">Efficiency is <span className="text-white font-bold">{analyticsData?.efficiencyScore || 0}% higher</span> than the benchmark.</p>
        </div>
      </div>
    </div>
  );
}