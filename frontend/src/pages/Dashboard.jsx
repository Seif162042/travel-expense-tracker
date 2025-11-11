/**
 * Dashboard Page Component
 * Main page displaying user's trips with:
 * - Overview statistics
 * - List of all trips with expense totals
 * - Form to create new trips
 * - Collapsible analytics charts
 */
import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import DashboardCharts from "../components/DashboardCharts";
import TripList from "../components/TripList";
import TripForm from "../components/TripForm";
import DashboardOverview from "../components/DashboardOverview";

export default function Dashboard() {
  // State for user's trips
  const [trips, setTrips] = useState([]);
  // State for expense totals per trip (trip_id -> total amount)
  const [expensesData, setExpensesData] = useState({});
  // Loading state
  const [loading, setLoading] = useState(true);
  // Error state
  const [err, setErr] = useState("");
  // State to toggle analytics visibility
  const [showAnalytics, setShowAnalytics] = useState(false);

  /**
   * Load all trips and calculate expense totals for each trip
   * Fetches trips and their associated expenses in parallel
   */
  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");

      // FIX: Handle different response structures
      const tripsData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setTrips(tripsData);

      // Load total expenses for each trip
      // Creates a map of trip_id -> total expense amount
      const expensesObj = {};
      await Promise.all(
        tripsData.map(async (t) => {
          try {
            const expRes = await api.get(`/expenses/trip/${t.id}`);
            // Handle different response structures for expenses
            const expensesArray = Array.isArray(expRes.data) ? expRes.data : (expRes.data.data || []);
            // Sum all expense amounts for this trip
            const total = expensesArray.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            expensesObj[t.id] = total;
          } catch {
            // If expenses can't be loaded, default to 0
            expensesObj[t.id] = 0;
          }
        })
      );
      setExpensesData(expensesObj);
    } catch (error) {
      setErr("Failed to load trips");
      setTrips([]); // Ensure trips is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <Navbar />
      <DashboardOverview trips={trips} expensesData={expensesData} />
      <TripList trips={trips} expensesData={expensesData} loadTrips={loadTrips} />
      <TripForm loadTrips={loadTrips} />
      {/* ===== Collapsible Analytics Overview ===== */}
      <div
        style={{
          marginTop: "1.5rem",
          background: "#f8f9fa",
          borderRadius: "10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "0",
        }}
      >
        <button
          onClick={() => setShowAnalytics(!showAnalytics)}
          style={{
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
            textAlign: "center",
            padding: "10px 0",
          }}
        >
          {showAnalytics ? "Hide Analytics Overview ↑" : "Show Analytics Overview ↓"}
        </button>

        {showAnalytics && (
          <div
            style={{
              marginTop: "1rem",
              transition: "max-height 0.4s ease",
              overflow: "hidden",
            }}
          >
            <DashboardCharts trips={trips} expensesData={expensesData} />
          </div>
        )}
      </div>

    </div>
  );
}
