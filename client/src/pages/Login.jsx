import { useState } from "react";
import { User, Lock, LogIn } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Success! Redirect the user to the dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Cool Background Graphic */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-teal/20 rounded-full blur-[120px]" />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">FLEET<span className="text-brand-teal">FLOW</span></h2>
          <p className="text-gray-500 font-medium mt-1">Sign in to your dashboard</p>
        </div>
        
        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded-lg py-3 pl-10 focus:ring-2 focus:ring-brand-teal outline-none transition-all" 
                placeholder="Enter your username"
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password" 
                required 
                className="w-full border border-gray-300 rounded-lg py-3 pl-10 focus:ring-2 focus:ring-brand-teal outline-none transition-all" 
                placeholder="••••••••"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-brand-teal hover:bg-teal-600 text-white font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 transition-all shadow-lg mt-4">
            Sign In <LogIn className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account? <a href="/register" className="text-brand-orange font-bold hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}