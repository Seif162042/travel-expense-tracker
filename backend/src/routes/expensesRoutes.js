// backend/src/routes/expensesRoutes.js
import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
/**
 * @swagger
 * tags: [Expenses]
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get expenses (optionally by trip_id)
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: trip_id
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       200:
 *         description: List of expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Expense'
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Add a new expense
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */


const router = express.Router();

router.get("/", verifyToken, getExpenses);

router.post(
    "/",
    verifyToken,
    [
        body("trip_id").isInt().withMessage("Trip ID must be integer"),
        body("description").isString().notEmpty(),
        body("amount").isNumeric(),
        body("category").optional().isString(),
        body("date").optional().isISO8601().toDate(),
        handleValidationErrors,
    ],
    createExpense
);

router.put(
    "/:id",
    verifyToken,
    [
        body("description").optional().isString(),
        body("amount").optional().isNumeric(),
        body("category").optional().isString(),
        body("date").optional().isISO8601().toDate(),
        handleValidationErrors,
    ],
    updateExpense
);

router.delete("/:id", verifyToken, deleteExpense);

export default router;
