#!/bin/bash

echo "🏁 Starting Sports Tournament System..."

# Kill any existing processes on our ports
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🔧 Starting backend API..."
cd backend
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "📱 Starting frontend..."
cd ../frontend
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Servers starting!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "Logs:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Keep the script running
wait
