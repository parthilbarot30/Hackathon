import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Truck, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Indian City Coordinate Lookup (normalized to SVG viewBox 0-1000) ─────────
const CITY_COORDS = {
    // Major metros
    "mumbai": { x: 230, y: 540 },
    "delhi": { x: 340, y: 220 },
    "new delhi": { x: 340, y: 220 },
    "bangalore": { x: 310, y: 700 },
    "bengaluru": { x: 310, y: 700 },
    "chennai": { x: 380, y: 700 },
    "kolkata": { x: 560, y: 400 },
    "hyderabad": { x: 330, y: 590 },
    "pune": { x: 250, y: 560 },
    "ahmedabad": { x: 210, y: 400 },
    "jaipur": { x: 290, y: 290 },
    "lucknow": { x: 410, y: 280 },
    "surat": { x: 210, y: 450 },
    "kanpur": { x: 400, y: 300 },
    "nagpur": { x: 320, y: 460 },
    "indore": { x: 270, y: 420 },
    "bhopal": { x: 300, y: 400 },
    "patna": { x: 500, y: 310 },
    "vadodara": { x: 215, y: 430 },
    "coimbatore": { x: 300, y: 740 },
    "kochi": { x: 275, y: 760 },
    "cochin": { x: 275, y: 760 },
    "visakhapatnam": { x: 430, y: 560 },
    "vizag": { x: 430, y: 560 },
    "chandigarh": { x: 310, y: 180 },
    "guwahati": { x: 620, y: 280 },
    "thiruvananthapuram": { x: 285, y: 800 },
    "trivandrum": { x: 285, y: 800 },
    "ranchi": { x: 490, y: 380 },
    "dehradun": { x: 330, y: 180 },
    "raipur": { x: 400, y: 450 },
    "amritsar": { x: 280, y: 170 },
    "jodhpur": { x: 230, y: 310 },
    "udaipur": { x: 240, y: 370 },
    "varanasi": { x: 440, y: 320 },
    "agra": { x: 350, y: 290 },
    "goa": { x: 240, y: 620 },
    "mangalore": { x: 260, y: 690 },
    "mysore": { x: 295, y: 720 },
    "mysuru": { x: 295, y: 720 },
    "madurai": { x: 330, y: 760 },
    "rajkot": { x: 180, y: 410 },
    "gwalior": { x: 330, y: 320 },
    "jabalpur": { x: 360, y: 390 },
    "allahabad": { x: 420, y: 320 },
    "prayagraj": { x: 420, y: 320 },
    "noida": { x: 345, y: 240 },
    "gurgaon": { x: 335, y: 240 },
    "gurugram": { x: 335, y: 240 },
    // Fallback — spread around the map for unknown cities
};

function getCityPosition(cityName) {
    if (!cityName) return null;
    const key = cityName.toLowerCase().trim();
    if (CITY_COORDS[key]) return CITY_COORDS[key];

    // Deterministic hash for unknown cities so they stay consistent
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    return {
        x: 150 + Math.abs(hash % 500),
        y: 180 + Math.abs((hash * 7) % 550),
    };
}

