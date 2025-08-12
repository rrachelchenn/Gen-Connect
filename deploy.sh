#!/bin/bash

echo "🚀 GenConnect Deployment Script"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Prepare for production deployment - $(date)"
fi

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://railway.app"
echo "2. Sign in with GitHub"
echo "3. Click 'New Project'"
echo "4. Select 'Deploy from GitHub repo'"
echo "5. Choose your GenConnect repository"
echo "6. Select the 'server' directory as source"
echo "7. Click 'Deploy'"
echo ""
echo "📋 Don't forget to set these environment variables in Railway:"
echo "   NODE_ENV=production"
echo "   JWT_SECRET=your_super_secret_jwt_key_here"
echo "   CORS_ORIGIN=https://www.genconnect.live"
echo ""
echo "🔗 After deployment, update your frontend API config with the Railway URL"
echo "   See DEPLOYMENT_GUIDE.md for detailed instructions"
