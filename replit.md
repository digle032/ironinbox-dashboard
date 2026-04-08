# IronInbox Dashboard

## Overview
A web-based email phishing detection dashboard built with React + TypeScript + Vite. Provides monitoring, flagged email review, keyword detection rules management, and security analytics. Currently uses mock data for demo purposes.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **Icons**: Lucide React, React Icons
- **PDF Export**: jsPDF + jspdf-autotable
- **Auth**: Firebase (optional, configured via env vars)
- **Package Manager**: npm

## Project Structure
- `src/components/` - UI components (common, dashboard, layout)
- `src/contexts/` - React Context providers (Auth, Theme, Settings, App)
- `src/pages/` - Route-level page components
- `src/data/` - Mock data (`mockData.ts`)
- `src/types/` - TypeScript type definitions
- `src/utils/` - Helper functions (PDF export, role helpers, hooks)

## Development
```bash
npm run dev    # Start dev server on port 5000
npm run build  # Production build to dist/
```

## Environment Variables
Firebase configuration is optional. Copy `.env.example` to `.env` and fill in Firebase credentials if you want live auth:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Deployment
Configured as a static site deployment. Build output goes to `dist/`.
- Build command: `npm run build`
- Public directory: `dist`

## Replit Configuration
- Dev server: `0.0.0.0:5000` with `allowedHosts: true` for proxy compatibility
- Base URL: `/` (changed from `/ironinbox-dashboard/` for Replit)
- Workflow: "Start application" runs `npm run dev`
