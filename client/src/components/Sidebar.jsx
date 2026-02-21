import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Map, Wrench, DollarSign, Users, BarChart3, Globe, LogOut, User } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-2 border-b border-slate-100">
        <div className="bg-brand-teal p-1.5 rounded-lg shadow-sm"><Globe className="text-white" size={24} /></div>
        <span className="text-2xl font-black text-brand-dark uppercase">FleetFlow</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${location.pathname === item.path ? 'bg-brand-teal/10 text-brand-teal shadow-sm border border-brand-teal/5' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-dark'}`}>
            <item.icon size={20} className={location.pathname === item.path ? 'text-brand-teal' : 'text-slate-400'} />
            {item.name}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-dark rounded-full flex items-center justify-center text-white shadow-md"><User size={18} /></div>
            <p className="text-xs font-black text-brand-dark leading-none">Console</p>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors" title="Logout"><LogOut size={20} /></button>
        </div>
      </div>
    </div>
  );
}