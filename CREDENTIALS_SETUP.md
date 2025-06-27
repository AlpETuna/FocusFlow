# AWS Credentials Setup Guide

## 🔐 Secure Credentials File Created

I've created `aws-credentials.sh` - a secure file to store your AWS credentials that **will never be committed to GitHub**.

## 📝 How to Use:

### Step 1: Edit the Credentials File
Open `aws-credentials.sh` and replace the example values with your real AWS credentials:

```bash
# Replace these with your actual AWS credentials:
export MY_AWS_ACCESS_KEY_ID="YOUR_ACTUAL_ACCESS_KEY_ID"
export MY_AWS_SECRET_ACCESS_KEY="YOUR_ACTUAL_SECRET_ACCESS_KEY"
export MY_AWS_DEFAULT_REGION="us-east-1"
```

### Step 2: Load the Credentials
Choose one of these methods:

**Option A: Source the file (recommended)**
```bash
source aws-credentials.sh
```

**Option B: Run as executable**
```bash
./aws-credentials.sh
```

### Step 3: Verify Credentials Work
```bash
aws sts get-caller-identity
```

### Step 4: Deploy Backend
```bash
cd backend
npm install
npm run deploy
```

### Step 5: Update Frontend API URL
After deployment, copy the API Gateway URL from the output and update your `.env` file:
```
REACT_APP_API_URL=https://your-real-api-url.execute-api.us-east-1.amazonaws.com/dev
```

## 🔒 Security Features:

✅ **Protected by .gitignore** - Will never be committed to git  
✅ **Masked output** - Only shows first/last 4 characters of access key  
✅ **Clear warnings** - Reminds you not to commit sensitive data  

## 🚀 Quick Test Workflow:

```bash
# 1. Edit aws-credentials.sh with your real credentials
nano aws-credentials.sh

# 2. Load credentials
source aws-credentials.sh

# 3. Test AWS connection
aws sts get-caller-identity

# 4. Deploy backend
cd backend && npm install && npm run deploy

# 5. Copy API URL to .env file
# 6. Test registration in your app
```

## 🆘 Getting AWS Credentials:

1. Go to **AWS Console**
2. Navigate to **IAM** → **Users**
3. Select your user (or create new one)
4. Go to **Security credentials** tab
5. Click **Create access key**
6. Copy the Access Key ID and Secret Access Key
7. Paste them into `aws-credentials.sh`

Once you set this up, your "failed to fetch" error should be resolved!