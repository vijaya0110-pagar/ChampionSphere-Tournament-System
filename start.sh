#!/bin/bash

echo "🏁 Starting Sports Tournament System..."

# Change to project directory
cd /Users/vijayapagar/Documents/sports-tournament-system

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "🗄️ Setting up database..."
cd ../database
if command -v mysql &> /dev/null; then
    mysql -u root -p < schema.sql
    echo "✅ Database setup complete"
else
    echo "⚠️ MySQL not found. Please install and configure MySQL manually."
fi

echo "🚀 Starting backend server..."
cd ../backend && npm run dev &
BACKEND_PID=$!

echo "🚀 Starting frontend development server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Project is starting up!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
