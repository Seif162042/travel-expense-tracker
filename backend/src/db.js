// backend/src/db.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

export async function testConnection() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("✅ Connected to DB at", res.rows[0].now);
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        throw err;
    }
}
