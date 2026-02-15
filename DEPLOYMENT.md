# 🚀 GitHub Pages Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ironinbox-dashboard`
3. Description: "Email Phishing Detection Dashboard"
4. Make it **Public** (so classmates can access)
5. **DO NOT** check "Add a README file" (we already have one)
6. Click "Create repository"

### Step 2: Update Package.json

Open `package.json` and replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/ironinbox-dashboard",
```

For example, if your username is `john-smith`, it should be:
```json
"homepage": "https://john-smith.github.io/ironinbox-dashboard",
```

### Step 3: Push to GitHub

Open terminal in the project folder and run:

```bash
# Set your GitHub username here
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ironinbox-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to GitHub Pages

```bash
npm run deploy
```

This will:
- Build your React app
- Create a `gh-pages` branch
- Upload the built files to GitHub Pages

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

Wait 2-3 minutes, then your site will be live at:
```
https://YOUR_GITHUB_USERNAME.github.io/ironinbox-dashboard
```

## 🔄 Updating Your Site

After making changes:

```bash
# Commit your changes
git add .
git commit -m "Update dashboard"
git push

# Deploy to GitHub Pages
npm run deploy
```

Your live site will update automatically!

## 📤 Share with Classmates

Give them this URL:
```
https://YOUR_GITHUB_USERNAME.github.io/ironinbox-dashboard
```

They can also:
1. **View the code**: `https://github.com/YOUR_GITHUB_USERNAME/ironinbox-dashboard`
2. **Clone and run locally**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/ironinbox-dashboard.git
   cd ironinbox-dashboard
   npm install
   npm run dev
   ```

## 🐛 Troubleshooting

### Issue: Blank page or 404 errors
**Solution**: Check that `base: '/ironinbox-dashboard/'` is set in `vite.config.ts`

### Issue: Push rejected
**Solution**: If someone else pushed first, pull their changes:
```bash
git pull origin main --rebase
git push origin main
```

### Issue: Site not updating
**Solution**: 
1. Clear your browser cache (Ctrl+Shift+R)
2. Wait 2-3 minutes for GitHub Pages to rebuild
3. Check the Actions tab on GitHub to see deployment status

## ⚙️ Advanced: Custom Domain

If you want to use a custom domain (like `ironinbox.com`):

1. Buy a domain from Namecheap, GoDaddy, etc.
2. Add a `CNAME` file to your `public/` folder with your domain name
3. In your domain registrar, add these DNS records:
   - Type: `A`, Name: `@`, Value: `185.199.108.153`
   - Type: `A`, Name: `@`, Value: `185.199.109.153`
   - Type: `A`, Name: `@`, Value: `185.199.110.153`
   - Type: `A`, Name: `@`, Value: `185.199.111.153`
   - Type: `CNAME`, Name: `www`, Value: `YOUR_GITHUB_USERNAME.github.io`
4. In GitHub repo Settings → Pages, enter your custom domain

## 📊 Monitoring

- **GitHub Actions**: Check deployment status at `https://github.com/YOUR_GITHUB_USERNAME/ironinbox-dashboard/actions`
- **Analytics**: Add Google Analytics by creating `public/_headers` file
- **Uptime**: Use UptimeRobot (free) to monitor if your site is online

---

**Need help?** Check the GitHub Pages documentation: https://docs.github.com/en/pages
