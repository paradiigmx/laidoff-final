#!/bin/bash

# Script to create GitHub repository "LaidOff" and push the app

REPO_NAME="LaidOff"
GITHUB_USER=$(git config user.name 2>/dev/null || echo "YOUR_GITHUB_USERNAME")

echo "🚀 Creating GitHub repository: $REPO_NAME"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✓ GitHub CLI found"
    echo "Creating repository using GitHub CLI..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin-new --push
    
    if [ $? -eq 0 ]; then
        echo "✅ Repository created and code pushed successfully!"
        echo "🔗 View your repo at: https://github.com/$GITHUB_USER/$REPO_NAME"
        exit 0
    else
        echo "❌ Failed to create repository with GitHub CLI"
        echo "Falling back to manual method..."
    fi
fi

# Manual method using GitHub API
echo ""
echo "To create the repository manually:"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Choose Public or Private"
echo "4. DO NOT initialize with README, .gitignore, or license"
echo "5. Click 'Create repository'"
echo ""
echo "Then run these commands:"
echo ""
echo "  git remote remove origin 2>/dev/null || true"
echo "  git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""

