import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Map, Wrench, DollarSign, Users, BarChart3, Globe, LogOut, User, Sun, Moon, Info, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  // Read logged-in user's name from localStorage
  const getUserName = () => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Login response: { message, user: { id, username, name } }
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
      {/* Logo + Settings */}
      <div className={`p-6 flex items-center justify-between border-b ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-brand-teal p-1.5 rounded-lg shadow-sm"><Globe className="text-white" size={24} /></div>
          <span className={`text-2xl font-black uppercase ${darkMode ? 'text-white' : 'text-brand-dark'}`}>FleetFlow</span>
        </div>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
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

      {/* Bottom Section: About Us + User */}
      <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-800' : 'border-slate-100'}`}>
        <Link
          to="/about"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-all mb-3 ${darkMode
              ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-50 hover:text-brand-dark'
            }`}
        >
          <Info size={18} className={darkMode ? 'text-gray-500' : 'text-slate-400'} />
          About Us
        </Link>

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
    </div>
  );
}