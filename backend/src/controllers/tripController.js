// backend/src/controllers/tripController.js
import { pool } from "../db.js";
import { HTTP_STATUS } from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";

// === GET /api/trips/feed ===
export const getFeedTrips = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const q = await pool.query(
      `SELECT t.id, t.user_id, u.name AS user_name, t.title, t.destination,
              t.start_date, t.end_date, t.budget, t.created_at
         FROM trips t
         JOIN users u ON u.id = t.user_id
         WHERE t.user_id != $1
         ORDER BY t.created_at DESC
         LIMIT 50`,
      [user_id]
    );

    return res.status(HTTP_STATUS.OK).json(q.rows);
  } catch (err) {
    console.error("Error fetching feed:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch feed");
  }
};

// === GET /api/trips ===
export const getTrips = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const q = await pool.query(
      `SELECT id, user_id, title, destination, start_date, end_date, budget, created_at
         FROM trips
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
      [user_id]
    );

    return res.status(HTTP_STATUS.OK).json(q.rows);
  } catch (err) {
    console.error("Error fetching user trips:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trips");
  }
};

// === GET /api/trips/:id ===
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await pool.query(
      `SELECT id, user_id, title, destination, start_date, end_date, budget, created_at
         FROM trips
         WHERE id = $1::uuid`,
      [id]
    );
    if (!q.rows.length) return res.status(404).json({ message: "Trip not found" });
    return res.status(HTTP_STATUS.OK).json(q.rows[0]);
  } catch (err) {
    console.error(err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trip");
  }
};

// === POST /api/trips ===
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

    // ✅ Overlap check that allows boundary touch
    const overlapCheck = await pool.query(
      `
      SELECT id, destination, start_date, end_date
      FROM trips
      WHERE user_id = $1
      AND NOT (
        $3::date <= start_date  -- ends on/before another starts
        OR $2::date >= end_date -- starts on/after another ends
      )
      `,
      [user_id, start_date, end_date]
    );

    if (overlapCheck.rows.length > 0) {
      const t = overlapCheck.rows[0];
      return res.status(400).json({
        message: `Trip overlaps with existing trip (${t.destination}) from ${t.start_date} to ${t.end_date}.`,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO trips (user_id, title, destination, start_date, end_date, budget)
      VALUES ($1, $2, $3, $4::date, $5::date, $6)
      RETURNING id, user_id, title, destination, start_date, end_date, budget, created_at
      `,
      [user_id, title ?? destination, destination, start_date, end_date, budget ?? null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating trip:", err);
    return res.status(500).json({ message: "Failed to create trip" });
  }
};

// === PUT /api/trips/:id ===
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const existingRes = await pool.query(
      `SELECT * FROM trips WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );
    if (!existingRes.rows.length)
      return res.status(404).json({ message: "Trip not found or not yours" });

    const existing = existingRes.rows[0];
    const newStart = req.body.start_date ?? existing.start_date;
    const newEnd = req.body.end_date ?? existing.end_date;
    const newDestination = req.body.destination ?? existing.destination;
    const newTitle = req.body.title ?? existing.title;
    const newBudget = req.body.budget ?? existing.budget;

    if (new Date(newEnd) < new Date(newStart))
      return res.status(400).json({ message: "End date must be after start date" });

    // ✅ Overlap check (exclude itself, allow touching boundaries)
    const overlapCheck = await pool.query(
      `
      SELECT id, destination, start_date, end_date
      FROM trips
      WHERE user_id = $1
      AND id != $2
      AND NOT (
        $4::date <= start_date
        OR $3::date >= end_date
      )
      `,
      [user_id, id, newStart, newEnd]
    );

    if (overlapCheck.rows.length > 0) {
      const t = overlapCheck.rows[0];
      return res.status(400).json({
        message: `Trip overlaps with existing trip (${t.destination}) from ${t.start_date} to ${t.end_date}.`,
      });
    }

    const result = await pool.query(
      `
      UPDATE trips
      SET 
        title = $2,
        destination = $3,
        start_date = $4::date,
        end_date = $5::date,
        budget = $6
      WHERE id = $1 AND user_id = $7
      RETURNING id, user_id, title, destination, start_date, end_date, budget, created_at
      `,
      [id, newTitle, newDestination, newStart, newEnd, newBudget, user_id]
    );

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating trip:", err);
    return res.status(500).json({ message: "Failed to update trip" });
  }
};

// === DELETE /api/trips/:id ===
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      `DELETE FROM trips WHERE id = $1::uuid AND user_id = $2 RETURNING id`,
      [id, user_id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Trip not found or not yours" });
    return res.status(HTTP_STATUS.OK).json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete trip");
  }
};

export default { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
