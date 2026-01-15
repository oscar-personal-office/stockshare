import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardsRouter from './routes/boards';
import stocksRouter from './routes/stocks';
import markingsRouter from './routes/markings';
import authRouter from './routes/auth';
import pool from './db/pool';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/markings', markingsRouter);

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    // Check database connection
    const result = await pool.query('SELECT NOW() as time');
    const dbTime = result.rows[0].time;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        serverTime: dbTime
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    console.log('Please make sure the database exists. Run:');
    console.log('  psql -U postgres -c "CREATE DATABASE stock_app;"');
    process.exit(1);
  }
}

startServer();
