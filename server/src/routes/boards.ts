import { Router, Request, Response } from 'express';
import pool from '../db/pool';

const router = Router();

// 获取所有板块（包含股票和标记）
router.get('/', async (req: Request, res: Response) => {
  try {
    const boardsResult = await pool.query(
      'SELECT * FROM boards ORDER BY id'
    );

    const boards = await Promise.all(
      boardsResult.rows.map(async (board) => {
        // 获取板块中的股票
        const stocksResult = await pool.query(
          'SELECT symbol, name FROM board_stocks WHERE board_id = $1',
          [board.id]
        );

        // 获取每只股票的标记
        const stocksWithMarkings = await Promise.all(
          stocksResult.rows.map(async (stock) => {
            const markingsResult = await pool.query(
              `SELECT m.user_id as id, u.name, u.avatar, u.color, m.buy_price, m.sell_price
               FROM stock_markings m
               JOIN users u ON m.user_id = u.id
               WHERE m.board_id = $1 AND m.symbol = $2`,
              [board.id, stock.symbol]
            );

            const markings = markingsResult.rows.map(row => ({
              id: row.id,
              name: row.name,
              avatar: row.avatar,
              color: row.color,
              buyPrice: row.buy_price ? parseFloat(row.buy_price) : null,
              sellPrice: row.sell_price ? parseFloat(row.sell_price) : null,
            }));

            return {
              ...stock,
              markings,
            };
          })
        );

        return {
          ...board,
          stocks: stocksWithMarkings,
        };
      })
    );

    res.json({ success: true, data: boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch boards' });
  }
});

// 创建新板块
router.post('/', async (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO boards (title) VALUES ($1) RETURNING *',
      [title]
    );

    res.json({
      success: true,
      data: { ...result.rows[0], stocks: [] },
    });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ success: false, error: 'Failed to create board' });
  }
});

// 删除板块
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM boards WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ success: false, error: 'Failed to delete board' });
  }
});

// 添加股票到板块
router.post('/:id/stocks', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { symbol, name } = req.body;

  if (!symbol || !name) {
    return res.status(400).json({ success: false, error: 'Symbol and name are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO board_stocks (board_id, symbol, name) VALUES ($1, $2, $3) RETURNING *',
      [id, symbol, name]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Stock already exists in this board' });
    }
    console.error('Error adding stock:', error);
    res.status(500).json({ success: false, error: 'Failed to add stock' });
  }
});

// 从板块删除股票
router.delete('/:id/stocks/:symbol', async (req: Request, res: Response) => {
  const { id, symbol } = req.params;

  try {
    await pool.query(
      'DELETE FROM board_stocks WHERE board_id = $1 AND symbol = $2',
      [id, symbol]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing stock:', error);
    res.status(500).json({ success: false, error: 'Failed to remove stock' });
  }
});

export default router;
