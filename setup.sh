#!/bin/bash

# FocusFlow Setup Script
# This script helps set up the environment files securely

echo "🚀 Setting up FocusFlow for development/deployment..."

# Create environment files from templates
if [ ! -f "backend/.env" ]; then
    echo "📄 Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

if [ ! -f ".env" ]; then
    echo "📄 Creating frontend .env from template..."
    cp .env.example .env
    echo "✅ Created .env"
else
    echo "⚠️  .env already exists, skipping..."
fi

# Generate JWT secret if Node.js is available
if command -v node &> /dev/null; then
    echo "🔐 Generating secure JWT secret..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Replace the placeholder in backend/.env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-super-secure-jwt-secret-here-at-least-32-characters/$JWT_SECRET/" backend/.env
    else
        # Linux
        sed -i "s/your-super-secure-jwt-secret-here-at-least-32-characters/$JWT_SECRET/" backend/.env
    fi
    
    echo "✅ JWT secret generated and configured"
else
    echo "⚠️  Node.js not found. Please manually set JWT_SECRET in backend/.env"
    echo "   You can generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your AWS credentials:"
echo "   export AWS_ACCESS_KEY_ID=your-access-key"
echo "   export AWS_SECRET_ACCESS_KEY=your-secret-key"
echo "   export AWS_DEFAULT_REGION=us-east-1"
echo ""
echo "2. Enable AWS Bedrock access (Claude 3 Sonnet)"
echo ""
echo "3. Run deployment:"
echo "   ./deploy.sh"
echo ""
echo "⚠️  IMPORTANT: Never commit .env files to version control!"
echo "   The .gitignore file is configured to protect them."