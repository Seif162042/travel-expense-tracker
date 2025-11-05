import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import DashboardCharts from "../components/DashboardCharts";
import TripList from "../components/TripList";
import TripForm from "../components/TripForm";
import DashboardOverview from "../components/DashboardOverview";




export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [expensesData, setExpensesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);


  const loadTrips = async () => {
    try {
      const res = await api.get("/trips");
      setTrips(res.data);

      // load total expenses for each trip
      const expensesObj = {};
      await Promise.all(
        res.data.map(async (t) => {
          try {
            const expRes = await api.get(`/expenses/trip/${t.id}`);
            const total = expRes.data.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            expensesObj[t.id] = total;
          } catch {
            expensesObj[t.id] = 0;
          }
        })
      );
      setExpensesData(expensesObj);
    } catch (error) {
      setErr("Failed to load trips");
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
    {showAnalytics ? "Hide Analytics Overview ▲" : "Show Analytics Overview ▼"}
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
