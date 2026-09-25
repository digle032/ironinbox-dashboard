import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { SCHEMA_VERSION, normalizeGmailMessage, presentStoredEmail } from './classifier.mjs';

const root = resolve(import.meta.dirname, '..');
loadEnv(resolve(root, '.env'));

const port = Number(process.env.API_PORT || 8787);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
const redirectUri = process.env.GMAIL_REDIRECT_URI || `http://localhost:${port}/api/gmail/callback`;
const dataFile = resolve(root, process.env.DATA_FILE || 'data/ironinbox.json');
const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY
  ? createHash('sha256').update(process.env.TOKEN_ENCRYPTION_KEY).digest()
  : null;
const oauthStates = new Map();

function loadEnv(path) {
  try {
    const text = requireText(path);
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const equals = line.indexOf('=');
      if (equals < 0) continue;
      const key = line.slice(0, equals).trim();
      const value = line.slice(equals + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch { /* .env is optional until the user connects Gmail */ }
}

function requireText(path) {
  return readFileSync(path, 'utf8');
}

async function loadStore() {
  try {
    return JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return { connections: {}, messages: {} };
    throw error;
  }
}

async function saveStore(store) {
  await mkdir(dirname(dataFile), { recursive: true });
  const temporaryFile = `${dataFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(store, null, 2), { mode: 0o600 });
  await rename(temporaryFile, dataFile);
}

function encrypt(value) {
  if (!encryptionKey) throw new Error('TOKEN_ENCRYPTION_KEY is not configured.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
}

function decrypt(value) {
  const [ivText, tagText, ciphertextText] = value.split('.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, 'base64url')), decipher.final()]).toString('utf8');
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function redirect(response, location) {
  response.writeHead(302, { Location: location, 'Cache-Control': 'no-store' });
  response.end();
}

function configured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && encryptionKey);
}

function gmailAuthUrl(state) {
  const query = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email https://www.googleapis.com/auth/gmail.readonly',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

async function googleToken(parameters) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, ...parameters }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error_description || 'Google token exchange failed.');
  return result;
}

async function accessToken(connection) {
  const token = JSON.parse(decrypt(connection.token));
  if (token.expiresAt > Date.now() + 30_000) return token.accessToken;
  const refreshed = await googleToken({ grant_type: 'refresh_token', refresh_token: token.refreshToken });
  connection.token = encrypt(JSON.stringify({
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token || token.refreshToken,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
  }));
  return refreshed.access_token;
}

async function gmail(path, token) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || 'Gmail request failed.');
  return result;
}

function gradingSettings(source = {}) {
  return {
    keywords: Array.isArray(source.keywords) ? source.keywords.filter((item) => typeof item === 'string') : [],
    options: source.options && typeof source.options === 'object' ? source.options : {},
    threshold: Number.isFinite(Number(source.threshold)) ? Number(source.threshold) : 50,
  };
}

function clientMessages(records, settings) {
  return Object.values(records || {})
    .filter((record) => record?.schemaVersion === SCHEMA_VERSION && record.email)
    .map((record) => presentStoredEmail(record, settings))
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
}

function isCurrentRecord(record) {
  return record?.schemaVersion === SCHEMA_VERSION && record.email;
}

async function sync(ownerId, incoming = {}) {
  const store = await loadStore();
  const connection = store.connections[ownerId];
  if (!connection) throw new Error('No Gmail account is connected for this browser.');
  const settings = gradingSettings(incoming);
  connection.settings = settings;
  const token = await accessToken(connection);
  const listed = await gmail('messages?labelIds=INBOX&maxResults=50', token);
  const existing = store.messages[ownerId] || {};
  let added = 0;
  for (const message of listed.messages || []) {
    if (isCurrentRecord(existing[message.id])) continue;
    const full = await gmail(`messages/${message.id}?format=full`, token);
    existing[message.id] = {
      schemaVersion: SCHEMA_VERSION,
      email: normalizeGmailMessage(full),
      review: existing[message.id]?.review || null,
    };
    added += 1;
  }
  store.messages[ownerId] = existing;
  connection.lastSyncedAt = new Date().toISOString();
  await saveStore(store);
  return { added, messages: clientMessages(existing, settings), lastSyncedAt: connection.lastSyncedAt };
}

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (request.method === 'GET' && url.pathname === '/api/health') return sendJson(response, 200, { configured: configured() });
    if (request.method === 'GET' && url.pathname === '/api/gmail/connect') {
      if (!configured()) return sendJson(response, 503, { error: 'Gmail is not configured. Add Google OAuth credentials and TOKEN_ENCRYPTION_KEY to .env.' });
      const ownerId = url.searchParams.get('ownerId');
      if (!ownerId || ownerId.length > 128) return sendJson(response, 400, { error: 'A valid ownerId is required.' });
      const state = randomBytes(32).toString('base64url');
      oauthStates.set(state, { ownerId, expiresAt: Date.now() + 10 * 60_000 });
      return redirect(response, gmailAuthUrl(state));
    }
    if (request.method === 'GET' && url.pathname === '/api/gmail/callback') {
      const state = oauthStates.get(url.searchParams.get('state'));
      oauthStates.delete(url.searchParams.get('state'));
      if (!state || state.expiresAt < Date.now()) throw new Error('The Gmail connection expired. Please try again.');
      if (url.searchParams.get('error')) throw new Error('Gmail permission was not granted.');
      const token = await googleToken({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: redirectUri });
      const profile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token.access_token}` } }).then(async (r) => r.ok ? r.json() : Promise.reject(new Error('Could not identify the Gmail account.')));
      const store = await loadStore();
      store.connections[state.ownerId] = { provider: 'gmail', email: profile.email, token: encrypt(JSON.stringify({ accessToken: token.access_token, refreshToken: token.refresh_token, expiresAt: Date.now() + token.expires_in * 1000 })), connectedAt: new Date().toISOString(), lastSyncedAt: null };
      await saveStore(store);
      return redirect(response, `${frontendUrl}/login?gmail=connected&ownerId=${encodeURIComponent(state.ownerId)}&email=${encodeURIComponent(profile.email)}`);
    }
    if (request.method === 'GET' && url.pathname === '/api/gmail/status') {
      const store = await loadStore(); const connection = store.connections[url.searchParams.get('ownerId')];
      return sendJson(response, 200, connection ? { connected: true, email: connection.email, lastSyncedAt: connection.lastSyncedAt } : { connected: false });
    }
    if (request.method === 'POST' && url.pathname === '/api/gmail/sync') {
      const body = JSON.parse(await readBody(request));
      return sendJson(response, 200, await sync(body.ownerId, body));
    }
    if (request.method === 'GET' && url.pathname === '/api/emails') {
      const store = await loadStore();
      const ownerId = url.searchParams.get('ownerId');
      const connection = store.connections[ownerId];
      return sendJson(response, 200, { messages: clientMessages(store.messages[ownerId], gradingSettings(connection?.settings)) });
    }
    if (request.method === 'POST' && url.pathname === '/api/emails/disposition') {
      const body = JSON.parse(await readBody(request));
      if (!body.ownerId || !Array.isArray(body.ids) || !['flagged', 'safe'].includes(body.disposition)) {
        return sendJson(response, 400, { error: 'ownerId, ids[], and disposition (flagged|safe) are required.' });
      }
      const store = await loadStore();
      const records = store.messages[body.ownerId] || {};
      const review = { disposition: body.disposition, by: typeof body.by === 'string' && body.by ? body.by : 'analyst', at: new Date().toISOString() };
      let updated = 0;
      for (const id of body.ids) {
        if (!isCurrentRecord(records[id])) continue;
        records[id] = { ...records[id], review };
        updated += 1;
      }
      store.messages[body.ownerId] = records;
      await saveStore(store);
      return sendJson(response, 200, { updated });
    }
    if (request.method === 'POST' && url.pathname === '/api/data/wipe') {
      const body = JSON.parse(await readBody(request));
      if (!body.ownerId) return sendJson(response, 400, { error: 'An ownerId is required.' });
      const store = await loadStore();
      delete store.connections[body.ownerId];
      delete store.messages[body.ownerId];
      await saveStore(store);
      return sendJson(response, 200, { wiped: true });
    }
    if (request.method === 'POST' && url.pathname === '/api/gmail/disconnect') {
      const body = JSON.parse(await readBody(request));
      if (!body.ownerId) return sendJson(response, 400, { error: 'An ownerId is required.' });
      const store = await loadStore();
      delete store.connections[body.ownerId];
      delete store.messages[body.ownerId];
      await saveStore(store);
      return sendJson(response, 200, { disconnected: true });
    }
    sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unexpected server error.' });
  }
}).listen(port, () => console.log(`IronInbox API listening on http://localhost:${port}`));

function readBody(request) {
  return new Promise((resolve, reject) => { let body = ''; request.on('data', (chunk) => body += chunk); request.on('end', () => resolve(body || '{}')); request.on('error', reject); });
}
