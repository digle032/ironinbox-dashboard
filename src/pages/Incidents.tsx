import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { User, Calendar } from 'lucide-react';
import Header from '../components/layout/Header';

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
}

  interface IncidentsPageProps {
  totalIncidents: number;
}

const Incidents: React.FC<IncidentsPageProps> = ({ totalIncidents }) => {
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

   const [] = useState(() => {
    const visiblePending = incidents.filter(i => i.status !== 'Resolved').length;
    // Mock hidden pending count
    const hiddenPending = Math.floor((totalIncidents - incidents.length) * 0.8);
    return visiblePending + hiddenPending;
  });



  return (
     <>
    <Header title={'Incidents'} /> 

    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Top section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incident Response Desk</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and track security incidents and requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
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

          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                <p className="text-sm font-medium text-slate-500">Total Amount of Requests</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">79</p>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
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
                <p className="text-sm font-medium text-slate-500">Requests Pending</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">63</p>
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Incident ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Reporter
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
  {incidents.map((incident) => (
    <tr
      key={incident.id}
      className="cursor-pointer hover:bg-slate-50 transition"
      onClick={() => openIncidentModal(incident)}
    >
      <td className="px-6 py-5 align-top">
        <div className="font-semibold text-slate-900">{incident.id}</div>
        <div className="mt-1 text-sm text-slate-500">{incident.createdTime}</div>
      </td>

      <td className="px-6 py-5 align-top font-semibold text-slate-900">
        {incident.subject}
      </td>

      <td className="px-6 py-5 align-top">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <User className="h-4 w-4" />
          </div>
          <span className="text-slate-700">{incident.reporter}</span>
        </div>
      </td>

      <td className="px-6 py-5 align-top">
        <span
          className={clsx(
            'inline-flex rounded-full px-3 py-1 text-xs font-semibold border',
            incident.priority === 'Critical' && 'border-red-200 bg-red-50 text-red-600',
            incident.priority === 'High' && 'border-orange-200 bg-orange-50 text-orange-600',
            incident.priority === 'Medium' && 'border-yellow-200 bg-yellow-50 text-yellow-700',
            incident.priority === 'Low' && 'border-emerald-200 bg-emerald-50 text-emerald-600'
          )}
        >
          {incident.priority}
        </span>
      </td>

      <td className="px-6 py-5 align-top text-slate-700">{incident.dueDate}</td>

      <td className="px-6 py-5 align-top">
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

      <td className="px-6 py-5 align-top text-slate-400">•••</td>
    </tr>
  ))}
</tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">1</span> to{" "}
            <span className="font-semibold text-slate-700">5</span> of{" "}
            <span className="font-semibold text-slate-700">79</span> results
          </p>

          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50">
              ‹
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
    {isModalOpen && draftIncident && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-blue-600">{draftIncident.id}</p>
          <p className="mt-1 text-sm text-slate-500">{draftIncident.createdTime}</p>
        </div>

        <button
          onClick={closeIncidentModal}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[80vh] overflow-y-auto px-6 py-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Subject</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {draftIncident.subject}
          </h2>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="leading-7 text-slate-700">{draftIncident.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reporter</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-800">{draftIncident.reporter}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Due Date</p>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="font-medium text-slate-800">{draftIncident.dueDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
              {draftIncident.category || 'General'}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned To</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
              {draftIncident.assignedTo || 'Unassigned'}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Source</p>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
              {draftIncident.source || 'Unknown'}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</p>
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
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
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
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button
          onClick={closeIncidentModal}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Close
        </button>
        <button
          onClick={handleSaveIncident}
          className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
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