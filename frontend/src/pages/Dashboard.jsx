import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
    const [stats, setStats] = useState({
        tripsCount: 0,
        expensesCount: 0,
        totalSpent: 0,
        avgPerTrip: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Fetch trips
                const tripsRes = await api.get("/trips");
                const trips = tripsRes.data;

                // For each trip, fetch its expenses
                let allExpenses = [];
                for (const trip of trips) {
                    const expRes = await api.get(`/expenses/${trip.id}`);
                    allExpenses = [...allExpenses, ...expRes.data];
                }

                const totalSpent = allExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
                const avgPerTrip = trips.length > 0 ? totalSpent / trips.length : 0;

                setStats({
                    tripsCount: trips.length,
                    expensesCount: allExpenses.length,
                    totalSpent,
                    avgPerTrip,
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}>
            <Navbar />
            <h2>Dashboard Overview</h2>

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
                    <h3>Total Expenses</h3>
                    <p>{stats.expensesCount}</p>
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
