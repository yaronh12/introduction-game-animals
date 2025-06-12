#!/bin/bash

# 🚀 Animal Introduction Game - Deployment Script
# This script helps you deploy your app to Vercel

echo "🎭 Animal Introduction Game - Deployment Setup"
echo "============================================="

# Check if required tools are installed
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if build works
echo ""
echo "🔨 Testing build..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

# Check for environment variables
echo ""
echo "🔍 Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    echo "⚠️  No .env.local file found. Creating template..."
    cat > .env.local << EOL
# OpenAI API Key (required for image generation)
OPENAI_API_KEY=your_openai_api_key_here

# Database (SQLite for development)
DATABASE_URL=./students.db
EOL
    echo "📝 Created .env.local template. Please add your OpenAI API key."
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo ""
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Animal Introduction Game ready for deployment"
    echo "✅ Git repository initialized"
fi

echo ""
echo "🌟 Setup Complete! Next Steps:"
echo "================================"
echo ""
echo "1. 🔑 Add your OpenAI API key to .env.local"
echo "   - Get it from: https://platform.openai.com"
echo "   - Edit .env.local file"
echo ""
echo "2. 🚀 Deploy to Vercel:"
echo "   Option A: One-click deploy"
echo "   → https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo"
echo ""
echo "   Option B: GitHub integration"
echo "   → Push to GitHub, then import in Vercel"
echo ""
echo "   Option C: Vercel CLI"
echo "   → npm i -g vercel && vercel"
echo ""
echo "3. 📊 Set up database in Vercel"
echo "   → Add Vercel Postgres in Storage tab"
echo ""
echo "4. 🎓 Share with students!"
echo "   → Students: your-app.vercel.app"
echo "   → Host view: your-app.vercel.app/host"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT.md"
echo "🔧 For troubleshooting, see: README.md"
echo ""
echo "✨ Happy teaching! ✨" 