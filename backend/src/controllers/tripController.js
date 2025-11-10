/**
 * Trip Controller
 */
import { pool } from "../db.js";
import { HTTP_STATUS } from "../config/constants.js";
import { errorResponse } from "../utils/responseHelpers.js";

/** Get public feed */
export const getFeedTrips = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const q = await pool.query(
      `SELECT t.id,t.user_id,u.name AS user_name,t.title,t.destination,
              t.start_date,t.end_date,t.budget,t.created_at
       FROM trips t
       JOIN users u ON u.id=t.user_id
       WHERE t.user_id != $1
       ORDER BY t.created_at DESC LIMIT 50`,
      [user_id]
    );

    return res.status(HTTP_STATUS.OK).json({ success: true, data: q.rows });
  } catch (err) {
    console.error("Error fetching feed:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch feed");
  }
};

/** Get user's trips */
export const getTrips = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const q = await pool.query(
      `SELECT id,user_id,title,destination,start_date,end_date,budget,created_at
         FROM trips
         WHERE user_id=$1
         ORDER BY created_at DESC LIMIT 50`,
      [user_id]
    );

    return res.status(HTTP_STATUS.OK).json({ success: true, data: q.rows });
  } catch (err) {
    console.error("Error fetching trips:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trips");
  }
};

/** Get trip by id */
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query(
      `SELECT id,user_id,title,destination,start_date,end_date,budget,created_at
       FROM trips WHERE id=$1::uuid`,
      [id]
    );
    if (!q.rows.length)
      return res.status(404).json({ message: "Trip not found" });

    return res.status(HTTP_STATUS.OK).json({ success: true, data: q.rows[0] });
  } catch (err) {
    console.error("Error in getTripById:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trip");
  }
};

/** Create trip */
export const createTrip = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { title, destination, start_date, end_date, budget } = req.body;
    if (!destination || !start_date || !end_date)
      return res.status(400).json({ message: "All fields required" });

    const newStart = new Date(start_date);
    const newEnd = new Date(end_date);
    if (newEnd < newStart)
      return res.status(400).json({ message: "End date must be after start date" });

    // overlap check
    const overlap = await pool.query(
      `SELECT id FROM trips WHERE user_id=$1
         AND NOT ($3::date <= start_date OR $2::date >= end_date)`,
      [user_id, start_date, end_date]
    );
    if (overlap.rows.length)
      return res.status(400).json({ message: "Trip overlaps existing one" });

    const result = await pool.query(
      `INSERT INTO trips (user_id,title,destination,start_date,end_date,budget)
       VALUES ($1,$2,$3,$4::date,$5::date,$6)
       RETURNING id,user_id,title,destination,start_date,end_date,budget,created_at`,
      [user_id, title ?? destination, destination, start_date, end_date, budget ?? null]
    );

    const trip = result.rows[0];
    // automatically add creator as owner in participants
    await pool.query(
      `INSERT INTO trip_participants (trip_id,user_id,role,permissions)
       VALUES ($1,$2,'owner',
         '{"can_edit_trip": true, "can_delete_trip": true, "can_add_expenses": true,
           "can_edit_expenses": true, "can_delete_expenses": true, "can_manage_participants": true}')
       ON CONFLICT DO NOTHING`,
      [trip.id, user_id]
    );

    return res.status(201).json({ success: true, data: trip });
  } catch (err) {
    console.error("Error creating trip:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to create trip");
  }
};

/** Update trip */
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const existing = await pool.query(
      "SELECT * FROM trips WHERE id=$1 AND user_id=$2",
      [id, user_id]
    );
    if (!existing.rows.length)
      return res.status(404).json({ message: "Trip not found or not yours" });

    const e = existing.rows[0];
    const newStart = req.body.start_date ?? e.start_date;
    const newEnd = req.body.end_date ?? e.end_date;
    if (new Date(newEnd) < new Date(newStart))
      return res.status(400).json({ message: "End date must be after start date" });

    const result = await pool.query(
      `UPDATE trips SET
         title=$2,destination=$3,start_date=$4::date,end_date=$5::date,budget=$6
       WHERE id=$1 AND user_id=$7
       RETURNING id,user_id,title,destination,start_date,end_date,budget,created_at`,
      [
        id,
        req.body.title ?? e.title,
        req.body.destination ?? e.destination,
        newStart,
        newEnd,
        req.body.budget ?? e.budget,
        user_id,
      ]
    );
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error updating trip:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update trip");
  }
};

/** Delete trip */
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const del = await pool.query(
      "DELETE FROM trips WHERE id=$1::uuid AND user_id=$2 RETURNING id",
      [id, user_id]
    );
    if (!del.rows.length)
      return res.status(404).json({ message: "Trip not found or not yours" });

    return res.status(HTTP_STATUS.OK).json({ success: true, deleted: del.rows[0].id });
  } catch (err) {
    console.error("Error deleting trip:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete trip");
  }
};

export default { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
