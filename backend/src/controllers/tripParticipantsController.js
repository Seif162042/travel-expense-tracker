/**
 * Trip Participants Controller
 * Handles many-to-many relationship between users and trips
 * 
 * Endpoints:
 * - Add participant to trip
 * - Remove participant from trip
 * - Get all participants for a trip
 * - Get all trips user participates in
 * - Update participant role/permissions
 */

import { pool } from "../db.js";
import { HTTP_STATUS } from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";

/**
 * Add a participant to a trip
 * Only trip owner can add participants
 * 
 * POST /api/trips/:tripId/participants
 * Body: { user_email: string, role: string }
 */
export const addParticipant = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { user_email, role = 'member' } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    // Validate role
    const validRoles = ['owner', 'editor', 'viewer', 'member'];
    if (!validRoles.includes(role)) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalid role");
    }

    // Check if current user is trip owner
    const ownerCheck = await pool.query(
      `SELECT tp.role FROM trip_participants tp 
       WHERE tp.trip_id = $1 AND tp.user_id = $2`,
      [tripId, currentUserId]
    );

    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].role !== 'owner') {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Only trip owner can add participants");
    }

    // Find user by email
    const userResult = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [user_email]
    );

    if (userResult.rows.length === 0) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const newUserId = userResult.rows[0].id;

    // Check if already participant
    const existingCheck = await pool.query(
      `SELECT * FROM trip_participants WHERE trip_id = $1 AND user_id = $2`,
      [tripId, newUserId]
    );

    if (existingCheck.rows.length > 0) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "User is already a participant");
    }

    // Set permissions based on role
    const permissions = getDefaultPermissions(role);

    // Add participant
    const result = await pool.query(
      `INSERT INTO trip_participants (trip_id, user_id, role, permissions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tripId, newUserId, role, JSON.stringify(permissions)]
    );

    return successResponse(res, HTTP_STATUS.CREATED, result.rows[0]);
  } catch (err) {
    console.error("Error adding participant:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to add participant");
  }
};

/**
 * Get all participants for a trip
 * Any trip participant can view other participants
 * 
 * GET /api/trips/:tripId/participants
 */
export const getParticipants = async (req, res) => {
  try {
    const { tripId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    // Check if user is participant
    const accessCheck = await pool.query(
      `SELECT * FROM trip_participants WHERE trip_id = $1 AND user_id = $2`,
      [tripId, currentUserId]
    );

    if (accessCheck.rows.length === 0) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "You are not a participant of this trip");
    }

    // Get all participants with user info
    const result = await pool.query(
      `SELECT tp.*, u.name, u.email
       FROM trip_participants tp
       JOIN users u ON u.id = tp.user_id
       WHERE tp.trip_id = $1
       ORDER BY tp.joined_at`,
      [tripId]
    );

    return successResponse(res, HTTP_STATUS.OK, result.rows);
  } catch (err) {
    console.error("Error fetching participants:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch participants");
  }
};

/**
 * Get all trips user participates in
 * Returns both owned and shared trips
 * 
 * GET /api/user/participating-trips
 */
export const getParticipatingTrips = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    // Get all trips where user is participant
    const result = await pool.query(
      `SELECT t.*, tp.role, tp.joined_at
       FROM trips t
       JOIN trip_participants tp ON tp.trip_id = t.id
       WHERE tp.user_id = $1
       ORDER BY t.start_date DESC
       LIMIT 50`,
      [userId]
    );

    return successResponse(res, HTTP_STATUS.OK, result.rows);
  } catch (err) {
    console.error("Error fetching participating trips:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch trips");
  }
};

/**
 * Remove participant from trip
 * Owner can remove others; users can remove themselves
 * 
 * DELETE /api/trips/:tripId/participants/:userId
 */
export const removeParticipant = async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    // Check current user's role
    const roleCheck = await pool.query(
      `SELECT role FROM trip_participants WHERE trip_id = $1 AND user_id = $2`,
      [tripId, currentUserId]
    );

    if (roleCheck.rows.length === 0) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "You are not a participant of this trip");
    }

    const isOwner = roleCheck.rows[0].role === 'owner';
    const isSelf = currentUserId === userId;

    // Can remove if: owner removing someone, or user removing themselves
    if (!isOwner && !isSelf) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Only owner can remove other participants");
    }

    // Prevent removing last owner
    if (isOwner && isSelf) {
      const ownerCount = await pool.query(
        `SELECT COUNT(*) FROM trip_participants WHERE trip_id = $1 AND role = 'owner'`,
        [tripId]
      );

      if (parseInt(ownerCount.rows[0].count) <= 1) {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Cannot remove last owner");
      }
    }

    // Remove participant
    const result = await pool.query(
      `DELETE FROM trip_participants WHERE trip_id = $1 AND user_id = $2 RETURNING *`,
      [tripId, userId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Participant not found");
    }

    return successResponse(res, HTTP_STATUS.OK, { message: "Participant removed" });
  } catch (err) {
    console.error("Error removing participant:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to remove participant");
  }
};

/**
 * Update participant role or permissions
 * Only owner can update roles
 * 
 * PATCH /api/trips/:tripId/participants/:userId
 * Body: { role?: string, permissions?: object }
 */
export const updateParticipant = async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const { role, permissions } = req.body;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    // Check if current user is owner
    const ownerCheck = await pool.query(
      `SELECT role FROM trip_participants WHERE trip_id = $1 AND user_id = $2`,
      [tripId, currentUserId]
    );

    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].role !== 'owner') {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Only owner can update participants");
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['owner', 'editor', 'viewer', 'member'];
      if (!validRoles.includes(role)) {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalid role");
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (role) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (permissions) {
      updates.push(`permissions = $${paramCount++}`);
      values.push(JSON.stringify(permissions));
    }

    if (updates.length === 0) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "No updates provided");
    }

    values.push(tripId, userId);

    const result = await pool.query(
      `UPDATE trip_participants 
       SET ${updates.join(', ')}
       WHERE trip_id = $${paramCount++} AND user_id = $${paramCount++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Participant not found");
    }

    return successResponse(res, HTTP_STATUS.OK, result.rows[0]);
  } catch (err) {
    console.error("Error updating participant:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to update participant");
  }
};

