/**
 * ParticipantsList Component
 * Displays all participants of a trip with their roles
 * Allows owner to remove participants
 * 
 * Save this as: frontend/src/components/ParticipantsList.jsx
 */

import { useState, useEffect } from 'react';
import { getParticipants, removeParticipant } from '../api/participants';

export default function ParticipantsList({ tripId, currentUserId, onParticipantsChange }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchParticipants();
  }, [tripId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getParticipants(tripId);
      setParticipants(data);
      
      // Check if current user is owner
      const currentUserParticipant = data.find(p => p.user_id === currentUserId);
      setIsOwner(currentUserParticipant?.role === 'owner');
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from this trip?`)) return;
    
    try {
      await removeParticipant(tripId, userId);
      await fetchParticipants(); // Refresh list
      if (onParticipantsChange) onParticipantsChange();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove participant');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return '👑';
      case 'editor':
        return '✏️';
      case 'member':
        return '👤';
      case 'viewer':
        return '👁️';
      default:
        return '👤';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">
        Trip Participants ({participants.length})
      </h3>
      
      {participants.length === 0 ? (
        <p className="text-gray-500">No participants yet</p>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.user_id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getRoleIcon(participant.role)}</span>
                  <span className="font-semibold">{participant.name}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(
                      participant.role
                    )}`}
                  >
                    {participant.role}
                  </span>
                </div>
                <div className="text-sm text-gray-500">{participant.email}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Joined {new Date(participant.joined_at).toLocaleDateString()}
                </div>
              </div>

              {isOwner && participant.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(participant.user_id, participant.name)}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                >
                  Remove
                </button>
              )}

              {participant.user_id === currentUserId && participant.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(participant.user_id, 'yourself')}
                  className="ml-4 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  Leave Trip
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Role Permissions:</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>👑 <strong>Owner:</strong> Full control - can edit trip, manage participants, and delete</li>
          <li>✏️ <strong>Editor:</strong> Can edit trip details and all expenses</li>
          <li>👤 <strong>Member:</strong> Can add their own expenses</li>
          <li>👁️ <strong>Viewer:</strong> Read-only access</li>
        </ul>
      </div>
    </div>
  );
}
