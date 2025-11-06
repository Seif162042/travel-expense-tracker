import { useState } from "react";
import api from "../api/axios";

export default function ExpenseForm({ tripId, trip, setExpenses, setErr }) {
    const [form, setForm] = useState({
        category: "",
        amount: "",
        description: "",
        date: "",
        end_date: "",
    });

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    // ✅ your style
    const inputStyle = {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "1rem",
        boxSizing: "border-box",
    };

    const addExpense = async (e) => {
        e.preventDefault();
        setErr("");

        const { category, amount, description, date, end_date } = form;
        if (!category || !amount || !date) return setErr("Please fill all required fields.");

        const s = new Date(date),
            eD = end_date ? new Date(end_date) : s,
            tS = new Date(trip.start_date),
            tE = new Date(trip.end_date);

        if (s < tS || eD > tE) return setErr("Expense must be within trip duration.");
        if (eD < s) return setErr("End date cannot be before start date.");

        try {
            const res = await api.post("/expenses", {
                trip_id: tripId,
                category,
                amount: Number(amount),
                description: description || null,
                date,
                end_date: end_date || undefined,
            });
            const newExpense = res.data.data || res.data;
            setExpenses((prev) => [newExpense, ...prev]);
            setForm({ category: "", amount: "", description: "", date: "", end_date: "" });
        } catch (e2) {
            const msg =
                e2.response?.data?.message ||
                JSON.stringify(e2.response?.data?.error || e2.response?.data?.errors) ||
                "Failed to add expense";
            setErr(msg);
        }
    };

    return (
        <form
            onSubmit={addExpense}
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "20px",
            }}
        >
            <input
                name="category"
                placeholder="Category (Hotel, Food, …)"
                value={form.category}
                onChange={onChange}
                required
                style={inputStyle}
            />
            <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={onChange}
                required
                style={inputStyle}
            />
            <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={onChange}
                style={inputStyle}
            />
            <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                style={inputStyle}
            />
            {form.category.toLowerCase() === "hotel" && (
                <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={onChange}
                    placeholder="End date"
                    style={inputStyle}
                />
            )}
            <button
                type="submit"
                style={{
                    gridColumn: "1 / -1",
                    padding: "12px",
                    backgroundColor: "var(--primary)",
                    borderRadius: "8px",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                }}
            >
                Add Expense
            </button>
        </form>
    );
}
