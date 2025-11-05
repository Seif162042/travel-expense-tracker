import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [stats, setStats] = useState({
        tripsCount: 0,
        totalSpent: 0,
        avgPerTrip: 0,
    });
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({
        destination: "",
        start_date: "",
        end_date: "",
        budget: "",
        notes: "",
    });
    const [editingTrip, setEditingTrip] = useState(null);
    const [sortBy, setSortBy] = useState("date");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // ===== Load trips + stats =====
    const loadTrips = async () => {
        try {
            const res = await api.get("/trips");
            const tripsData = res.data;

            const totalSpent = tripsData.reduce((sum, t) => sum + Number(t.budget || 0), 0);
            const avgPerTrip = tripsData.length > 0 ? totalSpent / tripsData.length : 0;

            setTrips(tripsData);
            setStats({
                tripsCount: tripsData.length,
                totalSpent,
                avgPerTrip,
            });
        } catch (error) {
            console.error(error);
            setErr("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrips();
    }, []);

    // ===== Handle form input =====
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ===== Add or Update trip =====
    const handleSubmit = async (e) => {
  e.preventDefault();
  setErr("");

  const newStart = new Date(form.start_date);
  const newEnd = new Date(form.end_date);

  if (newEnd < newStart) {
    setErr("End date must be after start date");
    return;
  }

  // Check overlap with existing trips
  const overlap = trips.some((t) => {
    const start = new Date(t.start_date);
    const end = new Date(t.end_date);
    return (
      (newStart >= start && newStart <= end) ||
      (newEnd >= start && newEnd <= end) ||
      (start >= newStart && start <= newEnd) ||
      (end >= newStart && end <= newEnd)
    );
  });

  if (overlap) {
    setErr("Trip dates overlap with an existing trip.");
    return;
  }

  try {
    const res = await api.post("/trips", {
      title: form.destination,
      destination: form.destination,
      start_date: form.start_date,
      end_date: form.end_date,
      budget: Number(form.budget),
    });

    setTrips((prev) => [res.data, ...prev]);
    setForm({ destination: "", start_date: "", end_date: "", budget: "", notes: "" });
    loadTrips(); // refresh stats
  } catch (error) {
    console.error(error);
    setErr(error.response?.data?.message || "Failed to add trip");
  }
};


    // ===== Edit trip =====
    const handleEditClick = (trip) => {
        setEditingTrip(trip);
        setForm({
            destination: trip.destination,
            start_date: trip.start_date.slice(0, 10),
            end_date: trip.end_date.slice(0, 10),
            budget: trip.budget,
            notes: trip.notes || "",
        });
    };

    // ===== Delete trip =====
    const deleteTrip = async (id) => {
        if (!confirm("Delete this trip?")) return;
        try {
            await api.delete(`/trips/${id}`);
            setTrips((prev) => prev.filter((t) => t.id !== id));
            loadTrips();
        } catch (error) {
            console.error(error);
            setErr("Failed to delete trip");
        }
    };

    // ===== Sorting =====
    const sortedTrips = [...trips].sort((a, b) => {
        if (sortBy === "budget") return b.budget - a.budget;
        if (sortBy === "destination") return a.destination.localeCompare(b.destination);
        return new Date(a.start_date) - new Date(b.start_date);
    });

    // ===== UI =====
    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
            <Navbar />

            <h2>Dashboard Overview</h2>
            {err && <p style={{ color: "red" }}>{err}</p>}

            {/* === Summary Stats === */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginTop: "20px",
                }}
            >
                <div style={cardStyle}>
                    <h3>Total Trips</h3>
                    <p>{stats.tripsCount}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Total Spent</h3>
                    <p>${stats.totalSpent.toFixed(2)}</p>
                </div>
                <div style={cardStyle}>
                    <h3>Average per Trip</h3>
                    <p>${stats.avgPerTrip.toFixed(2)}</p>
                </div>
            </div>

            {/* === My Trips Section === */}
            <h2>My Trips</h2>
             {/* === Sorting Options === */}
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <label style={{ marginRight: "8px", fontWeight: "500" }}>Sort by:</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "0.95rem",
                    }}
                >
                    <option value="date">Start Date</option>
                    <option value="budget">Budget</option>
                    <option value="destination">Destination</option>
                </select>
            </div>
            {trips.length === 0 ? (
                <p>No trips yet. Add your first one below!</p>
            ) : (
                <ul style={{ padding: 0, listStyle: "none", marginBottom: "2rem" }}>
                    {sortedTrips.map((trip) => (
                        <li
                            key={trip.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "10px 14px",
                                borderRadius: 6,
                                marginBottom: 8,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "#fff",
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
                            </div>
                            <div>
                                <button
                                    style={{
                                        marginRight: "8px",
                                        padding: "5px 10px",
                                        background: "#6a0dad",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => handleEditClick(trip)}
                                >
                                    Edit
                                </button>
                                <button
                                    style={{
                                        padding: "5px 10px",
                                        background: "#b91c1c",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => deleteTrip(trip.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* === Add / Edit Trip Form === */}
            <h3>{editingTrip ? "Edit Trip" : "Add New Trip"}</h3>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    width: "100%",
                }}
            >
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
                <textarea
                    name="notes"
                    placeholder="Notes (optional)"
                    value={form.notes}
                    onChange={handleChange}
                    style={{
                        ...inputStyle,
                        gridColumn: "1 / -1",
                        minHeight: "70px",
                        resize: "vertical",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        gridColumn: "1 / -1",
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        cursor: "pointer",
                    }}
                >
                    {editingTrip ? "Update Trip" : "Add Trip"}
                </button>
            </form>
        </div>
    );
}

const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#fafafa",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
};
