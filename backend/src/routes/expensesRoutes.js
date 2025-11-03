// src/routes/expenses.js
import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    createExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense tracking endpoints
 */

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of all expenses
 *   post:
 *     summary: Add a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trip_id:
 *                 type: integer
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Expense added successfully
 */


const router = express.Router();



/**
 * POST /api/expenses
 */
router.post(
    "/",
    [
        body("trip_id").isInt().withMessage("trip_id must be an integer"),
        body("description")
            .isString()
            .notEmpty()
            .withMessage("Description is required"),
        body("amount").isNumeric().withMessage("Amount must be numeric"),
        handleValidationErrors,
    ],
    createExpense
);

/**
 * PUT /api/expenses/:id
 */
router.put(
    "/:id",
    [
        body("description").optional().isString(),
        body("amount").optional().isNumeric(),
        handleValidationErrors,
    ],
    updateExpense
);

/**
 * DELETE /api/expenses/:id
 */
router.delete("/:id", deleteExpense);

export default router;
