import express from 'express';
import db from '../db';

const router = express.Router();

router.post('/brackets/:tournament_id', async (req, res) => {
  try {
    const tid = req.params.tournament_id;
    
    const [tournaments] = await db.execute('SELECT * FROM tournaments WHERE id = ?', [tid]);
    if ((tournaments as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }
    
    const tournament = (tournaments as any[])[0];
    const [teams] = await db.execute('SELECT * FROM teams WHERE tournament_id = ? ORDER BY seed', [tid]);
    const teamList = teams as any[];
    
    if (teamList.length < 2) {
      return res.status(400).json({ success: false, message: 'Need at least 2 teams' });
    }
    
    const matches = [];
    
    if (tournament.format === 'single_elimination') {
      for (let i = 0; i < teamList.length; i += 2) {
        if (i + 1 < teamList.length) {
          matches.push({
            round: 1,
            match_number: Math.floor(i / 2) + 1,
            team1_id: teamList[i].id,
            team2_id: teamList[i + 1].id
          });
        }
      }
    } else if (tournament.format === 'round_robin') {
      let matchNum = 1;
      for (let i = 0; i < teamList.length; i++) {
        for (let j = i + 1; j < teamList.length; j++) {
          matches.push({
            round: 1,
            match_number: matchNum++,
            team1_id: teamList[i].id,
            team2_id: teamList[j].id
          });
        }
      }
    }
    
    for (const m of matches) {
      await db.execute(
        'INSERT INTO matches (tournament_id, round, match_number, team1_id, team2_id) VALUES (?, ?, ?, ?, ?)',
        [tid, m.round, m.match_number, m.team1_id, m.team2_id]
      );
    }
    
    res.json({
      success: true,
      message: `Generated ${matches.length} matches`,
      data: { matches_created: matches.length }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/tournament/:tournament_id', async (req, res) => {
  try {
    const [matches] = await db.execute(`
      SELECT m.*,
             t1.name as team1_name, t2.name as team2_name,
             w.name as winner_name
      FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams w ON m.winner_id = w.id
      WHERE m.tournament_id = ?
      ORDER BY m.round, m.match_number
    `, [req.params.tournament_id]);
    
    res.json({
      success: true,
      data: { matches }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/score', async (req, res) => {
  try {
    const { match_id, team1_score, team2_score } = req.body;
    
    const [matches] = await db.execute('SELECT * FROM matches WHERE id = ?', [match_id]);
    if ((matches as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    const match = (matches as any[])[0];
    const winner_id = team1_score > team2_score ? match.team1_id : match.team2_id;
    const loser_id = team1_score > team2_score ? match.team2_id : match.team1_id;
    
    await db.execute(
      "UPDATE matches SET team1_score = ?, team2_score = ?, winner_id = ?, status = 'completed' WHERE id = ?",
      [team1_score, team2_score, winner_id, match_id]
    );
    
    await db.execute('UPDATE teams SET wins = wins + 1, points = points + 3 WHERE id = ?', [winner_id]);
    await db.execute('UPDATE teams SET losses = losses + 1 WHERE id = ?', [loser_id]);
    
    res.json({
      success: true,
      message: 'Score updated',
      data: { match_id, winner_id }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;