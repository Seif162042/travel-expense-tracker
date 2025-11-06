import { useState } from "react";
import api from "../api/axios";

export default function ExpenseList({ expenses, setExpenses, setErr, trip }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setEditData({
            category: expense.category,
            amount: expense.amount,
            description: expense.description || "",
            date: expense.date ? expense.date.slice(0, 10) : "",
            end_date: expense.end_date ? expense.end_date.slice(0, 10) : "",
        });
        setErr(""); // Clear any previous errors when starting to edit
    };

    const saveEdit = async (id) => {
        try {
            // === Client-side date validation ===
            if (trip && editData.date) {
                // Normalize dates to date-only strings for comparison (YYYY-MM-DD)
                const expenseStartDate = editData.date.slice(0, 10);
                const expenseEndDate = editData.end_date
                    ? editData.end_date.slice(0, 10)
                    : expenseStartDate;
                const tripStartDate = trip.start_date ? trip.start_date.slice(0, 10) : null;
                const tripEndDate = trip.end_date ? trip.end_date.slice(0, 10) : null;

                if (tripStartDate && tripEndDate) {
                    // Validate expense dates are within trip dates (string comparison works for YYYY-MM-DD format)
                    if (expenseStartDate < tripStartDate || expenseEndDate > tripEndDate) {
                        setErr("Expense dates must stay within the trip duration.");
                        return;
                    }

                    // Validate expense end date is not before start date
                    if (expenseEndDate < expenseStartDate) {
                        setErr("Expense end date cannot be before start date.");
                        return;
                    }
                }
            } else if (trip && !editData.date) {
                // If trip exists but no date provided, that's also invalid
                setErr("Expense date is required.");
                return;
            }

            // === Prepare payload ===
            const payload = {
                amount: Number(editData.amount),
                category: editData.category,
                description: editData.description?.trim() || null,
                date: editData.date ? editData.date : undefined,
                end_date: editData.end_date ? editData.end_date : undefined,
            };

            const res = await api.put(`/expenses/${id}`, payload);
            const updated = res.data;

            setExpenses((prev) =>
                prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
            );
            setEditingId(null);
            setErr(""); // Clear error on successful save
        } catch (e) {
            console.error("Update failed:", e.response?.data || e);
            setErr(
                e.response?.data?.message ||
                (Array.isArray(e.response?.data?.error)
                    ? e.response.data.error[0].msg
                    : "Failed to update expense")
            );
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
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
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
                                    style={{ width: "120px" }}
                                />
                                <input
                                    type="date"
                                    value={editData.date}
                                    onChange={(e) =>
                                        setEditData({ ...editData, date: e.target.value })
                                    }
                                />
                                <input
                                    type="date"
                                    value={editData.end_date}
                                    onChange={(e) =>
                                        setEditData({ ...editData, end_date: e.target.value })
                                    }
                                />
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <button onClick={() => saveEdit(ex.id)}>💾 Save</button>
                                <button onClick={() => {
                                    setEditingId(null);
                                    setErr(""); // Clear error when canceling
                                }}>✖ Cancel</button>
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
                                {ex.description && (
                                    <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                                        {ex.description}
                                    </div>
                                )}
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
