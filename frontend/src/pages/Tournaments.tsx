
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trophy, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Tournaments() {

  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    loadTournaments();
  }, []);




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

  const loadTournaments = async () => {
    try {
      const res = await axios.get('/api/tournaments');
      setTournaments(res.data.data.tournaments);
    } catch (error) {
      // Mock data for demo purposes + localStorage tournaments
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
      
      // Add tournaments from localStorage
      const localTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]');
      
      // Calculate dynamic status for each tournament
      const tournamentsWithStatus = [...mockData, ...localTournaments].map(tournament => ({
        ...tournament,
        status: calculateTournamentStatus(tournament.start_date, tournament.end_date)
      }));
      
      setTournaments(tournamentsWithStatus);
    }
  };


  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-green-500';
    if (status === 'completed') return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  const handleDeleteTournament = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await axios.delete(`/api/tournaments/${id}`);
        loadTournaments();
      } catch (error) {
        // Mock deletion
        const updatedTournaments = tournaments.filter(t => t.id !== id);
        setTournaments(updatedTournaments);
        
        // Remove from localStorage
        const localTournaments = JSON.parse(localStorage.getItem('mockTournaments') || '[]');
        const updatedLocalTournaments = localTournaments.filter((t: any) => t.id !== id);
        localStorage.setItem('mockTournaments', JSON.stringify(updatedLocalTournaments));
        
        console.log('Tournament deleted:', id);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Tournaments</h1>
        <Link
          to="/tournaments/create"
          className="gradient-btn text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Tournament
        </Link>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament: any, i) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative group"
          >
            <Link to={`/tournaments/${tournament.id}`}>
              <div className="glass-card p-6 text-white hover:scale-105 transition">
                <div className="flex items-start justify-between mb-4">
                  <Trophy className="w-8 h-8" />
                  <span className={`${getStatusColor(tournament.status)} px-3 py-1 rounded-full text-xs font-semibold`}>
                    {tournament.status}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{tournament.name}</h3>
                <p className="text-sm opacity-80 mb-4">{tournament.sport_name}</p>
                
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <Calendar className="w-4 h-4" />
                  <span>{tournament.start_date || 'Date TBD'}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                  <div className="text-sm">
                    <span className="font-semibold">Format:</span> {tournament.format.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteTournament(tournament.id, e)}
              className="absolute top-3 right-3 p-2 rounded-full bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/40"
              title="Delete Tournament"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="glass-card p-12 text-center text-white">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Tournaments Yet</h2>
          <p className="opacity-70 mb-6">Create your first tournament to get started!</p>
          <Link
            to="/tournaments/create"
            className="gradient-btn text-white px-6 py-3 rounded-lg inline-block"
          >
            Create Tournament
          </Link>
        </div>
      )}
    </div>
  );
}