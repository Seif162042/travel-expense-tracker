import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({
        destination: "",
        start_date: "",
        end_date: "",
        budget: "",
        notes: "",
    });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // ===== Fetch Trips =====
    const loadTrips = async () => {
        try {
            const res = await api.get("/trips");
            setTrips(res.data);
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

    // ===== Form change handler =====
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ===== Add new trip =====
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr("");

        try {
            const res = await api.post("/trips", {
                destination: form.destination,
                start_date: form.start_date,
                end_date: form.end_date,
                budget: Number(form.budget),
                notes: form.notes,
            });

            setTrips((prev) => [res.data, ...prev]);
            setForm({ destination: "", start_date: "", end_date: "", budget: "", notes: "" });
        } catch (error) {
            console.error(error);
            setErr("Failed to add trip");
        }
    };

    // ===== Delete trip =====
    const deleteTrip = async (id) => {
        if (!confirm("Delete this trip?")) return;
        try {
            await api.delete(`/trips/${id}`);
            setTrips((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error(error);
            setErr("Failed to delete trip");
        }
    };

    // ===== UI =====
    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
            <Navbar />

            <h2>Your Trips</h2>
            {err && <p style={{ color: "red" }}>{err}</p>}

            {/* Trip List */}
            {trips.length === 0 ? (
                <p>No trips yet. Add your first one below!</p>
            ) : (
                <ul style={{ padding: 0, listStyle: "none" }}>
                    {trips.map((trip) => (
                        <li
                            key={trip.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "10px",
                                borderRadius: 6,
                                marginBottom: 8,
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
                            </div>
                            <button onClick={() => deleteTrip(trip.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Add New Trip Form */}
            <h3 style={{ marginTop: 30 }}>Add New Trip</h3>
            <form
                onSubmit={handleSubmit}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
            >
                <input
                    name="destination"
                    placeholder="Destination"
                    value={form.destination}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="budget"
                    placeholder="Budget"
                    value={form.budget}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="start_date"
                    value={form.start_date}
                    onChange={handleChange}
                    required
                />
                <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="notes"
                    placeholder="Notes (optional)"
                    value={form.notes}
                    onChange={handleChange}
                    style={{ gridColumn: "1 / -1" }}
                />
                <button type="submit" style={{ gridColumn: "1 / -1" }}>
                    Add Trip
                </button>
            </form>
        </div>
    );
}
