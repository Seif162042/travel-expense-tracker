/**
 * AddParticipantForm Component
 * Form for trip owner to add new participants
 * 
 * Save this as: frontend/src/components/AddParticipantForm.jsx
 */

import { useState } from 'react';
import { addParticipant } from '../api/participants';

export default function AddParticipantForm({ tripId, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await addParticipant(tripId, formData.email, formData.role);
      
      // Reset form
      setFormData({ email: '', role: 'member' });
      setShowForm(false);
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Show success message
      alert(`Successfully added ${formData.email} as ${formData.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add participant');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!showForm) {
    return (
      <div className="card">
        <button className="btn-block" onClick={() => setShowForm(true)}>
          + Add Participant
        </button>
      </div>
    );
  }

  const closeForm = () => {
    setShowForm(false);
    setError('');
    setFormData({ email: '', role: 'member' });
  };

  return (
    <div className="card">
      <div className="row-between">
        <h3>Add Participant</h3>
        <button type="button" className="btn-ghost" onClick={closeForm}>
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="stack">
        {error && <div className="error">{error}</div>}

        <div>
          <label htmlFor="email">User Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter user's email address"
            required
            disabled={loading}
          />
          <p className="hint">The user must already have an account with this email</p>
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="member">Member - Can add expenses</option>
            <option value="editor">Editor - Can edit trip & expenses</option>
            <option value="viewer">Viewer - Read-only access</option>
            <option value="owner">Owner - Full control</option>
          </select>
        </div>

        <div className="note">
          <strong>Role Explanation:</strong>
          <ul>
            <li><strong>Member:</strong> Can add their own expenses to the trip</li>
            <li><strong>Editor:</strong> Can edit trip details and all expenses</li>
            <li><strong>Viewer:</strong> Can view trip and expenses but cannot make changes</li>
            <li><strong>Owner:</strong> Full control including deleting trip and managing participants</li>
          </ul>
        </div>

        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Participant'}
          </button>
          <button type="button" className="btn-ghost" onClick={closeForm} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
