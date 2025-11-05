import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";

export default function DashboardCharts({ trips = [], expensesData = {} }) {
  // === Derived datasets ===
  const barData = trips.map((t) => ({
    name: t.destination,
    Budget: Number(t.budget) || 0,
    Spent: Number(expensesData[t.id]) || 0,
  }));

  const pieData = trips.map((t) => ({
    name: t.destination,
    value: Number(t.budget) || 0,
  }));

  const lineData = trips
    .slice()
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .map((t) => ({
      name: t.destination,
      date: t.start_date?.slice(0, 10),
      Spent: Number(expensesData[t.id]) || 0,
    }));

  const COLORS = [
    "#6A0DAD", // deep purple
    "#9B5DE5", // bright violet
    "#F15BB5", // magenta
    "#00BBF9", // cyan
    "#00F5D4", // aqua green
    "#FFB400", // gold
    "#FF4C4C", // red
    "#4CAF50", // green
    "#2196F3", // blue
  ];

  // === If no data ===
  if (!trips.length) {
    return <p style={{ textAlign: "center", color: "#777" }}>No analytics data yet.</p>;
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Analytics Overview</h2>

      {/* === Bar Chart === */}
      <div style={chartCard}>
        <h4>Budget vs. Actual Spent</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Budget" fill="#8884d8" />
            <Bar dataKey="Spent" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* === Pie Chart === */}
      <div style={chartCard}>
        <h4>Trip Budget Distribution</h4>
        {pieData.length > 0 && pieData.some((p) => p.value > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center", color: "#999", marginTop: "1rem" }}>
            Not enough data to render pie chart.
          </p>
        )}
      </div>

      {/* === Line Chart === */}
      <div style={chartCard}>
        <h4>Spending Trend Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Spent" stroke="#6A0DAD" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const chartCard = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: "10px",
  padding: "1rem",
  marginBottom: "1.5rem",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
};
