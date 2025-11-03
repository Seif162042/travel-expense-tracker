import { pool } from "../db.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../config/constants.js";

// @desc Create a new trip
export const createTrip = async (req, res) => {
    const { destination, start_date, end_date, budget, notes } = req.body;
    const user_id = req.user.id;

    if (!destination || !start_date || !end_date)
        return res.status(400).json({ message: "Missing required fields" });

    try {
        const result = await pool.query(
            `INSERT INTO trips (user_id, destination, start_date, end_date, budget, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [user_id, destination, start_date, end_date, budget, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Get all trips for logged-in user
export const getTrips = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const { rows } = await pool.query(
            "SELECT * FROM trips ORDER BY id DESC LIMIT $1 OFFSET $2",
            [limit, offset]
        );

        res.status(200).json(rows);
    } catch (err) {
        next(err); // let global error handler catch it
    }
};


// @desc Get single trip by ID
export const getTripById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query("SELECT * FROM trips WHERE id = $1 AND user_id = $2", [id, user_id]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Trip not found" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Update a trip
export const updateTrip = async (req, res) => {
    const { id } = req.params;
    const { destination, start_date, end_date, budget, notes } = req.body;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE trips
       SET destination = $1, start_date = $2, end_date = $3, budget = $4, notes = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
            [destination, start_date, end_date, budget, notes, id, user_id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Trip not found or not yours" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Delete a trip
export const deleteTrip = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query("DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id", [id, user_id]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: "Trip not found or not yours" });

        res.json({ message: "Trip deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Get all trips from all users (public trips)
export const getAllTrips = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT trips.*, users.name AS user_name 
       FROM trips 
       JOIN users ON trips.user_id = users.id
       ORDER BY trips.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        return successResponse(res, HTTP_STATUS.CREATED, newUser, SUCCESS_MESSAGES.USER_REGISTERED);
    }
};
export default { createTrip, getTrips, updateTrip, deleteTrip };

