// backend/src/controllers/expenseController.js
import { pool } from "../db.js";
import { HTTP_STATUS, SUCCESS_MESSAGES } from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";

// GET /api/expenses (requires verifyToken)
export const getExpenses = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const q = await pool.query(
            `SELECT id, user_id, trip_id, description, amount, category, date, created_at
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
// GET /api/expenses/trip/:trip_id (requires verifyToken)
export const getExpensesByTripId = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { trip_id } = req.params;
        if (!trip_id) return res.status(400).json({ message: "trip_id is required" });

        const q = await pool.query(
            `SELECT id, user_id, trip_id, description, amount, category, date, created_at
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


// POST /api/expenses (requires verifyToken)
export const createExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { trip_id, description, amount, category, date } = req.body;
        if (!trip_id || !description || amount == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = await pool.query(
            `INSERT INTO expenses (user_id, trip_id, description, amount, category, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, trip_id, description, amount, category, date, created_at`,
            [user_id, trip_id, description, amount, category ?? null, date ?? null]
        );

        return successResponse(res, HTTP_STATUS.CREATED, result.rows[0], SUCCESS_MESSAGES.EXPENSE_CREATED);
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to create expense");
    }
};

// PUT /api/expenses/:id (requires verifyToken)
export const updateExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params;
        const { description, amount, category, date } = req.body;

        const result = await pool.query(
            `UPDATE expenses
       SET description = COALESCE($2, description),
           amount = COALESCE($3, amount),
           category = COALESCE($4, category),
           date = COALESCE($5, date)
       WHERE id = $1 AND user_id = $6
       RETURNING id, user_id, trip_id, description, amount, category, date, created_at`,
            [id, description ?? null, amount ?? null, category ?? null, date ?? null, user_id]
        );

        if (!result.rows.length) return res.status(404).json({ message: "Expense not found or not yours" });
        return res.status(HTTP_STATUS.OK).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update expense");
    }
};

// DELETE /api/expenses/:id (requires verifyToken)
export const deleteExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { id } = req.params;
        const result = await pool.query(
            `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`,
            [id, user_id]
        );

        if (!result.rows.length) return res.status(404).json({ message: "Expense not found or not yours" });
        return res.status(HTTP_STATUS.OK).json({ deleted: result.rows[0].id });
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete expense");
    }
};

export default { createExpense, getExpenses, updateExpense, deleteExpense };
