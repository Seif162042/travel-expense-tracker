import { pool } from "../db.js";

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
export const getTrips = async (req, res) => {
    const user_id = req.user.id;
    try {
        const result = await pool.query("SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC", [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
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
