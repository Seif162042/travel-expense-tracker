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

import * as participants from "../data/participants.js";
import { findTripOwnerId } from "../data/trips.js";
import { findUserIdByEmail } from "../data/users.js";
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
    const ownerCheck = await participants.findParticipantRole(tripId, currentUserId);

    if (!ownerCheck || ownerCheck.role !== 'owner') {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Only trip owner can add participants");
    }

    // Find user by email
    const newUser = await findUserIdByEmail(user_email);

    if (!newUser) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const newUserId = newUser.id;

    // Check if already participant
    const existing = await participants.findParticipant(tripId, newUserId);

    if (existing) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "User is already a participant");
    }

    // Set permissions based on role
    const permissions = getDefaultPermissions(role);

    // Add participant
    const added = await participants.addParticipant(tripId, newUserId, role, permissions);

    return successResponse(res, HTTP_STATUS.CREATED, added);
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

    // Check if user is trip owner OR participant
    const tripOwnerId = await findTripOwnerId(tripId);

    if (!tripOwnerId) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Trip not found");
    }

    const isOwner = tripOwnerId === currentUserId;

    // If not owner, check if participant
    if (!isOwner) {
      const access = await participants.findParticipant(tripId, currentUserId);

      if (!access) {
        return errorResponse(res, HTTP_STATUS.FORBIDDEN, "You are not a participant of this trip");
      }
    }

    // Get all participants with user info
    const list = await participants.findTripParticipants(tripId);

    return successResponse(res, HTTP_STATUS.OK, list);
  } catch (err) {
    console.error("Error fetching participants:", err);
    return errorResponse(res, HTTP_STATUS.SERVER_ERROR, "Failed to fetch participants");
  }
};

export const getParticipatingTrips = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
    }

    // Get all trips where user is participant
    const trips = await participants.findParticipatingTrips(userId);

    return successResponse(res, HTTP_STATUS.OK, trips);
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
    const roleCheck = await participants.findParticipantRole(tripId, currentUserId);

    if (!roleCheck) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "You are not a participant of this trip");
    }

    const isOwner = roleCheck.role === 'owner';
    const isSelf = currentUserId === userId;

    // Can remove if: owner removing someone, or user removing themselves
    if (!isOwner && !isSelf) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Only owner can remove other participants");
    }

    // Prevent removing last owner
    if (isOwner && isSelf) {
      const ownerCount = await participants.countOwners(tripId);

      if (ownerCount <= 1) {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Cannot remove last owner");
      }
    }

    // Remove participant
    const removed = await participants.removeParticipant(tripId, userId);

    if (!removed) {
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
    const ownerCheck = await participants.findParticipantRole(tripId, currentUserId);

    if (!ownerCheck || ownerCheck.role !== 'owner') {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, "Only owner can update participants");
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['owner', 'editor', 'viewer', 'member'];
      if (!validRoles.includes(role)) {
        return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "Invalid role");
      }
    }

    if (!role && !permissions) {
      return errorResponse(res, HTTP_STATUS.BAD_REQUEST, "No updates provided");
    }

    const updated = await participants.updateParticipant(tripId, userId, { role, permissions });

    if (!updated) {
      return errorResponse(res, HTTP_STATUS.NOT_FOUND, "Participant not found");
    }

    return successResponse(res, HTTP_STATUS.OK, updated);
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
    const participant = await participants.findParticipantPermissions(tripId, userId);

    if (!participant) {
      return false;
    }

    const { role, permissions } = participant;

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
