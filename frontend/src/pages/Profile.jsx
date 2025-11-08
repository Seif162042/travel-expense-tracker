/**
 * Profile Page Component
 * 
 * This page displays the authenticated user's profile information.
 * 
 * Functionality:
 * - Fetches and displays the current user's profile data from the API
 * - Shows user details: name, email, and user ID
 * - Handles loading and error states during data fetch
 * - Provides a clean, readable display of profile information
 * 
 * Flow:
 * 1. On component mount, fetches user profile from /users/me endpoint
 * 2. Displays loading indicator while fetching
 * 3. Renders profile information once loaded
 * 4. Shows error message if fetch fails
 */
import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get("/users/me");
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
            <Navbar />
            <h2>User Profile</h2>
            {profile ? (
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "16px",
                        backgroundColor: "#fafafa",
                    }}
                >
                    <p>
                        <strong>Name:</strong> {profile.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {profile.email}
                    </p>
                    <p>
                        <strong>User ID:</strong> {profile.id}
                    </p>
                </div>
            ) : (
                <p>No profile data found.</p>
            )}
        </div>
    );
}
