import { Router, Request, Response } from 'express';
import pool from '../db/pool';

const router = Router();

// 获取用户列表 (必须在 /:boardId/:symbol 之前)
router.get('/users/all', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// 获取当前用户（模拟 - 返回默认用户）(必须在 /:boardId/:symbol 之前)
router.get('/users/me', async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = 'me'");
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// 获取股票的所有标记
router.get('/:boardId/:symbol', async (req: Request, res: Response) => {
  const { boardId, symbol } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, u.name, u.avatar, u.color
       FROM stock_markings m
       JOIN users u ON m.user_id = u.id
       WHERE m.board_id = $1 AND m.symbol = $2
       ORDER BY m.created_at DESC`,
      [boardId, symbol]
    );

    const markings = result.rows.map(row => ({
      id: row.user_id,
      name: row.name,
      avatar: row.avatar,
      color: row.color,
      buyPrice: row.buy_price ? parseFloat(row.buy_price) : null,
      sellPrice: row.sell_price ? parseFloat(row.sell_price) : null,
    }));

    res.json({ success: true, data: markings });
  } catch (error) {
    console.error('Error fetching markings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch markings' });
  }
});

// 保存或更新用户标记
router.post('/', async (req: Request, res: Response) => {
  const { userId, boardId, symbol, buyPrice, sellPrice } = req.body;

  if (!userId || !boardId || !symbol) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // 如果买入价和卖出价都为空，则删除标记
    if (!buyPrice && !sellPrice) {
      await pool.query(
        `DELETE FROM stock_markings WHERE user_id = $1 AND board_id = $2 AND symbol = $3`,
        [userId, boardId, symbol]
      );
      return res.json({ success: true, message: 'Marking removed' });
    }

    // 使用 UPSERT 保存或更新标记
    const result = await pool.query(
      `INSERT INTO stock_markings (user_id, board_id, symbol, buy_price, sell_price, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, board_id, symbol)
       DO UPDATE SET buy_price = $4, sell_price = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, boardId, symbol, buyPrice || null, sellPrice || null]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving marking:', error);
    res.status(500).json({ success: false, error: 'Failed to save marking' });
  }
});

// 删除用户标记
router.delete('/:boardId/:symbol/:userId', async (req: Request, res: Response) => {
  const { boardId, symbol, userId } = req.params;

  try {
    await pool.query(
      `DELETE FROM stock_markings WHERE user_id = $1 AND board_id = $2 AND symbol = $3`,
      [userId, boardId, symbol]
    );
    res.json({ success: true, message: 'Marking deleted' });
  } catch (error) {
    console.error('Error deleting marking:', error);
    res.status(500).json({ success: false, error: 'Failed to delete marking' });
  }
});

export default router;
