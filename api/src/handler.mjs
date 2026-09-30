import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { classify } from './classify.mjs';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const random = () => randomBytes(32).toString('base64url');
const fail = (status, message) => Object.assign(new Error(message), { status });
const json = (status, jsonBody, cookies = []) => ({ status, jsonBody, cookies, headers: { 'Cache-Control': 'no-store' } });

export function createHandler({ env, storage, fetcher = fetch }) {
  const frontend = env.FRONTEND_URL?.replace(/\/$/, '');
  const redirectUri = env.GMAIL_REDIRECT_URI;
  const key = env.TOKEN_ENCRYPTION_KEY ? createHash('sha256').update(env.TOKEN_ENCRYPTION_KEY).digest() : null;
  const ready = Boolean(frontend && redirectUri && key && storage && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
  const secure = !frontend?.startsWith('http://localhost:');
  const cookie = (name, value, maxAge) => ({ name, value, maxAge, path: '/', httpOnly: true, secure, sameSite: 'Lax' });
  const cookiesOf = (request) => Object.fromEntries((request.headers.get('cookie') || '').split(';').map(x => x.trim().split('=')));
  function encrypt(value) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
    return [iv, cipher.getAuthTag(), data].map(x => x.toString('base64url')).join('.');
  }
  function decrypt(value) {
    const [iv, tag, data] = value.split('.').map(x => Buffer.from(x, 'base64url'));
    const cipher = createDecipheriv('aes-256-gcm', key, iv);
    cipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([cipher.update(data), cipher.final()]).toString());
  }
  const redirect = (location, cookies = []) => ({ status: 302, headers: { Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }, cookies });
  async function google(url, options = {}) {
    const response = await fetcher(url, { ...options, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw fail(502, 'Google could not complete the request. Try reconnecting Gmail.');
    return response.json();
  }
  const exchange = (parameters) => google('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, ...parameters }),
  });

  return async (request, context = {}) => {
    const url = new URL(request.url);
    const path = url.pathname;
    const cookies = cookiesOf(request);
    try {
      if (request.method === 'GET' && path === '/api/health') return json(200, { configured: ready });
      if (!ready) throw fail(503, 'The API is not configured. Ask the administrator to complete Azure setup.');
      if (request.method === 'POST' && (request.headers.get('origin') !== frontend || !request.headers.get('content-type')?.startsWith('application/json'))) {
        throw fail(403, 'Request origin or content type is not allowed.');
      }
      if (request.method === 'GET' && path === '/api/gmail/connect') {
        const state = random();
        const browser = random();
        await storage.write(`oauth/${hash(state)}`, { browser: hash(browser), expiresAt: Date.now() + 600_000 });
        const query = new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: redirectUri,
          response_type: 'code', scope: 'openid email https://www.googleapis.com/auth/gmail.readonly',
          access_type: 'offline', prompt: 'consent', state });
        return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${query}`, [cookie('ironinbox_oauth', browser, 600)]);
      }
      if (request.method === 'GET' && path === '/api/gmail/callback') {
        const stateKey = `oauth/${hash(url.searchParams.get('state') || '')}`;
        const state = await storage.read(stateKey);
        if (!state || state.value.expiresAt < Date.now() || state.value.browser !== hash(cookies.ironinbox_oauth || '')) throw fail(400, 'Gmail connection expired. Please try again.');
        await storage.remove(stateKey, state.etag); // Consume once across all function instances.
        if (url.searchParams.has('error') || !url.searchParams.get('code')) throw fail(400, 'Gmail permission was not granted.');
        const token = await exchange({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: redirectUri });
        const profile = await google('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token.access_token}` } });
        if (!profile.sub || !profile.email || !profile.email_verified) throw fail(400, 'Google did not return a verified email address.');
        const session = random();
        await storage.write(`sessions/${hash(session)}`, { encrypted: encrypt({
          uid: profile.sub, email: profile.email, accessToken: token.access_token, refreshToken: token.refresh_token,
          tokenExpiresAt: Date.now() + token.expires_in * 1000, expiresAt: Date.now() + 7 * 86400_000,
          messages: {}, lastSyncedAt: null,
        }) });
        return redirect(`${frontend}/login`, [cookie('ironinbox_session', session, 7 * 86400), cookie('ironinbox_oauth', '', 0)]);
      }
      const sessionKey = `sessions/${hash(cookies.ironinbox_session || '')}`;
      const record = cookies.ironinbox_session ? await storage.read(sessionKey) : null;
      const account = record ? decrypt(record.value.encrypted) : null;
      if (!account || account.expiresAt < Date.now()) throw fail(401, 'Please connect Gmail to sign in.');
      if (request.method === 'GET' && path === '/api/gmail/status') return json(200, {
        connected: true, uid: account.uid, email: account.email, lastSyncedAt: account.lastSyncedAt,
      });
      if (request.method === 'POST' && ['/api/auth/logout', '/api/gmail/disconnect', '/api/data/wipe'].includes(path)) {
        await storage.remove(sessionKey, record.etag);
        return json(200, { disconnected: true, wiped: true }, [cookie('ironinbox_session', '', 0)]);
      }
      if (request.method === 'POST' && path === '/api/gmail/sync') {
        if (account.tokenExpiresAt < Date.now() + 30_000) {
          if (!account.refreshToken) throw fail(401, 'Please reconnect Gmail to renew access.');
          const token = await exchange({ grant_type: 'refresh_token', refresh_token: account.refreshToken });
          account.accessToken = token.access_token;
          account.refreshToken = token.refresh_token || account.refreshToken;
          account.tokenExpiresAt = Date.now() + token.expires_in * 1000;
        }
        const gmail = (route) => google(`https://gmail.googleapis.com/gmail/v1/users/me/${route}`, { headers: { Authorization: `Bearer ${account.accessToken}` } });
        // Bound work below SWA's 45-second request limit; retain at most 50 records.
        const listed = await gmail('messages?labelIds=INBOX&maxResults=50');
        const ids = (listed.messages || []).map(x => x.id);
        const pending = ids.filter(id => !account.messages[id]).slice(0, 10);
        const messages = await Promise.all(pending.map(id => gmail(`messages/${encodeURIComponent(id)}?format=full`)));
        for (const message of messages) account.messages[message.id] = classify(message);
        account.messages = Object.fromEntries(ids.filter(id => account.messages[id]).map(id => [id, account.messages[id]]));
        account.lastSyncedAt = new Date().toISOString();
        await storage.write(sessionKey, { encrypted: encrypt(account) }, record.etag);
        return json(200, { added: messages.length, messages: Object.values(account.messages).sort((a,b) => b.received.localeCompare(a.received)), lastSyncedAt: account.lastSyncedAt, hasMore: ids.some(id => !account.messages[id]) });
      }
      if (request.method === 'GET' && path === '/api/emails') return json(200, { messages: Object.values(account.messages) });
      return json(404, { error: 'Not found.' });
    } catch (error) {
      const status = error.status || (error.statusCode === 412 || error.statusCode === 404 ? 409 : 500);
      context.error?.(`API request failed (${status})`); // Do not log tokens, message bodies, or OAuth codes.
      if (path === '/api/gmail/callback') return redirect(`${frontend}/login?gmail=error`, [cookie('ironinbox_oauth', '', 0)]);
      return json(status, { error: error.status ? error.message : status === 409 ? 'Mailbox changed during this request. Please retry.' : 'The API request failed. Please try again.' });
    }
  };
}
