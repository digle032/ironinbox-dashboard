import { createServer } from 'node:http';
import { createHandler } from '../api/src/handler.mjs';
import { createStorage } from '../api/src/storage.mjs';

const port = Number(process.env.API_PORT || 8787);
const handler = createHandler({ env: process.env, storage: process.env.IRONINBOX_STORAGE_CONNECTION_STRING
  ? createStorage(process.env.IRONINBOX_STORAGE_CONNECTION_STRING, process.env.IRONINBOX_STORAGE_CONTAINER) : null });
createServer(async (request, response) => {
  try {
    const result = await handler({ url: `http://localhost:${port}${request.url}`, method: request.method, headers: new Headers(Object.entries(request.headers).filter(([, value]) => typeof value === 'string')),
      json: async () => {
        let body = '';
        for await (const chunk of request) { body += chunk; if (Buffer.byteLength(body) > 65536) throw new Error('Body too large'); }
        return JSON.parse(body || '{}');
      },
    });
    const headers = { ...result.headers };
    if (result.cookies?.length) headers['Set-Cookie'] = result.cookies.map(c => `${c.name}=${c.value}; Path=${c.path}; Max-Age=${c.maxAge}; HttpOnly; SameSite=${c.sameSite}${c.secure ? '; Secure' : ''}`);
    if (result.jsonBody) headers['Content-Type'] = 'application/json';
    response.writeHead(result.status || 200, headers);
    response.end(result.jsonBody ? JSON.stringify(result.jsonBody) : '');
  } catch {
    response.writeHead(500); response.end('API request failed');
  }
}).listen(port, () => console.log(`IronInbox API listening on http://localhost:${port}`));
