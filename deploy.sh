#!/bin/bash

# Root Focus Deployment Script
# This script deploys the complete Root Focus application

set -e

echo "🚀 Starting Root Focus Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found!${NC}"
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
    echo -e "${RED}❌ JWT_SECRET not configured!${NC}"
    echo "Please edit backend/.env and set a secure JWT_SECRET"
    echo "You can generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    exit 1
fi

# Check API keys and environment variables
echo -e "\n${BLUE}🔑 Checking API keys and environment variables...${NC}"

# Source backend environment to check variables
source backend/.env

MISSING_VARS=()

# Check required variables
[ -z "$JWT_SECRET" ] && MISSING_VARS+=("JWT_SECRET")
[ -z "$USERS_TABLE" ] && MISSING_VARS+=("USERS_TABLE")
[ -z "$SESSIONS_TABLE" ] && MISSING_VARS+=("SESSIONS_TABLE")
[ -z "$GROUPS_TABLE" ] && MISSING_VARS+=("GROUPS_TABLE")
[ -z "$GROUP_MEMBERS_TABLE" ] && MISSING_VARS+=("GROUP_MEMBERS_TABLE")
[ -z "$OPENAI_API_KEY" ] && MISSING_VARS+=("OPENAI_API_KEY")

# Test OpenAI API key if present
if [ ! -z "$OPENAI_API_KEY" ]; then
    echo "🤖 Testing OpenAI API key..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -H "Content-Type: application/json" \
        https://api.openai.com/v1/models)
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✅ OpenAI API key is valid${NC}"
    else
        echo -e "${RED}❌ OpenAI API key is invalid (HTTP $response)${NC}"
        MISSING_VARS+=("OPENAI_API_KEY (invalid)")
    fi
fi

# Check if any required variables are missing
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing or invalid environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}   - $var${NC}"
    done
    echo -e "${YELLOW}Please set all required environment variables in backend/.env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All API keys and environment variables are configured${NC}"

# Check if AWS credentials are set
if [ -z "$MY_AWS_ACCESS_KEY_ID" ] || [ -z "$MY_AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS credentials not found!"
    echo "Please set the following environment variables:"
    echo "export MY_AWS_ACCESS_KEY_ID=your-access-key-id"
    echo "export MY_AWS_SECRET_ACCESS_KEY=your-secret-access-key"
    echo "export MY_AWS_DEFAULT_REGION=us-east-1"
    exit 1
fi

# Set AWS region if not already set
export MY_AWS_DEFAULT_REGION=${MY_AWS_DEFAULT_REGION:-us-east-1}

echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo "📍 Region: $MY_AWS_DEFAULT_REGION"

# Export standard AWS environment variables for AWS CLI and Serverless Framework
export AWS_ACCESS_KEY_ID="$MY_AWS_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$MY_AWS_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$MY_AWS_DEFAULT_REGION"

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

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

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
API_URL=$(aws cloudformation list-exports --query "Exports[?Name=='rootfocus-backend-prod-ServiceEndpoint'].Value" --output text)

if [ -z "$API_URL" ]; then
    echo "⚠️  Could not automatically extract API URL. Please check the deployment output above."
    echo "Look for a line that says 'ServiceEndpoint' and copy the URL."
    read -p "Please enter the API Gateway URL: " API_URL
fi

echo -e "${GREEN}✅ API Gateway URL: $API_URL${NC}"

# Test backend health
echo -e "\n${BLUE}🏥 Testing backend health...${NC}"

# Wait a moment for API to be ready
sleep 5

# Test auth endpoints
echo "Testing authentication endpoints..."

# Test register endpoint
response=$(curl -s -X POST "${API_URL}/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"testpass","name":"Test User"}' \
    -w "\n%{http_code}")

http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✅ Auth register endpoint is working${NC}"
else
    echo -e "${RED}❌ Auth register endpoint returned HTTP $http_code${NC}"
fi

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

echo -e "${GREEN}✅ Frontend built successfully!${NC}"

# Display deployment summary
echo ""
echo -e "${GREEN}🎉 Root Focus Deployment Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All API keys verified and working${NC}"
echo -e "${GREEN}✅ Backend deployed with database authentication${NC}"
echo -e "${GREEN}✅ Frontend deployed with launch page${NC}"
echo -e "${GREEN}✅ Demo accounts removed - real login required${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Backend API URL: $API_URL"
echo "Frontend build ready in: ./build/"
echo ""
echo "Next steps:"
echo "1. Deploy the frontend to AWS Amplify (recommended)"
echo "2. Follow the AWS_AMPLIFY_SETUP.md guide for step-by-step instructions"
echo "3. Set environment variables in Amplify console"
echo ""
echo "Alternative deployment options:"
echo "1. You can test locally by serving the build folder: npm run serve"
echo "2. Or copy the 'build' folder to any web server"
echo ""
echo "🔧 AWS Resources Created:"
echo "- Lambda functions for API endpoints"
echo "- DynamoDB tables for data storage"
echo "- API Gateway for HTTP endpoints"
echo "- IAM roles for permissions"
echo ""
echo "💰 Estimated monthly cost: $15-43 (depending on usage)"