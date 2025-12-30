#!/bin/bash

# Script to set up the new "LaidOff" GitHub repository

REPO_NAME="LaidOff"
GITHUB_USER="paradiigmx"  # Based on existing remote

echo "🚀 Setting up GitHub repository: $REPO_NAME"
echo ""

# Check current remotes
echo "Current remotes:"
git remote -v
echo ""

# Option 1: Try with GitHub CLI if available
if command -v gh &> /dev/null; then
    echo "✓ GitHub CLI detected"
    read -p "Do you want to create the repo using GitHub CLI? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating repository..."
        gh repo create "$REPO_NAME" --public --source=. --remote=laidoff-origin --push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Repository created and code pushed successfully!"
            echo "🔗 View your repo at: https://github.com/$GITHUB_USER/$REPO_NAME"
            exit 0
        fi
    fi
fi

# Option 2: Manual setup instructions
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  MANUAL SETUP INSTRUCTIONS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. Create the repository on GitHub:"
echo "   👉 Go to: https://github.com/new"
echo "   👉 Repository name: $REPO_NAME"
echo "   👉 Choose: Public or Private"
echo "   ⚠️  DO NOT initialize with README, .gitignore, or license"
echo "   👉 Click 'Create repository'"
echo ""
echo "2. After creating, run these commands:"
echo ""
echo "   # Remove old origin (if you want to keep it, skip this)"
echo "   # git remote remove origin"
echo ""
echo "   # Add new remote for LaidOff repo"
echo "   git remote add laidoff https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo ""
echo "   # Push to the new repository"
echo "   git push -u laidoff main"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Ask if they want to proceed with manual commands
read -p "Have you created the repository on GitHub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Setting up remote and pushing..."
    
    # Add the new remote
    git remote add laidoff https://github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null || \
    git remote set-url laidoff https://github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null
    
    # Push to the new repo
    echo "Pushing to https://github.com/$GITHUB_USER/$REPO_NAME.git ..."
    git push -u laidoff main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to LaidOff repository!"
        echo "🔗 View your repo at: https://github.com/$GITHUB_USER/$REPO_NAME"
    else
        echo ""
        echo "❌ Push failed. Please check:"
        echo "   1. Repository exists on GitHub"
        echo "   2. You have push access"
        echo "   3. Your GitHub credentials are configured"
    fi
fi

