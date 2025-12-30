#!/bin/bash

# Script to fix the push issue by creating a fresh commit

echo "🔧 Fixing push issue..."
echo ""

# Check current status
echo "Current branch:"
git branch --show-current
echo ""

# Create orphan branch (fresh start)
echo "Creating fresh branch..."
git checkout --orphan fresh-main

# Add all files
echo "Adding all files..."
git add -A

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: DreamShift app optimized for GitHub"

# Remove old remote and add new one
echo "Setting up remote..."
git remote remove laidoff-final 2>/dev/null || true
git remote add laidoff-final https://github.com/paradiigmx/laidoff-final.git

# Force push to main (since repo is empty)
echo ""
echo "Pushing to GitHub..."
git push -f laidoff-final fresh-main:main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed!"
    echo "🔄 Switching back to main branch..."
    git checkout main 2>/dev/null || git branch -m fresh-main main
    git branch -D fresh-main 2>/dev/null || true
    echo ""
    echo "✅ Done! Repository: https://github.com/paradiigmx/laidoff-final"
else
    echo ""
    echo "❌ Push failed. Trying alternative method..."
    echo "You may need to manually push:"
    echo "  git push -f laidoff-final fresh-main:main"
fi

