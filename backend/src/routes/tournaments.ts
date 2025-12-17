import express from 'express';
import db from '../db';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, sport_id, format, start_date, end_date, max_teams } = req.body;
    
    const [result] = await db.execute(
      `INSERT INTO tournaments (name, sport_id, format, start_date, end_date, max_teams)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, sport_id, format, start_date, end_date, max_teams || 16]
    );
    
    res.json({
      success: true,
      message: `Tournament '${name}' created successfully`,
      data: { tournament_id: (result as any).insertId, format }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const [tournaments] = await db.execute(`
      SELECT t.*, s.name as sport_name
      FROM tournaments t
      JOIN sports s ON t.sport_id = s.id
      ORDER BY t.created_at DESC
    `);
    
    res.json({
      success: true,
      message: `Retrieved ${(tournaments as any[]).length} tournaments`,
      data: { tournaments }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [tournaments] = await db.execute(
      `SELECT t.*, s.name as sport_name
       FROM tournaments t
       JOIN sports s ON t.sport_id = s.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    
    if ((tournaments as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }
    
    const [teams] = await db.execute(
      'SELECT * FROM teams WHERE tournament_id = ? ORDER BY points DESC, wins DESC',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Tournament details retrieved',
      data: { 
        tournament: (tournaments as any[])[0],
        teams
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id/analytics', async (req, res) => {
  try {
    const [standings] = await db.execute(`
      SELECT t.id, t.name, t.wins, t.losses, t.points,
             (SELECT COUNT(*) FROM players WHERE team_id = t.id) as player_count
      FROM teams t
      WHERE t.tournament_id = ?
      ORDER BY t.points DESC, t.wins DESC
    `, [req.params.id]);
    
    const [matchStats] = await db.execute(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM matches
      WHERE tournament_id = ?
    `, [req.params.id]);
    
    const stats = (matchStats as any[])[0];
    
    res.json({
      success: true,
      message: 'Analytics retrieved',
      data: {
        standings,
        total_matches: stats.total,
        completed_matches: stats.completed,
        pending_matches: stats.total - stats.completed
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;