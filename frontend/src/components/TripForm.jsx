/**
 * TripForm Component
 * Form for creating new trips.
 * Handles trip creation with validation and refreshes the trip list on success.
 */
import { useState } from "react";
import api from "../api/axios";

export default function TripForm({ loadTrips }) {
  // Form state for trip input fields
  const [form, setForm] = useState({
    destination: "",
    start_date: "",
    end_date: "",
    budget: "",
  });
  // Error state for displaying validation/API errors
  const [err, setErr] = useState("");

  /**
   * Generic onChange handler for all form inputs
   */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Handle form submission to create a new trip
   * Resets form and refreshes trip list on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await api.post("/trips", {
        title: form.destination,
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
        budget: Number(form.budget),
      });
      // Reset form after successful submission
      setForm({ destination: "", start_date: "", end_date: "", budget: "" });
      // Refresh the trip list in parent component
      loadTrips();
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to add trip");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Add New Trip</h3>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <form onSubmit={handleSubmit} style={formGrid}>
        <input
          name="destination"
          placeholder="Destination"
          value={form.destination}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="number"
          name="budget"
          placeholder="Budget"
          value={form.budget}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={submitBtn}>
          Add Trip
        </button>
      </form>
    </div>
  );
}

const formGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  width: "100%",
};
const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
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
