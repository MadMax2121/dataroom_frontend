import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/pages/Dashboard';
import DataRooms from './components/pages/DataRooms';
import Documents from './components/pages/Documents';
import Analytics from './components/pages/Analytics';
import AccessLinks from './components/pages/AccessLinks';
import Settings from './components/pages/Settings';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/datarooms" element={<DataRooms />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/access-links" element={<AccessLinks />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;