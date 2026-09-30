# IronInbox

A React dashboard backed by integrated Azure Functions for Gmail monitoring.

## Run locally

Use Node 22.16+:

```sh
npm ci
npm --prefix api ci
```

Copy `.env.example` to `.env` and configure Google OAuth, the encryption key, and a private Blob Storage container. Register `http://localhost:5000/api/gmail/callback` with Google. Start these in separate terminals:

```sh
npm run api
npm run dev
```

## Deployment

Follow [AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md). Azure Static Web Apps builds the frontend into `dist` and deploys `api` as managed Functions. The local `server/index.mjs` is only a development adapter for the same API handler.

Static Web Apps can use the Free plan. Blob Storage is a separate resource with usage-based costs. Secrets belong in backend environment variables, never in frontend code or GitHub.

## Implemented

- Google OAuth sign-in and read-only access to the same Gmail mailbox.
- Secure browser sessions and encrypted mailbox/token storage.
- Sync of the latest 50 inbox messages, processed in bounded batches.
- Rule-based classification using headers, sender domains, links, attachment metadata, and configurable keywords.
- Server-persisted release/reflag decisions within the mailbox session.
- Disconnect and deletion of the current session's stored records.

Password signup, Microsoft Entra login, Outlook/Slack ingestion, background monitoring, and Gmail message modification are not implemented. Incident edits, stars/read markers, preferences, and role previews are browser-side features; role previews are not backend authorization. Sign-out deletes the current mailbox session. Google consent is revoked separately in Google Account settings.

## Checks

```sh
npm run test:api
npm run build
npm run lint
```

API and classifier tests live together in `api/test`. All backend entry points share `api/src/handler.mjs` and `api/src/classify.mjs`.
