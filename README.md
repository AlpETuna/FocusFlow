# FocusFlow - AI-Powered Productivity Timer

FocusFlow is an advanced productivity application that combines the Pomodoro technique with AI-powered screen monitoring to help users maintain focus and track their study habits effectively.

🔗 **Live Demo**: [https://focus-flow-app.netlify.app](https://focus-flow-app.netlify.app)

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern React with hooks for state management
- **React Router v6** - Client-side routing with future flags enabled
- **Context API** - Global state management for authentication and timer persistence
- **CSS3** - Custom styling with CSS variables for theming
- **LocalStorage** - Persistent user preferences and timer state

### Backend
- **AWS Lambda** - Serverless compute for API endpoints
- **AWS DynamoDB** - NoSQL database for user data and session tracking
- **AWS API Gateway** - RESTful API with CORS support
- **AWS Bedrock** - Claude AI for intelligent screen content analysis
- **Serverless Framework** - Infrastructure as Code deployment

### Key Features
- **AI Screen Monitoring** - Analyzes screenshots every 2 minutes to verify study activity
- **Smart Time Adjustments** - Awards +10 minutes for high focus, deducts -20 minutes for distractions
- **Persistent Timer** - Continues counting across page navigation and browser refreshes
- **Focus Tree Visualization** - Gamified progress tracking with growing tree levels
- **Group Study Sessions** - Create and join study groups with friends
- **Leaderboards** - Compete with friends and global users

## 🛠️ Architecture

### Authentication Flow
- Password-based authentication with bcrypt hashing
- Session management via user IDs in headers (x-user-id)
- No JWT tokens - simplified architecture for demo purposes

### Data Models
- **Users**: Profile data, total focus time, tree levels
- **Focus Sessions**: Start/end times, duration, AI adjustments
- **Focus Scores**: Individual AI analysis results
- **Groups**: Study groups with member tracking

### AI Integration
- Screen capture using Browser Media Streams API
- Content analysis using AWS Bedrock (Claude 3 Sonnet)
- Focus scoring algorithm (0-100 scale)
- Automatic time adjustments based on focus levels

## 📦 Deployment

### Frontend (Netlify)
The frontend is deployed on Netlify with automatic builds from the main branch.

Environment variables required:
```
REACT_APP_API_URL=https://your-api-gateway-url.amazonaws.com
```

### Backend (AWS)
The backend uses Serverless Framework for deployment to AWS.

```bash
cd backend
npm install
serverless deploy --stage dev
```

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- AWS Account (for backend)
- Netlify Account (for frontend deployment)

### Frontend Setup
```bash
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
serverless offline start
```

## 📱 Usage

1. **Register/Login** - Create an account to start tracking
2. **Start Timer** - Choose preset (Pomodoro/Short/Long)
3. **Enable AI Monitoring** - Grant screen permission for focus tracking
4. **Study** - Timer runs with periodic AI analysis
5. **Track Progress** - View total time, tree growth, and leaderboards

## 🔐 Privacy & Security

- Screenshots are analyzed in real-time and never stored
- All data is encrypted in transit (HTTPS)
- User passwords are hashed with bcrypt
- Screen sharing permission can be revoked anytime

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

Built with ❤️ for productive studying