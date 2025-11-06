/**
 * ExpenseChart Component
 * Displays a pie chart showing expense breakdown by category.
 * Aggregates expenses by category and shows the total amount per category.
 */
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ExpenseChart({ expenses }) {
    // Color palette for pie chart segments
    const COLORS = ["#6A4C93", "#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];
    
    // Aggregate expenses by category, summing amounts for each category
    const data = Object.values(
        expenses.reduce((a, e) => {
            const c = e.category || "Uncategorized";
            // Initialize category if it doesn't exist
            a[c] = a[c] || { name: c, value: 0 };
            // Add expense amount to category total
            a[c].value += Number(e.amount) || 0;
            return a;
        }, {})
    );

    return (
        <div style={{ background: "#fff", borderRadius: "8px", padding: "16px", marginTop: "20px" }}>
            <h4 style={{ textAlign: "center" }}>Expense Breakdown by Category</h4>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                        {data.map((entry, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`$${v}`, n]} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
