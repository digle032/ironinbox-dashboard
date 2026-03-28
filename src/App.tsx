import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import { useRole } from './utils/useRole';
import FlaggedEmails from './pages/FlaggedEmails';
import KeywordMonitoring from './pages/KeywordMonitoring';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Login from './pages/Login';
import PrivacyAccessControl from './pages/PrivacyAccessControl';
import Settings from './pages/Settings';
import Incidents from './pages/Incidents';

function AppShell() {
  const { hasPermission } = useRole();
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f172a]">
      <Sidebar
        canViewInbox={hasPermission('canViewInbox')}
        canViewFlaggedEmails={hasPermission('canViewFlaggedEmails')}
        canViewKeywordMonitoring={hasPermission('canViewKeywordMonitoring')}
      />
      <div className="flex-1 ml-72 bg-slate-50 dark:bg-[#0f172a]">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  try {
    return (
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />

                  <Route
                    element={
                      <ProtectedRoute>
                        <AppShell />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="/flagged-emails" element={<FlaggedEmails />} />
                    <Route path="/incidents" element={<Incidents totalIncidents={0} />} />
                    <Route path="/keyword-monitoring" element={<KeywordMonitoring />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/privacy-access-control" element={<PrivacyAccessControl />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </Router>
            </AppProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>

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
