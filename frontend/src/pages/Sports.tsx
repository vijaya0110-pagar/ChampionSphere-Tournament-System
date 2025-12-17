import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CircleDot, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sports() {

  const [sports, setSports] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newSport, setNewSport] = useState('');

  useEffect(() => {
    loadSports();
  }, []);



  const loadSports = async () => {
    try {
      const res = await axios.get('/api/sports');
      setSports(res.data.data.sports);
    } catch (error) {
      // Mock data for demo purposes
      const mockData = [
        { id: 1, name: 'Football' },
        { id: 2, name: 'Basketball' },
        { id: 3, name: 'Cricket' },
        { id: 4, name: 'Tennis' },
        { id: 5, name: 'Volleyball' },
        { id: 6, name: 'Baseball' }
      ];
      const localSports = JSON.parse(localStorage.getItem('mockSports') || '[]');
      
      // Merge preventing duplicates
      const allSports = [...mockData];
      localSports.forEach((ls: any) => {
        if (!allSports.find(s => s.id === ls.id)) {
            allSports.push(ls);
        }
      });
      setSports(allSports);
    }
  };

  const handleDeleteSport = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will remove it from the sports list.`)) {
      try {
        await axios.delete(`/api/sports/${id}`);
        loadSports();
      } catch (error) {
        // Mock deletion - remove from localStorage
        const localSports = JSON.parse(localStorage.getItem('mockSports') || '[]');
        const updatedLocalSports = localSports.filter((sport: any) => sport.id !== id);
        localStorage.setItem('mockSports', JSON.stringify(updatedLocalSports));
        
        // Also remove from current state
        setSports(sports.filter(sport => sport.id !== id));
        console.log('Sport deleted:', name);
      }
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/api/sports', { name: newSport });
    } catch (error) {
      // Mock successful creation for demo purposes
      const mockSport = { id: Date.now(), name: newSport };
      
      const existing = JSON.parse(localStorage.getItem('mockSports') || '[]');
      existing.push(mockSport);
      localStorage.setItem('mockSports', JSON.stringify(existing));
      
      // Reload to merge properly
      loadSports(); 
      console.log('Mock sport created:', newSport);
    }
    setShowModal(false);
    setNewSport('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Sports</h1>
        <button
          onClick={() => setShowModal(true)}
          className="gradient-btn text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Sport
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {sports.map((sport: any, i) => (
          <motion.div
            key={sport.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 text-white text-center hover:scale-105 transition cursor-pointer relative"
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSport(sport.id, sport.name);
                }}
                className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all opacity-70 hover:opacity-100"
                title="Delete Sport"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <CircleDot className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold">{sport.name}</h3>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Add New Sport</h2>
            <input
              type="text"
              value={newSport}
              onChange={(e) => setNewSport(e.target.value)}
              placeholder="Sport name (e.g., Football)"
              className="w-full px-4 py-3 rounded-lg mb-4 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                className="flex-1 gradient-btn text-white px-6 py-3 rounded-lg font-semibold"
              >
                Create
              </button>
              <button
                onClick={() => setShowModal(false)}
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
