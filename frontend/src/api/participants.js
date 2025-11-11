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
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
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
 * @param {string} newRole - New role to assign
 * @returns {Promise} Response with updated participant data
 */
export const updateParticipantRole = async (tripId, userId, newRole) => {
  try {
    const response = await api.put(`/trips/${tripId}/participants/${userId}`, {
      role: newRole
    });
    return response.data;
  } catch (error) {
    console.error('Error updating participant role:', error);
    throw error;
  }
};