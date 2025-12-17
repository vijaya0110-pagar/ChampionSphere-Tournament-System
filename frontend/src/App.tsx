





import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Sports from './pages/Sports';
import Tournaments from './pages/Tournaments';
import Teams from './pages/Teams';
import TournamentDetail from './pages/TournamentDetail';
import CreateTournament from './pages/CreateTournament';
import { Trophy } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <nav className="glass-card mx-4 mt-4 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">


            <Link to="/" className="flex items-center gap-2 text-white text-2xl font-bold hover:opacity-80">
              <Trophy className="w-8 h-8" />
              Sports Tournament System
            </Link>





            <div className="flex gap-6">
              <Link to="/" className="text-white hover:text-blue-200 transition font-semibold">Home</Link>
              <Link to="/sports" className="text-white hover:text-blue-200 transition font-semibold">Sports</Link>
              <Link to="/tournaments" className="text-white hover:text-blue-200 transition font-semibold">Tournaments</Link>
              <Link to="/teams" className="text-white hover:text-blue-200 transition font-semibold">Teams</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">





          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/create" element={<CreateTournament />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
