import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Sidebar from './components/layout/Sidebar';
import FlaggedEmails from './pages/FlaggedEmails';
import KeywordMonitoring from './pages/KeywordMonitoring';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Privacy from './pages/Privacy';
import Settings from './pages/Settings';

function App() {
  try {
    return (
      <SettingsProvider>
        <AppProvider>
          <Router>
            <div className="flex h-screen bg-slate-50">
              <Sidebar />
              <div className="flex-1 ml-72 bg-slate-50">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
  </SettingsProvider>
    );
  } catch (error) {
    console.error('App Error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error Loading App</h1>
        <pre>{String(error)}</pre>
      </div>
    );
  }
}

export default App;
