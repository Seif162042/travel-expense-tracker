import express from "express";
import { body, param, query } from "express-validator";
import { verifyToken } from "../middleware/authMiddleware.js";
import { handleValidationErrors, emptyToUndefined } from "../middleware/validate.js";
import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getExpensesByTripId,
} from "../controllers/expenseController.js";

const router = express.Router();

const emptyToUndefined = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const k of ["trip_id", "amount", "category", "description", "date", "end_date"]) {
            if (req.body[k] === "") req.body[k] = undefined;
        }
    }
    next();
};

/**
 * @swagger
 * tags:
 *   - name: Expenses
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: List expenses (optionally filter by trip_id)
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: trip_id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: If provided, returns expenses for this trip only
 *     responses:
 *       200:
 *         description: Array of expenses
 */
router.get(
    "/",
    verifyToken,
    query("trip_id").optional().isUUID().withMessage("trip_id must be a valid UUID"),
    handleValidationErrors,
    getExpenses
);

/**
 * @swagger
 * /api/expenses/trip/{trip_id}:
 *   get:
 *     summary: List expenses for a specific trip
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: trip_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Array of expenses for the trip
 */
router.get(
    "/trip/:trip_id",
    verifyToken,
    param("trip_id").isUUID().withMessage("trip_id must be a valid UUID"),
    handleValidationErrors,
    getExpensesByTripId
);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create an expense (supports multi-day via end_date)
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trip_id, amount, category]
 *             properties:
 *               trip_id: { type: string, format: uuid }
 *               amount: { type: number }
 *               category: { type: string, example: "Hotel" }
 *               description: { type: string, nullable: true }
 *               date: { type: string, format: date, description: "Start date of expense" }
 *               end_date: { type: string, format: date, description: "Optional end date for multi-day expenses" }
 *           example:
 *             trip_id: "705e6e02-0b93-4521-aa90-892625f37a8a"
 *             amount: 320.00
 *             category: "Hotel"
 *             description: "3 nights"
 *             date: "2025-11-10"
 *             end_date: "2025-11-13"
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
router.post(
    "/",
    verifyToken,
    emptyToUndefined,
    [
        body("trip_id").isUUID().withMessage("trip_id must be a valid UUID"),
        body("amount").isNumeric().withMessage("amount must be a number").toFloat(),
        body("category").isString().trim().notEmpty().withMessage("category is required"),
        body("description").optional().isString().trim(),
        body("date").optional().isISO8601().withMessage("Invalid start date"),
        body("end_date").optional().isISO8601().withMessage("Invalid end date"),
        handleValidationErrors,
    ],
    createExpense
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *               category: { type: string }
 *               description: { type: string, nullable: true }
 *               date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    emptyToUndefined,
    [
        body("amount").optional().isNumeric().toFloat(),
        body("category").optional().isString().trim(),
        body("description").optional().isString().trim(),
        body("date").optional().isISO8601(),
        body("end_date").optional().isISO8601(),
        handleValidationErrors,
    ],
    updateExpense
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    deleteExpense
);

export default router;
