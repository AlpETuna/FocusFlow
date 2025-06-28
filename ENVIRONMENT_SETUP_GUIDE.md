# Environment Setup Guide for FocusFlow

This guide will help you set up all required environment variables for local development and Netlify deployment.

## 🔧 Local Development Setup

### Step 1: Run the Setup Script
First, run the automated setup script:
```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Create `.env` and `backend/.env` files from templates
- Generate a secure JWT secret automatically

### Step 2: Set AWS Credentials

You have several options for AWS credentials:

#### Option A: Environment Variables (Recommended for local development)
```bash
export MY_AWS_ACCESS_KEY_ID=your-access-key-id
export MY_AWS_SECRET_ACCESS_KEY=your-secret-access-key
export MY_AWS_DEFAULT_REGION=us-east-1
```

#### Option B: AWS CLI Configuration
```bash
aws configure
# Enter your Access Key ID, Secret Access Key, and region
```

#### Option C: AWS Profile
If you have multiple AWS profiles:
```bash
export AWS_PROFILE=your-profile-name
```

### Step 3: Get Your AWS Credentials
To get AWS credentials:
1. Go to AWS Console → IAM → Users
2. Create a new user or select existing user
3. Go to "Security credentials" tab
4. Create new Access Key
5. Download the credentials

### Step 4: Enable AWS Bedrock
The app uses AWS Bedrock for AI analysis:
1. Go to AWS Console → Bedrock
2. Navigate to "Model access" in the sidebar
3. Request access to "Claude 3 Sonnet" model
4. Wait for approval (usually immediate)

### Step 5: Deploy Backend
```bash
cd backend
npm install
npm run deploy
```

This will output your API Gateway URL.

### Step 6: Update Frontend API URL
Copy the API Gateway URL from the deployment output and update:
- `.env` file: `REACT_APP_API_URL=your-api-gateway-url`

## 🌐 AWS Amplify Deployment Setup (Recommended)

### Step 1: Deploy Backend First
Make sure your backend is deployed and you have the API Gateway URL.

### Step 2: Create Amplify App
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Choose "Host web app"
3. Connect your Git repository
4. Select your branch (main/master)

### Step 3: Set Environment Variables in Amplify
Go to App settings → Environment variables and set:

#### Required Variables:
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
```

### Step 4: Deploy
Amplify will automatically build and deploy your app using the `amplify.yml` configuration.

**For detailed instructions, see: [`AWS_AMPLIFY_SETUP.md`](AWS_AMPLIFY_SETUP.md)**

## 🌐 Alternative: Netlify Deployment Setup

If you prefer Netlify over Amplify:

### Step 1: Set Environment Variables in Netlify
Go to your Netlify site dashboard → Site settings → Environment variables

#### Required Variables:
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

Note: Netlify doesn't need AWS credentials since the backend is deployed separately.

## 📋 Environment Variables Summary

### Frontend (.env)
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

### Backend (backend/.env)
```
JWT_SECRET=your-secure-jwt-secret-at-least-32-characters
MY_AWS_REGION=us-east-1
MY_AWS_PROFILE=default
```

### AWS Amplify Environment Variables
Frontend only (AWS credentials handled by Amplify service integration):
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
```

### Netlify Environment Variables (Alternative)
If using Netlify instead of Amplify:
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

## 🔒 Security Notes

1. **Never commit .env files** - They're in .gitignore for protection
2. **Use different JWT secrets** for development and production
3. **Rotate AWS keys regularly**
4. **Use IAM roles with minimal permissions**

## 🚀 Quick Start Commands

```bash
# 1. Initial setup
./setup.sh

# 2. Set AWS credentials (choose one method above)
export MY_AWS_ACCESS_KEY_ID=your-key
export MY_AWS_SECRET_ACCESS_KEY=your-secret
export MY_AWS_DEFAULT_REGION=us-east-1

# 3. Deploy backend
cd backend
npm install
npm run deploy

# 4. Update frontend .env with API URL
# Copy the API Gateway URL from deployment output

# 5. Test locally
cd ..
npm install
npm start

# 6. Deploy to AWS Amplify
# Follow AWS_AMPLIFY_SETUP.md guide
# Connect your Git repository and set environment variables
```

## 🆘 Troubleshooting

### Common Issues:

1. **"AWS credentials not found"**
   - Check your AWS credentials are set correctly
   - Verify AWS CLI configuration: `aws sts get-caller-identity`

2. **"Bedrock access denied"**
   - Enable Bedrock model access in AWS Console
   - Check your AWS region (must be us-east-1 for Claude)

3. **"API calls failing"**
   - Verify REACT_APP_API_URL is correct
   - Check CORS settings in serverless.yml

4. **"JWT errors"**
   - Ensure JWT_SECRET is at least 32 characters
   - Use the same JWT_SECRET for both local and deployed backend