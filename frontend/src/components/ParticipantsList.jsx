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
        return 'role-owner';
      case 'editor':
        return 'role-editor';
      case 'member':
        return 'role-member';
      case 'viewer':
        return 'role-viewer';
      default:
        return 'role-viewer';
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
      <div className="card">
        <p className="trip-meta">Loading participants…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Trip Participants ({participants.length})</h3>

      {participants.length === 0 ? (
        <p className="trip-meta">No participants yet</p>
      ) : (
        <ul className="trip-list">
          {participants.map((participant) => (
            <li key={participant.user_id} className="participant">
              <div>
                <div className="participant-name">
                  <span>{getRoleIcon(participant.role)}</span>
                  <strong>{participant.name}</strong>
                  <span className={`badge ${getRoleBadgeColor(participant.role)}`}>
                    {participant.role}
                  </span>
                </div>
                <div className="trip-meta">{participant.email}</div>
                <div className="trip-meta">
                  Joined {new Date(participant.joined_at).toLocaleDateString()}
                </div>
              </div>

              {isOwner && participant.role !== 'owner' && (
                <button
                  className="btn-danger"
                  onClick={() => handleRemove(participant.user_id, participant.name)}
                >
                  Remove
                </button>
              )}

              {participant.user_id === currentUserId && participant.role !== 'owner' && (
                <button
                  className="btn-ghost"
                  onClick={() => handleRemove(participant.user_id, 'yourself')}
                >
                  Leave Trip
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="note">
        <strong>Role Permissions:</strong>
        <ul>
          <li>👑 <strong>Owner:</strong> Full control - can edit trip, manage participants, and delete</li>
          <li>✏️ <strong>Editor:</strong> Can edit trip details and all expenses</li>
          <li>👤 <strong>Member:</strong> Can add their own expenses</li>
          <li>👁️ <strong>Viewer:</strong> Read-only access</li>
        </ul>
      </div>
    </div>
  );
}
