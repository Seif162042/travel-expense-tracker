/**
 * Trip Participants API Service
 * Handles all API calls related to trip participants (M:N relationship)
 * 
 * Save this as: frontend/src/api/participants.js
 */

import api from './axios';

/**
 * Add a participant to a trip
 * @param {string} tripId - UUID of the trip
 * @param {string} userEmail - Email of user to add
 * @param {string} role - Role: 'owner', 'editor', 'member', or 'viewer'
 * @returns {Promise} Response with participant data
 */
export const addParticipant = async (tripId, userEmail, role = 'member') => {
  try {
    const response = await api.post(`/trips/${tripId}/participants`, {
      user_email: userEmail,
      role
    });
    return response.data;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
};

/**
 * Get all participants for a trip
 * @param {string} tripId - UUID of the trip
 * @returns {Promise<Array>} Array of participants with user info
 */
export const getParticipants = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}/participants`);
    return response.data;
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }
};

/**
 * Remove a participant from a trip
 * @param {string} tripId - UUID of the trip
 * @param {string} userId - UUID of user to remove
 * @returns {Promise} Response with success message
 */
export const removeParticipant = async (tripId, userId) => {
  try {
    const response = await api.delete(`/trips/${tripId}/participants/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

/**
 * Update participant role or permissions
 * @param {string} tripId - UUID of the trip
 * @param {string} userId - UUID of user to update
 * @param {object} updates - Object with role and/or permissions
 * @returns {Promise} Response with updated participant data
 */
export const updateParticipant = async (tripId, userId, updates) => {
  try {
    const response = await api.patch(`/trips/${tripId}/participants/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating participant:', error);
    throw error;
  }
};

/**
 * Get all trips the current user participates in
 * @returns {Promise<Array>} Array of trips with role info
 */
export const getParticipatingTrips = async () => {
  try {
    const response = await api.get('/user/participating-trips');
    return response.data;
  } catch (error) {
    console.error('Error fetching participating trips:', error);
    throw error;
  }
};

/**
 * Check if current user can perform action on trip
 * @param {string} tripId - UUID of the trip
 * @param {string} action - Action to check (e.g., 'can_edit_trip')
 * @returns {Promise<boolean>} True if user has permission
 */
export const checkPermission = async (tripId, action) => {
  try {
    const participants = await getParticipants(tripId);
    const currentUserId = localStorage.getItem('userId'); // Adjust based on your auth setup
    
    const userParticipant = participants.find(p => p.user_id === currentUserId);
    
    if (!userParticipant) return false;
    
    // Owner can do everything
    if (userParticipant.role === 'owner') return true;
    
    // Check specific permission
    return userParticipant.permissions?.[action] === true;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export default {
  addParticipant,
  getParticipants,
  removeParticipant,
  updateParticipant,
  getParticipatingTrips,
  checkPermission
};
