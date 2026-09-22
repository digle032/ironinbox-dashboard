# Gmail monitoring setup

IronInbox can run without any paid services. The browser is the dashboard; the local API server is responsible for the OAuth exchange and encrypted refresh-token storage.

## 1. Create Google OAuth credentials

1. Create or select a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Gmail API**.
3. Configure the OAuth consent screen. While the app is in testing, add each classmate/tester as a test user.
4. Create an OAuth client of type **Web application**.
5. Add this authorized redirect URI: `http://localhost:8787/api/gmail/callback`.

The app requests `gmail.readonly`; it cannot send, delete, or change messages.

## 2. Configure secrets

Copy `.env.example` to `.env` and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a long unique `TOKEN_ENCRYPTION_KEY`. Keep `.env` private. The server encrypts refresh tokens before writing `data/ironinbox.json`; this generated data is ignored by Git.

For a local demo, leave the supplied `FRONTEND_URL`, `GMAIL_REDIRECT_URI`, and `API_PORT` values unchanged.

## 3. Run the two local services

Install project dependencies once, then use two terminals:

```powershell
npm install
npm run api
```

```powershell
npm run dev
```

Open the Vite address (normally `http://localhost:5000`), choose **Connect Gmail**, approve the read-only consent screen, then use **Sync Gmail** on the dashboard. Disconnecting Gmail or wiping monitoring data also removes the local encrypted token and stored messages.

The initial sync scans up to the 50 newest Inbox messages. Later syncs fetch only messages that have not already been stored. The simple rule engine scores risky language, links, and suspicious sender domains, placing messages with a score of 30 or higher in **Flagged Emails** and the rest in **Inbox**.

## Deployment note

GitHub Pages can host the Vite frontend, but it cannot run this API or safeguard OAuth secrets. For a public deployment, host `server/index.mjs` on a service that runs Node and change `FRONTEND_URL` and `GMAIL_REDIRECT_URI` to the deployed HTTPS addresses. Do not deploy `.env` or `data/` to a public repository.
