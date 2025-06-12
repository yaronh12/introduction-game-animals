@echo off
REM 🚀 Animal Introduction Game - Deployment Script for Windows
REM This script helps you deploy your app to Vercel

echo 🎭 Animal Introduction Game - Deployment Setup
echo =============================================

REM Check if Node.js is installed
echo 📋 Checking prerequisites...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

REM Check if build works
echo.
echo 🔨 Testing build...
npm run build
if errorlevel 1 (
    echo ❌ Build failed. Please check for errors above.
    pause
    exit /b 1
)
echo ✅ Build successful!

REM Check for environment variables
echo.
echo 🔍 Checking environment configuration...

if not exist ".env.local" (
    echo ⚠️  No .env.local file found. Creating template...
    (
        echo # OpenAI API Key ^(required for image generation^)
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo.
        echo # Database ^(SQLite for development^)
        echo DATABASE_URL=./students.db
    ) > .env.local
    echo 📝 Created .env.local template. Please add your OpenAI API key.
)

REM Check if git is initialized
if not exist ".git" (
    echo.
    echo 🔧 Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit: Animal Introduction Game ready for deployment"
    echo ✅ Git repository initialized
)

echo.
echo 🌟 Setup Complete! Next Steps:
echo ================================
echo.
echo 1. 🔑 Add your OpenAI API key to .env.local
echo    - Get it from: https://platform.openai.com
echo    - Edit .env.local file
echo.
echo 2. 🚀 Deploy to Vercel:
echo    Option A: One-click deploy
echo    → https://vercel.com/new/clone?repository-url=https://github.com/yourusername/your-repo
echo.
echo    Option B: GitHub integration
echo    → Push to GitHub, then import in Vercel
echo.
echo    Option C: Vercel CLI
echo    → npm i -g vercel ^&^& vercel
echo.
echo 3. 📊 Set up database in Vercel
echo    → Add Vercel Postgres in Storage tab
echo.
echo 4. 🎓 Share with students!
echo    → Students: your-app.vercel.app
echo    → Host view: your-app.vercel.app/host
echo.
echo 📖 For detailed instructions, see: DEPLOYMENT.md
echo 🔧 For troubleshooting, see: README.md
echo.
echo ✨ Happy teaching! ✨

pause 