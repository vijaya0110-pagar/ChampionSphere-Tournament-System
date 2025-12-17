import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sportsRoutes from './routes/sports';
import tournamentsRoutes from './routes/tournaments';
import teamsRoutes from './routes/teams';
import matchesRoutes from './routes/matches';
import predictionsRoutes from './routes/predictions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/sports', sportsRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/predictions', predictionsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend API running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.MYSQL_DATABASE}`);
});
