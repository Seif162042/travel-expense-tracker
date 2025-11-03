// backend/src/routes/tripRoutes.js
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

const router = express.Router();

// all protected by JWT
router.get("/", verifyToken, getTrips);
router.get("/:id", verifyToken, getTripById);

router.post(
    "/",
    verifyToken,
    [
        body("title").isString().notEmpty().withMessage("Title is required"),
        body("destination").isString().notEmpty().withMessage("Destination is required"),
        body("budget").optional().isNumeric(),
        handleValidationErrors,
    ],
    createTrip
);

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

router.delete("/:id", verifyToken, deleteTrip);

export default router;
