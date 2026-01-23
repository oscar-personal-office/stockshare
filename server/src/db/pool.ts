import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '54321', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'AcSNetjbsKSbrbjNFMNtgF5rODjkOC9N',
  database: process.env.DB_NAME || 'stock_app',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
