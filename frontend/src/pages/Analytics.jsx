/**
 * Analytics Page Component
 * 
 * This page provides comprehensive analytics and visualizations of travel expenses across
 * all trips with filtering capabilities.
 * 
 * Functionality:
 * - Fetches all trips and expenses data on mount
 * - Provides filters: trip selection, date range (from/to dates)
 * - Calculates summary metrics: total trips, total spent, average per trip
 * - Displays three types of charts:
 *   1. Bar Chart: Spending by destination (shows budget per trip)
 *   2. Line Chart: Spending trend over time (daily expense aggregation)
 *   3. Pie Chart: Spending breakdown by category
 * - Handles loading and error states
 * 
 * Data Processing:
 * - Filters expenses based on selected trip and date range
 * - Aggregates expenses by date for trend analysis
 * - Groups expenses by category for pie chart
 * - Calculates totals and averages from filtered data
 * 
 * Flow:
 * 1. Fetches trips and expenses in parallel on mount
 * 2. Applies filters to expense data based on user selections
 * 3. Processes filtered data into chart-friendly formats
 * 4. Renders summary cards and three chart visualizations
 */
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
        const tripsData = Array.isArray(tripsRes.data) ? tripsRes.data : (tripsRes.data.data || []);
        const expensesData = Array.isArray(expensesRes.data) ? expensesRes.data : (expensesRes.data.data || []);


        setTrips(tripsData);
        setExpenses(expensesData);
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
  if (err) return <p className="error">{err}</p>;

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
  const colors = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

  // ====== UI ======
  return (
    <div className="container">
      <Navbar />
      <h2>Global Analytics</h2>

      {/* === Filters === */}
      <div className="filters">
        {/* Trip Selector */}
        <div>
          <label>Trip:</label>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
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
          <label>From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label>To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* === Summary Cards === */}
      <div className="stats-grid">
        <div className="card stat-card">
          <p className="stat-label">Total Trips</p>
          <p className="stat-value">{totalTrips}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Total Spent</p>
          <p className="stat-value">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Average per Trip</p>
          <p className="stat-value">${avgBudget.toFixed(2)}</p>
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
          <Bar dataKey="budget" fill="#4f46e5" name="Budget" />
        </BarChart>
      </ResponsiveContainer>

      {/* === Line Chart: Spending Trend === */}
      <h3 className="section">Spending Trend Over Time</h3>
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
            stroke="#4f46e5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* === Pie Chart: Category Breakdown === */}
      <h3 className="section">Spending by Category</h3>
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
