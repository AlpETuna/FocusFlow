#!/bin/bash

# FocusFlow Deployment Script
# This script deploys the complete FocusFlow application

set -e

echo "🚀 Starting FocusFlow Deployment..."

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found!"
    echo "Please copy backend/.env.example to backend/.env and fill in your values:"
    echo "cp backend/.env.example backend/.env"
    echo "Then edit backend/.env and set your JWT_SECRET"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ .env not found!"
    echo "Please copy .env.example to .env:"
    echo "cp .env.example .env"
    echo "The API URL will be filled automatically after backend deployment"
fi

# Check if JWT_SECRET is set in backend/.env
if grep -q "your-super-secure-jwt-secret-here" backend/.env; then
    echo "❌ JWT_SECRET not configured!"
    echo "Please edit backend/.env and set a secure JWT_SECRET"
    echo "You can generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

# Check if AWS credentials are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found!"
    echo "Please set the following environment variables:"
    echo "export AWS_ACCESS_KEY_ID=your-access-key-id"
    echo "export AWS_SECRET_ACCESS_KEY=your-secret-access-key"
    echo "export AWS_DEFAULT_REGION=us-east-1"
    exit 1
fi

# Set AWS region if not already set
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "✅ AWS credentials configured"
echo "📍 Region: $AWS_DEFAULT_REGION"

# Add AWS CLI to PATH
export PATH=$PATH:$(pwd)/aws/dist

# Verify AWS CLI
aws --version

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found!"
    echo "Please install Node.js 18+ and npm, then run this script again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ..
npm install

# Deploy backend
echo "🚀 Deploying backend to AWS..."
cd backend
npm run deploy-prod

# Extract API Gateway URL from deployment output
echo "🔍 Extracting API Gateway URL..."
API_URL=$(aws cloudformation list-exports --query "Exports[?Name=='focusflow-backend-prod-ServiceEndpoint'].Value" --output text)

if [ -z "$API_URL" ]; then
    echo "⚠️  Could not automatically extract API URL. Please check the deployment output above."
    echo "Look for a line that says 'ServiceEndpoint' and copy the URL."
    read -p "Please enter the API Gateway URL: " API_URL
fi

echo "✅ API Gateway URL: $API_URL"

# Update frontend environment
echo "🔧 Configuring frontend..."
cd ..
cat > .env << EOF
# Frontend Environment Configuration
# IMPORTANT: This file contains configuration and should not be committed to version control

ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false

# API Configuration
REACT_APP_API_URL=$API_URL
EOF

# Build frontend
echo "🏗️  Building frontend..."
npm run build

echo "✅ Frontend built successfully!"

# Display deployment summary
echo ""
echo "🎉 FocusFlow Deployment Complete!"
echo "================================="
echo "Backend API URL: $API_URL"
echo "Frontend build ready in: ./build/"
echo ""
echo "Next steps:"
echo "1. Deploy the frontend to your hosting service (Netlify, Vercel, S3, etc.)"
echo "2. Copy the contents of the 'build' folder to your web server"
echo "3. Set up your domain and SSL certificate"
echo ""
echo "Testing:"
echo "1. You can test locally by serving the build folder"
echo "2. Or deploy to a hosting service"
echo ""
echo "🔧 AWS Resources Created:"
echo "- Lambda functions for API endpoints"
echo "- DynamoDB tables for data storage"
echo "- API Gateway for HTTP endpoints"
echo "- IAM roles for permissions"
echo ""
echo "💰 Estimated monthly cost: $15-43 (depending on usage)"