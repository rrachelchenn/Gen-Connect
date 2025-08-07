#!/bin/bash

echo "🚀 Setting up GenConnect..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies  
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "Demo accounts:"
echo "  Senior (Tutee): demo.senior@genconnect.com / demo123"
echo "  Student (Tutor): demo.student@genconnect.com / demo123"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"