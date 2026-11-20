/**
 * TripList Component
 * Displays a list of trips with inline editing and deletion capabilities.
 * Shows budget usage and days remaining for each trip.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function TripList({ trips, expensesData, loadTrips }) {
  // Error state for displaying API errors
  const [err, setErr] = useState("");
  // State to track which trip is being edited
  const [editingTrip, setEditingTrip] = useState(null);
  // Form state for editing trip data
  const [form, setForm] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
  });

  // ===== Handle Edit =====
  /**
   * Initiates edit mode for a trip
   * Populates the form with the trip's current data
   */
  const handleEditClick = (trip) => {
    setEditingTrip(trip);
    // Format dates to YYYY-MM-DD for date input fields
    setForm({
      destination: trip.destination,
      start_date: trip.start_date.slice(0, 10),
      end_date: trip.end_date.slice(0, 10),
      budget: trip.budget,
    });
  };

  /**
   * Saves the edited trip to the backend
   * Resets edit mode and refreshes trip list on success
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/trips/${editingTrip.id}`, {
        title: form.destination,
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
        budget: Number(form.budget),
      });
      setEditingTrip(null);
      setForm({ destination: "", start_date: "", end_date: "", budget: "" });
      loadTrips();
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to update trip");
    }
  };

  // ===== Handle Delete =====
  /**
   * Deletes a trip after user confirmation
   * Refreshes trip list after successful deletion
   */
  const deleteTrip = async (id) => {
    if (!confirm("Delete this trip?")) return;
    try {
      await api.delete(`/trips/${id}`);
      loadTrips();
    } catch (error) {
      setErr("Failed to delete trip");
    }
  };

  // ===== Helper Badges =====
  /**
   * Calculate percentage of budget used for a trip
   * Returns 0-100, capped at 100%
   */
  const getBudgetUsed = (trip) => {
  const spent = expensesData?.[trip.id] || 0;
  if (!trip.budget) return 0;
  return Math.min(((spent / trip.budget) * 100).toFixed(0), 100);
};

  /**
   * Calculate days remaining until trip ends
   * Returns formatted string with days left, "Ends today", or days ago
   */
  const getDaysLeft = (trip) => {
    const today = new Date();
    const end = new Date(trip.end_date);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `${diff} day${diff > 1 ? "s" : ""} left`;
    if (diff === 0) return "Ends today";
    return `${Math.abs(diff)} day${Math.abs(diff) > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="section">
      <h2>My Trips</h2>
      {err && <p className="error">{err}</p>}

      {trips.length === 0 ? (
        <p>No trips yet.</p>
      ) : (
        <ul className="trip-list">
          {trips.map((trip) => (
            <li key={trip.id} className="card trip-item">
              <div>
                <Link to={`/trips/${trip.id}`} className="trip-title">
                  {trip.destination}
                </Link>
                <div className="trip-meta">
                  {trip.start_date?.slice(0, 10)} → {trip.end_date?.slice(0, 10)} | Budget: $
                  {trip.budget}
                </div>

                <div className="badges">
                  <span className="badge">{getBudgetUsed(trip)}% used</span>
                  <span
                    className={`badge ${
                      getDaysLeft(trip).includes("ago") ? "badge-late" : "badge-ok"
                    }`}
                  >
                    {getDaysLeft(trip)}
                  </span>
                </div>
              </div>

              <div className="actions">
                <button className="btn-soft" onClick={() => handleEditClick(trip)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => deleteTrip(trip.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingTrip && (
        <div className="section">
          <h3>Edit Trip: {editingTrip.destination}</h3>
          <form onSubmit={handleEditSubmit} className="form-grid">
            <input
              name="destination"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              required
            />
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              required
            />
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
            />
            <button type="submit">Save</button>
            <button type="button" className="btn-ghost" onClick={() => setEditingTrip(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
