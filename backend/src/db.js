// backend/src/db.js
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

// Keep Postgres types as strings (avoid timezone shifts)
pg.types.setTypeParser(1082, v => v); // DATE -> 'YYYY-MM-DD'
pg.types.setTypeParser(1114, v => v); // TIMESTAMP WITHOUT TIME ZONE
pg.types.setTypeParser(1184, v => v); // TIMESTAMPTZ

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },   // Neon requires SSL
    max: 10,                              // sensible default on Render Free
    idleTimeoutMillis: 30_000,            // close idle clients after 30s
    connectionTimeoutMillis: 10_000,      // fail fast if DB can't be reached
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

// Graceful shutdown (Render restarts, deploys, SIGINT, SIGTERM)
const shutdown = async (signal) => {
    try {
        console.log(`\n${signal} received: closing DB pool…`);
        await pool.end();
        console.log("✅ DB pool closed.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Error closing DB pool:", e);
        process.exit(1);
    }
};
["SIGINT", "SIGTERM"].forEach(sig => process.on(sig, () => shutdown(sig)));
