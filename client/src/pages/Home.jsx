import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Menu, X, ArrowRight, Truck, Globe, LayoutDashboard, Map, 
  Wrench, DollarSign, Users, BarChart3, CheckCircle, TrendingUp, Navigation, User 
} from "lucide-react";
import { Link } from "react-router-dom";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [realStats, setRealStats] = useState({ activeFleet: 0, maintenanceAlert: 0, pendingCargo: 0 });
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0.7)", "rgba(255,255,255,0.95)"]);

  // Custom Authentication Check
  const isSignedIn = !!localStorage.getItem("user");

  // Fetch real data from PostgreSQL backend
  useEffect(() => {
    fetch(`${API_URL}/dashboard`)
      .then(res => res.json())
      .then(data => setRealStats(data))
      .catch(err => console.error("Error loading home stats:", err));
  }, []);

  const particles = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: 6 + Math.random() * 16, delay: i * 0.4
  }));

  const systemModules = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicle Registry', path: '/registry', icon: Truck },
    { name: 'Dispatcher', path: '/dispatcher', icon: Map },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .gradient-text { background: linear-gradient(135deg, #15B5A4 0%, #F97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .mesh-bg { background: radial-gradient(ellipse at 20% 50%, rgba(21,181,164,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.05) 0%, transparent 60%), #f8fafc; }
        .map-grid { background-image: linear-gradient(rgba(21,181,164,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(21,181,164,0.1) 1px, transparent 1px); background-size: 40px 40px; }
      `}</style>

      {/* ─── NAVBAR ──────────────────────────────────────────────── */}
      <motion.nav style={{ backgroundColor: navBg }} className="fixed top-0 w-full z-50 px-5 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <motion.button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white shadow-md border border-slate-100 rounded-xl text-slate-600">
            <Menu size={22} />
          </motion.button>
          {!isSignedIn && (
            <Link to="/login" className="bg-gradient-to-r from-[#1C3F4E] to-[#15B5A4] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg">
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#15B5A4] to-[#1C3F4E] p-1.5 rounded-xl"><Globe className="text-white" size={18} /></div>
          <span className="text-xl font-black tracking-tight text-[#1C3F4E] uppercase">Fleet<span className="text-[#15B5A4]">Flow</span></span>
        </div>

        <div className="hidden md:block w-36" />
      </motion.nav>

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <div className="relative min-h-screen mesh-bg pt-24">
        <div className="absolute inset-0 pointer-events-none">{particles.map((p, i) => <Particle key={i} {...p} />)}</div>
        <div className="absolute inset-0 map-grid opacity-50" />

        <main className="relative z-10 pt-12 pb-20 px-6 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-8xl font-black text-[#1C3F4E] mb-6 tracking-tight">
            Logistics, <span className="gradient-text">Beautifully</span> Managed.
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-lg mb-10">Unified interface for real-time fleet analytics and predictive maintenance.</p>
          
          <Link to={isSignedIn ? "/dashboard" : "/login"}>
            <motion.button whileHover={{ scale: 1.05 }} className="px-10 py-4 bg-[#1C3F4E] text-white rounded-2xl font-black text-lg shadow-xl flex items-center gap-2 mx-auto">
              {isSignedIn ? "Go to Dashboard" : "Get Started"} <ArrowRight size={20} />
            </motion.button>
          </Link>

          {/* Real Data Overlay */}
          <div className="mt-16 relative w-full max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl aspect-[16/7] bg-[#1C3F4E]">
            <div className="absolute inset-0 p-8 flex flex-col justify-between text-left">
              <div className="flex justify-between items-start">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white">
                  <p className="text-xs font-bold text-[#15B5A4] uppercase">Live Assets</p>
                  <p className="text-3xl font-black">{realStats.activeFleet}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-white text-right">
                  <p className="text-xs font-bold text-orange-400 uppercase">Alerts</p>
                  <p className="text-3xl font-black">{realStats.maintenanceAlert}</p>
                </div>
              </div>
              <p className="text-white/60 text-sm font-bold uppercase tracking-widest">PostgreSQL Connected Hub</p>
            </div>
          </div>
        </main>
      </div>

      {/* ─── STATS BAND ──────────────────────────────────────────── */}
      <section className="bg-[#1C3F4E] py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={realStats.activeFleet} label="Fleet Vehicles" />
          <AnimatedStat value={98} label="System SLA" suffix="%" />
          <AnimatedStat value={realStats.maintenanceAlert} label="In Service" />
          <AnimatedStat value={43} label="Efficiency Gain" suffix="%" />
        </div>
      </section>
    </div>
  );
}