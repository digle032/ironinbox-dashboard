export const SCHEMA_VERSION = 1;
const BRANDS = {
  paypal: ['paypal.com'],
  microsoft: ['microsoft.com'],
  google: ['google.com'],
  amazon: ['amazon.com'],
  apple: ['apple.com', 'icloud.com'],
  facebook: ['facebook.com', 'meta.com'],
  instagram: ['instagram.com'],
  netflix: ['netflix.com'],
  linkedin: ['linkedin.com'],
  wellsfargo: ['wellsfargo.com'],
  chase: ['chase.com'],
};
const HOMOGLYPHS = { 0: 'o', 1: 'l', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a' };
const PHRASES = [
  'verify your account',
  'confirm your identity',
  'unusual activity',
  'account will be',
  'wire transfer',
  'gift card',
  'confirm your password',
  'credential',
  'sign in',
  'urgent',
  'immediately',
  'suspended',
];
const RISKY_EXTENSIONS = /\.(exe|scr|js|jse|vbs|bat|cmd|ps1|msi|iso|img|lnk|hta|jar|html?|zip|7z|rar|docm|xlsm)$/i;
function header(headers, name) {
  return headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value || '';
}
function decodeBase64Url(value = '') {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}
function walkParts(part, out) {
  const mimeType = part.mimeType || '';
  if (part.filename) {
    out.attachments.push({ filename: part.filename, mimeType, size: part.body?.size || 0 });
  } else if (mimeType === 'text/plain' && part.body?.data && !out.text) {
    out.text = decodeBase64Url(part.body.data);
  } else if (mimeType === 'text/html' && part.body?.data && !out.html) {
    out.html = decodeBase64Url(part.body.data);
  }
  for (const child of part.parts || []) walkParts(child, out);
  return out;
}
function htmlToText(html) {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function hostOf(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return '';
  }
}
function extractLinks(html, text) {
  const links = [];
  const seen = new Set();
  const push = (href, linkText) => {
    const host = hostOf(href);
    if (!href || !host || seen.has(href)) return;
    seen.add(href);
    links.push({ href, text: (linkText || href).trim(), host });
  };
  if (html) {
    const pattern = /<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = pattern.exec(html))) {
      push(match[1], htmlToText(match[2]) || match[1]);
    }
  }
  if (!links.length && text) {
    const pattern = /https?:\/\/[^\s<>"']+/gi;
    let match;
    while ((match = pattern.exec(text))) push(match[0], match[0]);
  }
  return links.slice(0, 50);
}
export function parseAddress(value = '') {
  const emailMatch = value.match(/<([^>]+)>/) || value.match(/([^\s<>]+@[^\s<>]+)/);
  const email = (emailMatch?.[1] || '').trim().toLowerCase();
  const name = value.replace(/<[^>]+>/, '').replace(/["']/g, '').trim();
  const domain = email.split('@')[1] || '';
  return { name, email, domain };
}
export function parseAuthenticationResults(value = '') {
  const verdict = (method) => value.match(new RegExp(`\\b${method}=(\\w+)`, 'i'))?.[1]?.toLowerCase() || 'none';
  return { spf: verdict('spf'), dkim: verdict('dkim'), dmarc: verdict('dmarc') };
}
export function normalizeGmailMessage({ id, threadId, labelIds = [], snippet = '', payload = {}, internalDate }) {
  const headers = payload.headers || [];
  const parts = walkParts(payload, { text: '', html: '', attachments: [] });
  const text = (parts.text || htmlToText(parts.html)).slice(0, 60_000);
  return {
    schemaVersion: SCHEMA_VERSION,
    id,
    threadId: threadId || id,
    labelIds,
    receivedAt: new Date(Number(internalDate || Date.now())).toISOString(),
    from: parseAddress(header(headers, 'From')),
    replyTo: header(headers, 'Reply-To') ? parseAddress(header(headers, 'Reply-To')) : null,
    to: header(headers, 'To'),
    subject: header(headers, 'Subject') || '(no subject)',
    snippet,
    text,
    links: extractLinks(parts.html, text),
    attachments: parts.attachments,
    auth: parseAuthenticationResults(header(headers, 'Authentication-Results')),
  };
}

function registrable(domain) {
  return (domain || '').split('.').slice(-2).join('.');
}
function isBrandDomain(domain) {
  const root = registrable(domain);
  return Object.values(BRANDS).some((domains) => domains.includes(root));
}
function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}
export function lookalikeBrand(domain) {
  if (!domain || isBrandDomain(domain)) return null;
  const label = registrable(domain).split('.')[0];
  const deglyphed = label.replace(/[0134578@]/g, (c) => HOMOGLYPHS[c]).replace(/-/g, '');
  for (const brand of Object.keys(BRANDS)) {
    if (deglyphed === brand || deglyphed.includes(brand)) return brand;
    if (brand.length >= 5 && levenshtein(deglyphed, brand) <= 1) return brand;
  }
  return null;
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export function riskLevel(score) {
  if (score >= 75) return 'Critical';
  if (score >= 55) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}
export function gradeEmail(email, { keywords = [], options = {} } = {}) {
  const signals = [];
  let score = 0;
  const add = (points, signal) => { score += points; signals.push({ source: 'server', weight: points, ...signal }); };
  const matchSubject = options.matchInSubject !== false;
  const matchBody = options.matchInBody !== false;
  const haystack = `${matchSubject ? email.subject : ''} ${matchBody ? email.text : ''}`;
  const lowered = options.caseInsensitive === false ? haystack : haystack.toLowerCase();
  for (const keyword of keywords) {
    const needle = options.caseInsensitive === false ? keyword : keyword.toLowerCase();
    if (!needle) continue;
    const hit = options.wholeWordOnly
      ? new RegExp(`\\b${escapeRegExp(needle)}\\b`).test(lowered)
      : lowered.includes(needle);
    if (hit) add(10, { type: 'keyword', detector: 'user-keyword', value: keyword, description: `Contains monitored keyword: ${keyword}` });
  }

  const text = `${email.subject} ${email.text}`.toLowerCase();
  const phraseHits = PHRASES.filter((phrase) => text.includes(phrase));
  if (phraseHits.length) {
    add(Math.min(24, phraseHits.length * 8), { type: 'keyword', detector: 'phrase', value: phraseHits.slice(0, 3).join(', '), description: `Pressure or credential language: ${phraseHits.slice(0, 3).join(', ')}` });
  }
  const dmarc = email.auth?.dmarc || 'none';
  const spf = email.auth?.spf || 'none';
  const dkim = email.auth?.dkim || 'none';
  if (dmarc === 'fail') add(30, { type: 'typo', detector: 'auth', value: 'dmarc=fail', description: 'DMARC failed: the From domain did not authorize this message.' });
  if (spf === 'fail' || spf === 'softfail') add(12, { type: 'typo', detector: 'auth', value: `spf=${spf}`, description: `SPF ${spf}: the sending server is not authorized for this domain.` });
  if (dkim === 'fail') add(10, { type: 'typo', detector: 'auth', value: 'dkim=fail', description: 'DKIM failed: the message content may have been altered.' });
  const brand = lookalikeBrand(email.from?.domain);
  if (brand) add(35, { type: 'typo', detector: 'lookalike-domain', value: email.from.domain, description: `Sender domain imitates ${brand}.` });
  const nameBrand = Object.keys(BRANDS).find((b) => (email.from?.name || '').toLowerCase().replace(/\s+/g, '').includes(b));
  if (nameBrand && !BRANDS[nameBrand].includes(registrable(email.from?.domain))) {
    add(20, { type: 'typo', detector: 'display-name', value: email.from.name, description: `Display name says "${email.from.name}" but the address is ${email.from.email}.` });
  }
  if (email.replyTo?.domain && registrable(email.replyTo.domain) !== registrable(email.from?.domain)) {
    add(15, { type: 'typo', detector: 'reply-to', value: email.replyTo.email, description: `Replies go to ${email.replyTo.email}, not the sender's domain.` });
  }
  for (const link of email.links || []) {
    const shownHost = hostOf(/^https?:/i.test(link.text) ? link.text : `https://${link.text}`);
    if (link.text.includes('.') && shownHost && link.host && registrable(shownHost) !== registrable(link.host)) {
      add(20, { type: 'typo', detector: 'link-mismatch', value: link.host, description: `Link text shows ${shownHost} but opens ${link.host}.` });
      break;
    }
  }
  const ipLink = (email.links || []).find((link) => /^\d{1,3}(\.\d{1,3}){3}$/.test(link.host));
  if (ipLink) add(15, { type: 'typo', detector: 'link-ip', value: ipLink.host, description: 'Link points to a raw IP address instead of a domain.' });
  const risky = (email.attachments || []).find((file) => RISKY_EXTENSIONS.test(file.filename));
  if (risky) add(25, { type: 'typo', detector: 'attachment', value: risky.filename, description: `Attachment type is commonly used to deliver malware: ${risky.filename}` });
  if (email.labelIds?.includes('SPAM')) add(20, { type: 'typo', detector: 'provider-spam', value: 'SPAM', description: 'Gmail classified this message as spam.' });
  if (dmarc === 'pass' && isBrandDomain(email.from?.domain)) score -= 15;
  score = Math.max(0, Math.min(100, score));
  return { riskScore: score, riskLevel: riskLevel(score), signals };
}

export function toClientEmail(email, grade, disposition, review = null) {
  return {
    id: email.id,
    threadId: email.threadId,
    receivedAt: email.receivedAt,
    received: new Date(email.receivedAt).toLocaleString(),
    sender: email.from.name ? `${email.from.name} <${email.from.email}>` : email.from.email || 'Unknown sender',
    senderEmail: email.from.email,
    senderDomain: email.from.domain,
    subject: email.subject,
    snippet: email.snippet,
    content: email.text,
    labelIds: email.labelIds,
    auth: email.auth,
    links: email.links,
    attachments: email.attachments,
    signals: grade.signals,
    riskScore: grade.riskScore,
    riskLevel: grade.riskLevel,
    sourceProvider: 'gmail',
    disposition,
    review: review || undefined,
  };
}
export function presentStoredEmail(record, { keywords = [], options = {}, threshold = 50 } = {}) {
  const grade = gradeEmail(record.email, { keywords, options });
  const disposition = record.review?.disposition ?? (grade.riskScore >= threshold ? 'flagged' : 'safe');
  return toClientEmail(record.email, grade, disposition, record.review);
}