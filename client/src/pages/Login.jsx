import { useState } from "react";
import { LogIn, Globe, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors ${darkMode ? 'bg-gray-950' : 'bg-[#0a192f]'}`}>
      {/* Background effects */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`rounded-2xl shadow-2xl p-8 lg:p-12 w-full max-w-md relative z-10 ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-gradient-to-br from-[#15B5A4] to-[#1C3F4E] p-2 rounded-xl"><Globe className="text-white" size={24} /></div>
          <span className={`text-2xl font-black uppercase ${darkMode ? 'text-white' : 'text-[#1C3F4E]'}`}>Fleet<span className="text-[#15B5A4]">Flow</span></span>
        </div>

        <h2 className={`text-2xl font-bold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
        <p className={`text-center mb-8 text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Sign in to your logistics command center.</p>

        {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-semibold border border-red-500/20">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
            <input type="text" required className={`w-full border rounded-xl p-3.5 focus:ring-2 focus:ring-brand-teal outline-none transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-slate-200 bg-slate-50'}`} placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} required className={`w-full border rounded-xl p-3.5 pr-12 focus:ring-2 focus:ring-brand-teal outline-none transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-slate-200 bg-slate-50'}`} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-teal hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg mt-4">
            Sign In <LogIn className="w-5 h-5" />
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>
          Don't have an account? <Link to="/register" className="text-brand-teal font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}