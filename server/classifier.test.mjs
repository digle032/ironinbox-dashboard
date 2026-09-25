import assert from 'node:assert/strict';
import test from 'node:test';
import {
  gradeEmail,
  lookalikeBrand,
  normalizeGmailMessage,
  parseAddress,
  parseAuthenticationResults,
} from './classifier.mjs';
function b64(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}
function gmailMessage({ from, replyTo, subject, html, text, auth, labelIds = ['INBOX'], attachments = [] }) {
  const headers = [
    { name: 'From', value: from },
    { name: 'Subject', value: subject },
    { name: 'Authentication-Results', value: auth },
  ];
  if (replyTo) headers.push({ name: 'Reply-To', value: replyTo });
  return {
    id: 'm1', threadId: 't1', labelIds, snippet: 'snippet', internalDate: '1767225600000',
    payload: {
      mimeType: 'multipart/mixed', headers,
      parts: [
        { mimeType: 'multipart/alternative', parts: [
          { mimeType: 'text/plain', body: { data: b64(text || '') } },
          { mimeType: 'text/html', body: { data: b64(html || '') } },
        ] },
        ...attachments.map((filename) => ({ mimeType: 'application/octet-stream', filename, body: { size: 1024, attachmentId: 'a' } })),
      ],
    },
  };
}


const PASS = 'mx.google.com; dkim=pass header.i=@example.com; spf=pass smtp.mailfrom=example.com; dmarc=pass (p=REJECT) header.from=example.com';
const FAIL = 'mx.google.com; dkim=fail header.i=@paypa1.com; spf=softfail smtp.mailfrom=paypa1.com; dmarc=fail (p=NONE) header.from=paypa1.com';
test('parses sender and auth headers', () => {
  assert.deepEqual(parseAddress('"PayPal Support" <Help@PayPa1.com>'), { name: 'PayPal Support', email: 'help@paypa1.com', domain: 'paypa1.com' });
  assert.deepEqual(parseAuthenticationResults(FAIL), { spf: 'softfail', dkim: 'fail', dmarc: 'fail' });
  assert.deepEqual(parseAuthenticationResults(''), { spf: 'none', dkim: 'none', dmarc: 'none' });
});
test('detects lookalike domains without flagging the real ones', () => {
  assert.equal(lookalikeBrand('paypa1.com'), 'paypal');
  assert.equal(lookalikeBrand('micr0soft-support.net'), 'microsoft');
  assert.equal(lookalikeBrand('arnazon.com'), null); // rn->m is out of scope for now; documented
  assert.equal(lookalikeBrand('paypal.com'), null);
  assert.equal(lookalikeBrand('mail.google.com'), null);
  assert.equal(lookalikeBrand('example.com'), null);
});
test('normalizes a multipart Gmail message', () => {
  const email = normalizeGmailMessage(gmailMessage({
    from: 'Alice <alice@example.com>', subject: 'Hi', text: 'plain body', html: '<a href="https://example.com/x">example.com</a>', auth: PASS,
    attachments: ['report.pdf'],
  }));
  assert.equal(email.text, 'plain body');
  assert.equal(email.receivedAt, '2026-01-01T00:00:00.000Z');
  assert.deepEqual(email.links, [{ href: 'https://example.com/x', text: 'example.com', host: 'example.com' }]);
  assert.deepEqual(email.attachments, [{ filename: 'report.pdf', mimeType: 'application/octet-stream', size: 1024 }]);
  assert.equal(email.auth.dmarc, 'pass');
});
test('grades a classic credential phish as Critical', () => {
  const email = normalizeGmailMessage(gmailMessage({
    from: '"PayPal" <security@paypa1.com>', replyTo: 'collect@evil.example', subject: 'Urgent: verify your account',
    html: 'Your account will be suspended. <a href="http://198.51.100.7/login">https://www.paypal.com/signin</a>', auth: FAIL,
  }));
  const grade = gradeEmail(email, { keywords: ['verify'] });
  const detectors = grade.signals.map((s) => s.detector);
  for (const d of ['user-keyword', 'phrase', 'auth', 'lookalike-domain', 'display-name', 'reply-to', 'link-mismatch', 'link-ip']) {
    assert.ok(detectors.includes(d), `expected ${d} in ${detectors}`);
  }
  assert.equal(grade.riskLevel, 'Critical');
});


test('grades an authenticated, ordinary email as Low', () => {
  const email = normalizeGmailMessage(gmailMessage({
    from: 'Alice <alice@example.com>', subject: 'Lunch Thursday?', text: 'Want to grab lunch? https://maps.example.com/place', auth: PASS,
  }));
  const grade = gradeEmail(email, { keywords: ['invoice'] });
  assert.equal(grade.riskScore, 0);
  assert.equal(grade.riskLevel, 'Low');
});
test('respects detection options for keywords', () => {
  const email = normalizeGmailMessage(gmailMessage({ from: 'a@example.com', subject: 'Password reset', text: 'nothing here', auth: PASS }));
  assert.equal(gradeEmail(email, { keywords: ['password'] }).signals.length, 1);
  assert.equal(gradeEmail(email, { keywords: ['password'], options: { matchInSubject: false } }).signals.length, 0);
  assert.equal(gradeEmail(email, { keywords: ['pass'], options: { wholeWordOnly: true } }).signals.length, 0);
});
test('flags dangerous attachments', () => {
  const email = normalizeGmailMessage(gmailMessage({ from: 'a@example.com', subject: 'Scan', text: 'see attached', auth: PASS, attachments: ['scan.pdf.html'] }));
  assert.ok(gradeEmail(email).signals.some((s) => s.detector === 'attachment'));
});