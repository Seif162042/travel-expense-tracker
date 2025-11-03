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
