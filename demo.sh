#!/bin/bash

# Root Focus Quick Demo Script
# Serves the built application locally for demonstration

echo "🎬 Root Focus Quick Demo"
echo "======================"
echo ""

# Check if build folder exists
if [ ! -d "build" ]; then
    echo "❌ Build folder not found!"
    echo "The application needs to be built first."
    echo "If you have Node.js installed, run: npm run build"
    exit 1
fi

echo "✅ Build folder found"
echo ""

# Try different methods to serve the files
echo "🚀 Starting demo server..."

# Method 1: Node.js serve package
if command -v npx &> /dev/null; then
    echo "📦 Using npx serve..."
    echo ""
    echo "🌐 Demo will be available at: http://localhost:3000"
    echo "📱 To stop the demo, press Ctrl+C"
    echo ""
    echo "🎯 Demo Features to Show:"
    echo "  • Modern landing page with animations"
    echo "  • Responsive design and UI components"
    echo "  • Navigation and user interface"
    echo "  • Visual design and user experience"
    echo ""
    echo "⚠️  Note: Backend features won't work without AWS deployment"
    echo "   For full functionality, run: ./deploy.sh"
    echo ""
    echo "Starting server..."
    npx serve -s build -l 3000
    exit 0
fi

# Method 2: Python 3
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3..."
    echo ""
    echo "🌐 Demo will be available at: http://localhost:3000"
    echo "📱 To stop the demo, press Ctrl+C"
    echo ""
    echo "🎯 Demo Features to Show:"
    echo "  • Modern landing page with animations"
    echo "  • Responsive design and UI components"
    echo "  • Navigation and user interface"
    echo "  • Visual design and user experience"
    echo ""
    echo "⚠️  Note: Backend features won't work without AWS deployment"
    echo "   For full functionality, run: ./deploy.sh"
    echo ""
    echo "Starting server..."
    cd build && python3 -m http.server 3000
    exit 0
fi

# Method 3: Python 2
if command -v python2 &> /dev/null; then
    echo "🐍 Using Python 2..."
    echo ""
    echo "🌐 Demo will be available at: http://localhost:3000"
    echo "📱 To stop the demo, press Ctrl+C"
    echo ""
    echo "Starting server..."
    cd build && python2 -m SimpleHTTPServer 3000
    exit 0
fi

# Method 4: PHP
if command -v php &> /dev/null; then
    echo "🐘 Using PHP..."
    echo ""
    echo "🌐 Demo will be available at: http://localhost:3000"
    echo "📱 To stop the demo, press Ctrl+C"
    echo ""
    echo "Starting server..."
    cd build && php -S localhost:3000
    exit 0
fi

# Method 5: Ruby
if command -v ruby &> /dev/null; then
    echo "💎 Using Ruby..."
    echo ""
    echo "🌐 Demo will be available at: http://localhost:3000"
    echo "📱 To stop the demo, press Ctrl+C"
    echo ""
    echo "Starting server..."
    cd build && ruby -run -e httpd . -p 3000
    exit 0
fi

# No server available
echo "❌ No suitable server found!"
echo ""
echo "🔧 To run a local demo, you need one of these installed:"
echo "  • Node.js (recommended) - https://nodejs.org/"
echo "  • Python 3 - https://python.org/"
echo "  • PHP - https://php.net/"
echo ""
echo "🌐 Alternative demo options:"
echo ""
echo "1. **Netlify Drop (Easiest)**"
echo "   • Go to https://drop.netlify.com"
echo "   • Drag and drop the 'build' folder"
echo "   • Get instant live demo URL"
echo ""
echo "2. **GitHub Pages**"
echo "   • Push to GitHub repository"
echo "   • Enable Pages in repository settings"
echo "   • Select 'Deploy from folder' -> /build"
echo ""
echo "3. **Vercel**"
echo "   • Go to https://vercel.com"
echo "   • Upload the 'build' folder"
echo "   • Get instant deployment"
echo ""
echo "📖 For detailed demo instructions, see DEMO_GUIDE.md"