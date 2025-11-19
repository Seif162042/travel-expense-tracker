/**
 * Date Validation Utilities
 * 
 * Helper functions for validating expense dates against trip dates.
 * Extracted to eliminate duplication between createExpense and updateExpense.
 * 
 */
import { pool } from "../db.js";

/**
 * Validates that expense dates are within trip dates
 * 
 * @param {Object} params - Validation parameters
 * @param {string} params.expenseDate - Start date of expense (YYYY-MM-DD)
 * @param {string} params.expenseEndDate - End date of expense (optional, YYYY-MM-DD)
 * @param {string} params.tripId - UUID of the trip
 * @param {string} params.userId - UUID of the user (for authorization)
 * 
 * @returns {Promise<Object>} Validation result
 * @returns {boolean} result.isValid - Whether dates are valid
 * @returns {string|null} result.error - Error message if invalid, null if valid
 * 
 * @example
 * const validation = await validateExpenseDates({
 *   expenseDate: '2024-01-15',
 *   expenseEndDate: '2024-01-17',
 *   tripId: 'abc-123',
 *   userId: 'user-456'
 * });
 * if (!validation.isValid) {
 *   return res.status(400).json({ message: validation.error });
 * }
 */
export async function validateExpenseDates({ expenseDate, expenseEndDate, tripId, userId }) {
    try {
        // Fetch trip dates from database
        const tripQuery = await pool.query(
            `SELECT start_date, end_date FROM trips WHERE id = $1 AND user_id = $2`,
            [tripId, userId]
        );

        // Check if trip exists and belongs to user
        if (!tripQuery.rows.length) {
            return {
                isValid: false,
                error: "Trip not found or does not belong to you"
            };
        }

        const trip = tripQuery.rows[0];

        // Convert string dates to Date objects for comparison
        const expenseStart = new Date(expenseDate);
        const expenseEnd = expenseEndDate ? new Date(expenseEndDate) : expenseStart;
        const tripStart = new Date(trip.start_date);
        const tripEnd = new Date(trip.end_date);

        // Validation 1: End date cannot be before start date
        if (expenseEnd < expenseStart) {
            return {
                isValid: false,
                error: "Expense end date cannot be before start date."
            };
        }

        // Validation 2: Expense dates must fall within trip dates
        if (expenseStart < tripStart || expenseEnd > tripEnd) {
            return {
                isValid: false,
                error: "Expense must be within trip duration."
            };
        }

        // All validations passed
        return {
            isValid: true,
            error: null
        };

    } catch (err) {
        // Database or unexpected errors
        console.error("Error in validateExpenseDates:", err);
        return {
            isValid: false,
            error: "Failed to validate expense dates"
        };
    }
}
