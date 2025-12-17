
// Mock API service to handle missing backend

interface Tournament {
  id: number;
  name: string;
  sport_name: string;
  start_date: string;
  end_date?: string;
  format: string;
}

interface Sport {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  captain?: string;
  members?: string[];
  score?: number;
  wins?: number;
  losses?: number;
  points?: number;
  seed?: number;
  created_at?: string;
}

interface Match {
  id: number;
  team1_name: string;
  team2_name: string;
  round: number;
  match_number: number;
  team1_score: number;
  team2_score: number;
  status: string;
}

export const mockApi = {
  // Override axios to prevent HTTP proxy errors
  init: (): void => {
    // This prevents actual HTTP calls from being made
    console.log('Mock API initialized - Backend calls will be simulated');
  },

  // Mock tournament data
  getTournaments: (): Tournament[] => {
    const mockData: Tournament[] = [
      {
        id: 1,
        name: 'Summer Championship 2025',
        sport_name: 'Football',
        start_date: '2025-06-15',
        end_date: '2025-07-15',
        format: 'single_elimination'
      },
      {
        id: 2,
        name: 'Winter Basketball League',
        sport_name: 'Basketball',
        start_date: '2025-08-01',
        end_date: '2025-09-01',
        format: 'round_robin'
      },
      {
        id: 3,
        name: 'Cricket World Cup',
        sport_name: 'Cricket',
        start_date: '2025-03-01',
        end_date: '2025-04-01',
        format: 'double_elimination'
      }
    ];
    
    const localTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]') as Tournament[];
    return [...mockData, ...localTournaments];
  },

  // Mock sports data
  getSports: (): Sport[] => {
    return [
      { id: 1, name: 'Football' },
      { id: 2, name: 'Basketball' },
      { id: 3, name: 'Cricket' },
      { id: 4, name: 'Tennis' },
      { id: 5, name: 'Volleyball' }
    ];
  },

  // Mock teams for tournament
  getTeamsForTournament: (tournamentId: string): Team[] => {
    return JSON.parse(localStorage.getItem(`mockTournamentTeams_${tournamentId}`) || '[]') as Team[];
  },

  // Mock matches for tournament
  getMatchesForTournament: (tournamentId: string): Match[] => {
    const teams = mockApi.getTeamsForTournament(tournamentId);
    
    if (teams.length >= 2) {
      const matches: Match[] = [];
      for (let i = 0; i < teams.length - 1; i += 2) {
        matches.push({
          id: i + 1,
          team1_name: teams[i].name,
          team2_name: teams[i + 1].name,
          round: 1,
          match_number: Math.floor(i / 2) + 1,
          team1_score: 0,
          team2_score: 0,
          status: 'scheduled'
        });
      }
      
      if (teams.length % 2 === 1) {
        matches.push({
          id: teams.length,
          team1_name: teams[teams.length - 1].name,
          team2_name: 'BYE',
          round: 1,
          match_number: Math.floor(teams.length / 2) + 1,
          team1_score: 1,
          team2_score: 0,
          status: 'completed'
        });
      }
      
      return matches;
    }
    
    return [];
  }
};

// Initialize mock API
mockApi.init();
