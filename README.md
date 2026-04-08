# IronInbox Dashboard

IronInbox Dashboard is a front-end email phishing detection dashboard built with React, TypeScript, Vite, and Tailwind CSS. The project currently functions as a demo application that simulates phishing monitoring, flagged email review, keyword-based detection management, incident escalation, role-based page visibility, theme switching, and user preference persistence in the browser. The current implementation uses mock data and browser storage for most workflows rather than a live production backend.

## What Is Included

This submission includes the source code for the IronInbox Dashboard project, including the main application code inside the `src` directory, static files in the `public` directory, configuration files for Vite, TypeScript, Tailwind CSS, ESLint, and deployment, and supporting documentation such as the existing README and deployment guide.

The current source files are organized as follows:

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Main application entry for routing, protected pages, and provider composition. |
| `src/contexts/AppContext.tsx` | Stores demo email data, keyword state, incident linkage, release/re-flag workflows, and data wipe behavior. |
| `src/contexts/AuthContext.tsx` | Implements demo sign-in, sign-up, monitored-email setup, and local/session storage-backed authentication state. |
| `src/contexts/SettingsContext.tsx` | Manages saved profile, notification, security, appearance, and advanced settings in localStorage. |
| `src/contexts/ThemeContext.tsx` | Handles light and dark theme persistence. |
| `src/pages/Dashboard.tsx` | Displays analytics, risk summaries, and role-gated dashboard content. |
| `src/pages/FlaggedEmails.tsx` | Supports suspicious email review, filtering, search, pagination, and PDF export. |
| `src/pages/Inbox.tsx` | Displays released emails and supports starring, read state updates, and re-flagging. |
| `src/pages/Incidents.tsx` | Tracks incidents and receives linked incidents created from flagged emails. |
| `src/pages/KeywordMonitoring.tsx` | Lets users add, edit, enable, disable, and remove monitored keywords and adjust detection behavior. |
| `src/pages/PrivacyAccessControl.tsx` | Shows privacy and access information and supports session-only data wipe actions. |
| `src/pages/Settings.tsx` | Includes theme switching, mock role preview, and engagement tracking display. |
| `src/pages/Login.tsx` | Provides the demo authentication screen for sign-in and sign-up. |
| `src/pages/Account.tsx` | Provides a placeholder account page for adding another monitored account. |
| `src/data/mockData.ts` | Contains mock flagged email, released email, and keyword data used by the demo. |
| `src/utils/pdfExport.ts` | Generates downloadable PDF reports for flagged email data. |
| `.env.example` | Provides placeholder Firebase environment variable names for future backend integration. |
| `DEPLOYMENT.md` | Documents GitHub Pages deployment steps. |

## Implemented Features in the Current Version

The current version of the project includes a dashboard route, login flow, inbox page, flagged emails page, incidents page, keyword monitoring page, settings page, privacy and access control page, and account page. Routing is protected so that users who are not signed in are redirected to the login page.

The flagged email workflow allows suspicious messages to be reviewed and then released into the inbox view. Released emails can later be starred, marked as read or unread, and re-flagged back into the flagged email list. The keyword monitoring workflow supports adding new keywords, editing keyword values, enabling and disabling individual keywords, deleting them, and adjusting detection options such as subject matching, body matching, case sensitivity, and whole-word matching.

The incidents workflow has also been expanded. The application can create incidents from flagged emails and insert them into the incident desk so the email-review workflow now connects to a case-management style interface. In addition, the settings area now includes a light/dark theme toggle, a browser-based mock role preview for viewer, manager, and admin roles, and an engagement tracker panel that records recent visits in browser storage.

It is important to note that the current authentication system is still a demo implementation. Although the repository includes a Firebase-style environment template, the active login behavior in the code uses locally simulated user creation and localStorage/sessionStorage persistence rather than a live Firebase authentication service. Because of that, the project should currently be described as a working front-end prototype with realistic interaction flows rather than a fully deployed production security platform.

## Setup Instructions

To run the project locally, first clone the repository and move into the project directory.

```bash
git clone https://github.com/digle032/ironinbox-dashboard.git
cd ironinbox-dashboard
```

Next, install the required dependencies.

```bash
npm install
```

After installation, start the development server.

```bash
npm run dev
```

The Vite development server should open the application locally at the address shown in the terminal, typically `http://localhost:5173`.

To create a production build, run:

```bash
npm run build
```

To preview the production build locally, run:

```bash
npm run preview
```

To deploy to GitHub Pages, the repository already includes a homepage value and deployment script. After pushing the latest code to GitHub, run:

```bash
npm run deploy
```

If deployment settings need to be changed for a different GitHub account or repository name, update the `homepage` value in `package.json` and confirm that `vite.config.ts` uses the correct base path.

## Environment and Configuration Notes

At the moment, no active backend secrets are required to run the demo version of the application locally because authentication and application data are simulated in the browser. However, the repository includes an `.env.example` file with Firebase-related variable names, which suggests that external authentication or cloud configuration is planned for a future version.

Because this is a front-end prototype, several project features currently rely on `localStorage` or `sessionStorage`. These include the signed-in user session, monitored email setup, saved settings, theme selection, mock role switching, and engagement logging.

## Short Note on Implementation Plans for Capstone II

For Capstone II, the project should move from a browser-simulated prototype to a more complete end-to-end system. The first major priority should be replacing mock authentication and browser-stored data with a real backend service. This would include implementing live user authentication, protected user records, persistent email/keyword/incident data storage, and proper session handling.

The second major priority should be connecting the dashboard to a real ingestion and analysis pipeline. Instead of relying on mock flagged emails, the system should ingest actual email metadata or test mailbox data, evaluate messages using configurable phishing-detection rules, and store the results in a database so that the dashboard, inbox, and incident views all reflect the same live records.

The third major priority should be strengthening the incident-response workflow. Capstone II can expand the current incident desk by adding full incident creation, editing, assignment, history tracking, analyst notes, and resolution logging. This would make the connection between phishing detection and incident management more realistic and useful.

A final implementation goal for Capstone II should be improving deployment readiness and evaluation quality. This can include role management backed by a real authorization model, better audit logging, stronger privacy disclosures that match the actual implementation, automated testing, and cloud deployment so the project can be demonstrated as a stable web application instead of only as a local prototype.
