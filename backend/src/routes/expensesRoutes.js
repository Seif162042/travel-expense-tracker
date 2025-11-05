import express from "express";
import { body, param, query } from "express-validator";
import { verifyToken } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getExpensesByTripId,
} from "../controllers/expenseController.js";

const router = express.Router();

/** Map notes -> description when clients send 'notes' */
const normalizeDescription = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        if (!req.body.description && typeof req.body.notes === "string") {
            req.body.description = req.body.notes;
        }
    }
    next();
};

/** Turn "" into undefined so optional() validators skip blanks */
const emptyToUndefined = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const k of ["trip_id", "amount", "category", "description", "date"]) {
            if (req.body[k] === "") req.body[k] = undefined;
        }
    }
    next();
};

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get expenses (optionally filter by trip_id)
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: trip_id
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Filter expenses for a specific trip
 *     responses:
 *       200:
 *         description: List of expenses
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
 * /api/expenses:
 *   post:
 *     summary: Create an expense
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             trip_id: "705e6e02-0b93-4521-aa90-892625f37a8a"
 *             amount: 23.5
 *             category: "food"
 *             description: "Croissants & coffee"
 *             date: "2025-11-02"
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 */
router.post(
    "/",
    verifyToken,
    normalizeDescription,
    emptyToUndefined,
    [
        body("trip_id").isUUID().withMessage("trip_id must be a valid UUID"),
        body("amount").isNumeric().withMessage("amount must be a number").toFloat(),
        body("category").isString().trim().notEmpty().withMessage("category is required"),
        body("description").optional({ nullable: true, checkFalsy: true }).isString().trim(),
        body("date").optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage("date must be YYYY-MM-DD"),
        handleValidationErrors,
    ],
    createExpense
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense by id
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
 *           schema: { type: object }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    normalizeDescription,
    emptyToUndefined,
    [
        body("amount").optional({ nullable: true, checkFalsy: true }).isNumeric().toFloat(),
        body("category").optional({ nullable: true, checkFalsy: true }).isString().trim(),
        body("description").optional({ nullable: true, checkFalsy: true }).isString().trim(),
        body("date").optional({ nullable: true, checkFalsy: true }).isISO8601(),
        handleValidationErrors,
    ],
    updateExpense
);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense by id
 *     tags: [Expenses]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    deleteExpense
);

// GET /api/expenses/trip/:trip_id (requires verifyToken)
router.get(
    "/trip/:trip_id",
    verifyToken,
    param("trip_id").isUUID().withMessage("trip_id must be a valid UUID"),
    handleValidationErrors,
    getExpensesByTripId
);


export default router;
