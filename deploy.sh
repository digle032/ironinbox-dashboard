#!/bin/bash

# GitHub Pages Deployment Script for IronInbox Dashboard
# This script automates the deployment process

echo ""
echo "🚀 IronInbox GitHub Pages Deployment"
echo "======================================"
echo ""

# Check if package.json has been updated
if grep -q "YOUR_GITHUB_USERNAME" package.json; then
    echo "⚠️  WARNING: You need to update package.json first!"
    echo ""
    echo "Open package.json and replace YOUR_GITHUB_USERNAME with your actual GitHub username"
    echo ""
    read -p "Press Enter when done, or Ctrl+C to cancel"
fi

# Check if git remote exists
if ! git remote get-url origin &> /dev/null; then
    echo "📝 GitHub repository URL not set"
    echo ""
    read -p "Enter your GitHub username: " username
    echo ""
    
    # Add remote
    git remote add origin "https://github.com/$username/ironinbox-dashboard.git"
    echo "✅ Remote repository added"
    
    # Push to GitHub
    echo ""
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub"
    else
        echo "❌ Failed to push to GitHub"
        echo "Make sure you've created the repository on GitHub first"
        exit 1
    fi
fi

# Deploy to GitHub Pages
echo ""
echo "🏗️  Building and deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    
    # Extract username from remote URL
    remote_url=$(git remote get-url origin)
    username=$(echo $remote_url | sed -n 's/.*github\.com[:/]\([^/]*\)\/.*/\1/p')
    
    if [ ! -z "$username" ]; then
        echo "🌐 Your site will be live at:"
        echo "   https://$username.github.io/ironinbox-dashboard"
        echo ""
        echo "⏱️  Wait 2-3 minutes for GitHub Pages to build"
        echo ""
        echo "📋 Next steps:"
        echo "   1. Go to: https://github.com/$username/ironinbox-dashboard/settings/pages"
        echo "   2. Set Source to: Branch 'gh-pages' / (root)"
        echo "   3. Click Save"
        echo ""
    fi
else
    echo ""
    echo "❌ Deployment failed"
    echo "Check the error messages above"
    exit 1
fi
