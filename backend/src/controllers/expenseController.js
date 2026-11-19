/**
 * Expense Controller
 * Handles all expense-related API endpoints including:
 * - Fetching expenses (all or by trip)
 * - Creating new expenses
 * - Updating existing expenses
 * - Deleting expenses
 * 
 */
import * as expenses from "../data/expenses.js";
import { findUserTripDates } from "../data/trips.js";
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

        const rows = await expenses.findExpensesByUser(user_id);
        return res.status(HTTP_STATUS.OK).json(rows);
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

        const rows = await expenses.findExpensesByUserAndTrip(user_id, trip_id);

        return res.status(HTTP_STATUS.OK).json(rows);
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
        } else if (!(await findUserTripDates(trip_id, user_id))) {
            return res.status(400).json({ message: "Trip not found or does not belong to you" });
        }

        // Create expense record
        const expense = await expenses.createExpense({
            userId: user_id,
            tripId: trip_id,
            description: description ?? null,
            amount,
            category: category ?? null,
            date: date ?? null,
            endDate: end_date ?? null,
        });

        return res.status(HTTP_STATUS.CREATED).json(expense);
    } catch (err) {
        if (err.constraint === "expenses_amount_check")
            return res.status(400).json({ message: "Amount must be greater than 0" });
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
        const expense = await expenses.findUserExpenseDates(id, user_id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found or not yours" });
        }

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
        const updated = await expenses.updateExpense(id, user_id, {
            description: description ?? null,
            amount: amount ?? null,
            category: category ?? null,
            date: date ?? null,
            endDate: end_date ?? null,
        });

        return res.status(HTTP_STATUS.OK).json(updated);
    } catch (err) {
        if (err.constraint === "expenses_amount_check")
            return res.status(400).json({ message: "Amount must be greater than 0" });
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

        const deleted = await expenses.deleteExpense(id, user_id);

        if (!deleted)
            return res.status(404).json({ message: "Expense not found or not yours" });

        return res.status(HTTP_STATUS.OK).json({ deleted: deleted.id });
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete expense");
    }
};
