# Deploy IronInbox to Azure Static Web Apps (integrated Functions)

The repository now contains a React frontend and an Azure Functions v4 HTTP API in `api/`. The same handler is used by `npm run api` locally. There is no App Service or Standard-plan linking requirement. Azure resources have not been created or changed by this code migration.

## Cost and storage

Keep Static Web Apps on Free. Managed API usage is subject to Azure's allowances. This implementation also requires a separate private Blob Storage container: capacity, transactions, and optional monitoring can incur charges. It is not a guaranteed zero-cost deployment. Kenneth should confirm subscription/education credits and storage pricing before creating it.

## Kenneth's Azure setup

1. Create or choose an Azure Storage account, with public blob access disabled. Create a **private** container named `ironinbox`. The API does not create the container automatically. Use a standard general-purpose account with locally redundant storage for this prototype if appropriate for the subscription.
2. Add a lifecycle rule scoped to `ironinbox/oauth/` to delete base blobs after one day since modification, and a rule scoped to `ironinbox/sessions/` to delete base blobs after eight days since modification. OAuth validity is independently limited to ten minutes; sessions to seven days. If soft delete/versioning is enabled, deleted records remain recoverable for that configured retention period.
3. In the **Static Web App** environment variables/application settings for production, set:
   - `GOOGLE_CLIENT_ID`: Google OAuth web-client ID.
   - `GOOGLE_CLIENT_SECRET`: matching client secret.
   - `TOKEN_ENCRYPTION_KEY`: unique cryptographically random secret, at least 32 random bytes. Keep it stable; changing it makes existing stored sessions unreadable.
   - `FRONTEND_URL`: `https://YOUR-SITE.azurestaticapps.net` (no trailing slash).
   - `GMAIL_REDIRECT_URI`: `https://YOUR-SITE.azurestaticapps.net/api/gmail/callback`.
   - `IRONINBOX_STORAGE_CONNECTION_STRING`: Storage account connection string. Treat it as a secret with account-level access; use an account dedicated to this prototype.
   - `IRONINBOX_STORAGE_CONTAINER`: `ironinbox`.
4. Keep secrets out of GitHub files, frontend variables, and the built website. These are backend runtime settings, not `VITE_` build values.
5. In the existing GitHub Actions workflow for this site, preserve its deployment token and branch, and set `app_location: "/"`, `api_location: "api"`, `output_location: "dist"`, and `app_build_command: "npm run build"` on the `Azure/static-web-apps-deploy` upload step. See `deployment/azure-workflow-settings.yml`. There is no existing GitHub workflow in this checkout, so this migration deliberately supplies settings instead of introducing a competing deployment.
6. Ensure the workflow's frontend build uses Node 22 (Vite 7 requires a recent Node release). The managed API runtime is separately configured as `node:20` in `public/staticwebapp.config.json`, which Vite copies to `dist`.
7. Push/merge these changes to the branch Kenneth's site actually deploys, then run that workflow. Do not set `api_location` to the old `server` folder.

## Google setup

Enable Gmail API in the Google Cloud project. Configure a Web application OAuth client and register the exact production `GMAIL_REDIRECT_URI` above. Add test users while consent is in testing. Use only the production URL until a separate preview OAuth configuration is prepared. The application requests read-only Gmail access; it cannot modify or send Gmail messages. Google may require verification for broader distribution of the restricted Gmail scope.

## Verify after deployment

1. Open `https://YOUR-SITE.azurestaticapps.net/api/health`. Expect JSON `{ "configured": true }`. This only confirms required settings are present, not that credentials/storage work.
2. Open `/login`, connect a Google test user's Gmail account, and approve access. Callback should return to `/login` and the app should enter the dashboard.
3. Run mailbox sync. It downloads the latest 50 inbox messages in batches of up to ten per API request, below SWA's 45-second request limit. Refresh and confirm session recovery.
4. Disconnect and confirm `/api/emails` returns HTTP 401. A caller-supplied owner ID never authorizes access.
5. Open a deep link such as `/dashboard` directly to verify SPA fallback. Unknown `/api/...` paths must return API errors rather than HTML.

## Local development

Use Node 22.16+ and run `npm ci` plus `npm --prefix api ci`. Copy `.env.example` to `.env` and fill in the same storage/Google settings, using a separate development storage container. Set `FRONTEND_URL=http://localhost:5000` and `GMAIL_REDIRECT_URI=http://localhost:5000/api/gmail/callback`; register that exact callback in Google. Run `npm run api` and `npm run dev` in separate terminals. Browser requests go through Vite's proxy, retaining same-origin cookies. Localhost cookies omit Secure; deployed cookies use Secure and HttpOnly.

Alternatively use Azure Functions Core Tools with `api/local.settings.json` and `npm --prefix api start`; that private file must not be committed. The lightweight local server requires no Core Tools installation.

Run `npm run test:api` and `npm run build` before deployment.

## Prototype behavior and limits

Mailbox contents and Google tokens are encrypted together with AES-256-GCM in per-session blobs. Login state is browser-bound, expires, and is consumed once using conditional deletion. API mutations check Origin and content type. Conditional writes prevent concurrent syncs or disconnects from silently overwriting each other.

A session lasts seven days. Sign-out, disconnect, and wipe remove that browser session's stored mailbox and tokens; signing in again creates a fresh session. They do not revoke Google's consent or erase sessions on other browsers. Google permissions can be revoked from the Google Account security page. The old local JSON data is not imported; reconnect Gmail after migration. Existing settings, incident edits, and release/reflag changes remain frontend prototype state.

## References

- https://learn.microsoft.com/en-us/azure/static-web-apps/add-api
- https://learn.microsoft.com/en-us/azure/static-web-apps/apis-overview
- https://learn.microsoft.com/en-us/azure/static-web-apps/configuration
- https://azure.microsoft.com/en-us/pricing/details/app-service/static/
