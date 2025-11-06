/**
 * DashboardOverview Component
 * Displays summary statistics cards showing:
 * - Total number of trips
 * - Total amount spent across all trips
 * - Average spending per trip
 * - Total budget across all trips
 */
export default function DashboardOverview({ trips, expensesData }) {
  if (!trips.length) {
    return <p>No trips yet — add your first one below!</p>;
  }

  // Compute totals and averages
  const tripsCount = trips.length;
  // Sum all trip budgets
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);
  // Sum all expenses from expensesData map
  const totalSpent = trips.reduce(
    (sum, t) => sum + (expensesData[t.id] || 0),
    0
  );
  // Calculate average spending per trip
  const avgPerTrip = tripsCount > 0 ? totalSpent / tripsCount : 0;

  return (
    <section style={{ marginTop: "1.5rem" }}>
      <h2>Dashboard Overview</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginTop: "1rem",
        }}
      >
        <div style={cardStyle}>
          <h3>Total Trips</h3>
          <p>{tripsCount}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Spent</h3>
          <p>${totalSpent.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3>Average Spent per Trip</h3>
          <p>${avgPerTrip.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Budget</h3>
          <p>${totalBudget.toFixed(2)}</p>
        </div>
      </div>
    </section>
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
