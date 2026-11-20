import { pool } from "../db.js";

export async function findUserIdByEmail(email) {
    const q = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    return q.rows[0];
}

export async function findUserWithPasswordByEmail(email) {
    const q = await pool.query(
        "SELECT id,name,email,password FROM users WHERE email=$1",
        [email]
    );
    return q.rows[0];
}

export async function findUserById(id) {
    const q = await pool.query(
        "SELECT id,name,email,created_at FROM users WHERE id=$1::uuid",
        [id]
    );
    return q.rows[0];
}

export async function createUser(name, email, passwordHash) {
    const q = await pool.query(
        `INSERT INTO users (name, email, password)
       VALUES ($1,$2,$3)
       RETURNING id,name,email,created_at`,
        [name, email, passwordHash]
    );
    return q.rows[0];
}
