import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { User, Calendar, AlertTriangle, Clock, CheckCircle, Layers } from 'lucide-react';
import Header from '../components/layout/Header';
import { useApp } from '../contexts/AppContext';

export interface Incident {
  id: string;
  createdTime: string;
  reporter: string;
  subject: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  dueDate: string;
  description: string;
  category?: string;
  assignedTo?: string;
  source?: string;
  sourceEmailId?: string;
}

interface IncidentsPageProps {
  totalIncidents: number;
}

const INCIDENT_PAGE_SIZE = 5;

const EMPTY_INCIDENT: Omit<Incident, 'id' | 'createdTime'> = {
  reporter: 'Current User',
  subject: '',
  priority: 'Medium',
  status: 'Open',
  dueDate: '',
  description: '',
  category: 'General',
  assignedTo: 'Unassigned',
  source: 'Manual',
};

const Incidents: React.FC<IncidentsPageProps> = ({ totalIncidents: _totalIncidents }) => {
  const { linkedIncidents, isWiped } = useApp();
  const [, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-2024-001',
      createdTime: '10 mins ago',
      reporter: 'System',
      subject: 'Malware Payload Detected in Attachment',
      priority: 'Critical',
      status: 'Open',
      dueDate: 'Today, 2:00 PM',
      description:
        'Our automated scanning system detected a malicious executable file disguised as a PDF document in an email from an unknown sender. The file has been quarantined and the email has been moved to a secure sandbox environment. Immediate investigation is required to determine if this is part of a larger attack campaign.',
      category: 'Email Security',
      assignedTo: 'SOC Team',
      source: 'Mail Gateway',
    },
    {
      id: 'INC-2024-002',
      createdTime: '1 hour ago',
      reporter: 'Sarah Jenkins (Finance)',
      subject: 'Suspicious Link in Invoice Email',
      priority: 'High',
      status: 'In Progress',
      dueDate: 'Tomorrow, 9:00 AM',
      description:
        'A finance user reported an invoice email containing a suspicious hyperlink that redirects to an external domain with signs of credential harvesting behavior.',
      category: 'Phishing',
      assignedTo: 'Analyst 2',
      source: 'User Report',
    },
    {
      id: 'INC-2024-003',
      createdTime: '3 hours ago',
      reporter: 'System',
      subject: 'Unusual Volume of Outbound Traffic',
      priority: 'Medium',
      status: 'Open',
      dueDate: 'Feb 10, 5:00 PM',
      description:
        'Network monitoring identified a spike in outbound traffic from a workstation that exceeded its normal activity baseline. Requires validation for potential exfiltration.',
      category: 'Network',
      assignedTo: 'Network Security',
      source: 'SIEM',
    },
    {
      id: 'INC-2024-004',
      createdTime: 'Yesterday',
      reporter: 'Mike Ross (IT)',
      subject: 'Request for Phishing Simulation Report',
      priority: 'Low',
      status: 'Resolved',
      dueDate: 'Feb 14, 5:00 PM',
      description:
        'Internal request to retrieve and review the latest phishing simulation performance report for awareness tracking.',
      category: 'Request',
      assignedTo: 'Awareness Team',
      source: 'Internal Ticket',
    },
    {
      id: 'INC-2024-005',
      createdTime: '2 days ago',
      reporter: 'System',
      subject: 'Failed Login Attempts - Admin Account',
      priority: 'High',
      status: 'In Progress',
      dueDate: 'Feb 8, 12:00 PM',
      description:
        'Multiple failed login attempts were detected against an administrative account from an unfamiliar IP range. Account is under review pending access verification.',
      category: 'Identity',
      assignedTo: 'IAM Team',
      source: 'Identity Provider',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [, setSelectedIncident] = useState<Incident | null>(null);
  const [draftIncident, setDraftIncident] = useState<Incident | null>(null);
  const [incidentPage, setIncidentPage] = useState(1);

  useEffect(() => {
    if (linkedIncidents.length === 0) return;
    setIncidents((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const mapped = linkedIncidents
        .filter((i) => !existingIds.has(i.id))
        .map((i) => ({ ...i }));
      if (mapped.length === 0) return prev;
      return [...mapped, ...prev];
    });
  }, [linkedIncidents]);

  const openIncidentModal = (incident: Incident) => {
    setIsCreating(false);
    setSelectedIncident(incident);
    setDraftIncident(incident);
    setIsModalOpen(true);
  };

  const openCreateIncidentModal = () => {
    const nextId = `INC-${new Date().getFullYear()}-${String(incidents.length + 1).padStart(3, '0')}`;
    setIsCreating(true);
    setSelectedIncident(null);
    setDraftIncident({
      ...EMPTY_INCIDENT,
      id: nextId,
      createdTime: 'Just now',
    });
    setIsModalOpen(true);
  };

  const closeIncidentModal = () => {
    setSelectedIncident(null);
    setDraftIncident(null);
    setIsModalOpen(false);
    setIsCreating(false);
  };

  const handleSaveIncident = () => {
    if (!draftIncident) return;
    if (isCreating) {
      setIncidents((prev) => [draftIncident, ...prev]);
      setIncidentPage(1);
    } else {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === draftIncident.id ? draftIncident : inc))
      );
    }
    setIsModalOpen(false);
    setSelectedIncident(null);
    setDraftIncident(null);
    setIsCreating(false);
  };

  useEffect(() => {
    if (isWiped) {
      setSelectedIncident(null);
      setDraftIncident(null);
      setIsModalOpen(false);
      setIsCreating(false);
      setIncidentPage(1);
    }
  }, [isWiped]);

  const allIncidents = isWiped ? [] : incidents;
  const totalIncidentPages = Math.max(1, Math.ceil(allIncidents.length / INCIDENT_PAGE_SIZE));
  const displayedIncidents = allIncidents.slice(
    (incidentPage - 1) * INCIDENT_PAGE_SIZE,
    incidentPage * INCIDENT_PAGE_SIZE
  );
  const pageFrom = allIncidents.length === 0 ? 0 : (incidentPage - 1) * INCIDENT_PAGE_SIZE + 1;
  const pageTo = Math.min(incidentPage * INCIDENT_PAGE_SIZE, allIncidents.length);

  const countOpen = allIncidents.filter((i) => i.status === 'Open').length;
  const countInProgress = allIncidents.filter((i) => i.status === 'In Progress').length;
  const countResolved = allIncidents.filter((i) => i.status === 'Resolved').length;
  const countCritical = allIncidents.filter((i) => i.priority === 'Critical').length;

  return (
    <>
      <Header title="Incidents" />

      <div className="p-6 space-y-4 bg-slate-50 min-h-screen max-w-7xl mx-auto dark:bg-[#040c18]">

        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e2e8f0]">Incident Response Desk</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-[#4a6080]">
              Manage and track security incidents and requests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-[#0f2040]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
              </svg>
              Filter
            </button>
            <button
              onClick={openCreateIncidentModal}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:shadow-[0_0_20px_rgba(59,130,246,0.18)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Incident
            </button>
          </div>
        </div>

        {/* Compact stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a]">Total</p>
              <Layers className="h-4 w-4 text-slate-300 dark:text-[#1a3a5a]" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-[#e2e8f0] dark:font-mono">{allIncidents.length}</p>
            <p className="text-[11px] text-slate-400 dark:text-[#2a4a6a] mt-0.5">{countCritical} critical</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a]">Open</p>
              <AlertTriangle className="h-4 w-4 text-red-400/60" />
            </div>
            <p className="text-2xl font-black text-red-500 dark:text-red-400 dark:font-mono">{countOpen}</p>
            <p className="text-[11px] text-slate-400 dark:text-[#2a4a6a] mt-0.5">requires action</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a]">In Progress</p>
              <Clock className="h-4 w-4 text-violet-400/60" />
            </div>
            <p className="text-2xl font-black text-violet-500 dark:text-violet-400 dark:font-mono">{countInProgress}</p>
            <p className="text-[11px] text-slate-400 dark:text-[#2a4a6a] mt-0.5">being handled</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a]">Resolved</p>
              <CheckCircle className="h-4 w-4 text-emerald-400/60" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 dark:font-mono">{countResolved}</p>
            <p className="text-[11px] text-slate-400 dark:text-[#2a4a6a] mt-0.5">closed out</p>
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
          <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
            <table className="min-w-full">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
                <tr>
                  {['Incident ID', 'Subject', 'Reporter', 'Priority', 'Due Date', 'Status', 'Actions'].map((col) => (
                    <th key={col} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-[#0f2a4a]">
                {displayedIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="cursor-pointer hover:bg-slate-50 transition dark:hover:bg-[#0f2040]"
                    onClick={() => openIncidentModal(incident)}
                  >
                    <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-700 dark:text-[#e2e8f0]">{incident.id}</div>
                      <div className="text-[11px] text-slate-400 dark:text-[#4a6080]">{incident.createdTime}</div>
                    </td>

                    <td className="px-4 py-2.5 align-middle max-w-[220px]">
                      <div className="text-sm font-medium text-slate-800 dark:text-[#e2e8f0] truncate">{incident.subject}</div>
                      {incident.sourceEmailId && (
                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/45 dark:text-blue-300">
                          Linked
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0f2040]">
                          <User className="h-3 w-3 text-slate-400 dark:text-[#4a6080]" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-[#94a3b8] truncate max-w-[130px]">{incident.reporter}</span>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border',
                        incident.priority === 'Critical' && 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-300',
                        incident.priority === 'High' && 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/45 dark:text-orange-300',
                        incident.priority === 'Medium' && 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/45 dark:text-yellow-300',
                        incident.priority === 'Low' && 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/45 dark:text-emerald-300',
                      )}>
                        {incident.priority}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 align-middle whitespace-nowrap text-sm text-slate-600 dark:text-[#94a3b8]">
                      {incident.dueDate}
                    </td>

                    <td className="px-4 py-2.5 align-middle whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex items-center gap-1.5 text-xs font-semibold',
                        incident.status === 'Open' && 'text-blue-600 dark:text-blue-400',
                        incident.status === 'In Progress' && 'text-violet-600 dark:text-violet-400',
                        incident.status === 'Resolved' && 'text-slate-400 dark:text-slate-500',
                      )}>
                        <span className={clsx(
                          'h-1.5 w-1.5 rounded-full',
                          incident.status === 'Open' && 'bg-blue-500',
                          incident.status === 'In Progress' && 'bg-violet-500',
                          incident.status === 'Resolved' && 'bg-slate-400',
                        )} />
                        {incident.status}
                      </span>
                    </td>

                    <td className="px-4 py-2.5 align-middle text-slate-300 dark:text-[#4a6080] text-sm">•••</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-[#0f2a4a]">
            <p className="text-xs text-slate-400 dark:text-[#4a6080]">
              Showing{' '}
              <span className="font-semibold text-slate-600 dark:text-[#94a3b8]">{pageFrom}</span>
              {' '}–{' '}
              <span className="font-semibold text-slate-600 dark:text-[#94a3b8]">{pageTo}</span>
              {' '}of{' '}
              <span className="font-semibold text-slate-600 dark:text-[#94a3b8]">{allIncidents.length}</span>
              {' '}results
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIncidentPage((p) => Math.max(1, p - 1))}
                disabled={incidentPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#0f2040] dark:border-[#0f2a4a] dark:text-[#4a6080] dark:hover:bg-[#0a1628]"
              >
                ‹
              </button>
              <span className="text-[11px] font-mono text-slate-400 dark:text-[#2a4a6a] px-1">
                {incidentPage}/{totalIncidentPages}
              </span>
              <button
                onClick={() => setIncidentPage((p) => Math.min(totalIncidentPages, p + 1))}
                disabled={incidentPage >= totalIncidentPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#0f2040] dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incident detail / create modal */}
      {isModalOpen && draftIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:bg-[#0a1628] dark:border-[#0f2a4a]">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[#0f2a4a]">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">{draftIncident.id}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-[#e2e8f0] mt-0.5">
                  {isCreating ? 'New Incident' : 'Edit Incident'}
                </p>
              </div>
              <button
                onClick={closeIncidentModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#4a6080] dark:hover:bg-[#0f2040] dark:hover:text-[#cbd5e1]"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5 space-y-4">

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">Subject</label>
                <input
                  type="text"
                  value={draftIncident.subject}
                  onChange={(e) => setDraftIncident({ ...draftIncident, subject: e.target.value })}
                  placeholder="Describe the incident..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#e2e8f0] dark:placeholder-[#2a4a6a]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">Description</label>
                <textarea
                  rows={3}
                  value={draftIncident.description}
                  onChange={(e) => setDraftIncident({ ...draftIncident, description: e.target.value })}
                  placeholder="Provide detailed information about the incident..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8] dark:placeholder-[#2a4a6a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">Reporter</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
                    <User className="h-3.5 w-3.5 text-slate-400 dark:text-[#4a6080] flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-[#94a3b8] truncate">{draftIncident.reporter}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">Due Date</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-[#4a6080] flex-shrink-0" />
                    <input
                      type="text"
                      value={draftIncident.dueDate}
                      onChange={(e) => setDraftIncident({ ...draftIncident, dueDate: e.target.value })}
                      placeholder="e.g. Tomorrow, 5:00 PM"
                      className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-[#94a3b8] placeholder-slate-300 dark:placeholder-[#2a4a6a]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">Priority</label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as Incident['priority'][]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setDraftIncident({ ...draftIncident, priority: p })}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs font-semibold transition',
                        draftIncident.priority === p
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">Status</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(['Open', 'In Progress', 'Resolved'] as Incident['status'][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraftIncident({ ...draftIncident, status: s })}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs font-semibold transition',
                        draftIncident.status === s
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Category', key: 'category' as const, value: draftIncident.category ?? 'General' },
                  { label: 'Assigned To', key: 'assignedTo' as const, value: draftIncident.assignedTo ?? 'Unassigned' },
                  { label: 'Source', key: 'source' as const, value: draftIncident.source ?? 'Unknown' },
                ].map(({ label, key, value }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#4a6080]">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setDraftIncident({ ...draftIncident, [key]: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-[#0f2a4a]">
              <button
                onClick={closeIncidentModal}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:bg-[#0f2040] dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIncident}
                disabled={!draftIncident.subject.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {isCreating ? 'Create Incident' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Incidents;
