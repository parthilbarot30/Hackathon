import { useState } from "react";
import { User, Mail, Phone, MapPin, Lock, ArrowRight, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Register() {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", username: "", email: "", mobile: "", address: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Success! Redirecting to Dashboard...");
        setTimeout(() => { window.location.href = '/dashboard'; }, 1500);
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  const inputClass = `w-full border rounded-xl p-3 focus:ring-2 focus:ring-brand-teal outline-none transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'border-gray-300 bg-slate-50'}`;
  const iconInputClass = `${inputClass} pl-10`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${darkMode ? 'bg-gray-950' : 'bg-[#0a192f]'}`}>
      <div className={`rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'}`}>

        <div className="hidden md:flex flex-col justify-center items-center w-1/3 bg-brand-teal p-8 text-white text-center">
          <div className="bg-white/10 p-3 rounded-2xl mb-4"><Globe className="text-white" size={32} /></div>
          <h2 className="text-3xl font-black mb-4 tracking-tighter">FLEETFLOW</h2>
          <p className="font-medium text-teal-100">Join the next generation of fleet management.</p>
        </div>

        <div className="w-full md:w-2/3 p-8 lg:p-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create your account</h2>

          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm font-semibold border border-red-500/20">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-500/10 text-green-500 rounded-lg text-sm font-semibold border border-green-500/20">{success}</div>}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
              <input type="text" required className={inputClass} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
              <input type="text" required className={inputClass} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="text" required className={iconInputClass} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="email" required className={iconInputClass} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mobile Number</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="tel" required className={iconInputClass} value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="text" required className={iconInputClass} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="password" required className={iconInputClass} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input type="password" required className={iconInputClass} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className={`w-full text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg ${darkMode ? 'bg-brand-teal hover:bg-teal-600' : 'bg-brand-dark hover:bg-black'}`}>
                Register Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className={`md:col-span-2 text-center text-sm mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Already have an account? <Link to="/login" className="text-brand-teal font-bold hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}