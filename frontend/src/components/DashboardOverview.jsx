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
    <section>
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="card stat-card">
          <p className="stat-label">Total Trips</p>
          <p className="stat-value">{tripsCount}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Total Spent</p>
          <p className="stat-value">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Average Spent per Trip</p>
          <p className="stat-value">${avgPerTrip.toFixed(2)}</p>
        </div>
        <div className="card stat-card">
          <p className="stat-label">Total Budget</p>
          <p className="stat-value">${totalBudget.toFixed(2)}</p>
        </div>
      </div>
    </section>
  );
}
