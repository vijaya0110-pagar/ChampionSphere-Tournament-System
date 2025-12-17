

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trophy, CircleDot, Check, Plus, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateTournament() {
  const navigate = useNavigate();

  const [sports, setSports] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    sport_id: '',
    format: 'single_elimination',
    start_date: '',
    end_date: '',
    max_teams: 16
  });
  

  const [teams, setTeams] = useState<any[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCaptain, setNewTeamCaptain] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>(['']);
  const [newTeamScore, setNewTeamScore] = useState<number>(0);
  const [showAddTeam, setShowAddTeam] = useState(false);


  useEffect(() => {
    loadSports();
  }, []);



  const loadSports = async () => {
    try {
      // Try to connect to real MySQL backend first
      console.log('🔗 Attempting to connect to MySQL backend...');
      const res = await axios.get('http://localhost:3001/api/sports');
      
      if (res.data.success) {
        console.log('✅ Connected to MySQL database! Sports loaded from database.');
        setSports(res.data.data.sports);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error: any) {
      console.warn('Sucessfully created the tournament!', error.message);
    
      // Mock data for demo purposes when backend is not available
      const mockData = [
        { id: 1, name: 'Football' },
        { id: 2, name: 'Basketball' },
        { id: 3, name: 'Cricket' },
        { id: 4, name: 'Tennis' },
        { id: 5, name: 'Volleyball' },
        { id: 6, name: 'Baseball' }
      ];
      
      const localSports = JSON.parse(localStorage.getItem('mockSports') || '[]');
      // Merge unique
      const allSports = [...mockData];
      localSports.forEach((ls: any) => {
        if (!allSports.find(s => s.id === ls.id)) {
            allSports.push(ls);
        }
      });
      setSports(allSports);
    }
  };





  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;
    
    const validMembers = newTeamMembers.filter(member => member.trim() !== '');
    
    const newTeam = {
      id: Date.now(),
      name: newTeamName.trim(),
      captain: newTeamCaptain.trim(),
      members: validMembers,
      score: newTeamScore,
      seed: teams.length + 1
    };
    
    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamCaptain('');
    setNewTeamMembers(['']);
    setNewTeamScore(0);
    setShowAddTeam(false);
  };

  const addMemberField = () => {
    setNewTeamMembers([...newTeamMembers, '']);
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...newTeamMembers];
    updated[index] = value;
    setNewTeamMembers(updated);
  };

  const removeMember = (index: number) => {
    if (newTeamMembers.length > 1) {
      setNewTeamMembers(newTeamMembers.filter((_, i) => i !== index));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Tournament...';

    try {
      // Try to create tournament in real MySQL database first
      console.log('💾 Attempting to create tournament in MySQL database...');
      const res = await axios.post('http://localhost:3001/api/tournaments', formData);
      
      if (res.data.success) {
        const tournamentId = res.data.data.tournament_id;
        console.log('✅ Tournament created successfully in MySQL database! ID:', tournamentId);
        
        // Also create teams if provided
        if (teams.length > 0) {
          console.log('👥 Creating teams in database...');
          for (const team of teams) {
            try {
              await axios.post('http://localhost:3001/api/teams', {
                name: team.name,
                tournament_id: tournamentId,
                seed: team.seed,
                points: team.score || 0
              });
            } catch (teamError) {
              console.warn('⚠️ Failed to create team in database:', team.name, teamError);
            }
          }
        }
        
        alert('🎉 Tournament created successfully in MySQL database!');
        navigate(`/tournaments/${tournamentId}`);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error: any) {
      console.warn('⚠️ MySQL backend not available, using mock data for demo:', error.message);
      
      // Mock successful creation for demo purposes
      const mockTournamentId = Math.floor(Math.random() * 1000) + 1;
      console.log('📝 Mock tournament created:', formData);
      
      // Store tournament in localStorage for demo purposes
      const newTournament = {
        id: mockTournamentId,
        name: formData.name,
        sport_name: sports.find(s => s.id.toString() === formData.sport_id)?.name || 'Unknown Sport',
        status: 'upcoming',
        start_date: formData.start_date,
        end_date: formData.end_date,
        format: formData.format
      };
      
      const existingTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]');
      existingTournaments.push(newTournament);
      localStorage.setItem('mockTournaments', JSON.stringify(existingTournaments));
      
      // Store initial teams for this tournament
      if (teams.length > 0) {
        localStorage.setItem(`mockTournamentTeams_${mockTournamentId}`, JSON.stringify(teams));
      }
      
      alert('📝 Tournament created locally');
      navigate(`/tournaments/${mockTournamentId}`);
    } finally {
      // Restore button state
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-white mb-6 flex items-center gap-2 hover:opacity-80"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2 font-semibold">Tournament Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Summer Championship 2025"
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60"
            />
          </div>


          <div>
            <label className="block text-white mb-4 font-semibold text-lg">Select Sport</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sports.map((sport: any) => (
                <motion.div
                  key={sport.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({...formData, sport_id: sport.id})}
                  className={`
                    glass-card p-4 text-center cursor-pointer transition-all duration-200
                    ${formData.sport_id === sport.id 
                      ? 'ring-2 ring-white bg-white bg-opacity-20' 
                      : 'hover:bg-white hover:bg-opacity-10'
                    }
                  `}
                >
                  <div className="relative">
                    <CircleDot className="w-12 h-12 mx-auto mb-3 text-white" />
                    {formData.sport_id === sport.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm">{sport.name}</h3>
                </motion.div>
              ))}
            </div>
            {!formData.sport_id && (
              <p className="text-white text-opacity-60 text-sm mt-2">Please select a sport</p>
            )}
          </div>

          <div>
            <label className="block text-white mb-2 font-semibold">Tournament Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({...formData, format: e.target.value})}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
            >
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
              <option value="round_robin">Round Robin</option>
              <option value="swiss_system">Swiss System</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2 font-semibold">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2 font-semibold">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
              />
            </div>
          </div>


          <div>
            <label className="block text-white mb-2 font-semibold">Maximum Teams</label>
            <input
              type="number"
              min="2"
              max="128"
              value={formData.max_teams}
              onChange={(e) => setFormData({...formData, max_teams: parseInt(e.target.value)})}
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
            />
          </div>

          {/* Teams Management Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-white font-semibold">Initial Teams</label>
              <button
                type="button"
                onClick={() => setShowAddTeam(true)}
                className="gradient-btn text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Team
              </button>
            </div>
            

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {teams.length === 0 ? (
                <p className="text-white text-opacity-60 text-sm">No teams added yet. Add some teams to get started!</p>
              ) : (
                teams.map((team, i) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white bg-opacity-10 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="w-5 h-5 text-white" />
                          <div>
                            <div className="text-white font-semibold">{team.name}</div>
                            <div className="text-white text-opacity-60 text-sm">Seed #{team.seed} • Score: {team.score}</div>
                          </div>
                        </div>
                        <div className="text-white text-opacity-80 text-sm">
                          <div><strong>Captain:</strong> {team.captain || 'Not specified'}</div>
                          {team.members && team.members.length > 0 && (
                            <div><strong>Members:</strong> {team.members.join(', ')}</div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTeams(teams.filter(t => t.id !== team.id))}
                        className="text-red-400 hover:text-red-300 text-sm ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full gradient-btn text-white px-6 py-4 rounded-lg text-lg font-bold"
          >
            Create Tournament
          </button>

        </form>
      </motion.div>
      

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add Team Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Team Name *</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Captain Name</label>
                <input
                  type="text"
                  value={newTeamCaptain}
                  onChange={(e) => setNewTeamCaptain(e.target.value)}
                  placeholder="Enter captain name"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Team Members</label>
                <div className="space-y-2">
                  {newTeamMembers.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={member}
                        onChange={(e) => updateMember(index, e.target.value)}
                        placeholder={`Member ${index + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg bg-white bg-opacity-20 text-white"
                      />
                      {newTeamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMemberField}
                    className="w-full px-3 py-2 border-2 border-dashed border-white border-opacity-30 text-white rounded-lg hover:border-opacity-50 transition"
                  >
                    + Add Another Member
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Initial Team Score</label>
                <input
                  type="number"
                  min="0"
                  value={newTeamScore}
                  onChange={(e) => setNewTeamScore(parseInt(e.target.value) || 0)}
                  placeholder="Enter initial score"
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white"
                />
                <p className="text-white text-opacity-60 text-xs mt-1">Used for AI predictions</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleAddTeam} 
                disabled={!newTeamName.trim()}
                className="flex-1 gradient-btn text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Add Team
              </button>
              <button 
                onClick={() => {
                  setShowAddTeam(false);
                  setNewTeamName('');
                  setNewTeamCaptain('');
                  setNewTeamMembers(['']);
                  setNewTeamScore(0);
                }} 
                className="flex-1 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg"
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
