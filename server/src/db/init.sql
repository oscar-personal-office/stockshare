-- 创建数据库（如果不存在）
-- 需要在 psql 中手动运行: CREATE DATABASE stock_app;

-- 板块表
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 股票表（板块中的股票）
CREATE TABLE IF NOT EXISTS board_stocks (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(board_id, symbol)
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL DEFAULT 'bg-indigo-600',
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 股票标记表
CREATE TABLE IF NOT EXISTS stock_markings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  buy_price DECIMAL(12, 2),
  sell_price DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, board_id, symbol)
);

-- 插入默认板块数据（幂等）
INSERT INTO boards (title) VALUES
  ('🛡️ 老万的短线看板'),
  ('🔋 老黄的赛道成长'),
  ('🚀 老曾的重仓观察')
ON CONFLICT (title) DO NOTHING;

-- 插入默认股票数据（幂等）
-- 使用子查询获取 board_id，避免硬编码
INSERT INTO board_stocks (board_id, symbol, name)
SELECT b.id, v.symbol, v.name
FROM (VALUES
  ('🛡️ 老万的短线看板', '600519.SH', '贵州茅台'),
  ('🛡️ 老万的短线看板', '601318.SH', '中国平安'),
  ('🛡️ 老万的短线看板', '600036.SH', '招商银行'),
  ('🔋 老黄的赛道成长', '300750.SZ', '宁德时代'),
  ('🔋 老黄的赛道成长', '002594.SZ', '比亚迪'),
  ('🚀 老曾的重仓观察', '300059.SZ', '东方财富'),
  ('🚀 老曾的重仓观察', '601138.SH', '工业富联')
) AS v(board_title, symbol, name)
JOIN boards b ON b.title = v.board_title
ON CONFLICT (board_id, symbol) DO NOTHING;
