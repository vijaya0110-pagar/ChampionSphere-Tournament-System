#!/bin/bash

# MySQL Database Checker Script (Fixed)
# Run this script to see your tournament data in MySQL

echo "🔍 Checking MySQL Tournament Database..."
echo "=================================="

# Function to execute MySQL query
execute_query() {
    local query="$1"
    local description="$2"
    
    echo ""
    echo "📋 $description"
    echo "-----------------------------------"
    mysql -u root -p tournament_db -e "$query"
}

# Connect and show basic info
echo "💾 Database: tournament_db"
echo "📊 Tables in your database:"
mysql -u root -p tournament_db -e "SHOW TABLES;"

# Show tournaments table (without format column)
execute_query "
SELECT 
    t.id,
    t.name as tournament_name,
    t.status,
    t.start_date,
    t.end_date,
    t.max_teams,
    t.created_at,
    s.name as sport_name
FROM tournaments t
LEFT JOIN sports s ON t.sport_id = s.id
ORDER BY t.created_at DESC;
" "All Tournaments (Most Recent First)"

# Show teams for tournaments
execute_query "
SELECT 
    tm.id,
    tm.name as team_name,
    tm.seed,
    tm.wins,
    tm.losses,
    tm.points,
    t.name as tournament_name,
    tm.created_at
FROM teams tm
LEFT JOIN tournaments t ON tm.tournament_id = t.id
ORDER BY t.name, tm.seed;
" "All Teams with Tournament Info"

# Show recent tournament with details (without format)
execute_query "
SELECT 
    t.id,
    t.name,
    s.name as sport,
    COUNT(tm.id) as team_count,
    t.created_at
FROM tournaments t
LEFT JOIN sports s ON t.sport_id = s.id
LEFT JOIN teams tm ON t.id = tm.tournament_id
GROUP BY t.id, t.name, s.name, t.created_at
ORDER BY t.created_at DESC
LIMIT 5;
" "Recent Tournaments with Team Counts"

# Show matches if any exist
execute_query "
SELECT 
    m.id,
    m.round,
    m.match_number,
    m.status,
    m.team1_score,
    m.team2_score,
    t1.name as team1_name,
    t2.name as team2_name,
    t.name as tournament_name
FROM matches m
LEFT JOIN teams t1 ON m.team1_id = t1.id
LEFT JOIN teams t2 ON m.team2_id = t2.id
LEFT JOIN tournaments t ON m.tournament_id = t.id
ORDER BY m.tournament_id, m.round, m.match_number;
" "Match Schedule and Results"

# Table structures
echo ""
echo "🏗️ Database Schema:"
echo "=================="

execute_query "DESCRIBE tournaments;" "Tournaments Table Structure"
execute_query "DESCRIBE teams;" "Teams Table Structure"
execute_query "DESCRIBE sports;" "Sports Table Structure"

echo ""
echo "✅ Database check complete!"
echo "💡 To create a new tournament, use the frontend app at http://localhost:5173"
echo "🔄 Then run this script again to see the new data!"

