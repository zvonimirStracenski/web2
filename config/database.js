import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL!');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

pool.query('SELECT NOW()')

export default pool;