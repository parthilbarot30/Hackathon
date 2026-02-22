import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Map, Wrench, DollarSign, Users, BarChart3, Globe, LogOut, User, Sun, Moon, Info, Settings, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Read logged-in user's name from localStorage
  const getUserName = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.user.name) return parsed.user.name;
        if (parsed.user && parsed.user.username) return parsed.user.username;
        if (parsed.name) return parsed.name;
        if (parsed.username) return parsed.username;
      }
    } catch (e) { }
    return "User";
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicle Registry', path: '/registry', icon: Truck },
    { name: 'Dispatcher', path: '/dispatcher', icon: Map },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className={`w-64 h-screen flex flex-col shadow-sm transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-slate-200'}`}>
      {/* Logo */}
      <div className={`p-6 flex items-center border-b ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-brand-teal p-1.5 rounded-lg shadow-sm"><Globe className="text-white" size={24} /></div>
          <span className={`text-2xl font-black uppercase ${darkMode ? 'text-white' : 'text-brand-dark'}`}>FleetFlow</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === item.path
              ? darkMode
                ? 'bg-brand-teal/20 text-brand-teal shadow-sm border border-brand-teal/10'
                : 'bg-brand-teal/10 text-brand-teal shadow-sm border border-brand-teal/5'
              : darkMode
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-brand-dark'
              }`}
          >
            <item.icon
              size={20}
              className={
                location.pathname === item.path
                  ? 'text-brand-teal'
                  : darkMode ? 'text-gray-500' : 'text-slate-400'
              }
            />
            {item.name}
          </Link>
        ))}
      </div>

      {/* Bottom Section: Settings + User */}
      <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>

        {/* Settings Button with Dropdown */}
        <div className="relative mb-3">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${darkMode
              ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-brand-dark'
              }`}
          >
            <div className="flex items-center gap-3">
              <Settings size={18} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
              Settings
            </div>
            <ChevronUp size={16} className={`transition-transform duration-200 ${settingsOpen ? 'rotate-0' : 'rotate-180'}`} />
          </button>

          {/* Settings Dropdown (opens upward) */}
          {settingsOpen && (
            <div className={`absolute bottom-full left-0 w-full mb-1 rounded-xl border shadow-lg overflow-hidden z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-400" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors ${darkMode ? 'bg-brand-teal' : 'bg-slate-300'}`} style={{ width: '32px', height: '18px' }}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${darkMode ? 'left-[14px]' : 'left-0.5'}`} style={{ width: '14px', height: '14px' }} />
                </div>
              </button>

              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-slate-100'}`} />

              {/* About Us */}
              <Link
                to="/about"
                onClick={() => setSettingsOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Info size={16} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
                About Us
              </Link>
            </div>
          )}
        </div>

        {/* User Profile + Logout */}
        <div className={`flex items-center justify-between p-3 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md ${darkMode ? 'bg-brand-teal' : 'bg-brand-dark'}`}>
              <User size={18} />
            </div>
            <p className={`text-xs font-black leading-none ${darkMode ? 'text-white' : 'text-brand-dark'}`}>{getUserName()}</p>
          </div>
          <button onClick={handleLogout} className={`p-2 rounded-xl transition-colors ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Close settings when clicking outside */}
      {settingsOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}