// ─── Animated Route Line ──────────────────────────────────────────────────────
function RouteLine({ from, to, index, total }) {
    if (!from || !to) return null;

    // Compute a curved path (quadratic bezier)
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // Offset the control point perpendicular to the line
    const offset = Math.min(80, Math.sqrt(dx * dx + dy * dy) * 0.3);
    const cpX = midX - (dy / Math.sqrt(dx * dx + dy * dy || 1)) * offset;
    const cpY = midY + (dx / Math.sqrt(dx * dx + dy * dy || 1)) * offset;

    const pathD = `M ${from.x} ${from.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;
    const hue = 170 + (index * 40) % 60; // Teal-to-cyan spectrum

    return (
        <g>
            {/* Glow layer */}
            <path
                d={pathD}
                fill="none"
                stroke={`hsla(${hue}, 80%, 55%, 0.25)`}
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#glow)"
            />
            {/* Main line */}
            <path
                d={pathD}
                fill="none"
                stroke={`hsla(${hue}, 85%, 60%, 0.8)`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="8 4"
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-24"
                    dur={`${1.5 + index * 0.2}s`}
                    repeatCount="indefinite"
                />
            </path>
            {/* Traveling dot */}
            <circle r="4" fill={`hsl(${hue}, 90%, 65%)`} filter="url(#glow)">
                <animateMotion
                    dur={`${3 + index * 0.5}s`}
                    repeatCount="indefinite"
                    path={pathD}
                />
            </circle>
        </g>
    );
}

// ─── City Dot ─────────────────────────────────────────────────────────────────
function CityDot({ pos, name, isOrigin }) {
    if (!pos) return null;
    return (
        <g>
            {/* Pulse ring */}
            <circle cx={pos.x} cy={pos.y} r="8" fill="none" stroke={isOrigin ? "#15B5A4" : "#F97316"} strokeWidth="1.5" opacity="0.5">
                <animate attributeName="r" from="5" to="16" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Solid dot */}
            <circle cx={pos.x} cy={pos.y} r="5" fill={isOrigin ? "#15B5A4" : "#F97316"} stroke="#0f2b35" strokeWidth="2" />
            {/* Label */}
            <text
                x={pos.x}
                y={pos.y - 12}
                textAnchor="middle"
                fill="rgba(255,255,255,0.85)"
                fontSize="11"
                fontWeight="700"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
            >
                {name}
            </text>
        </g>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveRouteMap() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await fetch(`${API_URL}/trips`);
                const data = await res.json();
                setTrips(data);
            } catch (err) {
                console.error("Error fetching trips for map:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
        // Refresh every 30s for live feel
        const interval = setInterval(fetchTrips, 30000);
        return () => clearInterval(interval);
    }, []);

    const activeTrips = trips.filter((t) => t.status === "On Trip");

    // Collect unique cities from active trips
    const citySet = new Map();
    activeTrips.forEach((trip) => {
        if (trip.origin) {
            const pos = getCityPosition(trip.origin);
            citySet.set(trip.origin.toLowerCase().trim(), { name: trip.origin, pos, isOrigin: true });
        }
        if (trip.destination) {
            const pos = getCityPosition(trip.destination);
            const key = trip.destination.toLowerCase().trim();
            if (!citySet.has(key)) {
                citySet.set(key, { name: trip.destination, pos, isOrigin: false });
            }
        }
    });

    return (
        <div className="w-full h-full flex overflow-hidden">
            {/* ── SVG MAP AREA ──────────────────────────────────────── */}
            <div className="flex-1 relative">
                {/* Grid background pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(21,181,164,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(21,181,164,0.3) 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                    }}
                />

                <svg
                    viewBox="100 100 600 750"
                    className="w-full h-full relative z-10"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        {/* Glow filter */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Soft shadow for text */}
                        <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                        </filter>
                    </defs>

                    {/* India outline (simplified) */}
                    <path
                        d="M280,140 C240,170 230,200 250,230 C230,260 200,300 180,360 C160,420 170,450 180,480 C165,500 160,530 170,560 C180,590 200,610 220,620 C230,650 240,680 260,720 C270,740 280,770 290,800 C295,810 300,810 310,800 C320,780 330,760 340,750 C360,720 380,710 400,700 C420,680 430,650 440,620 C450,590 460,560 450,530 C460,500 470,470 460,440 C470,410 480,390 500,380 C520,370 540,380 560,400 C570,390 580,370 570,350 C580,330 600,310 620,290 C630,270 620,260 610,250 C600,240 580,250 560,240 C540,230 520,220 500,220 C480,210 460,220 440,230 C430,240 420,250 410,270 C400,260 390,250 380,240 C370,220 360,200 350,180 C340,170 330,160 310,150 C300,145 290,142 280,140 Z"
                        fill="rgba(21,181,164,0.06)"
                        stroke="rgba(21,181,164,0.2)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />

                    {/* Route lines */}
                    {activeTrips.map((trip, i) => {
                        const from = getCityPosition(trip.origin);
                        const to = getCityPosition(trip.destination);
                        return (
                            <RouteLine
                                key={trip.id}
                                from={from}
                                to={to}
                                index={i}
                                total={activeTrips.length}
                            />
                        );
                    })}

                    {/* City dots */}
                    {[...citySet.values()].map((city, i) => (
                        <CityDot key={i} pos={city.pos} name={city.name} isOrigin={city.isOrigin} />
                    ))}

                    {/* "No active routes" fallback */}
                    {!loading && activeTrips.length === 0 && (
                        <text
                            x="400"
                            y="480"
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.3)"
                            fontSize="18"
                            fontWeight="700"
                            fontFamily="'Plus Jakarta Sans', sans-serif"
                        >
                            No active routes
                        </text>
                    )}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 flex items-center gap-4 z-20">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#15B5A4] shadow-[0_0_6px_#15B5A4]" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Origin</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-[0_0_6px_#F97316]" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Destination</span>
                    </div>
                </div>
            </div>

            {/* ── ACTIVE TRIPS SIDEBAR ────────────────────────────── */}
            <div className="w-56 border-l border-white/10 bg-white/5 backdrop-blur-sm flex flex-col">
                <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-[10px] font-black text-[#15B5A4] uppercase tracking-widest">Active Trips</p>
                    <p className="text-xl font-black text-white">{activeTrips.length}</p>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin">
                    <AnimatePresence>
                        {activeTrips.length > 0 ? (
                            activeTrips.map((trip, i) => (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-white/8 border border-white/10 rounded-xl p-3 hover:bg-white/12 transition-colors cursor-default"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Truck size={12} className="text-[#15B5A4]" />
                                        <span className="text-xs font-black text-white truncate">
                                            {trip.type || `Vehicle #${trip.vehicle_id}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-white/60 font-semibold">
                                        <MapPin size={9} className="text-[#15B5A4] shrink-0" />
                                        <span className="truncate">{trip.origin || "—"}</span>
                                        <ArrowRight size={9} className="text-white/30 shrink-0" />
                                        <span className="truncate">{trip.destination || "—"}</span>
                                    </div>
                                    <div className="mt-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#15B5A4]/20 text-[#15B5A4]">
                                            En Route
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/30 text-center py-8">
                                <Navigation size={20} className="mb-2 opacity-40" />
                                <p className="text-[10px] font-bold uppercase tracking-wider">No active trips</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
