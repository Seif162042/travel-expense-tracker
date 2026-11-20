/**
 * Trip Controller
 * Handles trip CRUD operations with:
 * - Date validation (end date must be after start date)
 * - Overlap prevention (prevents creating overlapping trips)
 * - Automatic owner assignment via trip_participants table
 * 
 * Business Rules:
 * - Users can only have one trip at a time (no overlapping dates)
 * - Trip creator is automatically added as 'owner' in trip_participants
 * - All dates must be in ISO 8601 format (YYYY-MM-DD)
 */
import * as trips from "../data/trips.js";
import { HTTP_STATUS } from "../config/constants.js";
import { errorResponse } from "../utils/responseHelpers.js";

/** Get public feed */
export const getFeedTrips = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const feed = await trips.findFeedTrips(user_id);

    return res.status(HTTP_STATUS.OK).json({ success: true, data: feed });
  } catch (err) {
    console.error("Error fetching feed:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch feed");
  }
};

/** Get user's trips */
export const getTrips = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const userTrips = await trips.findTripsByUser(user_id);

    return res.status(HTTP_STATUS.OK).json({ success: true, data: userTrips });
  } catch (err) {
    console.error("Error fetching trips:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trips");
  }
};

/** Get trip by id */
export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await trips.findTripById(id);
    if (!trip)
      return res.status(404).json({ message: "Trip not found" });

    return res.status(HTTP_STATUS.OK).json({ success: true, data: trip });
  } catch (err) {
    console.error("Error in getTripById:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trip");
  }
};

/** Create trip */
export const createTrip = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const { title, destination, start_date, end_date, budget } = req.body;
    if (!destination || !start_date || !end_date)
      return res.status(400).json({ message: "All fields required" });
    // Prevent creating overlapping trips for the same user
    // SQL logic: new trip must end before existing starts OR start after existing ends
    // If neither condition is true, trips overlap
    const newStart = new Date(start_date);
    const newEnd = new Date(end_date);
    if (newEnd < newStart)
      return res.status(400).json({ message: "End date must be after start date" });

    // overlap check
    const overlap = await trips.findOverlappingTrip(user_id, start_date, end_date);
    if (overlap)
      return res.status(400).json({ message: "Trip overlaps existing one" });
    // Automatically add trip creator as owner in trip_participants table
    // This establishes the M:N relationship and grants full permissions
    // ON CONFLICT DO NOTHING prevents duplicate entries if retry occurs
    const trip = await trips.createTripWithOwner({
      userId: user_id,
      title: title ?? destination,
      destination,
      startDate: start_date,
      endDate: end_date,
      budget: budget ?? null,
    });

    return res.status(201).json({ success: true, data: trip });
  } catch (err) {
    if (err.constraint === "trips_no_overlap")
      return res.status(400).json({ message: "Trip overlaps existing one" });
    console.error("Error creating trip:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to create trip");
  }
};

/** Update trip */
export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const e = await trips.findUserTrip(id, user_id);
    if (!e)
      return res.status(404).json({ message: "Trip not found or not yours" });

    const newStart = req.body.start_date ?? e.start_date;
    const newEnd = req.body.end_date ?? e.end_date;
    if (new Date(newEnd) < new Date(newStart))
      return res.status(400).json({ message: "End date must be after start date" });

    const updated = await trips.updateTrip(id, user_id, {
      title: req.body.title ?? e.title,
      destination: req.body.destination ?? e.destination,
      startDate: newStart,
      endDate: newEnd,
      budget: req.body.budget ?? e.budget,
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.constraint === "trips_no_overlap")
      return res.status(400).json({ message: "Trip overlaps existing one" });
    console.error("Error updating trip:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update trip");
  }
};

/** Delete trip */
export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await trips.deleteTrip(id, user_id);
    if (!deleted)
      return res.status(404).json({ message: "Trip not found or not yours" });

    return res.status(HTTP_STATUS.OK).json({ success: true, deleted: deleted.id });
  } catch (err) {
    console.error("Error deleting trip:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to delete trip");
  }
};

export default { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
