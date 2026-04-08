import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { RiCheckLine, RiCloseLine, RiShieldLine, RiRefreshLine, RiLockLine } from 'react-icons/ri';
import Modal from '../components/common/Modal';
import { useApp } from '../contexts/AppContext';

const ACCESS_ITEMS = [
  { label: 'Read email subject & body', allowed: true },
  { label: 'Read sender and domain',    allowed: true },
  { label: 'Delete emails',             allowed: false },
  { label: 'Modify emails',             allowed: false },
  { label: 'Send emails',               allowed: false },
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
  const [isWiping, setIsWiping]           = useState(false);
  const [wipeMessage, setWipeMessage]     = useState<string | null>(null);

  const handleWipeData = async () => {
    setIsWiping(true);
    await new Promise((r) => setTimeout(r, 1500));
    wipeAllData();
    setIsWiping(false);
    setShowWipeModal(false);
    setWipeMessage('All personal data has been wiped for this session.');
    window.setTimeout(() => setWipeMessage(null), 6000);
  };

  const panel = 'bg-white border border-slate-200 rounded-xl p-5 dark:bg-[#0a1628] dark:border-[#0f2a4a]';
  const sectionHead = 'text-sm font-semibold text-slate-800 dark:text-[#e2e8f0] mb-4 flex items-center gap-2';

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#040c18]">
      <Header title="Privacy & Access Control" />

      <div className="w-full max-w-3xl mx-auto px-6 py-6 space-y-4">

        <p className="text-xs text-center text-slate-400 dark:text-[#2a4a6a] pb-1">
          Your data is protected. We only access what is required for monitoring.
        </p>

        {/* What IronInbox Can Access */}
        <div className={panel}>
          <h2 className={sectionHead}>
            <RiLockLine className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
            What IronInbox Can Access
          </h2>
          <ul className="space-y-2.5">
            {ACCESS_ITEMS.map((item) => (
              <li key={item.label} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-b-0 dark:border-[#0f2a4a]">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${item.allowed ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-red-50 dark:bg-red-950/40'}`}>
                  {item.allowed
                    ? <RiCheckLine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    : <RiCloseLine className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                </div>
                <span className="text-sm text-slate-700 dark:text-[#94a3b8]">{item.label}</span>
                <span className={`ml-auto text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded
                                 ${item.allowed
                                   ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                                   : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40'}`}>
                  {item.allowed ? 'Allowed' : 'Denied'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Security Measures */}
        <div className={panel}>
          <h2 className={sectionHead}>
            <RiShieldLine className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
            Security Measures
          </h2>
          <ul className="space-y-3">
            {SECURITY_MEASURES.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-[#94a3b8]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Account Control */}
        <div className={panel}>
          <h2 className={sectionHead}>Account Control</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowWipeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                         bg-red-600 text-white hover:bg-red-700"
            >
              <RiRefreshLine className="w-4 h-4" />
              Wipe All Stored Monitoring Data
            </button>

            {wipeMessage && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2
                            dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800/50"
                 role="status">
                {wipeMessage}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-[#2a4a6a]">
              Wipe applies to this session only; a full page reload restores data.
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={showWipeModal} onClose={() => setShowWipeModal(false)} title="Wipe All Stored Monitoring Data">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-[#94a3b8]">
            This clears monitoring data and the incidents desk view for this browser session only.
            Refreshing or reopening the app restores the original demo data. Nothing is written to permanent storage.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowWipeModal(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                         border-slate-200 text-slate-700 hover:bg-slate-50
                         dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-white/[0.03]">
              Cancel
            </button>
            <button onClick={handleWipeData} disabled={isWiping}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
              {isWiping ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Wiping…</span></>
              ) : (
                <><RiRefreshLine className="w-4 h-4" /><span>Wipe Data</span></>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrivacyAccessControl;
