# 🚀 Root Focus - Final Deployment Guide

This guide will help you deploy the complete Root Focus application with all necessary configurations filled in.

## 📋 Prerequisites Checklist

- [ ] AWS Account with Bedrock access enabled
- [ ] AWS CLI installed and configured
- [ ] Node.js 18+ and npm installed
- [ ] Serverless Framework installed globally
- [ ] AWS credentials ready

## 🔧 Quick Setup Commands

### Step 1: Install Prerequisites (if not already installed)

```bash
# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Serverless Framework
npm install -g serverless

# Install AWS CLI (if not already done)
# AWS CLI is already downloaded in the project folder
export PATH=$PATH:$(pwd)/aws/dist
```

### Step 2: Configure AWS Credentials

**Option A: Environment Variables (Recommended)**
```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_DEFAULT_REGION=us-east-1
```

**Option B: AWS Configure**
```bash
aws configure
```

### Step 3: Deploy Everything

```bash
# Make sure you're in the Root Focus directory
cd /path/to/RootFocus

# Run the automated deployment script
./deploy.sh
```

## 🎯 What Gets Deployed

### Backend (AWS Lambda + DynamoDB)
- **Authentication System**: User registration, login, JWT tokens
- **Focus Sessions**: Start/stop tracking, session management
- **Screen Analysis**: AI-powered focus scoring using AWS Bedrock
- **Group Features**: Team collaboration and leaderboards
- **Database**: DynamoDB tables for all data storage

### Frontend (React Application)
- **Modern UI**: Responsive design with animations
- **Real-time Tracking**: Screen capture and analysis
- **Dashboard**: Progress visualization and statistics
- **Social Features**: Friends, groups, and leaderboards

## 📁 Project Structure

```
RootFocus/
├── deploy.sh                 # Automated deployment script
├── .env                     # Frontend environment (API URL)
├── backend/
│   ├── .env                # Backend environment (JWT secret)
│   ├── serverless.yml      # AWS deployment configuration
│   └── src/handlers/       # Lambda function handlers
├── src/                    # React frontend source
├── build/                  # Built frontend (ready to deploy)
└── public/                # Static assets
```

## 🔑 Environment Configuration

### Backend Environment (`backend/.env`)
```bash
# JWT Secret - Already configured with secure random string
JWT_SECRET="fjwjewrewieyreoe9394kj30skcxm45i4wods8fj3m590ske89djJ2h39skl5b50s386fu834j340dkds-23ij4-dw045k34302lsw-3o50667i43-0dfl;pe]w"

# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=default
```

### Frontend Environment (`.env`)
```bash
# React App Configuration
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false

# API Configuration - Will be filled automatically by deploy.sh
REACT_APP_API_URL=https://your-api-gateway-url.com/prod
```

## 🚀 Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual Step-by-Step
```bash
# 1. Deploy backend
cd backend
npm install
npm run deploy-prod

# 2. Get API URL from deployment output
# Look for: ServiceEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# 3. Update frontend config
cd ..
echo "REACT_APP_API_URL=your-api-url-here" >> .env

# 4. Build frontend
npm install
npm run build
```

## 🌐 Frontend Hosting Options

### Option A: Netlify (Recommended)
1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop the `build` folder
3. Set environment variable: `REACT_APP_API_URL`

### Option B: Vercel
1. Create account at [vercel.com](https://vercel.com)
2. Import from GitHub or upload build folder
3. Set environment variable: `REACT_APP_API_URL`

### Option C: AWS S3 + CloudFront
```bash
# Create S3 bucket
aws s3 mb s3://your-rootfocus-bucket

# Enable static website hosting
aws s3 website s3://your-rootfocus-bucket --index-document index.html

# Upload build files
aws s3 sync build/ s3://your-rootfocus-bucket

# Set public read policy
aws s3api put-bucket-policy --bucket your-rootfocus-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-rootfocus-bucket/*"
  }]
}'
```

## 🧪 Testing Your Deployment

1. **Backend API Test**:
```bash
curl -X POST https://your-api-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

2. **Frontend Test**:
   - Open your deployed frontend URL
   - Register a new account
   - Start a focus session
   - Test screen analysis feature

## 📊 Monitoring & Debugging

### CloudWatch Logs
```bash
# View logs for specific function
serverless logs -f register -t

# View all function logs
serverless logs -t
```

### DynamoDB Tables
Check the AWS Console for these tables:
- `rootfocus-backend-prod-users`
- `rootfocus-backend-prod-focus-sessions`
- `rootfocus-backend-prod-focus-scores`
- `rootfocus-backend-prod-groups`
- `rootfocus-backend-prod-group-members`

## 💰 Cost Estimation

**Monthly costs for moderate usage (100-500 users):**
- Lambda: ~$5-10
- DynamoDB: ~$2-8
- API Gateway: ~$3-10
- Bedrock (AI): ~$5-15
- **Total: $15-43/month**

## 🔧 Troubleshooting

### Common Issues

1. **"Bedrock access denied"**
   - Enable Bedrock model access in AWS Console
   - Go to Bedrock > Model access > Request model access

2. **"JWT Secret not found"**
   - Check `backend/.env` file exists
   - Verify JWT_SECRET is set

3. **"CORS errors"**
   - Verify API Gateway URL in frontend .env
   - Check serverless.yml CORS configuration

4. **"Screen capture not working"**
   - Ensure HTTPS is used (required for screen API)
   - Grant browser permissions

## 🎉 Success Checklist

- [ ] Backend deployed successfully to AWS
- [ ] DynamoDB tables created
- [ ] API Gateway URL obtained
- [ ] Frontend built with correct API URL
- [ ] Frontend deployed to hosting service
- [ ] User registration working
- [ ] Focus sessions can be started
- [ ] Screen analysis generating scores
- [ ] All features accessible via web interface

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs for backend errors
2. Use browser developer tools for frontend debugging
3. Verify all environment variables are set correctly
4. Ensure AWS service limits aren't exceeded

---

**🎯 Your Root Focus application is now ready for production use!**