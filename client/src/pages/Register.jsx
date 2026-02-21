import { useState } from "react";
import { User, Mail, Phone, MapPin, Lock, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Register() {
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Success! Redirecting to Dashboard...");
        
        // 👇 THIS IS THE REDIRECT TO DASHBOARD YOU ASKED FOR 👇
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500); 

      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex">
        
        <div className="hidden md:flex flex-col justify-center items-center w-1/3 bg-brand-teal p-8 text-white text-center">
          <h2 className="text-3xl font-black mb-4 tracking-tighter">FLEETFLOW</h2>
          <p className="font-medium text-teal-100">Join the next generation of fleet management.</p>
        </div>

        <div className="w-full md:w-2/3 p-8 lg:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create your account</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm font-semibold">{success}</div>}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" required className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" required className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="tel" required className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" required className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" required className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" required className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-brand-teal outline-none" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-brand-dark hover:bg-black text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-all shadow-md">
                Register Account <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <p className="md:col-span-2 text-center text-sm text-gray-500 mt-4">
              Already have an account? <a href="/login" className="text-brand-teal font-bold hover:underline">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}