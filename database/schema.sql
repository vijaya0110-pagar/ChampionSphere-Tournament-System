CREATE DATABASE IF NOT EXISTS tournament_db;
USE tournament_db;

CREATE TABLE sports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sport_id INT NOT NULL,
    format ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss_system') NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    max_teams INT DEFAULT 16,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sport_id) REFERENCES sports(id) ON DELETE CASCADE,
    INDEX idx_sport (sport_id),
    INDEX idx_status (status)
);

CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    tournament_id INT NOT NULL,
    seed INT,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    INDEX idx_tournament (tournament_id),
    INDEX idx_standings (tournament_id, points DESC, wins DESC)
);

CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    team_id INT NOT NULL,
    position VARCHAR(50),
    stats JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    INDEX idx_team (team_id)
);

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    round INT NOT NULL,
    match_number INT NOT NULL,
    team1_id INT,
    team2_id INT,
    team1_score INT DEFAULT 0,
    team2_score INT DEFAULT 0,
    winner_id INT,
    scheduled_time DATETIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    venue VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_tournament (tournament_id),
    INDEX idx_status (status),
    INDEX idx_round (tournament_id, round)
);

CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    predicted_winner_id INT,
    confidence_score DECIMAL(5,2),
    analysis TEXT,
    was_correct BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (predicted_winner_id) REFERENCES teams(id) ON DELETE SET NULL,
    INDEX idx_match (match_id)
);

INSERT INTO sports (name) VALUES 
('Football'), ('Basketball'), ('Cricket'), ('Tennis'), 
('Volleyball'), ('Baseball'), ('Hockey'), ('Rugby');