/**
 * Helper: Get default permissions for a role
 */
function getDefaultPermissions(role) {
  switch (role) {
    case 'owner':
      return {
        can_edit_trip: true,
        can_delete_trip: true,
        can_add_expenses: true,
        can_edit_expenses: true,
        can_delete_expenses: true,
        can_manage_participants: true
      };
    case 'editor':
      return {
        can_edit_trip: true,
        can_delete_trip: false,
        can_add_expenses: true,
        can_edit_expenses: true,
        can_delete_expenses: true,
        can_manage_participants: false
      };
    case 'member':
      return {
        can_edit_trip: false,
        can_delete_trip: false,
        can_add_expenses: true,
        can_edit_expenses: false,
        can_delete_expenses: false,
        can_manage_participants: false
      };
    case 'viewer':
      return {
        can_edit_trip: false,
        can_delete_trip: false,
        can_add_expenses: false,
        can_edit_expenses: false,
        can_delete_expenses: false,
        can_manage_participants: false
      };
    default:
      return {
        can_edit_trip: false,
        can_delete_trip: false,
        can_add_expenses: true,
        can_edit_expenses: false,
        can_delete_expenses: false,
        can_manage_participants: false
      };
  }
}

/**
 * Helper: Check if user has permission for action on trip
 */
export const checkTripPermission = async (userId, tripId, action) => {
  try {
    const result = await pool.query(
      `SELECT role, permissions FROM trip_participants 
       WHERE trip_id = $1 AND user_id = $2`,
      [tripId, userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const { role, permissions } = result.rows[0];

    // Owner can do everything
    if (role === 'owner') {
      return true;
    }

    // Check specific permission
    return permissions?.[action] === true;
  } catch (err) {
    console.error("Error checking permission:", err);
    return false;
  }
};

// Export all functions
export default {
  addParticipant,
  getParticipants,
  getParticipatingTrips,
  removeParticipant,
  updateParticipant,
  checkTripPermission
};
