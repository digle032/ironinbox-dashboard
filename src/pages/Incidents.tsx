import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { User, Calendar } from 'lucide-react';
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

const MOCK_TOTAL_REQUESTS = 79;
const MOCK_PENDING_REQUESTS = 63;

const Incidents: React.FC<IncidentsPageProps> = ({ totalIncidents: _totalIncidents }) => {
  const { linkedIncidents, isWiped } = useApp();
  const [, setOpenDropdownId] = useState<string | null>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);


  // Mock Data - showing 5 items per page
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
    source: 'Mail Gateway'
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
    source: 'User Report'
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
    source: 'SIEM'
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
    source: 'Internal Ticket'
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
    source: 'Identity Provider'
  }
]);

const [, setSelectedIncident] = useState<Incident | null>(null);
const [isModalOpen, setIsModalOpen] = useState(false);
const [draftIncident, setDraftIncident] = useState<Incident | null>(null);
const [incidentPage, setIncidentPage] = useState(1);
const INCIDENT_PAGE_SIZE = 5;

useEffect(() => {
  if (linkedIncidents.length === 0) return;
  setIncidents(prev => {
    const existingIds = new Set(prev.map(incident => incident.id));
    const mapped = linkedIncidents
      .filter(incident => !existingIds.has(incident.id))
      .map(incident => ({ ...incident }));
    if (mapped.length === 0) return prev;
    return [...mapped, ...prev];
  });
}, [linkedIncidents]);

const openIncidentModal = (incident: Incident) => {
  setSelectedIncident(incident);
  setDraftIncident(incident);
  setIsModalOpen(true);
};

const closeIncidentModal = () => {
  setSelectedIncident(null);
  setDraftIncident(null);
  setIsModalOpen(false);
};

const handleSaveIncident = () => {
  if (!draftIncident) return;

  setIncidents((prev) =>
    prev.map((incident) =>
      incident.id === draftIncident.id ? draftIncident : incident
    )
  );

  setIsModalOpen(false);
  setSelectedIncident(null);
  setDraftIncident(null);
};

const allIncidents = isWiped ? [] : incidents;
const totalRequestsDisplay = isWiped ? 0 : MOCK_TOTAL_REQUESTS;
const pendingRequestsDisplay = isWiped ? 0 : MOCK_PENDING_REQUESTS;
const totalIncidentPages = Math.max(1, Math.ceil(allIncidents.length / INCIDENT_PAGE_SIZE));
const displayedIncidents = allIncidents.slice((incidentPage - 1) * INCIDENT_PAGE_SIZE, incidentPage * INCIDENT_PAGE_SIZE);
const pageFrom = allIncidents.length === 0 ? 0 : (incidentPage - 1) * INCIDENT_PAGE_SIZE + 1;
const pageTo = Math.min(incidentPage * INCIDENT_PAGE_SIZE, allIncidents.length);

