import express from "express";
import {
    createExpense,
    getExpensesByTrip,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

// POST /api/expenses - create
router.post("/", createExpense);

// GET /api/expenses/:trip_id - get all for a trip
router.get("/:trip_id", getExpensesByTrip);

// PUT /api/expenses/:id - update one
router.put("/:id", updateExpense);

// DELETE /api/expenses/:id - delete one
router.delete("/:id", deleteExpense);

export default router;
