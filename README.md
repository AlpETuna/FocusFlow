# FocusFlow 🌳

A modern focus and productivity app that transforms study sessions into a growing digital forest. Features AI-powered screen monitoring, collaborative group trees, and real-time progress tracking.

![FocusFlow](https://img.shields.io/badge/version-2.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🧠 AI-Powered Focus Monitoring
- Advanced screen analysis using AWS Bedrock (Claude 3 Sonnet)
- Real-time focus scoring (0-100)
- Activity categorization and insights
- Privacy-focused: no screenshots stored

### 🌲 Group Trees
- Create study groups with shared trees
- Tree health depends on all members' participation
- Daily goals and streak tracking
- Real-time member activity status

### 📊 Visual Progress Tracking
- Personal tree that grows with focus time
- Level progression system
- Daily and total statistics
- Achievement system

### 🏆 Social Features
- Friend system with activity tracking
- Global and friend leaderboards
- Study session sharing
- Group challenges

## 🚀 Tech Stack

### Frontend
- React 18 with Hooks
- Modern, clean UI design
- Real-time screen capture API
- Responsive design

### Backend
- AWS Lambda (Serverless)
- API Gateway
- DynamoDB
- AWS Bedrock (Claude 3 Sonnet)

### Authentication
- JWT-based auth
- Secure password hashing
- Protected API endpoints

## 📦 Quick Start

### 🔧 Prerequisites
- Node.js 18+
- AWS Account with Bedrock access enabled
- Serverless Framework (`npm install -g serverless`)

### 🚀 Setup & Deploy

```bash
# 1. Clone and setup environment
git clone <repository-url>
cd FocusFlow
./setup.sh

# 2. Set AWS credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1

# 3. Enable AWS Bedrock access (Claude 3 Sonnet) in AWS Console

# 4. Deploy everything
./deploy.sh
```

### 📋 Detailed Setup

1. **Environment Configuration**
   ```bash
   # The setup script creates environment files from templates
   ./setup.sh
   
   # Or manually:
   cp backend/.env.example backend/.env
   cp .env.example .env
   # Edit backend/.env and set your JWT_SECRET
   ```

2. **AWS Configuration**
   - Get AWS credentials from IAM Console
   - Enable Bedrock model access for Claude 3 Sonnet
   - Set environment variables

3. **Deployment**
   ```bash
   # Verify setup
   ./check-setup.sh
   
   # Deploy backend and frontend
   ./deploy.sh
   ```

## 🎯 Key Features Explained

### AI Screen Monitoring
The app uses browser screen capture APIs combined with AWS Bedrock (Claude 3 Sonnet) to:
- Analyze screen content every 2 minutes
- Detect if you're focused on work vs distractions
- Provide focus scores and insights
- Ensure authentic study sessions

### Group Trees
A unique collaborative feature where:
- Groups share a single tree
- Tree health = percentage of active members
- Missing daily goals affects the whole tree
- Encourages accountability and teamwork

### Privacy First
- Screenshots are analyzed instantly and discarded
- No image storage on servers
- All data encrypted in transit
- User control over monitoring

## 🛠️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   AWS Lambda     │    │  AWS Bedrock    │
│                 │    │                  │    │                 │
│ - Screen Capture│───▶│ - Auth & Sessions│───▶│ - Claude 3 Sonnet│
│ - Group Trees   │    │ - Group Logic    │    │ - Focus Analysis │
│ - Real-time UI  │    │ - Data Storage   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   DynamoDB       │
                       │                  │
                       │ - Users          │
                       │ - Sessions       │
                       │ - Groups         │
                       │ - Focus Scores   │
                       └──────────────────┘
```

## 💰 Cost Optimization

Designed for minimal running costs:
- Serverless architecture (pay per use)
- DynamoDB on-demand billing
- AWS Bedrock pay-per-token pricing
- Estimated: $15-43/month for moderate usage (100-500 users)

### Detailed Cost Breakdown
- **Lambda**: ~$5-10/month
- **DynamoDB**: ~$2-8/month
- **API Gateway**: ~$3-10/month
- **Bedrock**: ~$5-15/month

## 🔒 Security

- JWT authentication with refresh tokens
- Bcrypt password hashing
- API rate limiting
- CORS configuration
- Input validation and sanitization
- Environment-based secrets management

## 🌐 Hosting Options

### Frontend Deployment
- **Netlify** (Recommended) - Drag & drop the `build` folder
- **Vercel** - Connect GitHub repository
- **AWS S3 + CloudFront** - Full AWS integration
- **GitHub Pages** - Free hosting

### Backend
- **AWS Lambda** (Default) - Serverless, auto-scaling
- Fully configured via Serverless Framework

## 🧪 Testing Your Deployment

```bash
# Test backend API
curl -X POST https://your-api-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test frontend locally
npm run serve  # Serves build folder at localhost:3000
```

## 📊 Monitoring

- **CloudWatch Logs** for backend monitoring
- **Real-time error tracking** via AWS Console
- **DynamoDB metrics** for database performance
- **Cost monitoring** via AWS Billing

## 🆘 Troubleshooting

### Common Issues
- **Environment Setup**: Run `./setup.sh` to create environment files
- **AWS Credentials**: Check environment variables are set
- **Bedrock Access**: Enable model access in AWS Console
- **JWT Errors**: Ensure JWT_SECRET is properly configured
- **CORS Errors**: Verify API Gateway URL in frontend .env

### Get Help
1. Run `./check-setup.sh` to verify configuration
2. Check `DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting
3. Review CloudWatch logs for backend errors

## 📁 Project Structure

```
FocusFlow/
├── setup.sh                    # Environment setup script
├── deploy.sh                   # Automated deployment
├── check-setup.sh             # Setup verification
├── DEPLOYMENT_CHECKLIST.md    # Detailed deployment guide
├── .env.example               # Frontend environment template
├── backend/
│   ├── .env.example          # Backend environment template
│   ├── serverless.yml        # AWS deployment configuration
│   ├── package.json          # Backend dependencies
│   └── src/handlers/         # Lambda function handlers
├── src/                      # React frontend source
├── build/                    # Built frontend (ready to deploy)
└── public/                   # Static assets
```

## 🔐 Security Notes

- Environment files (`.env`) are protected by `.gitignore`
- Use `.env.example` files as templates
- Never commit secrets to version control
- JWT secrets are auto-generated during setup
- All API endpoints require authentication

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AWS for Bedrock AI services and serverless infrastructure
- Anthropic for Claude 3 Sonnet model
- The open-source community

---

## 🎉 Ready to Deploy?

```bash
# Quick start
./setup.sh
./deploy.sh

# Check setup first
./check-setup.sh
```

**Built with ❤️ using AWS Serverless Architecture - Secure & Production Ready! 🚀**