import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ExpenseChart({ expenses }) {
    const COLORS = ["#6A4C93", "#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];
    const data = Object.values(
        expenses.reduce((a, e) => {
            const c = e.category || "Uncategorized";
            a[c] = a[c] || { name: c, value: 0 };
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
