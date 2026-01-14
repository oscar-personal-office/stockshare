-- 创建数据库（如果不存在）
-- 需要在 psql 中手动运行: CREATE DATABASE stock_app;

-- 板块表
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
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

-- 插入默认板块数据
INSERT INTO boards (title) VALUES
  ('🛡️ 老万的短线看板'),
  ('🔋 老黄的赛道成长'),
  ('🚀 老曾的重仓观察')
ON CONFLICT DO NOTHING;

-- 插入默认股票数据
INSERT INTO board_stocks (board_id, symbol, name) VALUES
  (1, '600519.SH', '贵州茅台'),
  (1, '601318.SH', '中国平安'),
  (1, '600036.SH', '招商银行'),
  (2, '300750.SZ', '宁德时代'),
  (2, '002594.SZ', '比亚迪'),
  (3, '300059.SZ', '东方财富'),
  (3, '601138.SH', '工业富联')
ON CONFLICT DO NOTHING;
