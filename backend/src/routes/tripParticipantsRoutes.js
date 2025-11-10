/**
 * Trip Participants Routes
 * Handles all routes for the many-to-many relationship between users and trips
 * 
 * Save this as: backend/src/routes/tripParticipantsRoutes.js
 */

import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  addParticipant,
  getParticipants,
  getParticipatingTrips,
  removeParticipant,
  updateParticipant
} from '../controllers/tripParticipantsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/trips/:tripId/participants
 * @desc    Add a participant to a trip (owner only)
 * @access  Private (Owner)
 * @body    { user_email: string, role: 'owner'|'editor'|'viewer'|'member' }
 */
router.post('/trips/:tripId/participants', addParticipant);

/**
 * @route   GET /api/trips/:tripId/participants
 * @desc    Get all participants for a trip
 * @access  Private (Any participant)
 */
router.get('/trips/:tripId/participants', getParticipants);

/**
 * @route   DELETE /api/trips/:tripId/participants/:userId
 * @desc    Remove a participant from a trip
 * @access  Private (Owner or self)
 */
router.delete('/trips/:tripId/participants/:userId', removeParticipant);

/**
 * @route   PATCH /api/trips/:tripId/participants/:userId
 * @desc    Update participant role or permissions
 * @access  Private (Owner only)
 * @body    { role?: string, permissions?: object }
 */
router.patch('/trips/:tripId/participants/:userId', updateParticipant);

/**
 * @route   GET /api/user/participating-trips
 * @desc    Get all trips the authenticated user participates in
 * @access  Private
 */
router.get('/user/participating-trips', getParticipatingTrips);

export default router;
