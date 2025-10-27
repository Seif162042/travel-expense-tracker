import express from "express";
import {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    deleteTrip,
} from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require login
router.use(protect);

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

export default router;
