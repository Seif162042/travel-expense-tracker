// src/routes/trips.js
import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
} from "../controllers/tripController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management endpoints
 */

const router = express.Router();

/**
 * GET /api/trips
 * Supports pagination via ?limit=10&offset=0
 * Protected: requires valid JWT
 */
router.get("/", verifyToken, getTrips);

/**
 * GET /api/trips/:id
 * Protected: requires valid JWT
 */
router.get("/:id", verifyToken, getTripById);

/**
 * POST /api/trips
 * Protected: requires valid JWT
 */
router.post(
    "/",
    verifyToken,
    [
        body("title").isString().notEmpty().withMessage("Title is required"),
        body("destination").isString().notEmpty().withMessage("Destination is required"),
        body("budget").optional().isNumeric().withMessage("Budget must be a number"),
        handleValidationErrors,
    ],
    createTrip
);

/**
 * PUT /api/trips/:id
 * Protected: requires valid JWT
 */
router.put(
    "/:id",
    verifyToken,
    [
        body("title").optional().isString(),
        body("destination").optional().isString(),
        body("budget").optional().isNumeric(),
        handleValidationErrors,
    ],
    updateTrip
);

/**
 * DELETE /api/trips/:id
 * Protected: requires valid JWT
 */
router.delete("/:id", verifyToken, deleteTrip);

export default router;
