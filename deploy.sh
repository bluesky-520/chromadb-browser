#!/bin/bash

# ChromaDB Browser Deployment Script for AWS EC2

echo "🚀 Starting ChromaDB Browser deployment..."

# Set environment variables
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export PORT=3001
export HOSTNAME=0.0.0.0

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "🌟 Starting application on port 3001..."
npm start
