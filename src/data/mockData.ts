import { FlaggedEmail, ReleasedEmail, Keyword } from '../types';

export const mockFlaggedEmails: FlaggedEmail[] = [
  {
    id: '1',
    received: '09:38 PM',
    sender: 'admin@acme-c0rp.test',
    subject: 'Urgent: Verify your account immediately',
    signals: [
      { type: 'keyword', value: 'verify', description: 'Contains sensitive keyword: verify' },
      { type: 'typo', value: 'acme-c0rp.test', description: 'Suspicious domain similar to acme-corp.com' }
    ],
    riskLevel: 'Critical',
    content: 'Your account needs verification immediately. Click here to update your credentials before suspension.'
  },
  {
    id: '2',
    received: '08:15 PM',
    sender: 'security@paypa1.test',
    subject: 'Verify your account now',
    signals: [
      { type: 'keyword', value: 'verify', description: 'Contains sensitive keyword: verify' },
      { type: 'typo', value: 'paypa1.test', description: 'Suspicious domain similar to paypal.com' }
    ],
    riskLevel: 'Critical',
    content: 'We detected unusual activity on your account. Please verify your information immediately.'
  },
  {
    id: '3',
    received: '07:42 PM',
    sender: 'noreply@g00gle.test',
    subject: 'Security alert on your account',
    signals: [
      { type: 'keyword', value: 'security', description: 'Contains sensitive keyword: security' },
      { type: 'typo', value: 'g00gle.test', description: 'Suspicious domain similar to google.com' }
    ],
    riskLevel: 'Critical',
    content: 'Your security settings need immediate attention. Click to review your account security.'
  },
  {
    id: '4',
    received: '06:29 PM',
    sender: 'support@bank0famerica.test',
    subject: 'Update your banking information',
    signals: [
      { type: 'keyword', value: 'banking', description: 'Contains sensitive keyword: banking' },
      { type: 'typo', value: 'bank0famerica.test', description: 'Suspicious domain similar to bankofamerica.com' }
    ],
    riskLevel: 'High',
    content: 'Please update your banking information to continue using our services.'
  },
  {
    id: '5',
    received: '05:18 PM',
    sender: 'admin@micr0soft.test',
    subject: 'Your Office 365 subscription expires today',
    signals: [
      { type: 'keyword', value: 'expires', description: 'Contains urgency keyword: expires' },
      { type: 'typo', value: 'micr0soft.test', description: 'Suspicious domain similar to microsoft.com' }
    ],
    riskLevel: 'High',
    content: 'Your subscription is expiring. Renew now to avoid service interruption.'
  },
  {
    id: '6',
    received: '04:55 PM',
    sender: 'notifications@amaz0n.test',
    subject: 'Confirm your recent order',
    signals: [
      { type: 'keyword', value: 'confirm', description: 'Contains sensitive keyword: confirm' },
      { type: 'typo', value: 'amaz0n.test', description: 'Suspicious domain similar to amazon.com' }
    ],
    riskLevel: 'High',
    content: 'Please confirm your recent order of $599.99. If you did not make this purchase, click here immediately.'
  },
  {
    id: '7',
    received: '03:12 PM',
    sender: 'admin@appleid-verify.test',
    subject: 'Suspicious activity detected',
    signals: [
      { type: 'keyword', value: 'suspicious', description: 'Contains urgency keyword: suspicious' },
      { type: 'typo', value: 'appleid-verify.test', description: 'Suspicious domain pretending to be Apple' }
    ],
    riskLevel: 'Critical',
    content: 'We detected suspicious login attempts on your Apple ID. Verify your identity now.'
  },
  {
    id: '8',
    received: '02:47 PM',
    sender: 'no-reply@linkedln.test',
    subject: 'You have 3 new connection requests',
    signals: [
      { type: 'typo', value: 'linkedln.test', description: 'Suspicious domain similar to linkedin.com (using "ln" instead of "in")' }
    ],
    riskLevel: 'Medium',
    content: 'You have new connection requests waiting. View them now.'
  },
  {
    id: '9',
    received: '01:33 PM',
    sender: 'support@netfIix.test',
    subject: 'Your payment method failed',
    signals: [
      { type: 'keyword', value: 'payment', description: 'Contains sensitive keyword: payment' },
      { type: 'typo', value: 'netfIix.test', description: 'Suspicious domain similar to netflix.com (using capital I)' }
    ],
    riskLevel: 'High',
    content: 'Your payment method was declined. Update your billing information to continue your subscription.'
  },
  {
    id: '10',
    received: '12:08 PM',
    sender: 'alerts@chase-bank.test',
    subject: 'Unusual account activity',
    signals: [
      { type: 'keyword', value: 'account', description: 'Contains sensitive keyword: account' },
      { type: 'typo', value: 'chase-bank.test', description: 'Suspicious domain pretending to be Chase' }
    ],
    riskLevel: 'Critical',
    content: 'We noticed unusual activity on your account. Verify your recent transactions immediately.'
  },
  {
    id: '11',
    received: '11:25 AM',
    sender: 'info@dropb0x.test',
    subject: 'Your files are ready for download',
    signals: [
      { type: 'typo', value: 'dropb0x.test', description: 'Suspicious domain similar to dropbox.com' }
    ],
    riskLevel: 'Medium',
    content: 'Someone shared files with you. Click here to view and download.'
  },
  {
    id: '12',
    received: '10:42 AM',
    sender: 'team@slacck.test',
    subject: 'You have been mentioned',
    signals: [
      { type: 'typo', value: 'slacck.test', description: 'Suspicious domain similar to slack.com' }
    ],
    riskLevel: 'Medium',
    content: 'You were mentioned in a conversation. Click to view the message.'
  },
  {
    id: '13',
    received: '09:15 AM',
    sender: 'updates@faceb00k.test',
    subject: 'Someone logged into your account',
    signals: [
      { type: 'keyword', value: 'logged', description: 'Contains security keyword: logged' },
      { type: 'typo', value: 'faceb00k.test', description: 'Suspicious domain similar to facebook.com' }
    ],
    riskLevel: 'High',
    content: 'We detected a login from an unrecognized device. Was this you?'
  },
  {
    id: '14',
    received: '08:33 AM',
    sender: 'noreply@we11sfargo.test',
    subject: 'Action required: Verify your identity',
    signals: [
      { type: 'keyword', value: 'verify', description: 'Contains sensitive keyword: verify' },
      { type: 'typo', value: 'we11sfargo.test', description: 'Suspicious domain similar to wellsfargo.com' }
    ],
    riskLevel: 'Critical',
    content: 'For your security, please verify your identity to continue accessing your account.'
  },
  {
    id: '15',
    received: '07:58 AM',
    sender: 'service@paypa1-secure.test',
    subject: 'Confirm recent transaction',
    signals: [
      { type: 'keyword', value: 'transaction', description: 'Contains sensitive keyword: transaction' },
      { type: 'typo', value: 'paypa1-secure.test', description: 'Suspicious domain pretending to be PayPal' }
    ],
    riskLevel: 'Critical',
    content: 'Please confirm your recent transaction of $1,250.00. If unauthorized, click here immediately.'
  }
];

