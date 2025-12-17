
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Trash2, ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [teamCaptain, setTeamCaptain] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [teamScore, setTeamScore] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournamentId) {
      loadTeamsForTournament(selectedTournamentId);
    }
  }, [selectedTournamentId]);

  const loadTournaments = async () => {
    try {
      const res = await axios.get('/api/tournaments');
      setTournaments(res.data.data.tournaments);
    } catch (error) {
      // Load tournaments from localStorage
      const mockData = [
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
      
      const localTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]');
      const allTournaments = [...mockData, ...localTournaments];
      setTournaments(allTournaments);
      
      // Auto-select the first tournament if none selected
      if (!selectedTournamentId && allTournaments.length > 0) {
        setSelectedTournamentId(allTournaments[0].id.toString());
      }
    }
  };

  const loadTeamsForTournament = async (tournamentId: string) => {
    try {
      const res = await axios.get(`/api/teams?tournament_id=${tournamentId}`);
      setTeams(res.data.data.teams);
    } catch (error) {
      // Load teams for specific tournament from localStorage
      const tournamentTeams = JSON.parse(localStorage.getItem(`mockTournamentTeams_${tournamentId}`) || '[]');
      setTeams(tournamentTeams);
    }
  };


  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !selectedTournamentId) return;

    try {
      await axios.post('/api/teams', { 
        name: newTeamName, 
        tournament_id: selectedTournamentId,
        captain: teamCaptain,
        members: teamMembers ? teamMembers.split(',').map(m => m.trim()).filter(m => m) : [],
        score: parseInt(teamScore) || Math.floor(Math.random() * 100) + 50
      });
      loadTeamsForTournament(selectedTournamentId);
    } catch (error) {
      // Mock creation with tournament association
      const newTeam = {
        id: Date.now(),
        name: newTeamName,
        captain: teamCaptain || '',
        members: teamMembers ? teamMembers.split(',').map(m => m.trim()).filter(m => m) : [],
        score: parseInt(teamScore) || Math.floor(Math.random() * 100) + 50,
        wins: 0,
        losses: 0,
        points: parseInt(teamScore) || Math.floor(Math.random() * 100) + 50,
        seed: teams.length + 1,
        created_at: new Date().toISOString()
      };
      
      // Save to tournament-specific localStorage
      const existingTeams = JSON.parse(localStorage.getItem(`mockTournamentTeams_${selectedTournamentId}`) || '[]');
      existingTeams.push(newTeam);
      localStorage.setItem(`mockTournamentTeams_${selectedTournamentId}`, JSON.stringify(existingTeams));
      
      // Reload to ensure state consistency
      loadTeamsForTournament(selectedTournamentId);
    }
    
    // Reset form
    setNewTeamName('');
    setTeamCaptain('');
    setTeamMembers('');
    setTeamScore('');
  };


  const handleDeleteTeam = (id: number) => {
    if (!selectedTournamentId) return;
    
    // Remove from state
    const updatedTeams = teams.filter(t => t.id !== id);
    setTeams(updatedTeams);
    
    // Update tournament-specific localStorage
    const localTeams = JSON.parse(localStorage.getItem(`mockTournamentTeams_${selectedTournamentId}`) || '[]');
    const updatedLocalTeams = localTeams.filter((t: any) => t.id !== id);
    localStorage.setItem(`mockTournamentTeams_${selectedTournamentId}`, JSON.stringify(updatedLocalTeams));
  };


  const handleAddMember = (teamId: number) => {
    if (!newMemberName.trim() || !selectedTournamentId) return;

    // Update in state
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        return { ...team, members: [...(team.members || []), newMemberName] };
      }
      return team;
    });
    setTeams(updatedTeams);

    // Update in tournament-specific localStorage
    const localTeams = JSON.parse(localStorage.getItem(`mockTournamentTeams_${selectedTournamentId}`) || '[]');
    const teamIndex = localTeams.findIndex((t: any) => t.id === teamId);
    
    if (teamIndex >= 0) {
      localTeams[teamIndex].members.push(newMemberName);
      localStorage.setItem(`mockTournamentTeams_${selectedTournamentId}`, JSON.stringify(localTeams));
    } else {
      // If team not found, add it
      const teamToSave = updatedTeams.find(t => t.id === teamId);
      if (teamToSave) {
        localTeams.push(teamToSave);
        localStorage.setItem(`mockTournamentTeams_${selectedTournamentId}`, JSON.stringify(localTeams));
      }
    }

    setNewMemberName('');
  };


  const selectedTournament = tournaments.find(t => t.id.toString() === selectedTournamentId);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-10 h-10 text-white" />
        <div>
          <h1 className="text-4xl font-bold text-white">Teams Management</h1>
          {selectedTournament && (
            <p className="text-white opacity-70 mt-1">
              Tournament: {selectedTournament.name} ({selectedTournament.sport_name})
            </p>
          )}
        </div>
      </div>

      {/* Tournament Selector */}
      <div className="mb-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Select Tournament</h2>
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
          >
            <option value="" className="bg-gray-800">Choose a tournament...</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id} className="bg-gray-800">
                {tournament.name} ({tournament.sport_name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedTournamentId && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Team Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 sticky top-8"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Team to Tournament
              </h2>
              <form onSubmit={handleAddTeam} className="space-y-4">
                <div>
                  <label className="block text-white mb-2 text-sm font-semibold">Team Name *</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2 text-sm font-semibold">Team Captain</label>
                  <input
                    type="text"
                    value={teamCaptain}
                    onChange={(e) => setTeamCaptain(e.target.value)}
                    placeholder="Captain name"
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2 text-sm font-semibold">Team Members</label>
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    placeholder="Player 1, Player 2, Player 3"
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2 text-sm font-semibold">Team Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={teamScore}
                    onChange={(e) => setTeamScore(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!newTeamName.trim()}
                  className="w-full gradient-btn text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                >
                  Add Team
                </button>
              </form>
            </motion.div>
          </div>

          {/* Teams List Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Teams ({teams.length})
              </h2>
            </div>
            
            <div className="space-y-4">
              {teams.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-white opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">No Teams Yet</h3>
                    <p className="text-white opacity-70">Add teams to get started with this tournament!</p>
                  </div>
              ) : (
                  teams.map((team, i) => (
                  <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card overflow-hidden"
                  >
                      <div className="p-6 flex justify-between items-center">
                          <div 
                            className="flex-1 cursor-pointer" 
                            onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                          >
                              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                {team.name}
                                {expandedTeamId === team.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-white opacity-60">
                                <span>{team.members?.length || 0} Members</span>
                                <span>Score: {team.score || 0}</span>
                                {team.captain && <span>Captain: {team.captain}</span>}
                              </div>
                          </div>
                          <button 
                              onClick={() => handleDeleteTeam(team.id)}
                              className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-all"
                              title="Delete Team"
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                      </div>

                      <AnimatePresence>
                        {expandedTeamId === team.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black bg-opacity-20 px-6 pb-6"
                          >
                            <div className="mb-4 pt-4 border-t border-white border-opacity-10">
                              <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider opacity-70">Team Members</h4>
                              {team.members && team.members.length > 0 ? (
                                <ul className="space-y-2 mb-4">
                                  {team.members.map((member: string, idx: number) => (
                                    <li key={idx} className="text-white flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                      {member}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-white text-sm opacity-50 italic mb-4">No members yet</p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add member name..."
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg bg-white bg-opacity-10 text-white text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddMember(team.id);
                                }}
                              />
                              <button
                                onClick={() => handleAddMember(team.id)}
                                disabled={!newMemberName.trim()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                  </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

