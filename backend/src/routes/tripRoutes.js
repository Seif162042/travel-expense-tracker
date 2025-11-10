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

router.get("/", verifyToken, getTrips);
router.get("/feed", verifyToken, getFeedTrips);
router.get(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    getTripById
);

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

router.delete(
    "/:id",
    verifyToken,
    param("id").isUUID().withMessage("id must be a valid UUID"),
    handleValidationErrors,
    deleteTrip
);

export default router;
