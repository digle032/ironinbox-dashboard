import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Header from '../components/layout/Header';
import Toast from '../components/common/Toast';
import { 
  RiShieldCheckLine, 
  RiLockLine, 
  RiShieldLine,
  RiMailLine,
  RiCheckLine
} from 'react-icons/ri';

const Privacy: React.FC = () => {
  const { security, updateSecurity } = useSettings();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50">
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      <Header title="Privacy & Security" />

      <div className="p-8 space-y-6 animate-fade-in max-w-5xl mx-auto">
        
        {/* Security Status Overview */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <RiShieldCheckLine className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Security Status: Protected</h2>
                <p className="text-emerald-100">All security features are active and monitoring</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold">98%</div>
              <div className="text-sm text-emerald-100">Security Score</div>
            </div>
          </div>
          
          {/* Live Security Settings Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-xs text-emerald-100 mb-1">2FA Status</p>
              <p className="font-bold">{security.twoFactorEnabled ? '✓ Enabled' : '✗ Disabled'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-emerald-100 mb-1">Encryption</p>
              <p className="font-bold">{security.dataEncryption ? '🔒 Active' : '🔓 Off'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-emerald-100 mb-1">Session Timeout</p>
              <p className="font-bold">{security.sessionTimeout} min</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-emerald-100 mb-1">Email Alerts</p>
              <p className="font-bold">{security.emailAlerts ? '✓ On' : '✗ Off'}</p>
            </div>
          </div>
        </div>

        {/* Authentication Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <RiLockLine className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authentication & Access</h3>
              <p className="text-sm text-slate-500">Manage login security and access controls</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                  {security.twoFactorEnabled && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <RiCheckLine className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={security.twoFactorEnabled}
                  onChange={(e) => {
                    updateSecurity({ twoFactorEnabled: e.target.checked });
                    showNotification(e.target.checked ? '🔐 2FA enabled' : '🔓 2FA disabled');
                  }}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Session Timeout */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Session Timeout</h4>
                <p className="text-xs text-slate-600">Auto-logout after inactivity</p>
              </div>
              <select 
                value={security.sessionTimeout}
                onChange={(e) => {
                  updateSecurity({ sessionTimeout: e.target.value });
                  showNotification(`⏱️ Session timeout set to ${e.target.value} minutes`);
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>

            {/* Login History */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Login History</h4>
                <p className="text-xs text-slate-600">View recent account access</p>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-blue-200 transition-all">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Data Protection */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <RiShieldLine className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Data Protection</h3>
              <p className="text-sm text-slate-500">Control how your data is stored and processed</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Data Encryption */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-purple-200 transition-all group">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900">End-to-End Encryption</h4>
                  {security.dataEncryption && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <RiCheckLine className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">All data is encrypted at rest and in transit</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={security.dataEncryption}
                  onChange={(e) => {
                    updateSecurity({ dataEncryption: e.target.checked });
                    showNotification(e.target.checked ? '🔒 Encryption enabled' : '🔓 Encryption disabled');
                  }}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Data Retention */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Data Retention Policy</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Flagged Emails:</span>
                  <span className="font-semibold text-slate-900">90 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Released Emails:</span>
                  <span className="font-semibold text-slate-900">30 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Activity Logs:</span>
                  <span className="font-semibold text-slate-900">1 year</span>
                </div>
              </div>
            </div>

            {/* Export Data */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-purple-200 transition-all group cursor-pointer">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Export Your Data</h4>
                <p className="text-xs text-slate-600">Download a copy of all your data</p>
              </div>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-purple-200 transition-all">
                Request Export
              </button>
            </div>
          </div>
        </div>

        {/* Notifications & Alerts */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <RiMailLine className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Security Alerts</h3>
              <p className="text-sm text-slate-500">Get notified about security events</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Email Alerts</h4>
                <p className="text-xs text-slate-600">Receive security notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={security.emailAlerts}
                  onChange={(e) => {
                    updateSecurity({ emailAlerts: e.target.checked });
                    showNotification(e.target.checked ? '📧 Email alerts enabled' : '📭 Email alerts disabled');
                  }}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 flex items-start space-x-3">
          <RiCheckLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Auto-Save Enabled</p>
            <p className="text-blue-600">All security settings are saved automatically. Your preferences are stored securely in your browser.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