useEffect(() => {
  if (isWiped) {
    setSelectedIncident(null);
    setDraftIncident(null);
    setIsModalOpen(false);
  }
}, [isWiped]);



  return (
     <>
    <Header title={'Incidents'} /> 

       <div className="p-6 space-y-4 bg-slate-50 min-h-screen max-w-7xl mx-auto dark:bg-[#040c18]">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div>
         <h1 className="text-3xl font-bold text-slate-900 dark:text-[#e2e8f0]">Incident Response Desk</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#4a6080]">
            Manage and track security incidents and requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-[#0a1628] dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-[#0f2040]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
            </svg>
            Filter
          </button>

        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:shadow-[0_0_20px_rgba(59,130,246,0.18)]">            
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Incident
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7l8 4 8-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8 4 8-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l8 4 8-4" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-[#4a6080]">Total Amount of Requests</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#e2e8f0]">
                  {totalRequestsDisplay}
                </p>
              </div>
            </div>

            <div className="hidden md:block text-slate-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7l8 4 8-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8 4 8-4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l8 4 8-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12h4l3-8 4 16 3-8h4"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-[#4a6080]">Requests Pending</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-[#e2e8f0]">
                  {pendingRequestsDisplay}
                </p>
              </div>
            </div>

            <div className="hidden md:block text-violet-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12h4l3-8 4 16 3-8h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-[#0a1628] dark:border-[#0f2a4a]">
        <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
              <tr>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Incident ID
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Subject
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Reporter
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Priority
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Due Date
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Status
                </th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-[#2a4a6a] dark:font-mono">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
  {displayedIncidents.map((incident) => (
    <tr
      key={incident.id}
      className="cursor-pointer hover:bg-slate-50 transition dark:hover:bg-[#0f2040]"
      onClick={() => openIncidentModal(incident)}
    >
      <td className="px-4 py-2.5 align-middle">
        <div className="font-semibold text-slate-900 dark:text-[#e2e8f0]">{incident.id}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-[#4a6080]">{incident.createdTime}</div>
      </td>

      <td className="px-4 py-2.5 align-middle font-semibold text-slate-900 dark:text-[#e2e8f0]">
        {incident.subject}
        {incident.sourceEmailId && (
          <span className="ml-2 inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/45 dark:text-blue-300">
            Linked Email
          </span>
        )}
      </td>

      <td className="px-4 py-2.5 align-middle">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-[#0f2040] dark:text-[#4a6080]">
            <User className="h-4 w-4" />
          </div>
          <span className="text-slate-700 dark:text-[#94a3b8]">{incident.reporter}</span>
        </div>
      </td>

      <td className="px-4 py-2.5 align-middle">
        <span
          className={clsx(
            'inline-flex rounded-full px-3 py-1 text-xs font-semibold border',
            incident.priority === 'Critical' && 'border-red-200 bg-red-50 text-red-600',
            incident.priority === 'Critical' && 'dark:border-red-900/60 dark:bg-red-950/45 dark:text-red-300',
            incident.priority === 'High' && 'border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/45 dark:text-orange-300',
            incident.priority === 'Medium' && 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/45 dark:text-yellow-300',
            incident.priority === 'Low' && 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/45 dark:text-emerald-300'
          )}
        >
          {incident.priority}
        </span>
      </td>

      <td className="px-4 py-2.5 align-middle text-slate-700 dark:text-[#94a3b8]">{incident.dueDate}</td>

      <td className="px-4 py-2.5 align-middle">
        <span
          className={clsx(
            'inline-flex items-center gap-2 text-sm font-medium',
            incident.status === 'Open' && 'text-blue-600',
            incident.status === 'In Progress' && 'text-violet-600',
            incident.status === 'Resolved' && 'text-slate-500'
          )}
        >
          <span
            className={clsx(
              'h-2.5 w-2.5 rounded-full',
              incident.status === 'Open' && 'bg-blue-500',
              incident.status === 'In Progress' && 'bg-violet-500',
              incident.status === 'Resolved' && 'bg-slate-400'
            )}
          ></span>
          {incident.status}
        </span>
      </td>

      <td className="px-4 py-2.5 align-middle text-slate-400 dark:text-[#4a6080]">•••</td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-[#0f2a4a]">
          <p className="text-sm text-slate-500 dark:text-[#4a6080]">
            Showing{' '}
            <span className="font-semibold text-slate-700 dark:text-[#94a3b8]">{pageFrom}</span> to{' '}
            <span className="font-semibold text-slate-700 dark:text-[#94a3b8]">{pageTo}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-[#94a3b8]">
              {totalRequestsDisplay}
            </span>{' '}
            results
          </p>

          <div className="flex items-center gap-2">
            <button onClick={() => setIncidentPage(p => Math.max(1, p - 1))} disabled={incidentPage <= 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#0f2040] dark:border-[#0f2a4a] dark:text-[#4a6080] dark:hover:bg-[#0a1628]">
              ‹
            </button>
            <span className="text-xs font-mono text-slate-400 dark:text-[#2a4a6a]">{incidentPage}/{totalIncidentPages}</span>
            <button onClick={() => setIncidentPage(p => Math.min(totalIncidentPages, p + 1))} disabled={incidentPage >= totalIncidentPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-[#0f2040] dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
    {isModalOpen && draftIncident && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 dark:bg-black/60">
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:bg-[#0a1628] dark:border-[#0f2a4a]">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-[#0f2a4a]">
        <div>
          <p className="text-sm font-semibold text-blue-600">{draftIncident.id}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#4a6080]">{draftIncident.createdTime}</p>
        </div>

        <button
          onClick={closeIncidentModal}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-[#4a6080] dark:hover:bg-[#0f2040] dark:hover:text-[#cbd5e1]"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-6 py-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Subject</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-[#e2e8f0]">
            {draftIncident.subject}
          </h2>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Description</p>
          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
            <p className="leading-7 text-slate-700 dark:text-[#94a3b8]">{draftIncident.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Reporter</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-[#0a1628] dark:text-[#4a6080]"> 
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-800 dark:text-[#94a3b8]">{draftIncident.reporter}</span>
            </div>
          </div>

          <div>
           <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Due Date</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-[#0f2a4a] dark:bg-[#0f2040]">
              <Calendar className="h-4 w-4 text-slate-400 dark:text-[#4a6080]" />
              <input
                type="text"
                value={draftIncident.dueDate}
                onChange={(e) => setDraftIncident({ ...draftIncident, dueDate: e.target.value })}
                className="w-full bg-transparent font-medium text-slate-800 outline-none dark:text-[#94a3b8]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Category</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8]">
              {draftIncident.category || 'General'}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Assigned To</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8]">
              {draftIncident.assignedTo || 'Unassigned'}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Source</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8]">
              {draftIncident.source || 'Unknown'}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Priority</p>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {(['Critical', 'High', 'Medium', 'Low'] as Incident['priority'][]).map((priority) => (
              <button
                key={priority}
                onClick={() =>
                  setDraftIncident({ ...draftIncident, priority })
                }
                className={clsx(
                  'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                  draftIncident.priority === priority
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/45 dark:text-blue-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]'
                )}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#4a6080]">Status</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {(['Open', 'In Progress', 'Resolved'] as Incident['status'][]).map((status) => (
              <button
                key={status}
                onClick={() =>
                  setDraftIncident({ ...draftIncident, status })
                }
                className={clsx(
                  'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                  draftIncident.status === status
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#0f2a4a] dark:bg-[#0f2040] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-[#0f2a4a]">
        <button
          onClick={closeIncidentModal}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 dark:bg-[#0f2040] dark:border-[#0f2a4a] dark:text-[#94a3b8] dark:hover:bg-[#0a1628]"
        >
          Close
        </button>
        <button
          onClick={handleSaveIncident}
          className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 dark:shadow-[0_0_20px_rgba(59,130,246,0.18)]"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}
  </>
  );
};

export default Incidents;