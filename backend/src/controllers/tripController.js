// backend/src/controllers/tripController.js
import { pool } from "../db.js";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";


// GET /api/trips/feed
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


// GET /api/trips
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



// GET /api/trips/:id
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

// POST /api/trips
export const createTrip = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { title, destination, start_date, end_date, budget } = req.body;

    // Basic required field validation
    if (!destination || !start_date || !end_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Ensure end date is after start date
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    // Check for overlapping trips (allow exact end/start match)
    const overlapCheck = await pool.query(
    `
    SELECT id, destination, start_date, end_date
    FROM trips
    WHERE user_id = $1
    AND NOT (
        $3 <= start_date  -- new trip ends before another starts
        OR $2 >= end_date -- new trip starts after another ends
    )
    `,
    [user_id, start_date, end_date]
    );


    if (overlapCheck.rows.length > 0) {
      const overlappingTrip = overlapCheck.rows[0];
      return res.status(400).json({
        message: `Trip overlaps with existing trip (${overlappingTrip.destination}) from ${overlappingTrip.start_date.slice(0, 10)} to ${overlappingTrip.end_date.slice(0, 10)}.`,
      });
    }

    // Insert trip
    const result = await pool.query(
      `
      INSERT INTO trips (user_id, title, destination, start_date, end_date, budget)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, title, destination, start_date, end_date, budget, created_at
      `,
      [user_id, title, destination, start_date, end_date, budget]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating trip:", err);
    return res.status(500).json({ message: "Failed to create trip" });
  }
};

// PUT /api/trips/:id
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { title, destination, start_date, end_date, budget } = req.body;

    // ✅ Check required fields
    if (!destination || !start_date || !end_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Ensure end date is after start date
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    // 🔍 Check overlap with other trips (exclude this one + allow boundary touch)
    const overlapCheck = await pool.query(
      `
      SELECT id, destination, start_date, end_date
      FROM trips
      WHERE user_id = $1
      AND id != $4
      AND NOT (
        $3 <= start_date  -- new trip ends before another starts
        OR $2 >= end_date -- new trip starts after another ends
      )
      `,
      [user_id, start_date, end_date, id]
    );

    if (overlapCheck.rows.length > 0) {
      const overlappingTrip = overlapCheck.rows[0];
      return res.status(400).json({
        message: `Trip overlaps with existing trip (${overlappingTrip.destination}) from ${overlappingTrip.start_date.slice(0, 10)} to ${overlappingTrip.end_date.slice(0, 10)}.`,
      });
    }

    // ✅ Update trip
    const result = await pool.query(
      `
      UPDATE trips
      SET 
        title = COALESCE($2, title),
        destination = COALESCE($3, destination),
        start_date = COALESCE($4::date, start_date),
        end_date = COALESCE($5::date, end_date),
        budget = COALESCE($6, budget)
      WHERE id = $1 AND user_id = $7
      RETURNING id, user_id, title, destination, start_date, end_date, budget, created_at
      `,
      [id, title ?? null, destination, start_date, end_date, budget ?? null, user_id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Trip not found or not yours" });

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating trip:", err);
    return res.status(500).json({ message: "Failed to update trip" });
  }
};


// DELETE /api/trips/:id  (requires verifyToken)
export const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const result = await pool.query(
            `DELETE FROM trips WHERE id = $1::uuid AND user_id = $2 RETURNING id`,
            [id, user_id]
        );

        if (!result.rows.length) return res.status(404).json({ message: "Trip not found or not yours" });
        return res.status(HTTP_STATUS.OK).json({ deleted: result.rows[0].id });
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete trip");
    }
};

export default { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
