import React from 'react';
import Modal from '../common/Modal';
import { FlaggedEmail } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { getVisibleSignals } from '../../utils/keywordSignals';
import { RiAlertLine, RiKeyLine, RiShieldCheckLine, RiTimeLine, RiUser3Line } from 'react-icons/ri';
import { BiEnvelope } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

interface EmailDetailModalProps {
  email: FlaggedEmail | null;
  onClose: () => void;
}

const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose }) => {
  const { releaseEmail, keywords, createIncidentFromFlaggedEmail } = useApp();
  const navigate = useNavigate();
  const [showCreateIncidentPanel, setShowCreateIncidentPanel] = React.useState(false);
  const [assignedTo, setAssignedTo] = React.useState('SOC Team');
  const [dueDate, setDueDate] = React.useState(() => {
    const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    nextDay.setHours(17, 0, 0, 0);
    const offsetMs = nextDay.getTimezoneOffset() * 60 * 1000;
    return new Date(nextDay.getTime() - offsetMs).toISOString().slice(0, 16);
  });

  if (!email) return null;

  const visibleSignals = getVisibleSignals(email, keywords);

  const handleRelease = () => { releaseEmail(email.id); onClose(); };

  const handleCreateIncident = () => {
    if (!dueDate) return;
    const parsed = new Date(dueDate);
    if (Number.isNaN(parsed.getTime())) return;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const sameDay   = parsed.toDateString() === now.toDateString();
    const isTomorrow = parsed.toDateString() === tomorrow.toDateString();
    const timePart  = parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const datePart  = parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const friendlyDueDate = sameDay ? `Today, ${timePart}` : isTomorrow ? `Tomorrow, ${timePart}` : `${datePart}, ${timePart}`;
    createIncidentFromFlaggedEmail(email, { dueDate: friendlyDueDate, assignedTo: assignedTo.trim() || 'SOC Team' });
    setShowCreateIncidentPanel(false);
    onClose();
    navigate('/incidents');
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800/60';
      case 'High':     return 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-800/60';
      case 'Medium':   return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/60';
      default:         return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/60';
    }
  };

  const inputCls = 'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#e2e8f0] dark:focus:border-cyan-500/40';

  return (
    <Modal isOpen={!!email} onClose={onClose} title="Email Analysis Report">
      <div className="space-y-6 animate-fade-in">

        {/* Email header */}
        <div className="rounded-lg border p-4 bg-slate-50/80 border-slate-200 dark:bg-[#060f1e] dark:border-[#0f2a4a]">
          <div className="flex items-start justify-between mb-4 gap-4">
            <h3 className="text-sm font-bold text-slate-900 leading-tight dark:text-[#e2e8f0]">{email.subject}</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 font-mono ${getRiskBadge(email.riskLevel)}`}>
              {email.riskLevel.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <RiUser3Line className="w-4 h-4" />, label: 'Sender',   value: email.sender },
              { icon: <RiTimeLine className="w-4 h-4" />,  label: 'Received', value: email.received },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 dark:bg-[#0a1628] dark:border-[#0f2a4a] text-slate-400 dark:text-[#2a4a6a]">
                  {icon}
                </div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-[#2a4a6a]">{label}</p>
                  <p className="text-xs font-medium text-slate-800 dark:text-[#94a3b8]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detection signals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RiAlertLine className="w-4 h-4 text-slate-400 dark:text-[#2a4a6a]" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
              Detection Signals
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded dark:bg-[#0f2040] dark:text-[#4a6080]">
              {visibleSignals.length}
            </span>
          </div>

          <div className="space-y-2">
            {visibleSignals.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-[#2a4a6a]">
                No active detection signals based on your current keyword settings.
              </p>
            ) : visibleSignals.map((signal, index) => (
              <div key={index}
                   className={`p-3 rounded-lg border transition-colors
                               ${signal.type === 'keyword'
                                 ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'
                                 : 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-md ${signal.type === 'keyword' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'}`}>
                    {signal.type === 'keyword' ? <RiKeyLine className="w-4 h-4" /> : <BiEnvelope className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${signal.type === 'keyword' ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
                      {signal.type === 'keyword' ? 'Keyword Detected' : 'Suspicious Domain'}
                    </span>
                    <p className="text-xs text-slate-700 font-medium mt-0.5 dark:text-[#94a3b8]">{signal.description}</p>
                    <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border bg-white/70 dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:text-[#94a3b8]">
                      {signal.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#0f2a4a]">
          <p className="text-[10px] font-mono text-slate-400 dark:text-[#2a4a6a]">
            Analysis ID: #{email.id}-{Date.now().toString().slice(-6)}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowCreateIncidentPanel(prev => !prev)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border transition-colors
                         bg-white border-slate-200 text-slate-700 hover:bg-slate-50
                         dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#94a3b8] dark:hover:bg-[#132843]">
              {showCreateIncidentPanel ? 'Cancel' : 'Create Incident'}
            </button>
            <button onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors
                         text-slate-600 hover:bg-slate-50 dark:text-[#4a6080] dark:hover:bg-white/[0.03] dark:hover:text-[#e2e8f0]">
              Close
            </button>
            <button onClick={handleRelease}
              className="px-4 py-2 text-xs font-semibold rounded-lg transition-all
                         bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5">
              <RiShieldCheckLine className="w-3.5 h-3.5" />
              Release Email
            </button>
          </div>
        </div>

        {/* Create incident panel */}
        {showCreateIncidentPanel && (
          <div className="rounded-lg border p-4 bg-blue-50/50 border-blue-200 dark:bg-cyan-500/[0.05] dark:border-cyan-500/20">
            <h4 className="text-xs font-bold text-blue-700 dark:text-cyan-300 mb-1">Create Linked Incident</h4>
            <p className="text-xs text-slate-500 mb-4 dark:text-[#2a4a6a]">
              Review these fields, then confirm to avoid accidental incident creation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1.5 dark:text-[#2a4a6a]">Due Date</label>
                <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-1.5 dark:text-[#2a4a6a]">Assigned To</label>
                <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="SOC Team" className={inputCls} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={handleCreateIncident} disabled={!dueDate}
                className="px-4 py-2 text-xs font-semibold rounded-lg transition-colors
                           bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                           dark:bg-cyan-500 dark:text-[#040c18] dark:hover:bg-cyan-400">
                Confirm & Create Incident
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmailDetailModal;
