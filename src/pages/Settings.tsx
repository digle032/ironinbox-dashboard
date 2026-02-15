import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Header from '../components/layout/Header';
import Toast from '../components/common/Toast';
import { 
  RiSettings3Line,
  RiUserLine,
  RiBellLine,
  RiPaletteLine,
  RiTimeLine,
  RiMailLine,
  RiDownloadLine,
  RiCheckLine
} from 'react-icons/ri';

const Settings: React.FC = () => {
  const { profile, appearance, notifications, advanced, updateProfile, updateAppearance, updateNotifications, updateAdvanced, resetToDefaults, exportSettings, clearCache } = useSettings();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleTimezoneChange = (tz: string) => {
    updateAppearance({ timezone: tz });
    showNotification(`🕐 Timezone updated to ${tz}`);
  };

  const handleAutoRefreshToggle = (enabled: boolean) => {
    updateAdvanced({ autoRefresh: enabled });
    showNotification(enabled ? '🔄 Auto-refresh enabled' : '⏸️ Auto-refresh disabled');
  };

  const handleNotificationToggle = (enabled: boolean) => {
    updateNotifications({ pushNotifications: enabled });
    showNotification(enabled ? '🔔 Push notifications enabled' : '🔕 Push notifications disabled');
  };

  const handleSoundToggle = (enabled: boolean) => {
    updateNotifications({ soundEnabled: enabled });
    showNotification(enabled ? '🔊 Sound effects enabled' : '🔇 Sound effects disabled');
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50/50">
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      <Header title="Settings" />

      <div className="p-8 space-y-6 animate-fade-in max-w-5xl mx-auto">
        
        {/* Current Settings Display */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <RiCheckLine className="w-5 h-5 mr-2" />
            Current Settings (Live Preview)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Timezone</p>
              <p className="font-bold">{appearance.timezone}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Notifications</p>
              <p className="font-bold">{notifications.pushNotifications ? '🔔 ON' : '🔕 OFF'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Sound</p>
              <p className="font-bold">{notifications.soundEnabled ? '🔊 ON' : '🔇 OFF'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-blue-100 text-xs mb-1">Auto-Refresh</p>
              <p className="font-bold">{advanced.autoRefresh ? '🔄 ON' : '⏸️ OFF'}</p>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <RiUserLine className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Profile Settings</h3>
              <p className="text-sm text-slate-500">Manage your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Profile Picture & Name */}
            <div className="flex items-center space-x-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <img 
                src={profile.avatar} 
                alt="Profile" 
                className="w-20 h-20 rounded-full shadow-md ring-4 ring-white"
              />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-slate-900 mb-1">{profile.name}</h4>
                <p className="text-sm text-slate-600 mb-3">{profile.email}</p>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-blue-200 transition-all">
                  Change Picture
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <label className="text-sm font-bold text-slate-900 mb-2 block">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
                onBlur={() => showNotification(`👤 Name updated to: ${profile.name}`)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
              <p className="text-xs text-slate-500 mt-2">This name appears in the sidebar and header</p>
            </div>

            {/* Email Field */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <label className="text-sm font-bold text-slate-900 mb-2 block">Email Address</label>
              <input 
                type="email" 
                value={profile.email}
                onChange={(e) => updateProfile({ email: e.target.value })}
                onBlur={() => showNotification(`📧 Email updated to: ${profile.email}`)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your.email@company.com"
              />
              <p className="text-xs text-slate-500 mt-2">Your primary contact email</p>
            </div>

            {/* Role */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <label className="text-sm font-bold text-slate-900 mb-2 block">Role</label>
              <input 
                type="text" 
                value={profile.role}
                disabled
                className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <RiPaletteLine className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Appearance</h3>
              <p className="text-sm text-slate-500">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Timezone */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <RiTimeLine className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Timezone</h4>
                  <p className="text-xs text-slate-600">Set your timezone</p>
                </div>
              </div>
              <select 
                value={appearance.timezone}
                onChange={(e) => handleTimezoneChange(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC-8">Pacific (UTC-8)</option>
                <option value="UTC-7">Mountain (UTC-7)</option>
                <option value="UTC-6">Central (UTC-6)</option>
                <option value="UTC-5">Eastern (UTC-5)</option>
                <option value="UTC+0">GMT (UTC+0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <RiBellLine className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
              <p className="text-sm text-slate-500">Configure notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Push Notifications</h4>
                <p className="text-xs text-slate-600">Receive real-time alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.pushNotifications}
                  onChange={(e) => handleNotificationToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-amber-200 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Sound Effects</h4>
                <p className="text-xs text-slate-600">Play sounds for notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.soundEnabled}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            {/* Email Digest */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
              <label className="text-sm font-bold text-slate-900 mb-3 block flex items-center">
                <RiMailLine className="w-4 h-4 mr-2" />
                Email Digest Frequency
              </label>
              <select 
                value={notifications.emailDigest}
                onChange={(e) => {
                  updateNotifications({ emailDigest: e.target.value });
                  showNotification(`📧 Email digest set to ${e.target.value}`);
                }}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="daily">Daily Summary</option>
                <option value="weekly">Weekly Summary</option>
                <option value="monthly">Monthly Summary</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <RiSettings3Line className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Advanced Settings</h3>
              <p className="text-sm text-slate-500">System and data management</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Auto Refresh */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-red-200 transition-all group">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Auto-Refresh Dashboard</h4>
                <p className="text-xs text-slate-600">Automatically update data every 30 seconds</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={advanced.autoRefresh}
                  onChange={(e) => handleAutoRefreshToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* Clear Cache */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-red-200 transition-all group cursor-pointer">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Clear Cache</h4>
                <p className="text-xs text-slate-600">Remove temporary files and data</p>
              </div>
              <button 
                onClick={() => {
                  clearCache();
                  showNotification('🗑️ Cache cleared successfully');
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
              >
                Clear Now
              </button>
            </div>

            {/* Export Settings */}
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-red-200 transition-all group cursor-pointer">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Export Settings</h4>
                <p className="text-xs text-slate-600">Download your configuration</p>
              </div>
              <button 
                onClick={() => {
                  exportSettings();
                  showNotification('📥 Settings exported successfully');
                }}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:border-red-200 transition-all flex items-center space-x-2"
              >
                <RiDownloadLine className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button 
            onClick={() => {
              resetToDefaults();
              showNotification('↺ All settings reset to defaults');
            }}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all font-medium"
          >
            Reset to Defaults
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 flex items-start space-x-3">
          <RiCheckLine className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Auto-Save Enabled</p>
            <p className="text-blue-600">All your changes are saved automatically to your browser. No need to click save!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
