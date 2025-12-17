import express from 'express';
import db from '../db';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, tournament_id } = req.body;
    
    const [teamCount] = await db.execute(
      'SELECT COUNT(*) as count FROM teams WHERE tournament_id = ?',
      [tournament_id]
    );
    
    const [tournamentData] = await db.execute(
      'SELECT max_teams FROM tournaments WHERE id = ?',
      [tournament_id]
    );
    
    if ((tournamentData as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    
    const current = (teamCount as any[])[0].count;
    const max = (tournamentData as any[])[0].max_teams;
    
    if (current >= max) {
      return res.status(400).json({ success: false, message: `Tournament full (max ${max} teams)` });
    }
    
    const seed = current + 1;
    const [result] = await db.execute(
      'INSERT INTO teams (name, tournament_id, seed) VALUES (?, ?, ?)',
      [name, tournament_id, seed]
    );
    
    res.json({
      success: true,
      message: `Team '${name}' registered`,
      data: { team_id: (result as any).insertId, seed }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/players', async (req, res) => {
  try {
    const { name, team_id, position } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO players (name, team_id, position) VALUES (?, ?, ?)',
      [name, team_id, position]
    );
    
    res.json({
      success: true,
      message: `Player '${name}' added`,
      data: { player_id: (result as any).insertId }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [teams] = await db.execute('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    
    if ((teams as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    
    const [players] = await db.execute('SELECT * FROM players WHERE team_id = ?', [req.params.id]);
    
    res.json({
      success: true,
      data: { team: (teams as any[])[0], players }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
