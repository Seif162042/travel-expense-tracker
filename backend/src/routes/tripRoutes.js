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
 * Normalize date field names so the controller always receives:
 *   req.body.start_date and req.body.end_date
 * (Supports both start_date/end_date and startDate/endDate from clients.)
 */
const normalizeDates = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        if (req.body.startDate && !req.body.start_date) req.body.start_date = req.body.startDate;
        if (req.body.endDate && !req.body.end_date) req.body.end_date = req.body.endDate;
    }
    next();
};

/**
 * @swagger
 * tags: [Trips]
 */

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips for the authenticated user (paginated)
 *     tags: [Trips]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 */

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip by id
 *     tags: [Trips]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip by id
 *     tags: [Trips]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: integer }
 *         required: true
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */

const router = express.Router();

// all protected by JWT
router.get("/", verifyToken, getTrips);
router.get("/:id", verifyToken, getTripById);

router.post(
    "/",
    verifyToken,
    normalizeDates, // ← ensures start_date/end_date are present if camelCase was sent
    [
        body("title").isString().notEmpty().withMessage("Title is required"),
        body("destination").isString().notEmpty().withMessage("Destination is required"),
        // Accept either start_date or startDate; validate when present
        body(["start_date", "startDate"])
            .optional()
            .isISO8601()
            .withMessage("start_date must be a valid date (YYYY-MM-DD)"),
        body(["end_date", "endDate"])
            .optional()
            .isISO8601()
            .withMessage("end_date must be a valid date (YYYY-MM-DD)"),
        body("budget").optional().isNumeric(),
        handleValidationErrors,
    ],
    createTrip
);

router.put(
    "/:id",
    verifyToken,
    normalizeDates,
    [
        body("title").optional().isString(),
        body("destination").optional().isString(),
        body(["start_date", "startDate"]).optional().isISO8601(),
        body(["end_date", "endDate"]).optional().isISO8601(),
        body("budget").optional().isNumeric(),
        handleValidationErrors,
    ],
    updateTrip
);

router.delete("/:id", verifyToken, deleteTrip);

export default router;
