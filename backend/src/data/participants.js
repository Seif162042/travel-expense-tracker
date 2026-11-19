import { pool } from "../db.js";

export async function findParticipantRole(tripId, userId) {
    const q = await pool.query(
        `SELECT role FROM trip_participants WHERE trip_id = $1 AND user_id = $2`,
        [tripId, userId]
    );
    return q.rows[0];
}

export async function findParticipant(tripId, userId) {
    const q = await pool.query(
        `SELECT * FROM trip_participants WHERE trip_id = $1 AND user_id = $2`,
        [tripId, userId]
    );
    return q.rows[0];
}

export async function findParticipantPermissions(tripId, userId) {
    const q = await pool.query(
        `SELECT role, permissions FROM trip_participants
       WHERE trip_id = $1 AND user_id = $2`,
        [tripId, userId]
    );
    return q.rows[0];
}

export async function findTripParticipants(tripId) {
    const q = await pool.query(
        `SELECT tp.*, u.name, u.email
       FROM trip_participants tp
       JOIN users u ON u.id = tp.user_id
       WHERE tp.trip_id = $1
       ORDER BY tp.joined_at`,
        [tripId]
    );
    return q.rows;
}

export async function findParticipatingTrips(userId) {
    const q = await pool.query(
        `SELECT t.*, tp.role, tp.joined_at
       FROM trips t
       JOIN trip_participants tp ON tp.trip_id = t.id
       WHERE tp.user_id = $1
       ORDER BY t.start_date DESC
       LIMIT 50`,
        [userId]
    );
    return q.rows;
}

export async function countOwners(tripId) {
    const q = await pool.query(
        `SELECT COUNT(*) FROM trip_participants WHERE trip_id = $1 AND role = 'owner'`,
        [tripId]
    );
    return parseInt(q.rows[0].count);
}

export async function addParticipant(tripId, userId, role, permissions) {
    const q = await pool.query(
        `INSERT INTO trip_participants (trip_id, user_id, role, permissions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
        [tripId, userId, role, JSON.stringify(permissions)]
    );
    return q.rows[0];
}

export async function updateParticipant(tripId, userId, { role, permissions }) {
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (role) {
        updates.push(`role = $${paramCount++}`);
        values.push(role);
    }

    if (permissions) {
        updates.push(`permissions = $${paramCount++}`);
        values.push(JSON.stringify(permissions));
    }

    values.push(tripId, userId);

    const q = await pool.query(
        `UPDATE trip_participants
       SET ${updates.join(', ')}
       WHERE trip_id = $${paramCount++} AND user_id = $${paramCount++}
       RETURNING *`,
        values
    );
    return q.rows[0];
}

export async function removeParticipant(tripId, userId) {
    const q = await pool.query(
        `DELETE FROM trip_participants WHERE trip_id = $1 AND user_id = $2 RETURNING *`,
        [tripId, userId]
    );
    return q.rows[0];
}
