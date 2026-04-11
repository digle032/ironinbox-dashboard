import React, { useState, useEffect, useRef } from 'react';
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

const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'] as const;
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved'] as const;

const INITIAL_INCIDENTS: Incident[] = [
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
    sourceEmailId: 'eml-gw-001',
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
    sourceEmailId: 'eml-rpt-8821',
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
  {
    id: 'INC-2024-006',
    createdTime: '2 days ago',
    reporter: 'System',
    subject: 'Endpoint Detected Suspicious PowerShell Activity',
    priority: 'Critical',
    status: 'Open',
    dueDate: 'Today, 6:00 PM',
    description: 'PowerShell script execution flagged by EDR.',
    category: 'Endpoint',
    assignedTo: 'SOC Team',
    source: 'EDR',
  },
  {
    id: 'INC-2024-007',
    createdTime: '3 days ago',
    reporter: 'John Smith (HR)',
    subject: 'Unauthorized Access to Shared Drive',
    priority: 'High',
    status: 'In Progress',
    dueDate: 'Tomorrow, 3:00 PM',
    description: 'User reported unknown file access.',
    category: 'Access Control',
    assignedTo: 'IT Security',
    source: 'User Report',
  },
  {
    id: 'INC-2024-008',
    createdTime: '3 days ago',
    reporter: 'System',
    subject: 'VPN Login from Unusual Location',
    priority: 'Medium',
    status: 'Open',
    dueDate: 'Feb 12, 1:00 PM',
    description: 'Login detected from foreign IP.',
    category: 'Network',
    assignedTo: 'IAM Team',
    source: 'VPN Logs',
  },
  {
    id: 'INC-2024-009',
    createdTime: '4 days ago',
    reporter: 'System',
    subject: 'Multiple Password Reset Requests',
    priority: 'Medium',
    status: 'Resolved',
    dueDate: 'Feb 11, 10:00 AM',
    description: 'Spike in password reset requests detected.',
    category: 'Identity',
    assignedTo: 'Help Desk',
    source: 'Auth System',
  },
  {
    id: 'INC-2024-010',
    createdTime: '5 days ago',
    reporter: 'Emily Clark (Marketing)',
    subject: 'Suspicious File Download',
    priority: 'High',
    status: 'In Progress',
    dueDate: 'Feb 13, 4:00 PM',
    description: 'Downloaded file flagged by antivirus.',
    category: 'Endpoint',
    assignedTo: 'SOC Team',
    source: 'Antivirus',
  },
  {
    id: 'INC-2024-011',
    createdTime: '5 days ago',
    reporter: 'System',
    subject: 'Database Query Spike',
    priority: 'Medium',
    status: 'Open',
    dueDate: 'Feb 15, 2:00 PM',
    description: 'Unusual database activity detected.',
    category: 'Database',
    assignedTo: 'DB Admin',
    source: 'Monitoring Tool',
  },
  {
    id: 'INC-2024-012',
    createdTime: '6 days ago',
    reporter: 'System',
    subject: 'Firewall Blocked Suspicious IP',
    priority: 'Low',
    status: 'Resolved',
    dueDate: 'Feb 10, 9:00 AM',
    description: 'Firewall blocked repeated access attempts.',
    category: 'Network',
    assignedTo: 'Network Security',
    source: 'Firewall',
  },
  {
    id: 'INC-2024-013',
    createdTime: '1 week ago',
    reporter: 'System',
    subject: 'Brute Force Attack Detected',
    priority: 'Critical',
    status: 'Open',
    dueDate: 'Today, 8:00 PM',
    description: 'Brute force attack detected on login portal.',
    category: 'Identity',
    assignedTo: 'SOC Team',
    source: 'SIEM',
  },
  {
    id: 'INC-2024-014',
    createdTime: '1 week ago',
    reporter: 'Alex Brown (Sales)',
    subject: 'Phishing Email Reported',
    priority: 'High',
    status: 'In Progress',
    dueDate: 'Tomorrow, 11:00 AM',
    description: 'User reported phishing email attempt.',
    category: 'Phishing',
    assignedTo: 'Analyst 1',
    source: 'User Report',
    sourceEmailId: 'eml-rpt-4402',
  },
  {
    id: 'INC-2024-015',
    createdTime: '1 week ago',
    reporter: 'System',
    subject: 'Suspicious API Activity',
    priority: 'Medium',
    status: 'Open',
    dueDate: 'Feb 16, 6:00 PM',
    description: 'API calls exceeded normal thresholds.',
    category: 'Application',
    assignedTo: 'App Security',
    source: 'API Gateway',
  },
];

