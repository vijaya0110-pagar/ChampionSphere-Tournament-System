🏆 Sports Tournament Management System
A comprehensive full-stack web application for managing sports tournaments, built with React, Node.js, Express, and MySQL.

🚀 Features
Frontend Features

Tournament Creation: Create tournaments with different formats (Single/Double Elimination, Round Robin, Swiss System)
Team Management: Add teams with players, captains, and seedings
Real-time Updates: Live tournament progress and standings
Responsive Design: Works on desktop and mobile devices
MySQL Integration: Real database storage with fallback to mock data
Backend Features

RESTful API: Comprehensive API endpoints for all operations
MySQL Database: Persistent data storage with proper relationships
CORS Enabled: Cross-origin resource sharing for frontend

Error Handling: Robust error handling and validation
Database Analytics: Tournament statistics and analytics

🛠️ Tech Stack
Frontend
React 18 with TypeScript
Vite for fast development and building
Tailwind CSS for styling
Framer Motion for animations
React Router for navigation
Axios for API calls
Lucide React for icons
Backend
Node.js with Express
MySQL2 for database connections
TypeScript for type safety
CORS for cross-origin requests
dotenv for environment variables

## 📁 Project Structure
'''text
sports-tournament-system/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   │   ├── tournaments.ts
│   │   │   ├── teams.ts
│   │   │   ├── matches.ts
│   │   │   ├── sports.ts
│   │   │   └── predictions.ts
│   │   ├── db.ts           # Database connection
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Tournaments.tsx
│   │   │   ├── CreateTournament.tsx
│   │   │   ├── TournamentDetail.tsx
│   │   │   ├── Teams.tsx
│   │   │   ├── Sports.tsx
│   │   │   └── DatabaseViewer.tsx
│   │   ├── lib/            # Utility functions and API clients
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql          # MySQL database schema
└── README.md
'''
🚀 Quick Start
Prerequisites
Node.js (v16 or higher)
MySQL (v8.0 or higher)
npm or yarn
1. Clone the Repository

git clone <your-repo-url>
cd sports-tournament-system
2. Database Setup
Install and start MySQL server
Create database:

CREATE DATABASE tournament_db;
Import schema:

mysql -u root -p tournament_db < database/schema.sql
3. Backend Setup

cd backend
npm install
npm run dev
Backend will start on http://localhost:3001

4. Frontend Setup

cd frontend
npm install
npm run dev
Frontend will start on http://localhost:5173

📊 Database Schema
Key Tables
sports: Available sports types
tournaments: Tournament information and settings
teams: Teams participating in tournaments
players: Individual team members
matches: Match results and scheduling
predictions: AI-powered match predictions
🔧 Environment Variables
Backend (.env)

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=tournament_db
PORT=3001
Frontend (.env)

VITE_API_URL=http://localhost:3001/api
📱 Usage
Creating a Tournament
Navigate to "Create Tournament"
Select tournament sport
Choose format (Single/Double Elimination, etc.)
Set dates and team limits
Add initial teams with players
Viewing Tournament Data
Home Page: Overview of all tournaments
Tournament Detail: Individual tournament progress
Database Viewer: Direct database content access
API Endpoints: Raw JSON data via HTTP
API Endpoints

GET    /api/sports           # Get all sports
POST   /api/tournaments      # Create new tournament
GET    /api/tournaments      # Get all tournaments
GET    /api/tournaments/:id  # Get specific tournament
GET    /api/tournaments/:id/analytics # Get tournament analytics

🎯 Key Features
✦ MySQL Integration
✦ Real database storage instead of mock data
✦ Persistent tournament data across sessions
✦ Proper relational data structure
✦ Frontend-Backend Communication
✦ RESTful API design
✦ Error handling and fallbacks
✦ Real-time data updates
✦ Database Viewer
✦ Direct MySQL content viewing
✦ Real-time data inspection
✦ Perfect for teacher demonstrations
