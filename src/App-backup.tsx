import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import FlaggedEmails from './pages/FlaggedEmails';
import KeywordMonitoring from './pages/KeywordMonitoring';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Navigate to="/flagged-emails" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/flagged-emails" element={<FlaggedEmails />} />
              <Route path="/keyword-monitoring" element={<KeywordMonitoring />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
