import { FlaggedEmail, ReleasedEmail, Keyword } from '../types';

export const mockFlaggedEmails: FlaggedEmail[] = [
  {
    id: '1',
    received: '9:38 PM',
    sender: 'admin@acme-c0rp.test',
    subject: 'Urgent: Verify your account',
    signals: [
      { type: 'keyword', value: 'verify', description: 'Contains sensitive keyword: verify' },
      { type: 'typo', value: 'acme-c0rp.test', description: 'Suspicious domain similar to acme-corp.com' }
    ],
    riskLevel: 'Critical',
    riskScore: 96,
    sourceProvider: 'gmail',
    content: 'Your account needs verification immediately. Click here to update your credentials before suspension.'
  },
  {
    id: '2',
    received: '8:15 PM',
    sender: 'security@paypa1.test',
    subject: 'Verify your account now',
    signals: [
      { type: 'keyword', value: 'verify', description: 'Contains sensitive keyword: verify' },
      { type: 'typo', value: 'paypa1.test', description: 'Suspicious domain similar to paypal.com' }
    ],
    riskLevel: 'Critical',
    riskScore: 94,
    sourceProvider: 'gmail',
    content: 'We detected unusual activity on your account. Please verify your information immediately.'
  },
  {
    id: '3',
    received: '7:42 PM',
    sender: 'noreply@g00gle.test',
    subject: 'Security alert on your account',
    signals: [
      { type: 'keyword', value: 'security', description: 'Contains sensitive keyword: security' },
      { type: 'typo', value: 'g00gle.test', description: 'Suspicious domain similar to google.com' }
    ],
    riskLevel: 'Critical',
    riskScore: 95,
    sourceProvider: 'gmail',
    content: 'Your security settings need immediate attention. Click to review your account security.'
  },
  {
    id: '4',
    received: '6:29 PM',
    sender: 'support@bank0famerica.test',
    subject: 'Update your banking information',
    signals: [
      { type: 'keyword', value: 'banking', description: 'Contains sensitive keyword: banking' },
      { type: 'typo', value: 'bank0famerica.test', description: 'Suspicious domain similar to bankofamerica.com' }
    ],
    riskLevel: 'High',
    riskScore: 82,
    sourceProvider: 'gmail',
    content: 'Please update your banking information to continue using our services.'
  },
  {
    id: '5',
    received: '5:18 PM',
    sender: 'admin@micr0soft.test',
    subject: 'Your subscription expires today',
    signals: [
      { type: 'keyword', value: 'expires', description: 'Contains urgency keyword: expires' },
      { type: 'typo', value: 'micr0soft.test', description: 'Suspicious domain similar to microsoft.com' }
    ],
    riskLevel: 'High',
    riskScore: 79,
    sourceProvider: 'gmail',
    content: 'Your subscription is expiring. Renew now to avoid service interruption.'
  },
  {
    id: '6',
    received: 'Apr 5, 2026',
    sender: 'notifications@amaz0n.test',
    subject: 'Confirm your recent order',
    signals: [
      { type: 'keyword', value: 'confirm', description: 'Contains sensitive keyword: confirm' },
      { type: 'typo', value: 'amaz0n.test', description: 'Suspicious domain similar to amazon.com' }
    ],
    riskLevel: 'High',
    riskScore: 84,
    sourceProvider: 'gmail',
    content: 'Please confirm your recent order of $599.99. If you did not make this purchase, click here immediately.'
  },
  {
    id: '7',
    received: 'Apr 4, 2026',
    sender: 'admin@appleid-verify.test',
    subject: 'Suspicious activity detected',
    signals: [
      { type: 'keyword', value: 'suspicious', description: 'Contains urgency keyword: suspicious' },
      { type: 'typo', value: 'appleid-verify.test', description: 'Suspicious domain pretending to be Apple' }
    ],
    riskLevel: 'Critical',
    riskScore: 97,
    sourceProvider: 'gmail',
    content: 'We detected suspicious login attempts on your Apple ID. Verify your identity now.'
  },
  {
    id: '8',
    received: 'Apr 3, 2026',
    sender: 'no-reply@linkedln.test',
    subject: 'You have 3 new connection requests',
    signals: [
      { type: 'typo', value: 'linkedln.test', description: 'Suspicious domain similar to linkedin.com (using "ln" instead of "in")' }
    ],
    riskLevel: 'Medium',
    riskScore: 64,
    sourceProvider: 'gmail',
    content: 'You have new connection requests waiting. View them now.'
  },
  {
    id: '9',
    received: 'Apr 2, 2026',
    sender: 'support@netfIix.test',
    subject: 'Your payment method failed',
    signals: [
      { type: 'keyword', value: 'payment', description: 'Contains sensitive keyword: payment' },
      { type: 'typo', value: 'netfIix.test', description: 'Suspicious domain similar to netflix.com (using capital I)' }
    ],
    riskLevel: 'High',
    riskScore: 81,
    sourceProvider: 'gmail',
    content: 'Your payment method was declined. Update your billing information to continue your subscription.'
  },
  {
    id: '10',
    received: 'Apr 1, 2026',
    sender: 'alerts@chase-bank.test',
    subject: 'Unusual account activity',
    signals: [
      { type: 'keyword', value: 'account', description: 'Contains sensitive keyword: account' },
      { type: 'typo', value: 'chase-bank.test', description: 'Suspicious domain pretending to be Chase' }
    ],
    riskLevel: 'Critical',
    riskScore: 93,
    sourceProvider: 'gmail',
    content: 'We noticed unusual activity on your account. Verify your recent transactions immediately.'
  },
  {
    id: '11',
    received: 'Mar 30, 2026',
    sender: 'info@dropb0x.test',
    subject: 'Your files are ready for download',
    signals: [
      { type: 'typo', value: 'dropb0x.test', description: 'Suspicious domain similar to dropbox.com' }
    ],
    riskLevel: 'Medium',
    riskScore: 61,
    sourceProvider: 'outlook',
    content: 'Someone shared files with you. Click here to view and download.'
  },
  {
    id: '12',
    received: 'Mar 27, 2026',
    sender: 'team@slacck.test',
    subject: 'You have been mentioned',
    signals: [
      { type: 'typo', value: 'slacck.test', description: 'Suspicious domain similar to slack.com' }
    ],
    riskLevel: 'Medium',
    riskScore: 58,
    sourceProvider: 'slack',
    content: 'You were mentioned in a conversation. Click to view the message.'
  },
  {
    id: '13',
    received: 'Mar 24, 2026',
    sender: 'updates@faceb00k.test',
    subject: 'Someone logged into your account',
    signals: [
      { type: 'keyword', value: 'logged', description: 'Contains security keyword: logged' },
      { type: 'typo', value: 'faceb00k.test', description: 'Suspicious domain similar to facebook.com' }
    ],
    riskLevel: 'High',
    riskScore: 80,
    sourceProvider: 'outlook',
    content: 'We detected a login from an unrecognized device. Was this you?'
  },
  {
    id: '14',
    received: 'Mar 20, 2026',
    sender: 'noreply@we11sfargo.test',
    subject: 'Action required: Verify your identity',
    signals: [
      { type: 'keyword', value: 'verify', description: 'Contains sensitive keyword: verify' },
      { type: 'typo', value: 'we11sfargo.test', description: 'Suspicious domain similar to wellsfargo.com' }
    ],
    riskLevel: 'Critical',
    riskScore: 96,
    sourceProvider: 'outlook',
    content: 'For your security, please verify your identity to continue accessing your account.'
  },
  {
    id: '15',
    received: 'Mar 16, 2026',
    sender: 'service@paypa1-secure.test',
    subject: 'Confirm recent transaction',
    signals: [
      { type: 'keyword', value: 'transaction', description: 'Contains sensitive keyword: transaction' },
      { type: 'typo', value: 'paypa1-secure.test', description: 'Suspicious domain pretending to be PayPal' }
    ],
    riskLevel: 'Critical',
    riskScore: 95,
    sourceProvider: 'outlook',
    content: 'Please confirm your recent transaction of $1,250.00. If unauthorized, click here immediately.'
  },
  {
    id: '16',
    received: 'Mar 15, 2026',
    sender: 'news@deals-t0day.test',
    subject: 'Limited-time offer inside',
    signals: [
      { type: 'typo', value: 'deals-t0day.test', description: 'Suspicious domain similar to deals-today.com' }
    ],
    riskLevel: 'Low',
    riskScore: 44,
    sourceProvider: 'outlook',
    content: 'Open this message to see your personalized deals. Unsubscribe any time.'
  },
  {
    id: '17',
    received: 'Mar 14, 2026',
    sender: 'hello@inv0ice-portal.test',
    subject: 'Invoice #8842 attached',
    signals: [
      { type: 'keyword', value: 'account', description: 'Contains sensitive keyword: account' },
      { type: 'typo', value: 'inv0ice-portal.test', description: 'Suspicious domain pretending to be an invoice portal' }
    ],
    riskLevel: 'Low',
    riskScore: 48,
    sourceProvider: 'outlook',
    content: 'Your invoice is ready. Sign in to your account to review payment details.'
  },
  {
    id: '18',
    received: 'Mar 12, 2026',
    sender: 'support@cloud-st0rage.test',
    subject: 'Shared folder invitation',
    signals: [
      { type: 'typo', value: 'cloud-st0rage.test', description: 'Suspicious domain similar to cloud-storage.com' }
    ],
    riskLevel: 'Low',
    riskScore: 41,
    sourceProvider: 'outlook',
    content: 'A folder was shared with you. Click to accept the invitation.'
  },
  {
    id: '19',
    received: 'Mar 10, 2026',
    sender: 'team@meetlng-calendar.test',
    subject: 'Reschedule: 1:1 sync',
    signals: [
      { type: 'typo', value: 'meetlng-calendar.test', description: 'Suspicious domain similar to meeting-calendar.com' }
    ],
    riskLevel: 'Low',
    riskScore: 46,
    sourceProvider: 'outlook',
    content: 'Your meeting was updated. Please confirm the new time on the calendar link.'
  },
  {
    id: '20',
    received: 'Mar 8, 2026',
    sender: 'billing@saas-renewai.test',
    subject: 'Renewal reminder',
    signals: [
      { type: 'keyword', value: 'expires', description: 'Contains urgency keyword: expires' },
      { type: 'typo', value: 'saas-renewai.test', description: 'Suspicious domain similar to a SaaS vendor' }
    ],
    riskLevel: 'Medium',
    riskScore: 55,
    sourceProvider: 'outlook',
    content: 'Your plan expires soon. Renew to avoid interruption to your workspace.'
  }
];

