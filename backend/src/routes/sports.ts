import express from 'express';
import db from '../db';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, rules } = req.body;
    const [result] = await db.execute(
      'INSERT INTO sports (name, rules) VALUES (?, ?)',
      [name, JSON.stringify(rules || null)]
    );
    
    res.json({
      success: true,
      message: `Sport '${name}' created successfully`,
      data: { sport_id: (result as any).insertId, name }
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
    const [sports] = await db.execute('SELECT * FROM sports ORDER BY name');
    
    res.json({
      success: true,
      message: `Retrieved ${(sports as any[]).length} sports`,
      data: { sports }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;