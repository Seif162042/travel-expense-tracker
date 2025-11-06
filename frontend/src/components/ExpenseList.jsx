import { useState } from "react";
import api from "../api/axios";

export default function ExpenseList({ expenses, setExpenses, setErr }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setEditData(expense);
    };

    const saveEdit = async (id) => {
        try {
            const res = await api.put(`/expenses/${id}`, {
                amount: Number(editData.amount),
                category: editData.category,
                description: editData.description || null,
                date: editData.date,
                end_date: editData.end_date,
            });
            setExpenses((prev) => prev.map((e) => (e.id === id ? res.data : e)));
            setEditingId(null);
        } catch (e) {
            setErr(e.response?.data?.message || "Failed to update expense");
        }
    };

    const removeExpense = async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses((prev) => prev.filter((x) => x.id !== id));
        } catch (e3) {
            setErr(e3.response?.data?.message || "Failed to delete expense");
        }
    };

    return (
        <ul style={{ padding: 0, listStyle: "none" }}>
            {expenses.map((ex) => (
                <li
                    key={ex.id}
                    className="card"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                    }}
                >
                    {editingId === ex.id ? (
                        <>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <input
                                    value={editData.category}
                                    onChange={(e) =>
                                        setEditData({ ...editData, category: e.target.value })
                                    }
                                    style={{ width: "20%" }}
                                />
                                <input
                                    type="number"
                                    value={editData.amount}
                                    onChange={(e) =>
                                        setEditData({ ...editData, amount: e.target.value })
                                    }
                                    style={{ width: "20%" }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => saveEdit(ex.id)}>💾 Save</button>
                                <button onClick={() => setEditingId(null)}>✖ Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <strong>{ex.category}</strong> — ${ex.amount}
                                <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                                    {ex.date?.slice(0, 10)}
                                    {ex.end_date ? ` → ${ex.end_date.slice(0, 10)}` : ""}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleEdit(ex)}>✎ Edit</button>
                                <button onClick={() => removeExpense(ex.id)}>🗑 Delete</button>
                            </div>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
}
