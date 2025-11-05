// backend/src/controllers/expenseController.js
import { pool } from "../db.js";
import { HTTP_STATUS } from "../config/constants.js";
import { errorResponse } from "../utils/responseHelpers.js";

// ✅ Get all expenses (user-wide)
export const getExpenses = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const q = await pool.query(
            `SELECT id, user_id, trip_id, description, amount, category, date, end_date, created_at
       FROM expenses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
            [user_id]
        );
        return res.status(HTTP_STATUS.OK).json(q.rows);
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch expenses");
    }
};

// ✅ Get expenses for a specific trip
export const getExpensesByTripId = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { trip_id } = req.params;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const q = await pool.query(
            `SELECT id, user_id, trip_id, description, amount, category, date, end_date, created_at
       FROM expenses
       WHERE user_id = $1 AND trip_id = $2
       ORDER BY created_at DESC`,
            [user_id, trip_id]
        );

        return res.status(HTTP_STATUS.OK).json(q.rows);
    } catch (err) {
        console.error("Error fetching expenses by trip_id:", err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch expenses for trip");
    }
};

// ✅ Create an expense
export const createExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { trip_id, description, amount, category, date, end_date } = req.body;

        if (!trip_id || amount == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 🟣 Validate date(s) within trip range
        if (date) {
            const tripQuery = await pool.query(
                `SELECT start_date, end_date FROM trips WHERE id = $1 AND user_id = $2`,
                [trip_id, user_id]
            );
            const trip = tripQuery.rows[0];

            if (trip) {
                const expenseStart = new Date(date);
                const expenseEnd = end_date ? new Date(end_date) : expenseStart;
                const tripStart = new Date(trip.start_date);
                const tripEnd = new Date(trip.end_date);

                if (expenseStart < tripStart || expenseEnd > tripEnd) {
                    return res
                        .status(400)
                        .json({ message: "Expense must be within trip duration." });
                }
                if (expenseEnd < expenseStart) {
                    return res
                        .status(400)
                        .json({ message: "Expense end date cannot be before start date." });
                }
            }
        }

        const result = await pool.query(
            `INSERT INTO expenses (user_id, trip_id, description, amount, category, date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, trip_id, description, amount, category, date, end_date, created_at`,
            [user_id, trip_id, description ?? null, amount, category ?? null, date ?? null, end_date ?? null]
        );

        return res.status(HTTP_STATUS.CREATED).json(result.rows[0]);
    } catch (err) {
        console.error("❌ Error creating expense:", err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to create expense");
    }
};


// ✅ Update expense
export const updateExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;
        const { description, amount, category, date, end_date } = req.body;

        const result = await pool.query(
            `UPDATE expenses
       SET description = COALESCE($2, description),
           amount = COALESCE($3, amount),
           category = COALESCE($4, category),
           date = COALESCE($5, date),
           end_date = COALESCE($6, end_date)
       WHERE id = $1 AND user_id = $7
       RETURNING id, user_id, trip_id, description, amount, category, date, end_date, created_at`,
            [id, description ?? null, amount ?? null, category ?? null, date ?? null, end_date ?? null, user_id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Expense not found or not yours" });
        }

        return res.status(HTTP_STATUS.OK).json(result.rows[0]);
    } catch (err) {
        console.error("Update expense error:", err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update expense");
    }
};

// ✅ Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, user_id]
        );

        if (!result.rows.length)
            return res.status(404).json({ message: "Expense not found or not yours" });

        return res.status(HTTP_STATUS.OK).json({ deleted: result.rows[0].id });
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete expense");
    }
};
