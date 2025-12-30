#!/bin/bash

# Script to push code to laidoff-final repository

echo "🚀 Pushing to laidoff-final repository..."
echo ""

# Verify remote is set
git remote -v | grep laidoff-final

if [ $? -ne 0 ]; then
    echo "Setting up remote..."
    git remote add laidoff-final https://github.com/paradiigmx/laidoff-final.git
fi

echo ""
echo "Pushing to GitHub..."
echo "You may be prompted for your GitHub credentials."
echo ""

# Push to the repository
git push -u laidoff-final main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to laidoff-final!"
    echo "🔗 View your repo at: https://github.com/paradiigmx/laidoff-final"
else
    echo ""
    echo "❌ Push failed. Common solutions:"
    echo "   1. Make sure the repository exists on GitHub"
    echo "   2. Use a Personal Access Token instead of password"
    echo "   3. Get a token from: https://github.com/settings/tokens"
    echo ""
    echo "   Then run:"
    echo "   git push -u https://YOUR_TOKEN@github.com/paradiigmx/laidoff-final.git main"
fi

