import express from "express";
import { getTrips, getTripById, createTrip, deleteTrip, getAllTrips } from "../controllers/tripController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below require login
router.use(protect);

router.get("/all", getAllTrips);
router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTripById);
//router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

export default router;
