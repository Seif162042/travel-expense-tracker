// backend/src/controllers/tripController.js
import { pool } from "../db.js";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";

// GET /api/trips
export const getTrips = async (req, res) => {
    try {
        const user_id = req.user?.id; // get the user ID from token
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const result = await pool.query(
            `SELECT id, user_id, title, destination, start_date, end_date, budget, created_at
             FROM trips
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 50`,
            [user_id]
        );

        return res.status(HTTP_STATUS.OK).json(result.rows);
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
        const { title, destination, budget } = req.body;
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });
        if (!title || !destination) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // accept both snake_case and camelCase
        const startDate = req.body.start_date ?? req.body.startDate ?? null;
        const endDate = req.body.end_date ?? req.body.endDate ?? null;

        const result = await pool.query(
            `INSERT INTO trips (user_id, title, destination, start_date, end_date, budget)
       VALUES ($1, $2, $3, $4::date, $5::date, $6)
       RETURNING id, user_id, title, destination, start_date, end_date, budget, created_at`,
            [user_id, title, destination, startDate, endDate, budget ?? null]
        );

        return successResponse(res, HTTP_STATUS.CREATED, result.rows[0], SUCCESS_MESSAGES.TRIP_CREATED);
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to create trip");
    }
};

// PUT /api/trips/:id
export const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { title, destination, budget } = req.body;
        const startDate = req.body.start_date ?? req.body.startDate ?? null;
        const endDate = req.body.end_date ?? req.body.endDate ?? null;

        const result = await pool.query(
            `UPDATE trips
       SET title       = COALESCE($2, title),
           destination = COALESCE($3, destination),
           start_date  = COALESCE($4::date, start_date),
           end_date    = COALESCE($5::date, end_date),
           budget      = COALESCE($6, budget)
       WHERE id = $1::uuid AND user_id = $7
       RETURNING id, user_id, title, destination, start_date, end_date, budget, created_at`,
            [id, title ?? null, destination ?? null, startDate, endDate, budget ?? null, user_id]
        );

        if (!result.rows.length) return res.status(404).json({ message: "Trip not found or not yours" });
        return res.status(HTTP_STATUS.OK).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update trip");
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
