#!/bin/bash

# Root Focus Setup Verification Script
# Checks if all prerequisites are installed and configured

echo "🔍 Root Focus Setup Verification"
echo "=============================="

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo "✅ npm: $NPM_VERSION"
    else
        echo "❌ npm not found"
        exit 1
    fi
else
    echo "❌ Node.js not found"
    echo "📥 Install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Serverless Framework
if command -v serverless &> /dev/null; then
    SLS_VERSION=$(serverless --version)
    echo "✅ Serverless Framework: $SLS_VERSION"
elif command -v sls &> /dev/null; then
    SLS_VERSION=$(sls --version)
    echo "✅ Serverless Framework: $SLS_VERSION"
else
    echo "❌ Serverless Framework not found"
    echo "📥 Install with: npm install -g serverless"
    exit 1
fi

# Check AWS CLI
if [ -f "$(pwd)/aws/dist/aws" ]; then
    export PATH=$PATH:$(pwd)/aws/dist
    AWS_VERSION=$(aws --version)
    echo "✅ AWS CLI: $AWS_VERSION"
elif command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    echo "✅ AWS CLI: $AWS_VERSION"
else
    echo "❌ AWS CLI not found"
    echo "📥 AWS CLI installer is in the project. Run: export PATH=\$PATH:\$(pwd)/aws/dist"
    exit 1
fi

# Check AWS credentials
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "✅ AWS credentials set via environment variables"
elif aws configure list | grep -q "access_key"; then
    echo "✅ AWS credentials configured via aws configure"
else
    echo "⚠️  AWS credentials not configured"
    echo "🔧 Set credentials with:"
    echo "   export AWS_ACCESS_KEY_ID=your-key"
    echo "   export AWS_SECRET_ACCESS_KEY=your-secret"
    echo "   export AWS_DEFAULT_REGION=us-east-1"
    echo "   OR run: aws configure"
fi

# Check backend dependencies
echo ""
echo "📦 Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "⚠️  Backend dependencies not installed"
    echo "🔧 Run: cd backend && npm install"
fi

# Check frontend dependencies
echo ""
echo "📦 Checking frontend dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed"
    echo "🔧 Run: npm install"
fi

# Check environment files
echo ""
echo "🔧 Checking configuration files..."

if [ -f "backend/.env" ]; then
    if grep -q "JWT_SECRET" backend/.env && ! grep -q "your-super-secure-jwt-secret-here" backend/.env; then
        echo "✅ Backend .env configured with JWT_SECRET"
    else
        echo "⚠️  Backend .env exists but JWT_SECRET not properly configured"
        echo "🔧 Edit backend/.env and set a secure JWT_SECRET"
    fi
else
    echo "⚠️  Backend .env file not found"
    echo "🔧 Copy backend/.env.example to backend/.env and configure"
fi

if [ -f ".env" ]; then
    echo "✅ Frontend .env file exists"
else
    echo "⚠️  Frontend .env file not found"
    echo "🔧 Copy .env.example to .env"
fi

# Check if build exists
if [ -d "build" ]; then
    echo "✅ Frontend build folder exists"
else
    echo "⚠️  Frontend not built yet"
    echo "🔧 Run: npm run build"
fi

echo ""
echo "🎯 Setup Summary:"
echo "=================="

# Count checks
CHECKS_PASSED=0
TOTAL_CHECKS=8

if command -v node &> /dev/null; then ((CHECKS_PASSED++)); fi
if command -v npm &> /dev/null; then ((CHECKS_PASSED++)); fi
if command -v serverless &> /dev/null || command -v sls &> /dev/null; then ((CHECKS_PASSED++)); fi
if [ -f "$(pwd)/aws/dist/aws" ] || command -v aws &> /dev/null; then ((CHECKS_PASSED++)); fi
if [ -n "$AWS_ACCESS_KEY_ID" ] || aws configure list | grep -q "access_key" 2>/dev/null; then ((CHECKS_PASSED++)); fi
if [ -d "backend/node_modules" ]; then ((CHECKS_PASSED++)); fi
if [ -d "node_modules" ]; then ((CHECKS_PASSED++)); fi
if [ -f "backend/.env" ] && [ -f ".env" ]; then ((CHECKS_PASSED++)); fi

echo "✅ $CHECKS_PASSED/$TOTAL_CHECKS checks passed"

if [ $CHECKS_PASSED -eq $TOTAL_CHECKS ]; then
    echo ""
    echo "🎉 All checks passed! Ready to deploy!"
    echo "🚀 Run: ./deploy.sh"
else
    echo ""
    echo "⚠️  Some issues need attention before deployment"
    echo "📖 See FINAL_DEPLOYMENT.md for detailed instructions"
fi