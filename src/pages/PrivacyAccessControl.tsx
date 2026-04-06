import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { RiCheckLine, RiCloseLine, RiShieldLine, RiRefreshLine } from 'react-icons/ri';
import Modal from '../components/common/Modal';
import { useApp } from '../contexts/AppContext';

const ACCESS_ITEMS = [
  { label: 'Read email subject & body', allowed: true },
  { label: 'Read sender and domain', allowed: true },
  { label: 'Delete emails', allowed: false },
  { label: 'Modify emails', allowed: false },
  { label: 'Send emails', allowed: false },
];

const SECURITY_MEASURES = [
  'OAuth-based login (no passwords stored)',
  'Read-only access',
  'Encrypted session tokens',
  'No permanent email storage',
];

const PrivacyAccessControl: React.FC = () => {
  const { wipeAllData } = useApp();
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeMessage, setWipeMessage] = useState<string | null>(null);

  const handleWipeData = async () => {
    setIsWiping(true);
    await new Promise((r) => setTimeout(r, 1500));
    wipeAllData();
    setIsWiping(false);
    setShowWipeModal(false);
    setWipeMessage('All personal data has been wiped for this session.');
    window.setTimeout(() => setWipeMessage(null), 6000);
  };

  return (
    <div className="flex-1 overflow-auto dark:bg-[#0f172a]">
      <Header title="Privacy & Access Control" />

      <div className="w-full max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-8">
        <p className="text-sm text-slate-500 text-center max-w-xl mx-auto dark:text-[#94a3b8]">
          Your data is protected. We only access what is required for monitoring.
        </p>

          {/* What Ironbox Can Access */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-[#1e293b] dark:border-[#334155]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#f8fafc]">What Ironbox Can Access</h2>
            <ul className="space-y-3">
              {ACCESS_ITEMS.map((item) => (
                <li key={item.label} className="flex items-center space-x-3">
                  {item.allowed ? (
                    <RiCheckLine className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <RiCloseLine className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-gray-800 dark:text-[#cbd5e1]">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Security Measures */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-[#1e293b] dark:border-[#334155]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2 dark:text-[#f8fafc]">
              <RiShieldLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Security Measures</span>
            </h2>
            <ul className="space-y-3">
              {SECURITY_MEASURES.map((item) => (
                <li key={item} className="flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 flex-shrink-0 dark:bg-[#64748b]" />
                  <span className="text-gray-800 dark:text-[#cbd5e1]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Control */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-[#1e293b] dark:border-[#334155]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 dark:text-[#f8fafc]">Account Control</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowWipeModal(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm hover:shadow-md dark:bg-red-700 dark:hover:bg-red-800 dark:shadow-[0_0_18px_rgba(239,68,68,0.18)]"
              >
                <RiRefreshLine className="w-5 h-5" />
                <span>Wipe All Stored Monitoring Data</span>
              </button>
              {wipeMessage ? (
                <p
                  className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2"
                  role="status"
                >
                  {wipeMessage}
                </p>
              ) : null}
              <p className="text-sm text-slate-500 dark:text-[#94a3b8]">
                Wipe applies to this session only; a full page reload restores data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showWipeModal}
        onClose={() => setShowWipeModal(false)}
        title="Wipe All Stored Monitoring Data"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-[#cbd5e1]">
            This clears monitoring data and the incidents desk view for this browser session only. Refreshing or reopening the app restores the original demo data. Nothing is written to permanent storage for this action.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowWipeModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors dark:border-[#334155] dark:text-[#cbd5e1] dark:hover:bg-[#243247]"
            >
              Cancel
            </button>
            <button
              onClick={handleWipeData}
              disabled={isWiping}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center space-x-2 dark:bg-red-700 dark:hover:bg-red-800 dark:shadow-[0_0_18px_rgba(239,68,68,0.18)]"
            >
              {isWiping ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Wiping...</span>
                </>
              ) : (
                <>
                  <RiRefreshLine className="w-4 h-4" />
                  <span>Wipe Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacyAccessControl;
