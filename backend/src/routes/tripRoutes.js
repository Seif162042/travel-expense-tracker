import express from "express";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    getFeedTrips,
} from "../controllers/tripController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/** Normalize input fields */
const normalizeDates = (req, _res, next) => {
    if (req.body) {
        if (req.body.startDate && !req.body.start_date)
            req.body.start_date = req.body.startDate;
        if (req.body.endDate && !req.body.end_date)
            req.body.end_date = req.body.endDate;
    }
    next();
};

const toIso = (s) => {
    if (typeof s !== "string") return s;
    const m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (!m) return s;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
};
const normalizeDateFormat = (req, _res, next) => {
    if (req.body) {
        for (const k of ["start_date", "startDate", "end_date", "endDate"]) {
            if (req.body[k]) req.body[k] = toIso(req.body[k]);
        }
    }
    next();
};

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips for authenticated user
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, getTrips);

/**
 * @swagger
 * /api/trips/feed:
 *   get:
 *     summary: Get feed of trips (public trips from other users)
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feed trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/feed", verifyToken, getFeedTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a specific trip by ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip UUID
 *     responses:
 *       200:
 *         description: Trip details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Invalid UUID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.get(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    getTripById
);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TripCreateRequest'
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Validation error - Invalid input data
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - Trip dates overlap with existing trip
 *       500:
 *         description: Server error
 */
router.post(
    "/",
    verifyToken,
    normalizeDates,
    normalizeDateFormat,
    [
        body("title").optional({ nullable: true, checkFalsy: true }).isString().trim(),
        body("destination").trim().notEmpty().withMessage("Destination is required"),
        body("start_date").isISO8601().withMessage("start_date must be valid date"),
        body("end_date").isISO8601().withMessage("end_date must be valid date"),
        body("budget").optional({ checkFalsy: true }).isNumeric().toFloat(),
    ],
    handleValidationErrors,
    createTrip
);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update an existing trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Berlin Trip"
 *               destination:
 *                 type: string
 *                 example: "Berlin, Germany"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-05"
 *               budget:
 *                 type: number
 *                 example: 800
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found
 *       409:
 *         description: Conflict - Updated dates overlap with another trip
 *       500:
 *         description: Server error
 */
router.put(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    normalizeDates,
    normalizeDateFormat,
    [
        body("title").optional({ checkFalsy: true }).isString(),
        body("destination").optional({ checkFalsy: true }).isString(),
        body(["start_date", "startDate"]).optional({ checkFalsy: true }).isISO8601(),
        body(["end_date", "endDate"]).optional({ checkFalsy: true }).isISO8601(),
        body("budget").optional({ checkFalsy: true }).isNumeric().toFloat(),
    ],
    handleValidationErrors,
    updateTrip
);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip and all associated expenses
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Trip UUID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trip deleted successfully"
 *                 deleted:
 *                   type: string
 *                   format: uuid
 *                   example: "705e6e02-0b93-4521-aa90-892625f37a8a"
 *       400:
 *         description: Invalid UUID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trip not found or doesn't belong to user
 *       500:
 *         description: Server error
 */
router.delete(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    deleteTrip
);

export default router;