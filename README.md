# 🛡️ IronInbox Dashboard

Email phishing detection dashboard built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **📊 Real-time Dashboard** - Monitor phishing threats with comprehensive analytics
- **📧 Flagged Emails** - Review and manage suspicious emails with detailed signal detection
- **🔍 Keyword Monitoring** - Customize keyword detection rules with flexible options
- **📥 Inbox** - View released emails that passed security checks
- **🔒 Privacy & Security** - Manage 2FA, session timeout, and security settings
- **⚙️ Settings** - Customize notifications, timezone, and advanced options
- **📱 Responsive Design** - Beautiful UI that works on all devices
- **🎨 Glassmorphism UI** - Modern, sleek design with backdrop blur effects

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- GitHub account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ironinbox-dashboard.git
   cd ironinbox-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### 🌐 Deploy to GitHub Pages

Want to host this live online for free? See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete guide!

**Quick deploy:**
1. Create a GitHub repo named `ironinbox-dashboard`
2. Update your GitHub username in `package.json` (line 6)
3. Run: `npm run deploy`

Your site will be live at: `https://YOUR_USERNAME.github.io/ironinbox-dashboard`

## 🔧 Keeping the Server Running

### Option 1: Development Server (Recommended for Testing)
```bash
npm run dev
```
Keep this terminal window open. The app runs on `http://localhost:5173`

### Option 2: Production Build + Serve
```bash
# Build the app
npm run build

# Install a static server globally
npm install -g serve

# Serve the built files
serve -s dist -l 5173
```

This creates an optimized production build that's faster and more stable.

## 📦 Build for Production

```bash
npm run build
```

The production files will be in the `dist/` folder.

## 🏗️ Project Structure

```
ironinbox-dashboard/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components (StatCard, Modal, Toast)
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── layout/          # Layout components (Sidebar, Header)
│   ├── contexts/            # React Context for state management
│   ├── data/                # Mock data
│   ├── pages/               # Page components
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions (PDF export, etc.)
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── ecosystem.config.js      # PM2 configuration
├── package.json
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🎯 Available Pages

- **`/dashboard`** - Overview with risk scores and analytics
- **`/inbox`** - Released emails that passed checks
- **`/flagged-emails`** - Suspicious emails awaiting review
- **`/keyword-monitoring`** - Manage detection keywords
- **`/privacy`** - Security settings and 2FA
- **`/settings`** - User preferences and configuration

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **React Router** - Navigation
- **React Icons** - Icon library
- **jsPDF** - PDF export functionality
- **PM2** - Process manager

## 📝 Features in Detail

### Email Detection
- Keyword matching with case-insensitive options
- Typosquatting detection
- Risk level assessment (Critical, High, Medium, Low)
- Signal-based threat identification

### Dashboard Analytics
- Total processed emails
- Currently flagged threats
- Emails released
- Active keywords monitoring
- Overall risk score calculation
- Threat distribution charts
- Top threat sources
- Recent activity feed

**Note**: This is a demo application with mock data.
