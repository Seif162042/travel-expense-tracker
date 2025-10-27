import { pool } from "../db.js";

// @desc Create new expense
export const createExpense = async (req, res) => {
    const { trip_id, category, amount, description, date } = req.body;
    const user_id = req.user.id;

    if (!trip_id || !category || !amount)
        return res.status(400).json({ message: "Missing required fields" });

    try {
        const result = await pool.query(
            `INSERT INTO expenses (user_id, trip_id, category, amount, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [user_id, trip_id, category, amount, description, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Get all expenses for a trip
export const getExpensesByTrip = async (req, res) => {
    const { trip_id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            "SELECT * FROM expenses WHERE user_id = $1 AND trip_id = $2 ORDER BY date DESC",
            [user_id, trip_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Update an expense
export const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { category, amount, description, date } = req.body;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE expenses
       SET category = $1, amount = $2, description = $3, date = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
            [category, amount, description, date, id, user_id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Expense not found or not yours" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Delete expense
export const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id",
            [id, user_id]
        );

        if (result.rows.length === 0)
            return res.status(404).json({ message: "Expense not found or not yours" });

        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
