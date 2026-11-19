import { pool } from "../db.js";

export async function findExpensesByUser(userId) {
    const q = await pool.query(
        `SELECT id, user_id, trip_id, description, amount, category, date, end_date, created_at
       FROM expenses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
        [userId]
    );
    return q.rows;
}

export async function findExpensesByUserAndTrip(userId, tripId) {
    const q = await pool.query(
        `SELECT id, user_id, trip_id, description, amount, category, date, end_date, created_at
       FROM expenses
       WHERE user_id = $1 AND trip_id = $2
       ORDER BY created_at DESC`,
        [userId, tripId]
    );
    return q.rows;
}

export async function findUserExpenseDates(id, userId) {
    const q = await pool.query(
        `SELECT trip_id, date as current_date, end_date as current_end_date FROM expenses WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return q.rows[0];
}

export async function createExpense({ userId, tripId, description, amount, category, date, endDate }) {
    const q = await pool.query(
        `INSERT INTO expenses (user_id, trip_id, description, amount, category, date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, trip_id, description, amount, category, date, end_date, created_at`,
        [userId, tripId, description, amount, category, date, endDate]
    );
    return q.rows[0];
}

export async function updateExpense(id, userId, { description, amount, category, date, endDate }) {
    const q = await pool.query(
        `UPDATE expenses
       SET description = COALESCE($2, description),
           amount = COALESCE($3, amount),
           category = COALESCE($4, category),
           date = COALESCE($5, date),
           end_date = COALESCE($6, end_date)
       WHERE id = $1 AND user_id = $7
       RETURNING id, user_id, trip_id, description, amount, category, date, end_date, created_at`,
        [id, description, amount, category, date, endDate, userId]
    );
    return q.rows[0];
}

export async function deleteExpense(id, userId) {
    const q = await pool.query(
        `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, userId]
    );
    return q.rows[0];
}
