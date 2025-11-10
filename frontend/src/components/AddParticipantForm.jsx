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
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Add Participant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Add Participant</h3>
        <button
          onClick={() => {
            setShowForm(false);
            setError('');
            setFormData({ email: '', role: 'member' });
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            User Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter user's email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            The user must already have an account with this email
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="member">Member - Can add expenses</option>
            <option value="editor">Editor - Can edit trip & expenses</option>
            <option value="viewer">Viewer - Read-only access</option>
            <option value="owner">Owner - Full control</option>
          </select>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Role Explanation:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-2 space-y-1">
            <li>• <strong>Member:</strong> Can add their own expenses to the trip</li>
            <li>• <strong>Editor:</strong> Can edit trip details and all expenses</li>
            <li>• <strong>Viewer:</strong> Can view trip and expenses but cannot make changes</li>
            <li>• <strong>Owner:</strong> Full control including deleting trip and managing participants</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Adding...' : 'Add Participant'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setError('');
              setFormData({ email: '', role: 'member' });
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
