import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import RoleGate, { AccessRestrictedBlock } from '../components/common/RoleGate';
import { useEngagementTracker } from '../utils/useEngagementTracker';
import { RiAddLine, RiMoreLine, RiDeleteBinLine } from 'react-icons/ri';

const KeywordMonitoring: React.FC = () => {
  useEngagementTracker('keyword-monitoring');
  const {
    keywords, addKeyword, deleteKeyword, toggleKeyword, updateKeyword,
    detectionOptions, detectionActions, updateDetectionOptions, updateDetectionActions,
  } = useApp();

  const [newKeyword, setNewKeyword]             = useState('');
  const [activeMenu, setActiveMenu]             = useState<string | null>(null);
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [editValue, setEditValue]               = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) { addKeyword(newKeyword.trim()); setNewKeyword(''); }
  };
  const startEditing  = (id: string, val: string) => { setEditingKeywordId(id); setEditValue(val); setActiveMenu(null); };
  const commitEdit    = (id: string) => { updateKeyword(id, editValue); setEditingKeywordId(null); setEditValue(''); };
  const cancelEdit    = () => { setEditingKeywordId(null); setEditValue(''); };

  const panel = 'bg-white border border-slate-200 rounded-xl dark:bg-[#0a1628] dark:border-[#0f2a4a]';
  const sectionHead = 'text-sm font-semibold text-slate-800 dark:text-[#e2e8f0]';
  const input = 'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:bg-[#0f2040] dark:border-[#1a3554] dark:text-[#e2e8f0] dark:placeholder:text-[#2a4a6a] dark:focus:border-cyan-500/40';
  const checkboxRow = 'flex items-start space-x-3 py-3 border-b border-slate-100 last:border-b-0 dark:border-[#0f2a4a]';

  return (
    <RoleGate permission="canViewKeywordMonitoring" fallback={<div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#040c18]"><AccessRestrictedBlock /></div>}>
      <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#040c18]">
        <Header title="Keyword Monitoring" />

        <div className="w-full max-w-4xl mx-auto px-6 py-6">
          <div className="space-y-4">

            {/* Active Keywords */}
            <div className={`${panel} p-5`}>
              <h2 className={`${sectionHead} mb-4`}>Active Keywords</h2>

              {/* Add keyword input */}
              <div className="flex items-center space-x-2 mb-5">
                <input
                  type="text" placeholder="Enter new keyword…" value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddKeyword()}
                  className={input}
                />
                <button onClick={handleAddKeyword} disabled={!newKeyword.trim()}
                  className="p-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed dark:bg-cyan-500 dark:text-[#040c18] dark:hover:bg-cyan-400 dark:disabled:bg-[#0f2040] dark:disabled:text-[#2a4a6a]">
                  <RiAddLine className="w-5 h-5" />
                </button>
              </div>

              {/* Keyword tags */}
              <div className="flex flex-wrap gap-2">
                {keywords.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-[#2a4a6a]">No keywords added yet</p>
                ) : keywords.map((keyword) => {
                  const isEditing = editingKeywordId === keyword.id;
                  return (
                    <div key={keyword.id}
                         className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                                     ${keyword.enabled
                                       ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30'
                                       : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-[#0f2040] dark:text-[#4a6080] dark:border-[#1a3554]'}`}>
                      {isEditing ? (
                        <div className="flex items-center space-x-1.5">
                          <input value={editValue} onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') commitEdit(keyword.id); if (e.key === 'Escape') cancelEdit(); }}
                            className="w-32 px-2 py-0.5 text-xs rounded border outline-none bg-white border-slate-300 text-slate-800 dark:bg-[#060f1e] dark:border-[#1a3554] dark:text-[#e2e8f0]"
                            autoFocus />
                          <button onClick={() => commitEdit(keyword.id)} className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white dark:bg-cyan-500 dark:text-[#040c18]">Save</button>
                          <button onClick={cancelEdit} className="px-2 py-0.5 text-xs rounded border border-slate-200 text-slate-600 dark:border-[#1a3554] dark:text-[#4a6080]">Cancel</button>
                        </div>
                      ) : (
                        <>
                          <span>{keyword.value}</span>
                          {!keyword.enabled && (
                            <span className="text-[9px] font-mono uppercase tracking-wider bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded dark:bg-[#0f2040] dark:text-[#2a4a6a]">off</span>
                          )}
                        </>
                      )}

                      <div className="relative">
                        <button onClick={() => setActiveMenu(activeMenu === keyword.id ? null : keyword.id)}
                          disabled={isEditing}
                          className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                          <RiMoreLine className="w-3.5 h-3.5" />
                        </button>
                        {activeMenu === keyword.id && !isEditing && (
                          <div className="absolute right-0 top-full mt-1 z-10 min-w-[140px] rounded-lg border shadow-lg overflow-hidden
                                          bg-white border-slate-200 dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:shadow-black/60">
                            <button onClick={() => startEditing(keyword.id, keyword.value)}
                              className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors dark:text-[#94a3b8] dark:hover:bg-white/[0.04]">
                              Edit
                            </button>
                            <button onClick={() => { toggleKeyword(keyword.id); setActiveMenu(null); }}
                              className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors dark:text-[#94a3b8] dark:hover:bg-white/[0.04]">
                              {keyword.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => { deleteKeyword(keyword.id); setActiveMenu(null); }}
                              className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:bg-red-950/30">
                              <RiDeleteBinLine className="w-3.5 h-3.5" />Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detection Options */}
            <div className={`${panel} p-5`}>
              <h2 className={`${sectionHead} mb-1`}>Detection Options</h2>
              <p className="text-xs text-slate-400 mb-4 dark:text-[#2a4a6a]">Configure how keyword matching operates across emails.</p>
              <div>
                {[
                  { key: 'caseInsensitive', label: 'Case-insensitive matching',  desc: 'Ignore case when matching (e.g., "Urgent" matches "urgent")' },
                  { key: 'matchInSubject',  label: 'Match in subject line',       desc: 'Search for keywords in email subject lines' },
                  { key: 'matchInBody',     label: 'Match in body',               desc: 'Search for keywords in email body content' },
                  { key: 'wholeWordOnly',   label: 'Whole-word only',             desc: 'Only match complete words (e.g., "verify" won\'t match "verification")' },
                ].map(opt => (
                  <label key={opt.key} className={`${checkboxRow} cursor-pointer group`}>
                    <input type="checkbox" checked={detectionOptions[opt.key as keyof typeof detectionOptions]}
                      onChange={e => updateDetectionOptions({ [opt.key]: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#1a3554]" />
                    <div>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors dark:text-[#94a3b8] dark:group-hover:text-cyan-400">
                        {opt.label}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5 dark:text-[#2a4a6a]">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Detection Actions */}
            <div className={`${panel} p-5`}>
              <h2 className={`${sectionHead} mb-1`}>Detection Actions</h2>
              <p className="text-xs text-slate-400 mb-4 dark:text-[#2a4a6a]">Define what happens when a keyword is detected.</p>
              <div>
                {[
                  { key: 'flagEmail',        label: 'Flag the email',              desc: 'Automatically flag emails containing keywords' },
                  { key: 'logMatch',         label: 'Log keyword match',           desc: 'Record all keyword matches in the system log' },
                  { key: 'showInDashboard',  label: 'Show reason in dashboard',    desc: 'Display matched keyword in the flagged emails dashboard' },
                ].map(act => (
                  <label key={act.key} className={`${checkboxRow} cursor-pointer group`}>
                    <input type="checkbox" checked={detectionActions[act.key as keyof typeof detectionActions]}
                      onChange={e => updateDetectionActions({ [act.key]: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-[#1a3554]" />
                    <div>
                      <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors dark:text-[#94a3b8] dark:group-hover:text-cyan-400">
                        {act.label}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5 dark:text-[#2a4a6a]">{act.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-5 py-2 text-sm font-semibold rounded-lg transition-colors
                                 bg-blue-600 text-white hover:bg-blue-700 shadow-sm
                                 dark:bg-cyan-500 dark:text-[#040c18] dark:hover:bg-cyan-400">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
};

export default KeywordMonitoring;
