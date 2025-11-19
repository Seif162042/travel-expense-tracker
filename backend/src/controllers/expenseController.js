/**
 * Expense Controller - REFACTORED
 * Handles all expense-related API endpoints including:
 * - Fetching expenses (all or by trip)
 * - Creating new expenses
 * - Updating existing expenses
 * - Deleting expenses
 * 
 */
import { pool } from "../db.js";
import { HTTP_STATUS } from "../config/constants.js";
import { errorResponse } from "../utils/responseHelpers.js";
import { validateExpenseDates } from "../utils/dateValidation.js";

/**
 * Get all expenses for the authenticated user
 * Returns up to 100 most recent expenses
 */
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

/**
 * Get all expenses for a specific trip
 * Only returns expenses that belong to the authenticated user
 */
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

/**
 * Create a new expense
 * Validates that expense dates are within the trip's date range
 * before creating the expense record
 */
export const createExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        if (!user_id) return res.status(401).json({ message: "Unauthorized" });

        const { trip_id, description, amount, category, date, end_date } = req.body;

        // Validate required fields
        if (!trip_id || amount == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Validate date(s) within trip range using helper function
        if (date) {
            const validation = await validateExpenseDates({
                expenseDate: date,
                expenseEndDate: end_date,
                tripId: trip_id,
                userId: user_id
            });

            if (!validation.isValid) {
                return res.status(400).json({ message: validation.error });
            }
        }

        // Create expense record
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


/**
 * Update an existing expense
 * Validates that updated dates are within the trip's date range
 * Uses COALESCE to only update provided fields
 */
export const updateExpense = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { id } = req.params;
        const { description, amount, category, date, end_date } = req.body;

        // First, get the expense to find its trip_id and current dates
        const expenseQuery = await pool.query(
            `SELECT trip_id, date as current_date, end_date as current_end_date FROM expenses WHERE id = $1 AND user_id = $2`,
            [id, user_id]
        );

        if (!expenseQuery.rows.length) {
            return res.status(404).json({ message: "Expense not found or not yours" });
        }

        const expense = expenseQuery.rows[0];
        const trip_id = expense.trip_id;

        // Use the new date if provided, otherwise use the current date
        // This allows partial updates while still validating dates
        const expenseDate = date ?? expense.current_date;
        const expenseEndDate = end_date ?? expense.current_end_date;

        // Validate date(s) within trip range using helper function
        if (expenseDate) {
            const validation = await validateExpenseDates({
                expenseDate: expenseDate,
                expenseEndDate: expenseEndDate,
                tripId: trip_id,
                userId: user_id
            });

            if (!validation.isValid) {
                return res.status(400).json({ message: validation.error });
            }
        }

        // Update expense record
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

        return res.status(HTTP_STATUS.OK).json(result.rows[0]);
    } catch (err) {
        console.error("Update expense error:", err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update expense");
    }
};

/**
 * Delete an expense
 * Only allows deletion of expenses that belong to the authenticated user
 */
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
