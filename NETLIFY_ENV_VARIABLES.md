# Netlify Environment Variables

## 🌐 Set these in Netlify Dashboard → Site Settings → Environment Variables:

### Required Frontend Variables:
```
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
```

### Required AWS Variables (for backend deployment):
```
MY_AWS_ACCESS_KEY_ID=your-aws-access-key-id
MY_AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
MY_AWS_DEFAULT_REGION=us-east-1
```

## 🚀 How to Get These Values:

### AWS Credentials:
1. Go to **AWS Console** → **IAM** → **Users**
2. Select your user → **Security credentials**
3. **Create access key**
4. Copy the Access Key ID and Secret Access Key

### API Gateway URL:
1. Deploy your backend first: `cd backend && npm install && npm run deploy`
2. Copy the API Gateway URL from the deployment output
3. It will look like: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`

## ✅ That's It!

No JWT secrets needed, no shell scripts - just these 5 environment variables in Netlify and you're ready to deploy!