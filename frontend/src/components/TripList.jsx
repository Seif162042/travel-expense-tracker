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
    <div style={{ marginTop: "2rem" }}>
      <h2>My Trips</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}

      {trips.length === 0 ? (
        <p>No trips yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {trips.map((trip) => (
            <li
              key={trip.id}
              style={{
                border: "1px solid #ddd",
                padding: "10px 14px",
                borderRadius: 6,
                marginBottom: 8,
                background: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Link
                  to={`/trips/${trip.id}`}
                  style={{ textDecoration: "none", fontWeight: 600 }}
                >
                  {trip.destination}
                </Link>
                <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                  {trip.start_date?.slice(0, 10)} → {trip.end_date?.slice(0, 10)} | Budget: $
                  {trip.budget}
                </div>

                {/* Badges showing budget usage and days remaining */}
                <div style={{ marginTop: "6px" }}>
                  <span
                    style={{
                      background: "#6a0dad",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      marginRight: "6px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {getBudgetUsed(trip)}% used
                  </span>
                  <span
                    style={{
                      background: "#eee",
                      color:
                        getDaysLeft(trip).includes("ago") ? "red" : "green",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {getDaysLeft(trip)}
                  </span>
                </div>
              </div>

              {/* Edit and Delete buttons */}
              <div>
                <button
                  style={editBtn}
                  onClick={() => handleEditClick(trip)}
                >
                  Edit
                </button>
                <button
                  style={deleteBtn}
                  onClick={() => deleteTrip(trip.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Inline Edit Form: Shows when a trip is being edited */}
      {editingTrip && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Edit Trip: {editingTrip.destination}</h3>
          <form onSubmit={handleEditSubmit} style={formGrid}>
            <input
              name="destination"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="number"
              name="budget"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
              style={inputStyle}
            />
            <button type="submit" style={submitBtn}>Save</button>
            <button
              type="button"
              style={{ ...submitBtn, background: "#aaa" }}
              onClick={() => setEditingTrip(null)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ====== STYLES ======
const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
};
const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  width: "100%",
};
const editBtn = {
  marginRight: "8px",
  padding: "5px 10px",
  background: "#6a0dad",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const deleteBtn = {
  padding: "5px 10px",
  background: "#b91c1c",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};
const submitBtn = {
  gridColumn: "1 / -1",
  padding: "10px",
  backgroundColor: "var(--primary)",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
  cursor: "pointer",
};