export const mockReleasedEmails: ReleasedEmail[] = [
  {
    id: 'r1',
    originalEmail: {
      id: 's1',
      received: '08:12 AM',
      sender: 'billing@spotify.com',
      subject: 'Your receipt for Spotify Premium',
      signals: [],
      riskLevel: 'Low',
      content: `Thanks for your payment. This receipt confirms your subscription renewal.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r2',
    originalEmail: {
      id: 's2',
      received: '09:05 AM',
      sender: 'noreply@github.com',
      subject: 'Security alert: New sign-in to your account',
      signals: [],
      riskLevel: 'Low',
      content: `We noticed a new sign-in to your GitHub account from a new device. If this was you, no action is needed.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r3',
    originalEmail: {
      id: 's3',
      received: '10:41 AM',
      sender: 'events@meetup.com',
      subject: 'Reminder: NYC React Meetup tonight',
      signals: [],
      riskLevel: 'Low',
      content: `Your event starts at 6:30 PM. Venue details and check-in info inside.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r4',
    originalEmail: {
      id: 's4',
      received: '11:22 AM',
      sender: 'support@delta.com',
      subject: 'Trip itinerary: BOS → JFK',
      signals: [],
      riskLevel: 'Low',
      content: `Your flight details, seat assignment, and baggage policy are included.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r5',
    originalEmail: {
      id: 's5',
      received: '12:03 PM',
      sender: 'newsletter@nytimes.com',
      subject: 'Today’s headlines',
      signals: [],
      riskLevel: 'Low',
      content: `Here’s a quick read of the top stories for today.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: true,
    isRead: false
  },
  {
    id: 'r6',
    originalEmail: {
      id: 's6',
      received: '01:15 PM',
      sender: 'hr@acme.com',
      subject: 'Interview schedule confirmation',
      signals: [],
      riskLevel: 'Low',
      content: `Confirming your interview time and meeting link. Reply if you need to reschedule.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r7',
    originalEmail: {
      id: 's7',
      received: '02:30 PM',
      sender: 'receipts@amazon.com',
      subject: 'Your Amazon.com order has shipped',
      signals: [],
      riskLevel: 'Low',
      content: `Tracking number and delivery estimate included.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r8',
    originalEmail: {
      id: 's8',
      received: '03:04 PM',
      sender: 'no-reply@slack.com',
      subject: 'You were added to #product-updates',
      signals: [],
      riskLevel: 'Low',
      content: `Welcome! Here are a few tips to get started.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r9',
    originalEmail: {
      id: 's9',
      received: '03:58 PM',
      sender: 'hello@canva.com',
      subject: 'Your design is ready to share',
      signals: [],
      riskLevel: 'Low',
      content: `We saved your latest changes. Share with teammates using this link.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r10',
    originalEmail: {
      id: 's10',
      received: '04:37 PM',
      sender: 'notifications@bankofamerica.com',
      subject: 'Account notice: Statement available',
      signals: [],
      riskLevel: 'Low',
      content: `Your monthly statement is now available in Online Banking.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: true,
    isRead: false
  },
  {
    id: 'r11',
    originalEmail: {
      id: 's11',
      received: '05:18 PM',
      sender: 'info@openai.com',
      subject: 'Product update: New features available',
      signals: [],
      riskLevel: 'Low',
      content: `We’ve shipped improvements and new capabilities. Learn what’s new.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r12',
    originalEmail: {
      id: 's12',
      received: '06:09 PM',
      sender: 'team@trello.com',
      subject: 'Board activity: Sprint Planning',
      signals: [],
      riskLevel: 'Low',
      content: `A card you’re watching was updated. View the changes.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: true
  },
  {
    id: 'r13',
    originalEmail: {
      id: 's13',
      received: '07:45 PM',
      sender: 'notifications@linkedin.com',
      subject: 'New job recommendations for you',
      signals: [],
      riskLevel: 'Low',
      content: `Here are roles based on your profile and interests.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r14',
    originalEmail: {
      id: 's14',
      received: '08:20 PM',
      sender: 'service@ubereats.com',
      subject: 'Your order is on the way',
      signals: [],
      riskLevel: 'Low',
      content: `Your driver is heading to you. Track your delivery in the app.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: false,
    isRead: false
  },
  {
    id: 'r15',
    originalEmail: {
      id: 's15',
      received: '09:02 PM',
      sender: 'calendar@google.com',
      subject: 'Invitation: Weekly sync',
      signals: [],
      riskLevel: 'Low',
      content: `You’ve been invited to an event. View details and RSVP.`
    },
    releasedAt: '2024-02-01',
    releasedBy: 'System',
    starred: true,
    isRead: true
  }
];

export const mockKeywords: Keyword[] = [
  { id: '1', value: 'verify', createdAt: '2024-01-15', enabled: true },
  { id: '2', value: 'urgent', createdAt: '2024-01-16', enabled: true },
  { id: '3', value: 'suspended', createdAt: '2024-01-16', enabled: true },
  { id: '4', value: 'confirm', createdAt: '2024-01-17', enabled: true },
  { id: '5', value: 'won', createdAt: '2024-01-17', enabled: true },
  { id: '6', value: 'prize', createdAt: '2024-01-18', enabled: true },
  { id: '7', value: 'account', createdAt: '2024-01-18', enabled: true },
  { id: '8', value: 'security', createdAt: '2024-01-19', enabled: true },
  { id: '9', value: 'expires', createdAt: '2024-01-19', enabled: true },
  { id: '10', value: 'click here', createdAt: '2024-01-20', enabled: true }
];
