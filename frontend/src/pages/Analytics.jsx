import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Analytics() {
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, expensesRes] = await Promise.all([
          api.get("/trips"),
          api.get("/expenses"),
        ]);
        setTrips(tripsRes.data);
        setExpenses(expensesRes.data);
      } catch (error) {
        console.error(error);
        setErr("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (err) return <p style={{ color: "red" }}>{err}</p>;

  // ====== Apply Filters ======
  const filteredExpenses = expenses.filter((e) => {
    if (selectedTrip && e.trip_id !== selectedTrip) return false;
    if (!e.date) return false;

    const date = new Date(e.date);
    if (fromDate && date < new Date(fromDate)) return false;
    if (toDate && date > new Date(toDate)) return false;

    return true;
  });

  // ====== Summary Metrics ======
  const totalSpent = filteredExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );
  const totalTrips = selectedTrip ? 1 : trips.length;
  const avgBudget = totalTrips > 0 ? totalSpent / totalTrips : 0;

  // ====== Spending by Destination ======
  const spendByDestination = trips.map((t) => ({
    destination: t.destination,
    budget: Number(t.budget) || 0,
  }));

  // ====== Spending Trend (by date) ======
  const spendByDate = filteredExpenses.reduce((acc, e) => {
    if (!e.date) return acc;
    const date = e.date.slice(0, 10);
    acc[date] = (acc[date] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  const trendData = Object.entries(spendByDate).map(([date, value]) => ({
    date,
    value,
  }));

  // ====== Category Breakdown ======
  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    const cat = e.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
    return acc;
  }, {});
  const categoryData = Object.entries(categoryTotals).map(
    ([name, value]) => ({ name, value })
  );

  // ====== Chart Colors ======
  const colors = [
    "#6A4C93",
    "#FF6B6B",
    "#4ECDC4",
    "#FFD93D",
    "#1A535C",
    "#FF9F1C",
    "#00A8E8",
    "#C77DFF",
  ];

  // ====== UI ======
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <Navbar />
      <h2 style={{ marginBottom: "1rem" }}>Global Analytics</h2>

      {/* === Filters === */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {/* Trip Selector */}
        <div>
          <label style={{ fontWeight: 500, marginRight: "6px" }}>Trip:</label>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Trips</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.destination}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label style={{ fontWeight: 500, marginRight: "6px" }}>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={selectStyle}
          />
        </div>
        <div>
          <label style={{ fontWeight: 500, marginRight: "6px" }}>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={selectStyle}
          />
        </div>
      </div>

      {/* === Summary Cards === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "2rem",
        }}
      >
        <div style={cardStyle}>
          <h3>Total Trips</h3>
          <p>{totalTrips}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Spent</h3>
          <p>${totalSpent.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3>Average per Trip</h3>
          <p>${avgBudget.toFixed(2)}</p>
        </div>
      </div>

      {/* === Bar Chart: Spending by Destination === */}
      <h3>Spending by Destination</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={spendByDestination}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="destination" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="budget" fill="#6A4C93" name="Budget" />
        </BarChart>
      </ResponsiveContainer>

      {/* === Line Chart: Spending Trend === */}
      <h3 style={{ marginTop: "2rem" }}>Spending Trend Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={trendData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#FF6B6B"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* === Pie Chart: Category Breakdown === */}
      <h3 style={{ marginTop: "2rem" }}>Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {categoryData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`$${value}`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
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

const selectStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
}