const Incidents: React.FC<IncidentsPageProps> = ({ totalIncidents: _totalIncidents }) => {
  const { linkedIncidents, isWiped } = useApp();
  const filterRef = useRef<HTMLDivElement>(null);

  const [incidents, setIncidents] = useState<Incident[]>(() => INITIAL_INCIDENTS.map((i) => ({ ...i })));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [, setSelectedIncident] = useState<Incident | null>(null);
  const [draftIncident, setDraftIncident] = useState<Incident | null>(null);
  const [incidentPage, setIncidentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
    setDraftIncident({ ...EMPTY_INCIDENT, id: nextId, createdTime: 'Just now' });
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

  const baseIncidents = isWiped ? [] : incidents;
  const allIncidents = baseIncidents.filter((i) => {
    if (filterPriority !== 'All' && i.priority !== filterPriority) return false;
    if (filterStatus !== 'All' && i.status !== filterStatus) return false;
    return true;
  });

  const totalIncidentPages = Math.max(1, Math.ceil(allIncidents.length / INCIDENT_PAGE_SIZE));
  const displayedIncidents = allIncidents.slice(
    (incidentPage - 1) * INCIDENT_PAGE_SIZE,
    incidentPage * INCIDENT_PAGE_SIZE
  );
  const pageFrom = allIncidents.length === 0 ? 0 : (incidentPage - 1) * INCIDENT_PAGE_SIZE + 1;
  const pageTo = Math.min(incidentPage * INCIDENT_PAGE_SIZE, allIncidents.length);

  const countOpen = baseIncidents.filter((i) => i.status === 'Open').length;
  const countInProgress = baseIncidents.filter((i) => i.status === 'In Progress').length;
  const countResolved = baseIncidents.filter((i) => i.status === 'Resolved').length;
  const countCritical = baseIncidents.filter((i) => i.priority === 'Critical').length;

  const hasActiveFilter = filterPriority !== 'All' || filterStatus !== 'All';

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(allIncidents.length / INCIDENT_PAGE_SIZE));
    setIncidentPage((p) => Math.min(p, pages));
  }, [allIncidents.length]);

  return (
    <>
      <Header
        title="Incidents"
        actionNode={
          <button
            onClick={openCreateIncidentModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors
                       dark:bg-blue-700 dark:hover:bg-blue-800 dark:shadow-[0_0_20px_rgba(59,130,246,0.18)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Incident
          </button>
        }
      />

      <div className="p-6 space-y-4 bg-slate-50 min-h-screen max-w-7xl mx-auto dark:bg-[var(--dm-bg-page)]">

        {/* Compact stat cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)]">Total</p>
              <Layers className="h-4 w-4 text-slate-300 dark:text-[var(--dm-text-mono)]" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-[var(--dm-text-primary)] dark:font-mono">{baseIncidents.length}</p>
            <p className="text-[11px] text-slate-400 dark:text-[var(--dm-text-muted)] mt-0.5">{countCritical} critical</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)]">Open</p>
              <AlertTriangle className="h-4 w-4 text-red-400/60" />
            </div>
            <p className="text-2xl font-black text-red-500 dark:text-red-400 dark:font-mono">{countOpen}</p>
            <p className="text-[11px] text-slate-400 dark:text-[var(--dm-text-muted)] mt-0.5">requires action</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)]">In Progress</p>
              <Clock className="h-4 w-4 text-violet-400/60" />
            </div>
            <p className="text-2xl font-black text-violet-500 dark:text-violet-400 dark:font-mono">{countInProgress}</p>
            <p className="text-[11px] text-slate-400 dark:text-[var(--dm-text-muted)] mt-0.5">being handled</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)]">Resolved</p>
              <CheckCircle className="h-4 w-4 text-emerald-400/60" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 dark:font-mono">{countResolved}</p>
            <p className="text-[11px] text-slate-400 dark:text-[var(--dm-text-muted)] mt-0.5">closed out</p>
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">

          {/* Table toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-[var(--dm-border)] bg-white dark:bg-[var(--dm-surface-card)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)] dark:font-mono">
              {allIncidents.length} incident{allIncidents.length !== 1 ? 's' : ''}
              {hasActiveFilter && <span className="ml-1 text-blue-500 dark:text-blue-400">· filtered</span>}
            </p>
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((o) => !o)}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                  hasActiveFilter
                    ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-chrome)]'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
                </svg>
                Filter
                {hasActiveFilter && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {(filterPriority !== 'All' ? 1 : 0) + (filterStatus !== 'All' ? 1 : 0)}
                  </span>
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">
                  <div className="mb-3">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)]">Priority</p>
                    <div className="flex flex-wrap gap-1">
                      {PRIORITIES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => { setFilterPriority(p); setIncidentPage(1); }}
                          className={clsx(
                            'rounded-md px-2 py-1 text-xs font-medium transition',
                            filterPriority === p
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-inset)]'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)]">Status</p>
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setFilterStatus(s); setIncidentPage(1); }}
                          className={clsx(
                            'rounded-md px-2 py-1 text-xs font-medium transition',
                            filterStatus === s
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-inset)]'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={() => { setFilterPriority('All'); setFilterStatus('All'); setIncidentPage(1); }}
                      className="w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:border-[var(--dm-border)] dark:text-[var(--dm-text-faint)] dark:hover:bg-[var(--dm-chrome)]"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[420px]">
            <table className="w-full min-w-[640px] table-fixed">
              <colgroup>
                <col className="w-[7.5rem]" />
                <col />
                <col className="w-[8.25rem]" />
                <col className="w-[5.5rem]" />
                <col className="w-[9rem]" />
                <col className="w-[6.75rem]" />
                <col className="w-[2.25rem]" />
              </colgroup>
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)]">
                <tr>
                  {[
                    { label: 'Incident ID', squeeze: true },
                    { label: 'Subject', squeeze: false },
                    { label: 'Reporter', squeeze: false },
                    { label: 'Priority', squeeze: true },
                    { label: 'Due Date', squeeze: false },
                    { label: 'Status', squeeze: false },
                    { label: '', squeeze: true },
                  ].map(({ label, squeeze }) => (
                    <th
                      key={label || 'actions'}
                      scope="col"
                      className={clsx(
                        'py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-muted)] dark:font-mono whitespace-nowrap',
                        squeeze ? 'px-2' : 'px-3',
                        !label && 'text-center',
                      )}
                    >
                      {label ? (
                        label
                      ) : (
                        <>
                          <span className="sr-only">Actions</span>
                          <span aria-hidden className="text-[10px] font-normal tracking-normal text-slate-300 dark:text-[var(--dm-text-muted)]">
                            ⋯
                          </span>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-[var(--dm-border)]">
                {displayedIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400 dark:text-[var(--dm-text-faint)]">
                      No incidents match the current filters.
                    </td>
                  </tr>
                ) : displayedIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="cursor-pointer hover:bg-slate-50 transition dark:hover:bg-[var(--dm-chrome)]"
                    onClick={() => openIncidentModal(incident)}
                  >
                    <td className="px-2 py-2.5 align-middle whitespace-nowrap">
                      <div className="text-xs font-semibold tabular-nums text-slate-700 dark:text-[var(--dm-text-primary)]">{incident.id}</div>
                      <div className="text-[11px] text-slate-400 dark:text-[var(--dm-text-faint)]">{incident.createdTime}</div>
                    </td>

                    <td className="min-w-0 px-3 py-2.5 align-middle">
                      <div className="text-sm font-medium text-slate-800 dark:text-[var(--dm-text-primary)] truncate" title={incident.subject}>
                        {incident.subject}
                      </div>
                      {incident.sourceEmailId && (
                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/45 dark:text-blue-300">
                          Linked
                        </span>
                      )}
                    </td>

                    <td className="min-w-0 px-3 py-2.5 align-middle">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[var(--dm-chrome)]">
                          <User className="h-3 w-3 text-slate-400 dark:text-[var(--dm-text-faint)]" />
                        </div>
                        <span className="min-w-0 truncate text-sm text-slate-600 dark:text-[var(--dm-text-secondary)]" title={incident.reporter}>
                          {incident.reporter}
                        </span>
                      </div>
                    </td>

                    <td className="px-2 py-2.5 align-middle whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight border',
                        incident.priority === 'Critical' && 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-300',
                        incident.priority === 'High' && 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/45 dark:text-orange-300',
                        incident.priority === 'Medium' && 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/45 dark:text-yellow-300',
                        incident.priority === 'Low' && 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/45 dark:text-emerald-300',
                      )}>
                        {incident.priority}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 align-middle whitespace-nowrap text-sm text-slate-600 dark:text-[var(--dm-text-secondary)]" title={incident.dueDate}>
                      {incident.dueDate}
                    </td>

                    <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex items-center gap-1 text-[11px] font-semibold leading-tight',
                        incident.status === 'Open' && 'text-blue-600 dark:text-blue-400',
                        incident.status === 'In Progress' && 'text-violet-600 dark:text-violet-400',
                        incident.status === 'Resolved' && 'text-slate-400 dark:text-slate-500',
                      )}>
                        <span className={clsx(
                          'h-1.5 w-1.5 flex-shrink-0 rounded-full',
                          incident.status === 'Open' && 'bg-blue-500',
                          incident.status === 'In Progress' && 'bg-violet-500',
                          incident.status === 'Resolved' && 'bg-slate-400',
                        )} />
                        <span className="truncate">{incident.status}</span>
                      </span>
                    </td>

                    <td className="px-1 py-2.5 align-middle text-center text-slate-300 dark:text-[var(--dm-text-faint)] text-xs" aria-hidden>
                      ⋯
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-[var(--dm-border)]">
            <p className="text-xs text-slate-400 dark:text-[var(--dm-text-faint)]">
              Showing{' '}
              <span className="font-semibold text-slate-600 dark:text-[var(--dm-text-secondary)]">{pageFrom}</span>
              {' '}–{' '}
              <span className="font-semibold text-slate-600 dark:text-[var(--dm-text-secondary)]">{pageTo}</span>
              {' '}of{' '}
              <span className="font-semibold text-slate-600 dark:text-[var(--dm-text-secondary)]">{allIncidents.length}</span>
              {' '}results
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIncidentPage((p) => Math.max(1, p - 1))}
                disabled={incidentPage <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[var(--dm-chrome)] dark:border-[var(--dm-border)] dark:text-[var(--dm-text-faint)] dark:hover:bg-[var(--dm-surface-card)]"
              >
                ‹
              </button>
              <span className="text-[11px] font-mono text-slate-400 dark:text-[var(--dm-text-muted)] px-1">
                {incidentPage}/{totalIncidentPages}
              </span>
              <button
                onClick={() => setIncidentPage((p) => Math.min(totalIncidentPages, p + 1))}
                disabled={incidentPage >= totalIncidentPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[var(--dm-chrome)] dark:border-[var(--dm-border)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-surface-card)]"
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
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:bg-[var(--dm-surface-card)] dark:border-[var(--dm-border)]">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-[var(--dm-border)]">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">{draftIncident.id}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-[var(--dm-text-primary)] mt-0.5">
                  {isCreating ? 'New Incident' : 'Edit Incident'}
                </p>
              </div>
              <button
                onClick={closeIncidentModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[var(--dm-text-faint)] dark:hover:bg-[var(--dm-chrome)] dark:hover:text-[var(--dm-text-secondary)]"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">Subject</label>
                <input
                  type="text"
                  value={draftIncident.subject}
                  onChange={(e) => setDraftIncident({ ...draftIncident, subject: e.target.value })}
                  placeholder="Describe the incident..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-primary)] dark:placeholder-[var(--dm-text-muted)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">Description</label>
                <textarea
                  rows={3}
                  value={draftIncident.description}
                  onChange={(e) => setDraftIncident({ ...draftIncident, description: e.target.value })}
                  placeholder="Provide detailed information about the incident..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-secondary)] dark:placeholder-[var(--dm-text-muted)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">Reporter</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)]">
                    <User className="h-3.5 w-3.5 text-slate-400 dark:text-[var(--dm-text-faint)] flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-[var(--dm-text-secondary)] truncate">{draftIncident.reporter}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">Due Date</label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)]">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-[var(--dm-text-faint)] flex-shrink-0" />
                    <input
                      type="text"
                      value={draftIncident.dueDate}
                      onChange={(e) => setDraftIncident({ ...draftIncident, dueDate: e.target.value })}
                      placeholder="e.g. Tomorrow, 5:00 PM"
                      className="w-full bg-transparent text-sm text-slate-700 outline-none dark:text-[var(--dm-text-secondary)] placeholder-slate-300 dark:placeholder-[var(--dm-text-muted)]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">Priority</label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {(['Critical', 'High', 'Medium', 'Low'] as Incident['priority'][]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setDraftIncident({ ...draftIncident, priority: p })}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs font-semibold transition',
                        draftIncident.priority === p
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-surface-card)]'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">Status</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(['Open', 'In Progress', 'Resolved'] as Incident['status'][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDraftIncident({ ...draftIncident, status: s })}
                      className={clsx(
                        'rounded-lg border px-3 py-2 text-xs font-semibold transition',
                        draftIncident.status === s
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-surface-card)]'
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
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[var(--dm-text-faint)]">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setDraftIncident({ ...draftIncident, [key]: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 dark:border-[var(--dm-border)] dark:bg-[var(--dm-chrome)] dark:text-[var(--dm-text-secondary)]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-[var(--dm-border)]">
              <button
                onClick={closeIncidentModal}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:bg-[var(--dm-chrome)] dark:border-[var(--dm-border)] dark:text-[var(--dm-text-secondary)] dark:hover:bg-[var(--dm-surface-card)]"
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
