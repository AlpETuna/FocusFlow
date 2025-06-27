# 🚀 Root Focus AWS Deployment Checklist

Your Root Focus application is now **COMPLETE** and ready for AWS deployment! Here's exactly what you need to do:

## ✅ What's Already Configured

### Backend (Complete)
- [x] All Lambda function handlers created
- [x] DynamoDB table configurations set up
- [x] AWS Bedrock AI integration configured
- [x] JWT authentication system ready
- [x] CORS and API Gateway settings
- [x] Serverless Framework configuration
- [x] Secure environment configuration templates

### Frontend (Complete)
- [x] React app with all components
- [x] API service updated to match backend
- [x] Environment configuration templates
- [x] Build folder already exists

## 🔧 What You Need to Fill In

### 1. Environment Configuration (Required)
Set up your environment files with secrets:

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp .env.example .env

# Generate a secure JWT secret for backend/.env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit backend/.env and replace:
JWT_SECRET=your-generated-jwt-secret-here
```

### 2. AWS Credentials (Required)
You need to set these environment variables before deployment:

```bash
export MY_AWS_ACCESS_KEY_ID=your-aws-access-key-here
export MY_AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key-here
export MY_AWS_DEFAULT_REGION=us-east-1
```

**How to get these:**
1. Go to AWS Console → IAM → Users
2. Create or select a user
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Copy the Access Key ID and Secret Access Key

### 3. AWS Bedrock Access (Required)
Enable Claude 3 Sonnet model access:

1. Go to AWS Console → Bedrock
2. Click "Model access" in the left sidebar
3. Click "Request model access"
4. Find "Anthropic Claude 3 Sonnet" and request access
5. Wait for approval (usually instant)

### 4. Prerequisites Installation
Install these on your system:

```bash
# Install Node.js 18+ (if not already installed)
# Download from https://nodejs.org/

# Install Serverless Framework globally
npm install -g serverless

# Verify installations
node --version  # Should be 18+
npm --version
serverless --version
```

## 🚀 Deployment Commands

### Option 1: Automated Deployment (Recommended)
```bash
# 1. Set up environment files
cp backend/.env.example backend/.env
cp .env.example .env

# 2. Generate JWT secret and add to backend/.env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste it as JWT_SECRET in backend/.env

# 3. Set your AWS credentials (replace with your actual values)
export MY_AWS_ACCESS_KEY_ID=your-access-key-here
export MY_AWS_SECRET_ACCESS_KEY=your-secret-key-here
export MY_AWS_DEFAULT_REGION=us-east-1

# 4. Run the deployment script
./deploy.sh
```

### Option 2: Manual Step-by-Step
```bash
# 1. Set up environment files
cp backend/.env.example backend/.env
cp .env.example .env

# 2. Generate JWT secret and add to backend/.env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Edit backend/.env and set JWT_SECRET

# 3. Install backend dependencies
cd backend
npm install

# 4. Deploy backend to AWS
npm run deploy-prod

# 5. Copy the API Gateway URL from the output
# It will look like: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

# 6. Update frontend environment
cd ..
echo "REACT_APP_API_URL=your-api-gateway-url-here" >> .env

# 7. Build frontend
npm install
npm run build
```

## 🌐 Frontend Hosting Options

After deployment, upload the `build/` folder to any of these services:

### Option A: Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag and drop the `build` folder to deploy
3. In site settings, add environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: Your API Gateway URL

### Option B: Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import from GitHub or upload build folder
3. Add environment variable: `REACT_APP_API_URL`

### Option C: AWS S3 + CloudFront
```bash
# Create S3 bucket
aws s3 mb s3://your-rootfocus-app-bucket

# Upload build files
aws s3 sync build/ s3://your-rootfocus-app-bucket

# Enable static website hosting
aws s3 website s3://your-rootfocus-app-bucket --index-document index.html
```

## 📋 Files That Are Ready (No Changes Needed)

- ✅ `backend/.env.example` - Environment template with instructions
- ✅ `backend/serverless.yml` - Complete AWS configuration
- ✅ `backend/package.json` - All dependencies listed
- ✅ `backend/src/handlers/*.js` - All Lambda functions ready
- ✅ `.env.example` - Frontend environment template
- ✅ `src/services/api.js` - Updated to match backend
- ✅ `deploy.sh` - Automated deployment script with security checks
- ✅ `build/` - Frontend already built
- ✅ `.gitignore` - Configured to protect secrets

## 🎯 Expected Deployment Output

When deployment succeeds, you'll see:
```
✅ Backend deployed successfully
✅ API Gateway URL: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
✅ DynamoDB tables created
✅ Frontend built and ready
```

## 💰 Expected AWS Costs

For moderate usage (100-500 users):
- **Lambda**: $5-10/month
- **DynamoDB**: $2-8/month
- **API Gateway**: $3-10/month
- **Bedrock AI**: $5-15/month
- **Total**: $15-43/month

## 🆘 Troubleshooting

### Common Issues:

1. **"AWS credentials not found"**
   ```bash
   export MY_AWS_ACCESS_KEY_ID=your-key
   export MY_AWS_SECRET_ACCESS_KEY=your-secret
   ```

2. **"Bedrock access denied"**
   - Go to AWS Console → Bedrock → Model access
   - Request access to Claude 3 Sonnet

3. **"Serverless command not found"**
   ```bash
   npm install -g serverless
   ```

4. **"Node.js version too old"**
   - Install Node.js 18+ from https://nodejs.org/

## ✅ Final Checklist

Before running `./deploy.sh`, verify:

- [ ] Environment files created: `cp backend/.env.example backend/.env` and `cp .env.example .env`
- [ ] JWT_SECRET generated and set in `backend/.env`
- [ ] AWS credentials set in environment variables
- [ ] Bedrock Claude 3 Sonnet access enabled
- [ ] Node.js 18+ installed
- [ ] Serverless Framework installed globally
- [ ] You're in the Root Focus project directory

## 🎉 After Deployment

1. Test backend API endpoints
2. Deploy frontend to hosting service
3. Update frontend environment with API URL
4. Test complete application
5. Share with users!

---

**Your Root Focus app is PRODUCTION READY! 🚀**

Just fill in your AWS credentials and run `./deploy.sh`