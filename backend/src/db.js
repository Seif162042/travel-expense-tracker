import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required by Neon
});

export async function testConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ Connected to Neon at', res.rows[0].now);
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
}
