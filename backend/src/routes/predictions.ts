import express from 'express';
import db from '../db';

const router = express.Router();

router.get('/match/:match_id', async (req, res) => {
  try {
    const [matches] = await db.execute(`
      SELECT m.*,
             t1.id as team1_id, t1.name as team1_name, t1.wins as team1_wins,
             t1.losses as team1_losses, t1.points as team1_points,
             t2.id as team2_id, t2.name as team2_name, t2.wins as team2_wins,
             t2.losses as team2_losses, t2.points as team2_points
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      WHERE m.id = ?
    `, [req.params.match_id]);
    
    if ((matches as any[]).length === 0) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    
    const match = (matches as any[])[0];
    
    const team1 = {
      id: match.team1_id,
      name: match.team1_name,
      wins: match.team1_wins,
      losses: match.team1_losses,
      points: match.team1_points
    };
    
    const team2 = {
      id: match.team2_id,
      name: match.team2_name,
      wins: match.team2_wins,
      losses: match.team2_losses,
      points: match.team2_points
    };
    
    const winRate1 = team1.wins + team1.losses > 0 ? team1.wins / (team1.wins + team1.losses) : 0.5;
    const winRate2 = team2.wins + team2.losses > 0 ? team2.wins / (team2.wins + team2.losses) : 0.5;
    
    const pointDiff = team1.points - team2.points;
    const winRateDiff = winRate1 - winRate2;
    
    let prediction;
    if (pointDiff > 3 || winRateDiff > 0.2) {
      prediction = {
        winner: team1.name,
        confidence: Math.min(60 + Math.abs(pointDiff) * 5 + Math.abs(winRateDiff) * 50, 95),
        analysis: `${team1.name} has a strong advantage with ${team1.points} points vs ${team2.points}. Their ${team1.wins}-${team1.losses} record shows consistent performance.`
      };
    } else if (pointDiff < -3 || winRateDiff < -0.2) {
      prediction = {
        winner: team2.name,
        confidence: Math.min(60 + Math.abs(pointDiff) * 5 + Math.abs(winRateDiff) * 50, 95),
        analysis: `${team2.name} leads with ${team2.points} points vs ${team1.points}. Their superior ${team2.wins}-${team2.losses} record gives them the edge.`
      };
    } else {
      prediction = {
        winner: team1.points >= team2.points ? team1.name : team2.name,
        confidence: 55,
        analysis: `Very close matchup! Both teams are evenly matched with similar records and points. Expect a competitive game.`
      };
    }
    
    const pred_winner_id = prediction.winner === team1.name ? team1.id : team2.id;
    
    await db.execute(
      'INSERT INTO predictions (match_id, predicted_winner_id, confidence_score, analysis) VALUES (?, ?, ?, ?)',
      [req.params.match_id, pred_winner_id, prediction.confidence, prediction.analysis]
    );
    
    res.json({
      success: true,
      message: 'Prediction generated',
      data: { prediction, team1, team2 }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
