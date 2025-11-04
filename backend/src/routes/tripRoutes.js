import express from "express";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
} from "../controllers/tripController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Normalize camelCase to snake_case so controllers can always read:
 *   req.body.start_date and req.body.end_date
 */
const normalizeDates = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        if (req.body.startDate && !req.body.start_date) req.body.start_date = req.body.startDate;
        if (req.body.endDate && !req.body.end_date) req.body.end_date = req.body.endDate;
    }
    next();
};

/**
 * (Optional) Accept dd-mm-yyyy or dd/mm/yyyy and turn into yyyy-mm-dd.
 * Harmless for already-ISO dates.
 */
const toIso = (s) => {
    if (typeof s !== "string") return s;
    const m = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/); // dd-mm-yyyy or dd/mm/yyyy
    if (!m) return s;
    const [, dd, mm, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
};
const normalizeDateFormat = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const k of ["start_date", "startDate", "end_date", "endDate"]) {
            if (req.body[k]) req.body[k] = toIso(req.body[k]);
        }
    }
    next();
};

/** Turn "" into undefined so optional validators skip blank fields. */
const emptyToUndefined = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const k of ["title", "destination", "start_date", "startDate", "end_date", "endDate", "budget"]) {
            if (req.body[k] === "") req.body[k] = undefined;
        }
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
 *     summary: Get all trips for the authenticated user
 *     tags: [Trips]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of trips
 */
router.get("/", verifyToken, getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by id
 *     tags: [Trips]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "a24c938d-8d4b-4216-8004-8e504aa7ff20"
 *     responses:
 *       200: { description: Trip found }
 *       404: { description: Not found }
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
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               destination: { type: string }
 *               start_date: { type: string, format: date }
 *               end_date: { type: string, format: date }
 *               budget: { type: number }
 *           example:
 *             title: "Berlin getaway"
 *             destination: "Berlin"
 *             start_date: "2025-11-05"
 *             end_date: "2025-11-07"
 *             budget: 650
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 */
router.post(
    "/",
    verifyToken,
    normalizeDates,
    normalizeDateFormat,
    emptyToUndefined,
    [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("destination").trim().notEmpty().withMessage("Destination is required"),
        body(["start_date", "startDate"])
            .optional({ nullable: true, checkFalsy: true })
            .isISO8601().withMessage("start_date must be YYYY-MM-DD"),
        body(["end_date", "endDate"])
            .optional({ nullable: true, checkFalsy: true })
            .isISO8601().withMessage("end_date must be YYYY-MM-DD"),
        body("budget")
            .optional({ nullable: true, checkFalsy: true })
            .isNumeric().withMessage("budget must be a number")
            .toFloat(),
        handleValidationErrors,
    ],
    createTrip
);

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
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "a24c938d-8d4b-4216-8004-8e504aa7ff20"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Not found }
 */
router.put(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    normalizeDates,
    normalizeDateFormat,
    emptyToUndefined,
    [
        body("title").optional({ nullable: true, checkFalsy: true }).isString().trim(),
        body("destination").optional({ nullable: true, checkFalsy: true }).isString().trim(),
        body(["start_date", "startDate"])
            .optional({ nullable: true, checkFalsy: true })
            .isISO8601().withMessage("start_date must be YYYY-MM-DD"),
        body(["end_date", "endDate"])
            .optional({ nullable: true, checkFalsy: true })
            .isISO8601().withMessage("end_date must be YYYY-MM-DD"),
        body("budget")
            .optional({ nullable: true, checkFalsy: true })
            .isNumeric().withMessage("budget must be a number")
            .toFloat(),
        handleValidationErrors,
    ],
    updateTrip
);

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
 *         required: true
 *         schema: { type: string, format: uuid }
 *         example: "a24c938d-8d4b-4216-8004-8e504aa7ff20"
 *     responses:
 *       204: { description: Deleted }
 *       404: { description: Not found }
 */
router.delete(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    deleteTrip
);

export default router;
