import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db/pool';

const router = Router();

// 生成随机头像颜色
const avatarColors = [
  'bg-indigo-600',
  'bg-rose-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-teal-500',
];

function getRandomColor(): string {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

// 生成头像文字（取昵称前两个字符）
function generateAvatar(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

// 生成用户ID（简单的随机ID）
function generateUserId(): string {
  return 'u_' + Math.random().toString(36).substring(2, 10);
}

// 注册
router.post('/register', async (req: Request, res: Response) => {
  const { name, password } = req.body;

  // 验证
  if (!name || !password) {
    return res.status(400).json({ success: false, error: '昵称和密码不能为空' });
  }

  if (name.length < 2 || name.length > 20) {
    return res.status(400).json({ success: false, error: '昵称长度应在2-20个字符之间' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: '密码至少6位' });
  }

  try {
    // 检查昵称是否已存在
    const existing = await pool.query('SELECT id FROM users WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: '该昵称已被使用' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = generateUserId();
    const avatar = generateAvatar(name);
    const color = getRandomColor();

    const result = await pool.query(
      `INSERT INTO users (id, name, avatar, color, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, avatar, color, created_at`,
      [userId, name, avatar, color, hashedPassword]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req: Request, res: Response) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ success: false, error: '昵称和密码不能为空' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, avatar, color, password, created_at FROM users WHERE name = $1',
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: '用户不存在' });
    }

    const user = result.rows[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: '密码错误' });
    }

    // 返回用户信息（不含密码）
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// 获取当前用户（通过 localStorage 中存储的 userId）
router.get('/me/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, name, avatar, color, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

export default router;
