import api from "../api/axios";

export default function ExpenseList({ expenses, setExpenses, setErr }) {
    const removeExpense = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
            setErr(err.response?.data?.message || "Failed to delete expense");
        }
    };

    return (
        <ul style={{ listStyle: "none", padding: 0 }}>
            {expenses.map((ex) => (
                <li
                    key={ex.id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "6px",
                        padding: "10px 14px",
                        marginBottom: "8px",
                    }}
                >
                    <div>
                        <strong>{ex.category}</strong> — ${ex.amount}
                        {ex.date && (
                            <span style={{ opacity: 0.7 }}>
                                {" "}
                                on {ex.date.slice(0, 10)} {ex.end_date ? `→ ${ex.end_date.slice(0, 10)}` : ""}
                            </span>
                        )}
                        {ex.description && (
                            <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>{ex.description}</div>
                        )}
                    </div>
                    <button onClick={() => removeExpense(ex.id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}
