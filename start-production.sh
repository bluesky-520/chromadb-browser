#!/bin/bash

# ChromaDB Browser Production Startup Script

echo "🚀 Starting ChromaDB Browser in production mode..."

# Set environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export PORT=3001
export HOSTNAME=0.0.0.0

# Kill any existing processes on port 3001
echo "🔄 Stopping any existing processes on port 3001..."
sudo lsof -ti:3001 | xargs -r sudo kill -9

# Wait a moment for processes to stop
sleep 2

# Clean up any existing build artifacts
echo "🧹 Cleaning up build artifacts..."
rm -rf .next
rm -rf out

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --only=production
fi

# Build the application
echo "🔨 Building application for production..."
npm run build

# Start the application
echo "🌟 Starting ChromaDB Browser on port 3001..."
echo "📍 Application will be available at: http://$(curl -s ifconfig.me):3001"
echo "📍 Local access: http://localhost:3001"

# Start with proper error handling
npm run start:prod 2>&1 | tee -a /var/log/chromadb-browser.log
