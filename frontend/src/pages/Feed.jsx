/**
 * Feed Page Component
 * 
 * This page displays a public feed of all trips from all users, allowing users to explore
 * other people's travel plans.
 * 
 * Functionality:
 * - Fetches all public trips from the /trips/feed endpoint
 * - Displays trips in a card-based grid layout
 * - Shows trip details: destination, dates, budget, and owner name
 * - Handles loading and error states
 * - Provides an empty state when no trips are available
 * 
 * Flow:
 * 1. On component mount, fetches all public trips
 * 2. Displays loading indicator while fetching
 * 3. Renders trip cards in a grid layout
 * 4. Shows empty message if no trips exist
 * 5. Shows error message if fetch fails
 */
import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Feed() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAllTrips = async () => {
            try {
                const res = await api.get("/trips/feed");  // ← THIS WAS MISSING!
                const tripsData = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setTrips(tripsData);
            } catch (err) {
                console.error(err);
                setError("Failed to load feed");
                setTrips([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAllTrips();
    }, []);


    if (loading) return <p>Loading feed...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
            <Navbar />
            <h2>Explore Other Trips</h2>

            {trips.length === 0 ? (
                <p>No public trips yet.</p>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        marginTop: "1rem",
                    }}
                >
                    {trips.map((trip) => (
                        <div
                            key={trip.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "1rem",
                                width: "260px",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <h3>{trip.destination}</h3>
                            <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                                {trip.start_date?.slice(0, 10)} → {trip.end_date?.slice(0, 10)}
                            </p>
                            <p>
                                <strong>Budget:</strong> ${trip.budget}
                            </p>
                            <p>
                                <strong>Posted by:</strong> {trip.user_name}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
