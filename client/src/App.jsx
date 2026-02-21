import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';       
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import Dispatcher from './pages/Dispatcher';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Drivers from './pages/Drivers';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />       
        <Route path="/register" element={<Register />} /> 

        <Route
          path="/*"
          element={
            <div className="flex h-screen bg-brand-bg">
              <Sidebar />
              <main className="flex-1 overflow-auto p-6">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/registry" element={<VehicleRegistry />} />
                  <Route path="/dispatcher" element={<Dispatcher />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/drivers" element={<Drivers />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;