import { pool } from "../db.js";

export async function findFeedTrips(userId) {
    const q = await pool.query(
        `SELECT t.id,t.user_id,u.name AS user_name,t.title,t.destination,
              t.start_date,t.end_date,t.budget,t.created_at
       FROM trips t
       JOIN users u ON u.id=t.user_id
       WHERE t.user_id != $1
       ORDER BY t.created_at DESC LIMIT 50`,
        [userId]
    );
    return q.rows;
}

export async function findTripsByUser(userId) {
    const q = await pool.query(
        `SELECT id,user_id,title,destination,start_date,end_date,budget,created_at
         FROM trips
         WHERE user_id=$1
         ORDER BY created_at DESC LIMIT 50`,
        [userId]
    );
    return q.rows;
}

export async function findTripById(id) {
    const q = await pool.query(
        `SELECT id,user_id,title,destination,start_date,end_date,budget,created_at
       FROM trips WHERE id=$1::uuid`,
        [id]
    );
    return q.rows[0];
}

export async function findTripOwnerId(id) {
    const q = await pool.query(`SELECT user_id FROM trips WHERE id = $1`, [id]);
    return q.rows[0]?.user_id;
}

export async function findUserTrip(id, userId) {
    const q = await pool.query("SELECT * FROM trips WHERE id=$1 AND user_id=$2", [id, userId]);
    return q.rows[0];
}

export async function findUserTripDates(id, userId) {
    const q = await pool.query(
        `SELECT start_date, end_date FROM trips WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return q.rows[0];
}

export async function findOverlappingTrip(userId, startDate, endDate) {
    const q = await pool.query(
        `SELECT id FROM trips WHERE user_id=$1
         AND NOT ($3::date <= start_date OR $2::date >= end_date)`,
        [userId, startDate, endDate]
    );
    return q.rows[0];
}

export async function createTripWithOwner({ userId, title, destination, startDate, endDate, budget }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query(
            `INSERT INTO trips (user_id,title,destination,start_date,end_date,budget)
         VALUES ($1,$2,$3,$4::date,$5::date,$6)
         RETURNING id,user_id,title,destination,start_date,end_date,budget,created_at`,
            [userId, title, destination, startDate, endDate, budget]
        );

        const trip = result.rows[0];
        // automatically add creator as owner in participants
        await client.query(
            `INSERT INTO trip_participants (trip_id,user_id,role,permissions)
         VALUES ($1,$2,'owner',
           '{"can_edit_trip": true, "can_delete_trip": true, "can_add_expenses": true,
             "can_edit_expenses": true, "can_delete_expenses": true, "can_manage_participants": true}')
         ON CONFLICT DO NOTHING`,
            [trip.id, userId]
        );
        await client.query("COMMIT");
        return trip;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

export async function updateTrip(id, userId, { title, destination, startDate, endDate, budget }) {
    const q = await pool.query(
        `UPDATE trips SET
         title=$2,destination=$3,start_date=$4::date,end_date=$5::date,budget=$6
       WHERE id=$1 AND user_id=$7
       RETURNING id,user_id,title,destination,start_date,end_date,budget,created_at`,
        [id, title, destination, startDate, endDate, budget, userId]
    );
    return q.rows[0];
}

export async function deleteTrip(id, userId) {
    const q = await pool.query(
        "DELETE FROM trips WHERE id=$1::uuid AND user_id=$2 RETURNING id",
        [id, userId]
    );
    return q.rows[0];
}