export const mockReleasedEmails: ReleasedEmail[] = [
  {
    id: 'r1',
    originalEmail: {
      id: 's1',
      received: 'Apr 5, 2026',
      sender: 'billing@spotify.com',
      subject: 'Your receipt for Spotify Premium',
      signals: [],
      riskLevel: 'Low',
      riskScore: 12,
      sourceProvider: 'gmail',
      content: `Thanks for your payment. This receipt confirms your subscription renewal.`
    },
    releasedAt: '2026-04-05',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r2',
    originalEmail: {
      id: 's2',
      received: 'Apr 4, 2026',
      sender: 'noreply@github.com',
      subject: 'Security alert: New sign-in to your account',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `We noticed a new sign-in to your GitHub account from a new device. If this was you, no action is needed.`
    },
    releasedAt: '2026-04-04',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r3',
    originalEmail: {
      id: 's3',
      received: 'Apr 3, 2026',
      sender: 'events@meetup.com',
      subject: 'Reminder: NYC React Meetup tonight',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `Your event starts at 6:30 PM. Venue details and check-in info inside.`
    },
    releasedAt: '2026-04-03',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r4',
    originalEmail: {
      id: 's4',
      received: 'Apr 2, 2026',
      sender: 'support@delta.com',
      subject: 'Trip itinerary: BOS → JFK',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `Your flight details, seat assignment, and baggage policy are included.`
    },
    releasedAt: '2026-04-02',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r5',
    originalEmail: {
      id: 's5',
      received: 'Apr 1, 2026',
      sender: 'newsletter@nytimes.com',
      subject: 'Today’s headlines',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `Here’s a quick read of the top stories for today.`
    },
    releasedAt: '2026-04-01',
    releasedBy: 'System',
    starred: true,
    isRead: false
  },
  {
    id: 'r6',
    originalEmail: {
      id: 's6',
      received: 'Mar 31, 2026',
      sender: 'hr@acme.com',
      subject: 'Interview schedule confirmation',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `Confirming your interview time and meeting link. Reply if you need to reschedule.`
    },
    releasedAt: '2026-03-31',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r7',
    originalEmail: {
      id: 's7',
      received: 'Mar 30, 2026',
      sender: 'receipts@amazon.com',
      subject: 'Your Amazon.com order has shipped',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `Tracking number and delivery estimate included.`
    },
    releasedAt: '2026-03-30',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r8',
    originalEmail: {
      id: 's8',
      received: 'Mar 29, 2026',
      sender: 'no-reply@slack.com',
      subject: 'You were added to #product-updates',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'gmail',
      content: `Welcome! Here are a few tips to get started.`
    },
    releasedAt: '2026-03-29',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r9',
    originalEmail: {
      id: 's9',
      received: 'Mar 28, 2026',
      sender: 'hello@canva.com',
      subject: 'Your design is ready to share',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `We saved your latest changes. Share with teammates using this link.`
    },
    releasedAt: '2026-03-28',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r10',
    originalEmail: {
      id: 's10',
      received: 'Mar 27, 2026',
      sender: 'notifications@bankofamerica.com',
      subject: 'Account notice: Statement available',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `Your monthly statement is now available in Online Banking.`
    },
    releasedAt: '2026-03-27',
    releasedBy: 'System',
    starred: true,
    isRead: false
  },
  {
    id: 'r11',
    originalEmail: {
      id: 's11',
      received: 'Mar 25, 2026',
      sender: 'info@openai.com',
      subject: 'Product update: New features available',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `We’ve shipped improvements and new capabilities. Learn what’s new.`
    },
    releasedAt: '2026-03-25',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r12',
    originalEmail: {
      id: 's12',
      received: 'Mar 23, 2026',
      sender: 'team@trello.com',
      subject: 'Board activity: Sprint Planning',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `A card you’re watching was updated. View the changes.`
    },
    releasedAt: '2026-03-23',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r13',
    originalEmail: {
      id: 's13',
      received: 'Mar 22, 2026',
      sender: 'notifications@linkedin.com',
      subject: 'New job recommendations for you',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `Here are roles based on your profile and interests.`
    },
    releasedAt: '2026-03-22',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r14',
    originalEmail: {
      id: 's14',
      received: 'Mar 20, 2026',
      sender: 'service@ubereats.com',
      subject: 'Your order is on the way',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `Your driver is heading to you. Track your delivery in the app.`
    },
    releasedAt: '2026-03-20',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r15',
    originalEmail: {
      id: 's15',
      received: 'Mar 18, 2026',
      sender: 'calendar@google.com',
      subject: 'Invitation: Weekly sync',
      signals: [],
      riskLevel: 'Low',
      riskScore: 15,
      sourceProvider: 'outlook',
      content: `You’ve been invited to an event. View details and RSVP.`
    },
    releasedAt: '2026-03-18',
    releasedBy: 'System',
    starred: true,
    isRead: true
  }
];

export const mockKeywords: Keyword[] = [
  { id: '1', value: 'verify', createdAt: '2025-02-15', enabled: true },
  { id: '2', value: 'urgent', createdAt: '2026-02-16', enabled: true },
  { id: '3', value: 'suspended', createdAt: '2026-02-16', enabled: true },
  { id: '4', value: 'confirm', createdAt: '2026-02-17', enabled: true },
  { id: '5', value: 'won', createdAt: '2026-02-17', enabled: true },
  { id: '6', value: 'prize', createdAt: '2026-02-18', enabled: true },
  { id: '7', value: 'account', createdAt: '2026-02-18', enabled: true },
  { id: '8', value: 'security', createdAt: '2026-02-19', enabled: true },
  { id: '9', value: 'expires', createdAt: '2026-02-19', enabled: true },
  { id: '10', value: 'click here', createdAt: '2026-02-20', enabled: true }
];
