import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Menu, X, ArrowRight, Truck, Globe, LayoutDashboard, Map,
  Wrench, DollarSign, Users, BarChart3, CheckCircle, TrendingUp, Navigation, User, Moon, Sun, Info, Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import LiveRouteMap from "../components/LiveRouteMap";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Floating Particle Component ──────────────────────────────────────────────
function Particle({ x, y, size, delay }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-[#15B5A4]/30 to-[#F97316]/20 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
      animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration: 4 + Math.random() * 3, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Animated Counter Component ───────────────────────────────────────────────
function AnimatedStat({ value, label, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(value) || 0;
    const duration = 1800;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/60 text-sm font-semibold">{label}</div>
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [realStats, setRealStats] = useState({ activeFleet: 0, maintenanceAlert: 0, pendingCargo: 0 });
  const [extendedStats, setExtendedStats] = useState({ totalVehicles: 0, totalDrivers: 0, totalTrips: 0, completedTrips: 0 });
  const { scrollY } = useScroll();
  const { darkMode, toggleDarkMode } = useTheme();

  const navBg = useTransform(
    scrollY,
    [0, 80],
    darkMode
      ? ["rgba(3,7,18,0.7)", "rgba(3,7,18,0.95)"]
      : ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.95)"]
  );

  const isSignedIn = !!localStorage.getItem("user");

  useEffect(() => {
    fetch(`${API_URL}/dashboard`)
      .then(res => res.json())
      .then(data => setRealStats(data))
      .catch(err => console.error("Error loading home stats:", err));

    fetch(`${API_URL}/dashboard/stats`)
      .then(res => res.json())
      .then(data => setExtendedStats(data))
      .catch(err => console.error("Error loading extended stats:", err));
  }, []);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: 6 + Math.random() * 16, delay: i * 0.4
  }));

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .gradient-text { background: linear-gradient(135deg, #15B5A4 0%, #F97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .mesh-bg-light { background: radial-gradient(ellipse at 20% 50%, rgba(21,181,164,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.05) 0%, transparent 60%), #f8fafc; }
        .mesh-bg-dark { background: radial-gradient(ellipse at 20% 50%, rgba(21,181,164,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.06) 0%, transparent 60%), #030712; }
        .map-grid { background-image: linear-gradient(rgba(21,181,164,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(21,181,164,0.1) 1px, transparent 1px); background-size: 40px 40px; }
      `}</style>

      {/* ─── NAVBAR ──────────────────────────────────────────────── */}
      <motion.nav style={{ backgroundColor: navBg }} className={`fixed top-0 w-full z-50 px-5 py-4 flex items-center justify-between shadow-sm backdrop-blur-xl border-b ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          {/* Small settings menu button */}
          <div className="relative">
            <motion.button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2.5 shadow-md border rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-slate-100 text-slate-600'}`}>
              {isMenuOpen ? <X size={22} /> : <Settings size={22} />}
            </motion.button>

            {/* Small dropdown — Settings + About Us ONLY */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full left-0 mt-2 w-56 rounded-2xl shadow-2xl border overflow-hidden z-[100] ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}
                >
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-sm transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-400" />}
                      <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <div className={`w-9 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-brand-teal' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${darkMode ? 'left-[16px]' : 'left-0.5'}`} />
                    </div>
                  </button>

                  {/* Divider */}
                  <div className={`border-t ${darkMode ? 'border-gray-800' : 'border-slate-100'}`} />

                  {/* About Us */}
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 font-bold text-sm transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Info size={18} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
                    About Us
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isSignedIn && (
            <Link to="/login" className="bg-gradient-to-r from-[#1C3F4E] to-[#15B5A4] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg">
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#15B5A4] to-[#1C3F4E] p-1.5 rounded-xl"><Globe className="text-white" size={18} /></div>
          <span className={`text-xl font-black tracking-tight uppercase ${darkMode ? 'text-white' : 'text-[#1C3F4E]'}`}>Fleet<span className="text-[#15B5A4]">Flow</span></span>
        </div>

        <div className="hidden md:block w-36" />
      </motion.nav>

      {/* Close dropdown when clicking outside */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <div className={`relative min-h-screen pt-24 ${darkMode ? 'mesh-bg-dark' : 'mesh-bg-light'}`}>
        <div className="absolute inset-0 pointer-events-none">{particles.map((p, i) => <Particle key={i} {...p} />)}</div>
        <div className="absolute inset-0 map-grid opacity-50" />

        <main className="relative z-10 pt-12 pb-20 px-6 max-w-7xl mx-auto text-center">
          <h1 className={`text-5xl md:text-8xl font-black mb-6 tracking-tight ${darkMode ? 'text-white' : 'text-[#1C3F4E]'}`}>
            Logistics, <span className="gradient-text">Beautifully</span> Managed.
          </h1>
          <p className={`max-w-2xl mx-auto text-lg mb-10 ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Unified interface for real-time fleet analytics and predictive maintenance.</p>

          <Link to={isSignedIn ? "/dashboard" : "/login"}>
            <motion.button whileHover={{ scale: 1.05 }} className={`px-10 py-4 text-white rounded-2xl font-black text-lg shadow-xl flex items-center gap-2 mx-auto ${darkMode ? 'bg-brand-teal' : 'bg-[#1C3F4E]'}`}>
              {isSignedIn ? "Go to Dashboard" : "Get Started"} <ArrowRight size={20} />
            </motion.button>
          </Link>

          {/* Live Route Map */}
          <div className="mt-16 relative w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/8] bg-[#1C3F4E]">
            <div className="absolute top-4 left-4 z-30 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white text-left">
              <p className="text-xs font-bold text-[#15B5A4] uppercase">Live Assets</p>
              <p className="text-3xl font-black">{realStats.activeFleet}</p>
            </div>
            <div className="absolute top-4 right-[15rem] z-30 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white text-right">
              <p className="text-xs font-bold text-orange-400 uppercase">Alerts</p>
              <p className="text-3xl font-black">{realStats.maintenanceAlert}</p>
            </div>
            <div className="absolute inset-0">
              <LiveRouteMap />
            </div>
            <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold uppercase tracking-widest z-20">Live Fleet Tracking</p>
          </div>
        </main>
      </div>

      {/* ─── STATS BAND (Real DB Data) ──────────────────────────── */}
      <section className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-[#1C3F4E]'}`}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={extendedStats.totalVehicles} label="Fleet Vehicles" />
          <AnimatedStat value={extendedStats.totalDrivers} label="Active Drivers" />
          <AnimatedStat value={extendedStats.totalTrips} label="Total Trips" />
          <AnimatedStat value={extendedStats.completedTrips} label="Completed" />
        </div>
      </section>
    </div>
  );
}