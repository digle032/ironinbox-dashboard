function header(headers, name) {
  return headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value || '';
}

function decodeBase64Url(value = '') {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function bodyFromPayload(payload) {
  if (payload.body?.data) return decodeBase64Url(payload.body.data);
  const parts = payload.parts || [];
  const plain = parts.find((part) => part.mimeType === 'text/plain');
  const html = parts.find((part) => part.mimeType === 'text/html');
  const nested = parts.map(bodyFromPayload).find(Boolean);
  return plain?.body?.data ? decodeBase64Url(plain.body.data) : html?.body?.data ? decodeBase64Url(html.body.data).replace(/<[^>]+>/g, ' ') : nested || '';
}

function riskLevel(score) {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

export function classify({ id, payload, internalDate }) {
  const sender = header(payload.headers, 'From') || 'Unknown sender';
  const subject = header(payload.headers, 'Subject') || '(no subject)';
  const content = bodyFromPayload(payload).slice(0, 60_000);
  const text = `${subject} ${content}`.toLowerCase();
  const signals = [];
  let score = 0;
  const terms = ['verify', 'password', 'credential', 'login', 'sign in', 'urgent', 'immediately', 'suspended', 'wire transfer', 'gift card'];
  for (const term of terms) {
    if (text.includes(term)) { signals.push({ type: 'keyword', value: term, description: `Risk phrase detected: ${term}`, source: 'server' }); score += 10; }
  }
  const urls = content.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  if (urls.length) { signals.push({ type: 'typo', value: urls[0].slice(0, 80), description: 'Message contains a link; verify its destination before opening.', source: 'server' }); score += 12; }
  const domain = sender.match(/@([^>\s]+)/)?.[1]?.toLowerCase() || '';
  if (/[0-9]/.test(domain) || /(paypa1|g00gle|micr0soft|amaz0n)/.test(domain)) { signals.push({ type: 'typo', value: domain, description: 'Sender domain contains a likely impersonation pattern.', source: 'server' }); score += 35; }
  if (/reply[- ]?to|account.{0,20}(suspend|disable)|click.{0,20}(verify|login|sign)/.test(text)) score += 18;
  score = Math.min(100, score);
  return { id, received: new Date(Number(internalDate || Date.now())).toISOString(), sender, subject, content, signals, riskScore: score, riskLevel: riskLevel(score), sourceProvider: 'gmail', disposition: score >= 30 ? 'flagged' : 'safe' };
}
