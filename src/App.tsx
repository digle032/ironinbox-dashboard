import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import FlaggedEmails from './pages/FlaggedEmails';
import KeywordMonitoring from './pages/KeywordMonitoring';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Login from './pages/Login';

function App() {
  try {
    return (
      <SettingsProvider>
        <AuthProvider>
          <AppProvider>
            <Router basename={import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inbox" element={<Inbox />} />
                  <Route path="flagged-emails" element={<FlaggedEmails />} />
                  <Route path="keyword-monitoring" element={<KeywordMonitoring />} />
                </Route>
              </Routes>
            </Router>
          </AppProvider>
        </AuthProvider>
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
