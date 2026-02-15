import React from 'react';
import Modal from '../common/Modal';
import { FlaggedEmail } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { RiAlertLine, RiKeyLine, RiShieldCheckLine, RiTimeLine, RiUser3Line } from 'react-icons/ri';
import { BiEnvelope } from 'react-icons/bi';

interface EmailDetailModalProps {
  email: FlaggedEmail | null;
  onClose: () => void;
}

const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose }) => {
  const { releaseEmail } = useApp();

  if (!email) return null;

  const handleRelease = () => {
    releaseEmail(email.id);
    onClose();
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'text-red-700 bg-red-50 border-red-200 ring-red-500/30';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200 ring-orange-500/30';
      case 'Medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 ring-yellow-500/30';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200 ring-blue-500/30';
    }
  };

  return (
    <Modal isOpen={!!email} onClose={onClose} title="Email Analysis Report">
      <div className="space-y-8 animate-fade-in">
        {/* Email Header Info */}
        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 leading-tight max-w-xl">{email.subject}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ring-4 ${getRiskColor(email.riskLevel)}`}>
              {email.riskLevel.toUpperCase()} RISK
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <RiUser3Line className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sender</p>
                <p className="text-sm font-medium text-slate-900">{email.sender}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <RiTimeLine className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Received</p>
                <p className="text-sm font-medium text-slate-900">{email.received}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detection Signals */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
            <RiAlertLine className="w-5 h-5 mr-2 text-slate-400" />
            Detection Signals
            <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{email.signals.length}</span>
          </h3>
          <div className="grid gap-3">
            {email.signals.map((signal, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                  signal.type === 'keyword'
                    ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                    : 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    signal.type === 'keyword' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {signal.type === 'keyword' ? <RiKeyLine className="w-5 h-5" /> : <BiEnvelope className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        signal.type === 'keyword' ? 'text-amber-700' : 'text-indigo-700'
                      }`}>
                        {signal.type === 'keyword' ? 'Keyword Detected' : 'Suspicious Domain'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{signal.description}</p>
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium border bg-white/50">
                      {signal.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
          <p className="text-xs text-slate-400">Analysis ID: #{email.id}-{Date.now().toString().slice(-6)}</p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleRelease}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform active:scale-95 transition-all duration-200 font-semibold text-sm flex items-center"
            >
              <RiShieldCheckLine className="mr-2 w-4 h-4" />
              Release Email
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EmailDetailModal;
