#!/bin/bash

# 🚀 SmartSender Deployment Script
# This script helps you deploy your SmartSender project to GitHub and Netlify

echo "🚀 SmartSender Deployment Helper"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    print_error "Please run this script from the SmartSender root directory"
    exit 1
fi

print_info "Current directory: $(pwd)"

# Step 1: Git Setup
echo ""
echo "📁 Step 1: Git Repository Setup"
echo "==============================="

if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Step 2: Add files
echo ""
echo "📋 Step 2: Adding Files"
echo "======================="

print_info "Adding all files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    print_info "Committing changes..."
    git commit -m "Deploy: SmartSender ready for Netlify deployment $(date '+%Y-%m-%d %H:%M:%S')"
    print_status "Changes committed"
fi

# Step 3: Remote repository setup
echo ""
echo "🌐 Step 3: GitHub Organization Setup"
echo "===================================="

# Check if origin remote exists
if git remote get-url origin > /dev/null 2>&1; then
    ORIGIN_URL=$(git remote get-url origin)
    print_status "Remote origin already set: $ORIGIN_URL"
else
    print_warning "Remote origin not set"
    echo ""
    print_info "Please follow these steps:"
    echo "1. Go to your GitHub organization"
    echo "2. Create a new repository (e.g., 'smartsender')"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub organization repository URL: " REPO_URL
    
    if [ ! -z "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        print_status "Remote origin set to: $REPO_URL"
    else
        print_error "Repository URL is required"
        exit 1
    fi
fi

# Step 4: Push to GitHub
echo ""
echo "⬆️  Step 4: Pushing to GitHub"
echo "============================="

print_info "Pushing to GitHub..."
if git push -u origin main 2>/dev/null; then
    print_status "Code pushed to GitHub successfully"
elif git push -u origin master 2>/dev/null; then
    print_status "Code pushed to GitHub successfully (master branch)"
else
    # Try to set upstream and push
    git branch -M main
    if git push -u origin main; then
        print_status "Code pushed to GitHub successfully"
    else
        print_error "Failed to push to GitHub. Please check your repository URL and permissions."
        exit 1
    fi
fi

# Step 5: Netlify deployment instructions
echo ""
echo "🌐 Step 5: Netlify Deployment"
echo "============================="

print_info "Your code is now on GitHub! 🎉"
echo ""
echo "Next steps for Netlify deployment:"
echo "1. Go to https://netlify.com"
echo "2. Sign in with your GitHub account"
echo "3. Click 'Add new site' → 'Import an existing project'"
echo "4. Choose 'Deploy with GitHub'"
echo "5. Select your organization and repository"
echo ""
echo "Build Settings (should auto-detect):"
echo "  - Base directory: frontend"
echo "  - Build command: npm run build"
echo "  - Publish directory: frontend/out"
echo "  - Node version: 18"
echo ""
echo "Environment Variables to add in Netlify:"
echo "  - NEXT_PUBLIC_API_URL=https://your-backend-url.com"
echo "  - NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id"
echo ""

# Step 6: Backend CORS update reminder
echo ""
echo "🔧 Step 6: Backend Update Required"
echo "=================================="

print_warning "Don't forget to update your backend CORS settings!"
echo ""
echo "Add your Netlify domain to your backend CORS configuration:"
echo "Example: 'https://your-site-name.netlify.app'"
echo ""

# Step 7: Final checklist
echo ""
echo "✅ Final Deployment Checklist"
echo "============================="

echo "□ Code pushed to GitHub organization"
echo "□ Netlify site created and configured"
echo "□ Environment variables set in Netlify"
echo "□ Backend CORS updated with Netlify domain"
echo "□ Test all features on live site"
echo ""

print_status "Deployment preparation complete!"
print_info "Your repository is ready for Netlify deployment."

echo ""
echo "🔗 Useful Links:"
echo "GitHub Repository: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
echo "Netlify Dashboard: https://app.netlify.com/"
echo "Deployment Guide: ./DEPLOYMENT_GUIDE.md"
echo ""

print_status "Happy deploying! 🚀"
