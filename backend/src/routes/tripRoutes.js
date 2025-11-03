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

/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip management endpoints
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips (paginated)
 *     tags: [Trips]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of trips to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: List of trips
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               destination:
 *                 type: string
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: Trip created successfully
 */


const router = express.Router();

/**
 * GET /api/trips
 * Supports pagination via ?limit=10&offset=0
 */
router.get("/", getTrips);

/**
 * GET /api/trips/:id
 */
router.get("/:id", getTripById);

/**
 * POST /api/trips
 */
router.post(
    "/",
    [
        body("title").isString().notEmpty().withMessage("Title is required"),
        body("destination")
            .isString()
            .notEmpty()
            .withMessage("Destination is required"),
        body("budget")
            .optional()
            .isNumeric()
            .withMessage("Budget must be a number"),
        handleValidationErrors,
    ],
    createTrip
);

/**
 * PUT /api/trips/:id
 */
router.put(
    "/:id",
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
 */
router.delete("/:id", deleteTrip);

export default router;
