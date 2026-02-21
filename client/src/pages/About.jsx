import { motion } from "framer-motion";
import { Globe, Truck, Shield, Users, BarChart3, ArrowLeft, Zap, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function About() {
    const { darkMode } = useTheme();

    const values = [
        { icon: Zap, title: "Speed", desc: "Real-time tracking and instant dispatching across your entire fleet network." },
        { icon: Shield, title: "Reliability", desc: "99.9% uptime with enterprise-grade PostgreSQL infrastructure." },
        { icon: Target, title: "Precision", desc: "AI-powered route optimization and predictive maintenance scheduling." },
        { icon: Heart, title: "Care", desc: "Driver safety scoring and wellness monitoring built into every trip." },
    ];

    const stats = [
        { value: "500+", label: "Fleets Managed" },
        { value: "10K+", label: "Vehicles Tracked" },
        { value: "99.9%", label: "Platform Uptime" },
        { value: "24/7", label: "Support Coverage" },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-950 text-white" : "bg-slate-50 text-slate-900"}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* Hero */}
            <div className={`relative overflow-hidden ${darkMode ? "bg-gray-900" : "bg-[#1C3F4E]"}`}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(21,181,164,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(21,181,164,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 text-sm font-bold transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-[#15B5A4] to-[#1C3F4E] p-2.5 rounded-2xl"><Globe className="text-white" size={28} /></div>
                        <span className="text-4xl font-black tracking-tight text-white uppercase">Fleet<span className="text-[#15B5A4]">Flow</span></span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Logistics Infrastructure for the <span className="text-[#15B5A4]">Modern Era</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-white/60 text-lg">
                        FleetFlow is a unified fleet management platform that brings real-time tracking, predictive maintenance, financial analytics, and driver management into a single beautiful interface — powered by PostgreSQL.
                    </p>
                </div>
            </div>

            {/* Stats Band */}
            <div className="bg-[#15B5A4]">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-3xl md:text-4xl font-black text-white">{s.value}</div>
                            <div className="text-white/70 text-sm font-semibold mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mission */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className={`text-3xl font-black mb-4 ${darkMode ? "text-white" : "text-[#1C3F4E]"}`}>Our Mission</h2>
                        <p className={`text-lg leading-relaxed ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                            We believe fleet management shouldn't feel like navigating a spreadsheet from 2005. FleetFlow was born from a simple idea: give logistics teams the same caliber of tools that tech companies use internally — beautiful, fast, and data-driven.
                        </p>
                        <p className={`text-lg leading-relaxed mt-4 ${darkMode ? "text-gray-400" : "text-slate-500"}`}>
                            From a single truck to a fleet of thousands, FleetFlow scales with your operations. Our platform connects vehicles, drivers, routes, maintenance schedules, and financials into one real-time dashboard — eliminating blind spots and reducing operational costs by up to 30%.
                        </p>
                    </div>
                    <div className={`rounded-3xl p-8 ${darkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-slate-200 shadow-lg"}`}>
                        <h3 className={`text-xl font-black mb-6 ${darkMode ? "text-white" : "text-[#1C3F4E]"}`}>What We Offer</h3>
                        <div className="space-y-4">
                            {[
                                { icon: Truck, text: "Real-time Vehicle Tracking & Registry" },
                                { icon: Users, text: "Driver Management & Safety Scoring" },
                                { icon: BarChart3, text: "Financial Analytics & ROI Reports" },
                                { icon: Shield, text: "Predictive Maintenance Alerts" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="bg-[#15B5A4]/10 p-2 rounded-xl"><item.icon size={18} className="text-[#15B5A4]" /></div>
                                    <span className={`font-semibold text-sm ${darkMode ? "text-gray-300" : "text-slate-600"}`}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className={`py-20 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className={`text-3xl font-black text-center mb-12 ${darkMode ? "text-white" : "text-[#1C3F4E]"}`}>Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`p-6 rounded-2xl border text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-200"}`}
                            >
                                <div className="bg-[#15B5A4]/10 p-3 rounded-2xl w-fit mx-auto mb-4">
                                    <v.icon size={24} className="text-[#15B5A4]" />
                                </div>
                                <h3 className={`font-black text-lg mb-2 ${darkMode ? "text-white" : "text-[#1C3F4E]"}`}>{v.title}</h3>
                                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-slate-500"}`}>{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className={`py-10 text-center border-t ${darkMode ? "border-gray-800 text-gray-500" : "border-slate-200 text-slate-400"}`}>
                <p className="text-sm font-bold">© 2026 FleetFlow. Built with ❤️ for modern logistics.</p>
            </div>
        </div>
    );
}
