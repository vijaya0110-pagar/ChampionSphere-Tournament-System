#!/bin/bash

echo "🏁 Starting Sports Tournament System Frontend..."

cd /Users/vijayapagar/Documents/sports-tournament-system/frontend

# Use npx to run vite to avoid permission issues
npx vite --host 0.0.0.0 --port 5173

echo "Frontend should be running at: http://localhost:5173"
