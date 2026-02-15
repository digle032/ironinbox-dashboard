# GitHub Pages Deployment Script for IronInbox Dashboard
# This script automates the deployment process

Write-Host ""
Write-Host "🚀 IronInbox GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if package.json has been updated
$packageJson = Get-Content "package.json" -Raw
if ($packageJson -match "YOUR_GITHUB_USERNAME") {
    Write-Host "⚠️  WARNING: You need to update package.json first!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Open package.json and replace YOUR_GITHUB_USERNAME with your actual GitHub username" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter when done, or Ctrl+C to cancel"
}

# Check if git remote exists
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "📝 GitHub repository URL not set" -ForegroundColor Yellow
    Write-Host ""
    $username = Read-Host "Enter your GitHub username"
    Write-Host ""
    
    # Add remote
    git remote add origin "https://github.com/$username/ironinbox-dashboard.git"
    Write-Host "✅ Remote repository added" -ForegroundColor Green
    
    # Push to GitHub
    Write-Host ""
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully pushed to GitHub" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
        Write-Host "Make sure you've created the repository on GitHub first" -ForegroundColor Yellow
        exit 1
    }
}

# Deploy to GitHub Pages
Write-Host ""
Write-Host "🏗️  Building and deploying to GitHub Pages..." -ForegroundColor Cyan
npm run deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    
    # Extract username from remote URL
    if ($remoteUrl -match "github\.com[:/]([^/]+)/") {
        $username = $matches[1]
        $siteUrl = "https://$username.github.io/ironinbox-dashboard"
        
        Write-Host "🌐 Your site will be live at:" -ForegroundColor Cyan
        Write-Host "   $siteUrl" -ForegroundColor White
        Write-Host ""
        Write-Host "⏱️  Wait 2-3 minutes for GitHub Pages to build" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Go to: https://github.com/$username/ironinbox-dashboard/settings/pages"
        Write-Host "   2. Set Source to: Branch 'gh-pages' / (root)"
        Write-Host "   3. Click Save"
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
    exit 1
}
