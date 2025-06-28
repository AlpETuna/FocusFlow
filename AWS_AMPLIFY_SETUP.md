# AWS Amplify Deployment Guide

## 🚀 AWS Amplify Setup for FocusFlow

AWS Amplify provides seamless deployment and hosting for your React frontend with automatic CI/CD from your Git repository.

## 📋 Prerequisites

1. **AWS Account** with proper permissions
2. **Backend deployed** (follow backend setup steps first)
3. **Git repository** (GitHub, GitLab, Bitbucket, or CodeCommit)

## 🔧 Step-by-Step Setup

### Step 1: Deploy Backend First

```bash
# Set AWS credentials
export MY_AWS_ACCESS_KEY_ID=your-access-key-id
export MY_AWS_SECRET_ACCESS_KEY=your-secret-access-key
export MY_AWS_DEFAULT_REGION=us-east-1

# Deploy backend
cd backend
npm install
npm run deploy

# Save the API Gateway URL from output
```

### Step 2: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"Create new app"**
3. Choose **"Host web app"**
4. Select your Git provider (GitHub/GitLab/Bitbucket)
5. Connect your repository and select the branch
6. Choose **"FocusFlow"** or your repository name

### Step 3: Configure Build Settings

Amplify will auto-detect the React app and use the `amplify.yml` configuration file.

**Verify the build specification:**
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    appRoot: .
```

### Step 4: Set Environment Variables

In the Amplify console:
1. Go to **App settings** → **Environment variables**
2. Add these variables:

```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
```

**To get your API Gateway URL:**
- It's shown in the backend deployment output
- Or run: `aws cloudformation list-exports --query "Exports[?Name=='rootfocus-backend-dev-ServiceEndpoint'].Value" --output text`

### Step 5: Deploy

1. Click **"Save and deploy"**
2. Amplify will automatically:
   - Pull your code from Git
   - Install dependencies
   - Build the React app
   - Deploy to global CDN
   - Provide a public URL

### Step 6: Set Up Custom Domain (Optional)

1. In Amplify console → **Domain management**
2. Click **"Add domain"**
3. Enter your domain name
4. Amplify will handle SSL certificate automatically

## 🔄 Automatic Deployments

Amplify automatically redeploys when you push to your connected Git branch:
- **Commit & Push** → **Auto Deploy**
- **Branch Protection** → Deploy previews for PRs
- **Rollbacks** → One-click rollback to previous versions

## 🌍 Environment Variables Reference

### Production Environment:
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
```

### Development/Staging Environment:
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false  
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
```

## 🔧 Advanced Configuration

### Multiple Environments

You can set up separate Amplify apps for different environments:
- **Production**: Connected to `main` branch
- **Staging**: Connected to `develop` branch
- **Feature branches**: Auto-preview deployments

### Custom Build Commands

If you need custom build steps, modify `amplify.yml`:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - echo "Pre-build custom commands here"
        build:
          commands:
            - npm run build
            - echo "Post-build custom commands here"
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
    appRoot: .
```

## 📊 Amplify vs Netlify Comparison

| Feature | AWS Amplify | Netlify |
|---------|-------------|---------|
| **Git Integration** | ✅ Auto-deploy | ✅ Auto-deploy |
| **Global CDN** | ✅ CloudFront | ✅ Edge network |
| **SSL/HTTPS** | ✅ Free cert | ✅ Free cert |
| **Environment Variables** | ✅ Per branch | ✅ Per branch |
| **AWS Integration** | ✅ Native | ⚠️ Manual setup |
| **Pricing** | ✅ Pay-as-you-go | ✅ Free tier + paid |
| **Preview Deployments** | ✅ PR previews | ✅ PR previews |

## 💰 Pricing

**AWS Amplify Hosting costs:**
- **Build minutes**: $0.01 per minute
- **Data transfer**: $0.15 per GB
- **Storage**: $0.023 per GB/month
- **Requests**: $0.50 per million requests

**Estimated monthly cost**: $5-15 for typical usage

## 🆘 Troubleshooting

### Build Failures
```bash
# Check build logs in Amplify console
# Common issues:
# 1. Missing environment variables
# 2. Node.js version mismatch
# 3. Dependency conflicts
# 4. package-lock.json missing (use npm install instead of npm ci)
```

**If you see "npm ci" errors:**
The `amplify.yml` file has been configured to use `npm install` instead of `npm ci` to avoid package-lock.json requirements.

**To generate package-lock.json locally (optional):**
```bash
npm install --package-lock-only
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### API Connection Issues
```bash
# Verify environment variables are set correctly
# Check CORS settings in backend/serverless.yml
# Ensure API Gateway URL is correct
```

### Domain Issues
```bash
# Check DNS settings
# Verify SSL certificate status
# Ensure domain verification is complete
```

## ✅ Verification Steps

After deployment:

1. **Check build logs** in Amplify console
2. **Visit your app URL** provided by Amplify  
3. **Test user registration** to verify backend connection
4. **Check browser console** for any errors
5. **Test focus session** functionality

## 🔄 Migration from Netlify

If you're migrating from Netlify:

1. **Keep Netlify running** during transition
2. **Deploy to Amplify** with same environment variables
3. **Test thoroughly** on Amplify URL
4. **Update DNS** to point to Amplify (if using custom domain)
5. **Delete Netlify site** once confirmed working

You can remove the `netlify.toml` file as it's no longer needed with Amplify.