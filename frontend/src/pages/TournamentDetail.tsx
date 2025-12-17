

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Users, Target, Brain, Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<any>(null);

  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('overview');

  const [showAddTeam, setShowAddTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamCaptain, setTeamCaptain] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [teamScore, setTeamScore] = useState('');
  const [predictions, setPredictions] = useState<any>({});
  const [editingScore, setEditingScore] = useState<number | null>(null);

  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);


  const calculateTournamentStatus = (startDate: string, endDate: string) => {
    const currentDate = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (currentDate >= start && (!end || currentDate <= end)) {
      return 'active';
    } else if (currentDate < start) {
      return 'upcoming';
    } else if (end && currentDate > end) {
      return 'completed';
    }
    return 'upcoming';
  };

  const handleDeleteTournament = async () => {
    if (window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/tournaments/${id}`);
        navigate('/tournaments');
      } catch (error) {
        // Mock deletion
        // Remove from localStorage
        const localTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]');
        const updatedLocalTournaments = localTournaments.filter((t: any) => t.id != id);
        localStorage.setItem('mockTournaments', JSON.stringify(updatedLocalTournaments));
        
        // Clear tournament-specific data
        localStorage.removeItem(`mockTournamentTeams_${id}`);
        localStorage.removeItem(`mockPredictions_${id}`);
        
        console.log('Tournament deleted:', id);
        navigate('/tournaments');
      }
    }
  };



  const loadData = async () => {
    try {
      const [tourRes, matchRes, analyticsRes] = await Promise.all([
        axios.get(`/api/tournaments/${id}`),
        axios.get(`/api/matches/tournament/${id}`),
        axios.get(`/api/tournaments/${id}/analytics`)
      ]);
      
      setTournament(tourRes.data.data.tournament);
      setTeams(tourRes.data.data.teams);
      setMatches(matchRes.data.data.matches);
      setAnalytics(analyticsRes.data.data);
    } catch (error) {
      // Mock data for demo purposes
      


      // Get the tournament data from mock tournaments list
      const mockTournaments = [
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
      
      // Get tournaments from localStorage
      const localTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]');
      const allTournaments = [...mockTournaments, ...localTournaments];
      




      // Find the current tournament by ID - try both string and number comparison
      if (!id) {
        console.error('No tournament ID provided');
        return;
      }
      
      const tournamentId = parseInt(id);
      console.log('Current URL ID parameter:', id, 'Parsed as:', tournamentId);
      console.log('Available tournaments:', allTournaments.map(t => ({ id: t.id, name: t.name })));
      
      // First try exact match with parsed ID
      let currentTournament = allTournaments.find((t: any) => parseInt(t.id) === tournamentId);
      
      // If not found, try string comparison
      if (!currentTournament) {
        currentTournament = allTournaments.find((t: any) => t.id.toString() === id.toString());
      }
      
      // If still not found, try loose comparison
      if (!currentTournament) {
        currentTournament = allTournaments.find((t: any) => t.id == id);
      }
      
      console.log('Found tournament:', currentTournament);
      
      // If tournament not found, create a minimal tournament object and show all available IDs
      if (!currentTournament) {
        console.log('Tournament not found. Available IDs:', allTournaments.map(t => t.id));
        setTournament({
          id: null,
          name: `Tournament ${id} Not Found`,
          sport_name: 'Unknown Sport',
          format: 'Unknown Format',
          status: 'error',
          max_teams: 0,
          start_date: null,
          available_ids: allTournaments.map(t => t.id)
        });
        return;
      }

      // Load saved teams for this tournament with ALL their details from tournament creation
      const localTournamentTeams = JSON.parse(localStorage.getItem(`mockTournamentTeams_${id}`) || '[]');
      
      // Ensure teams have all required fields with proper defaults
      const currentTeams = localTournamentTeams.map((team: any, index: number) => ({
        id: team.id || Date.now() + index,
        name: team.name || `Team ${index + 1}`,
        seed: team.seed || (index + 1),
        score: team.score || 0,
        captain: team.captain || '',
        members: team.members || [],
        wins: team.wins || 0,
        losses: team.losses || 0,
        points: team.points || team.score || 0,
        created_at: team.created_at || new Date().toISOString()
      }));
      
      // Load saved predictions
      const savedPredictions = JSON.parse(localStorage.getItem(`mockPredictions_${id}`) || '{}');
      setPredictions(savedPredictions);


      setTournament({
        id: currentTournament.id,
        name: currentTournament.name,
        sport_name: currentTournament.sport_name,
        format: currentTournament.format,
        status: calculateTournamentStatus(currentTournament.start_date, currentTournament.end_date),
        max_teams: currentTournament.max_teams || 16,
        start_date: currentTournament.start_date,
        end_date: currentTournament.end_date
      });

      setTeams(currentTeams);
      
      // Create matches using the actual teams from tournament creation
      const generatedMatches = [];
      if (currentTeams.length >= 2) {
        // Generate first round matches
        for (let i = 0; i < currentTeams.length - 1; i += 2) {
          generatedMatches.push({
            id: i + 1,
            team1_name: currentTeams[i].name,
            team2_name: currentTeams[i + 1].name,
            round: 1,
            match_number: Math.floor(i / 2) + 1,
            team1_score: 0,
            team2_score: 0,
            status: 'scheduled'
          });
        }
        
        // If odd number of teams, add a bye for the last team
        if (currentTeams.length % 2 === 1) {
          generatedMatches.push({
            id: currentTeams.length,
            team1_name: currentTeams[currentTeams.length - 1].name,
            team2_name: 'BYE',
            round: 1,
            match_number: Math.floor(currentTeams.length / 2) + 1,
            team1_score: 1,
            team2_score: 0,
            status: 'completed'
          });
        }
      }
      

      const finalMatches = generatedMatches.length > 0 ? generatedMatches : [
        {
          id: 1,
          team1_name: 'Sample Team 1',
          team2_name: 'Sample Team 2',
          round: 1,
          match_number: 1,
          team1_score: 0,
          team2_score: 0,
          status: 'scheduled'
        }
      ];

      setMatches(finalMatches);


      // Generate realistic analytics based on actual teams and their scores
      // Calculate analytics AFTER setting matches to ensure we use the correct data
      const completedMatchesCount = finalMatches.filter(m => m.status === 'completed').length;
      const totalMatchesCount = finalMatches.length;
      

      // Create standings based on the actual teams with their scores
      const teamStandings = currentTeams.map((team: any, index: number) => ({
        id: team.id,
        name: team.name,
        wins: team.wins || 0,
        losses: team.losses || 0,
        points: team.score || 0,
        captain: team.captain || '',
        members_count: team.members?.length || 0,
        seed: team.seed || index + 1
      }));
      
      // Sort by score (higher score = better position)
      teamStandings.sort((a: any, b: any) => b.points - a.points);
      
      setAnalytics({
        total_matches: totalMatchesCount,
        completed_matches: completedMatchesCount,
        pending_matches: totalMatchesCount - completedMatchesCount,
        teams_count: currentTeams.length,
        standings: teamStandings
      });
    }
  };



  const handleAddTeam = async () => {
    if (!teamName.trim()) return;
    
    try {
      await axios.post('/api/teams', { name: teamName, tournament_id: id });
    } catch (error) {
      // Mock successful creation with all necessary fields
      const newTeam = {
        id: Date.now(),
        name: teamName,
        seed: teams.length + 1,
        score: parseInt(teamScore) || Math.floor(Math.random() * 100) + 50,
        captain: teamCaptain || '',
        members: teamMembers ? teamMembers.split(',').map((m: string) => m.trim()).filter((m: string) => m) : [],
        wins: 0,
        losses: 0,
        points: parseInt(teamScore) || Math.floor(Math.random() * 100) + 50,
        created_at: new Date().toISOString()
      };
      
      const updatedTeams = [...teams, newTeam];
      setTeams(updatedTeams);
      
      // Persist to local storage specific to tournament
      localStorage.setItem(`mockTournamentTeams_${id}`, JSON.stringify(updatedTeams));
      

      // Update analytics locally without calling loadData to preserve match states
      const updatedMatches = [...matches];
      const completedMatchesCount = updatedMatches.filter(m => m.status === 'completed').length;
      const totalMatchesCount = updatedMatches.length;
      
      setAnalytics({
        ...analytics,
        completed_matches: completedMatchesCount,
        pending_matches: totalMatchesCount - completedMatchesCount,
        teams_count: updatedTeams.length
      });
      
      console.log('Mock team created:', teamName);
    }
    
    // Reset form fields
    setTeamName('');
    setTeamCaptain('');
    setTeamMembers('');
    setTeamScore('');
    setShowAddTeam(false);
  };


  const handleGenerateBrackets = async () => {
    try {
      await axios.post(`/api/matches/brackets/${id}`);
    } catch (error) {

      // Mock bracket generation
      const newMatches = [
        {
          id: 3,
          team1_name: 'Winner of Match 1',
          team2_name: 'Winner of Match 2',
          round: 2,
          match_number: 1,
          team1_score: 0,
          team2_score: 0,
          status: 'scheduled'
        }
      ];
      
      // Update matches locally to preserve analytics state
      const updatedMatches = [...matches, ...newMatches];
      setMatches(updatedMatches);
      
      // Update analytics to reflect new match count
      const completedMatchesCount = updatedMatches.filter(m => m.status === 'completed').length;
      const totalMatchesCount = updatedMatches.length;
      

      setAnalytics((prevAnalytics: any) => ({
        total_matches: totalMatchesCount,
        completed_matches: completedMatchesCount,
        pending_matches: totalMatchesCount - completedMatchesCount,
        teams_count: teams.length,
        standings: prevAnalytics?.standings || []
      }));
      

      console.log('Mock brackets generated');
    }
  };



  const handleScoreUpdate = async (matchId: number, score1: number, score2: number) => {
    try {
      await axios.post('/api/matches/score', {
        match_id: matchId,
        team1_score: score1,
        team2_score: score2
      });
    } catch (error) {
      // Mock score update with proper match state management
      const updatedMatches = matches.map(match => 
        match.id === matchId 
          ? { ...match, team1_score: score1, team2_score: score2, status: 'completed' }
          : match
      );
      setMatches(updatedMatches);
      
      // Update analytics to reflect the new completed match count
      const completedMatchesCount = updatedMatches.filter(m => m.status === 'completed').length;
      const totalMatchesCount = updatedMatches.length;
      


      // Always update analytics, ensuring complete matches count is accurate
      setAnalytics((prevAnalytics: any) => {
        const newAnalytics = {
          total_matches: totalMatchesCount,
          completed_matches: completedMatchesCount,
          pending_matches: totalMatchesCount - completedMatchesCount,
          teams_count: teams.length,
          standings: prevAnalytics?.standings || []
        };
        console.log('Analytics updated:', newAnalytics);
        return newAnalytics;
      });
      
      console.log('Mock score updated:', matchId, score1, score2, `Completed matches: ${completedMatchesCount}/${totalMatchesCount}`);
    }
    // Don't call loadData() to avoid resetting the form, just update local state
  };




  const handlePredict = async (matchId: number) => {
    try {
      const res = await axios.get(`/api/predictions/match/${matchId}`);
      setPredictions({...predictions, [matchId]: res.data.data});
    } catch (error) {
      // Smart prediction based on actual tournament data
      const match = matches.find(m => m.id === matchId);
      if (!match) return;
      


      // Get team data from the teams array - these teams have scores from tournament creation
      const team1Data = teams.find(t => t.name === match.team1_name);
      const team2Data = teams.find(t => t.name === match.team2_name);
      
      // If teams aren't found in the teams array, try to get from matches data
      const team1Score = team1Data?.score || 0;
      const team2Score = team2Data?.score || 0;
      
      const team1MembersCount = team1Data?.members?.length || 0;
      const team2MembersCount = team2Data?.members?.length || 0;
      
      // Calculate team strength based on scores and team composition
      // Base strength from score + bonus for team depth
      const team1Strength = team1Score + (team1MembersCount * 10); // Each member adds 10 points
      const team2Strength = team2Score + (team2MembersCount * 10);
      
      // Add some randomness but keep it realistic (within ±15% of base strength)
      const team1FinalStrength = team1Strength * (0.85 + Math.random() * 0.30);
      const team2FinalStrength = team2Strength * (0.85 + Math.random() * 0.30);
      

      const winner = team1FinalStrength > team2FinalStrength ? match.team1_name : match.team2_name;
      const loserData = team1FinalStrength > team2FinalStrength ? team2Data : team1Data;
      
      // Calculate confidence based on strength difference
      const strengthDifference = Math.abs(team1FinalStrength - team2FinalStrength);
      const averageStrength = (team1FinalStrength + team2FinalStrength) / 2;
      const dominanceRatio = strengthDifference / (averageStrength || 1);
      const confidence = Math.floor(Math.min(90, Math.max(65, 65 + (dominanceRatio * 20) + (Math.random() * 10 - 5))));
      
      const mockPrediction = {
        prediction: {
          winner: winner,
          confidence: confidence,


          analysis: `${winner} wins with ${team1FinalStrength > team2FinalStrength ? team1Score : team2Score} base score and ${team1FinalStrength > team2FinalStrength ? team1MembersCount : team2MembersCount} team members vs ${loserData.score || 0} points and ${loserData.members?.length || 0} members. Strength advantage: ${Math.abs((team1FinalStrength > team2FinalStrength ? team1FinalStrength : team2FinalStrength) - (team1FinalStrength > team2FinalStrength ? team2FinalStrength : team1FinalStrength)).toFixed(1)}. ${confidence}% confidence based on team score and roster depth.`
        }
      };
      
      const newPredictions = {...predictions, [matchId]: mockPrediction};
      setPredictions(newPredictions);
      
      // Save predictions to localStorage
      localStorage.setItem(`mockPredictions_${id}`, JSON.stringify(newPredictions));
      
      console.log('Smart prediction generated for match:', matchId, 'Winner:', winner);
    }
  };

  if (!tournament) return <div className="text-white text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{tournament.name}</h1>
            <p className="text-white opacity-80">{tournament.sport_name} • {tournament.format.replace('_', ' ').toUpperCase()}</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-right">
              <div className="bg-green-500 px-4 py-2 rounded-full text-white font-semibold mb-2">
                {tournament.status.toUpperCase()}
              </div>
              <p className="text-white text-sm">{teams.length} / {tournament.max_teams} Teams</p>
            </div>
            <button
              onClick={handleDeleteTournament}
              className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all"
              title="Delete Tournament"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-6">
        {['overview', 'teams', 'matches', 'predictions', 'analytics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === tab
                ? 'gradient-btn text-white'
                : 'glass-card text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>


      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 text-center"
            >
              <Users className="w-12 h-12 mx-auto mb-4 text-white" />
              <div className="text-white text-3xl font-bold mb-2">{teams.length}</div>
              <div className="text-white opacity-70">Registered Teams</div>
            </motion.div>
            

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 text-center"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4 text-white" />
              <div className="text-white text-3xl font-bold mb-2">{analytics?.completed_matches || 0}</div>
              <div className="text-white opacity-70">Completed Matches</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 text-center"
            >
              <Target className="w-12 h-12 mx-auto mb-4 text-white" />
              <div className="text-white text-3xl font-bold mb-2">{analytics?.total_matches || 0}</div>
              <div className="text-white opacity-70">Total Matches</div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Tournament Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-white">
                <span>Registration Status:</span>
                <span className="font-bold">{teams.length >= tournament.max_teams ? 'Full' : `${teams.length}/${tournament.max_teams} teams`}</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div 
                  className="gradient-btn h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(teams.length / tournament.max_teams) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-white text-sm opacity-70">
                <span>0 teams</span>
                <span>{tournament.max_teams} teams needed</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Teams</h2>
            <button
              onClick={() => setShowAddTeam(true)}
              className="gradient-btn text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Team
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {teams.map((team: any, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">{team.name}</h3>
                  <span className="text-sm opacity-70">Seed #{team.seed}</span>
                </div>
                <div className="text-sm space-y-1">
                  <div>Record: {team.wins}W - {team.losses}L</div>
                  <div className="font-bold">Points: {team.points}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {matches.length === 0 && teams.length >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-8 text-center mt-6"
            >
              <Target className="w-12 h-12 mx-auto mb-4 text-white" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Generate Brackets!</h3>
              <p className="text-white opacity-80 mb-4">You have {teams.length} teams registered.</p>
              <button
                onClick={handleGenerateBrackets}
                className="gradient-btn text-white px-8 py-3 rounded-lg font-bold"
              >
                Generate Brackets
              </button>
            </motion.div>
          )}
        </div>
      )}


      {activeTab === 'matches' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">Matches</h2>
          {matches.map((match: any) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-white mb-2">
                    <span className="text-sm opacity-70">Round {match.round} - Match {match.match_number}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 text-right">
                      <div className="text-white font-bold text-xl">{match.team1_name}</div>
                    </div>
                    <div className="text-center">
                      {match.status === 'completed' ? (
                        <div className="text-white text-3xl font-bold">
                          {match.team1_score} - {match.team2_score}
                        </div>
                      ) : (
                        <div className="text-white opacity-50">VS</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-xl">{match.team2_name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  {match.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        setEditingScore(match.id);
                        setScore1('');
                        setScore2('');
                      }}
                      className="gradient-btn text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Enter Score
                    </button>
                  )}
                  
                  {match.status === 'completed' && (
                    <div className="text-green-400 text-sm font-semibold">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
              
              {/* Score Entry Modal */}
              <AnimatePresence>
                {editingScore === match.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white border-opacity-20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-white font-semibold">{match.team1_name}</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={score1}
                          onChange={(e) => setScore1(e.target.value)}
                          placeholder="0"
                          className="w-16 px-2 py-1 rounded text-center bg-white bg-opacity-20 text-white"
                        />
                        <span className="text-white">-</span>
                        <input
                          type="number"
                          min="0"
                          value={score2}
                          onChange={(e) => setScore2(e.target.value)}
                          placeholder="0"
                          className="w-16 px-2 py-1 rounded text-center bg-white bg-opacity-20 text-white"
                        />
                      </div>
                      <div className="text-white font-semibold">{match.team2_name}</div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          if (score1 !== '' && score2 !== '') {
                            handleScoreUpdate(match.id, parseInt(score1), parseInt(score2));
                            setEditingScore(null);
                            setScore1('');
                            setScore2('');
                          }
                        }}
                        disabled={score1 === '' || score2 === ''}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        Save Score
                      </button>
                      <button
                        onClick={() => {
                          setEditingScore(null);
                          setScore1('');
                          setScore2('');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI Match Predictions
          </h2>
          {matches.filter((m: any) => m.status === 'scheduled').map((match: any) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                  <div className="text-sm opacity-70 mb-1">Round {match.round}</div>
                  <div className="font-bold">{match.team1_name} vs {match.team2_name}</div>
                </div>
                
                {!predictions[match.id] && (
                  <button
                    onClick={() => handlePredict(match.id)}
                    className="gradient-btn text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Predict
                  </button>
                )}
              </div>

              {predictions[match.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-white border-opacity-20 pt-4 mt-4"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="text-white text-sm mb-1">Predicted Winner</div>
                      <div className="text-white text-xl font-bold">{predictions[match.id].prediction.winner}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-sm mb-1">Confidence</div>
                      <div className="text-3xl font-bold text-green-400">
                        {predictions[match.id].prediction.confidence}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                    <div className="text-white text-sm opacity-90">
                      {predictions[match.id].prediction.analysis}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Tournament Analytics</h2>
          

          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass-card p-6 text-center">
              <div className="text-white text-4xl font-bold mb-2">{analytics.teams_count}</div>
              <div className="text-white opacity-70">Teams</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-white text-4xl font-bold mb-2">{analytics.total_matches}</div>
              <div className="text-white opacity-70">Total Matches</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-green-400 text-4xl font-bold mb-2">{analytics.completed_matches}</div>
              <div className="text-white opacity-70">Completed</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-yellow-400 text-4xl font-bold mb-2">
                {analytics.pending_matches || analytics.total_matches - analytics.completed_matches}
              </div>
              <div className="text-white opacity-70">Pending</div>
            </div>
          </div>


          <div className="glass-card p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Team Standings</h3>
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white border-opacity-20">
                  <th className="text-left py-3">Rank</th>
                  <th className="text-left py-3">Team</th>
                  <th className="text-center py-3">Score</th>
                  <th className="text-center py-3">Captain</th>
                  <th className="text-center py-3">Members</th>
                  <th className="text-center py-3">Seed</th>
                </tr>
              </thead>
              <tbody>
                {analytics.standings.map((team: any, i: number) => (
                  <tr key={team.id} className="border-b border-white border-opacity-10">
                    <td className="py-3 font-bold">{i + 1}</td>
                    <td className="py-3 font-semibold">{team.name}</td>
                    <td className="text-center py-3 font-bold text-green-400">{team.points}</td>
                    <td className="text-center py-3 text-sm">{team.captain || '-'}</td>
                    <td className="text-center py-3">{team.members_count}</td>
                    <td className="text-center py-3">#{team.seed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.standings.length === 0 && (
              <p className="text-white text-opacity-60 text-center py-8">No teams registered yet</p>
            )}
          </div>
        </div>
      )}


      {showAddTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-lg w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Add New Team</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Team Captain</label>
                <input
                  type="text"
                  value={teamCaptain}
                  onChange={(e) => setTeamCaptain(e.target.value)}
                  placeholder="Captain name"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Team Members (comma-separated)</label>
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="Player 1, Player 2, Player 3"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Team Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={teamScore}
                  onChange={(e) => setTeamScore(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleAddTeam} 
                disabled={!teamName.trim()}
                className="flex-1 gradient-btn text-white px-6 py-3 rounded-lg disabled:opacity-50"
              >
                Add Team
              </button>
              <button 
                onClick={() => {
                  setShowAddTeam(false);
                  setTeamName('');
                  setTeamCaptain('');
                  setTeamMembers('');
                  setTeamScore('');
                }} 
                className="flex-1 bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
