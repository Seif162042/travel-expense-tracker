/**
 * ExpenseForm Component
 * Form for creating new expenses associated with a trip.
 * Includes validation to ensure expense dates are within the trip duration.
 */
import { useState } from "react";
import api from "../api/axios";

export default function ExpenseForm({ tripId, trip, setExpenses, setErr }) {
    // Form state to hold expense input values
    const [form, setForm] = useState({
        category: "",
        amount: "",
        description: "",
        date: "",
        end_date: "",
    });

    // Generic onChange handler for all form inputs
    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    /**
     * Handles form submission to create a new expense
     * Validates required fields and ensures dates are within trip duration
     */
    const addExpense = async (e) => {
        e.preventDefault();
        setErr("");

        const { category, amount, description, date, end_date } = form;
        // Validate required fields
        if (!category || !amount || !date) return setErr("Please fill all required fields.");

        // Date validation: ensure expense dates are within trip dates
        const s = new Date(date),
            eD = end_date ? new Date(end_date) : s,
            tS = new Date(trip.start_date),
            tE = new Date(trip.end_date);

        // Check if expense dates fall within trip duration
        if (s < tS || eD > tE) return setErr("Expense must be within trip duration.");
        // Check if end date is not before start date
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
        <form onSubmit={addExpense} className="form-grid section">
            <input
                name="category"
                placeholder="Category (Hotel, Food, …)"
                value={form.category}
                onChange={onChange}
                required
            />
            <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={onChange}
                required
            />
            <input
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={onChange}
            />
            <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
            />
            {/* Show end_date field only for hotel expenses (multi-day stays) */}
            {form.category.toLowerCase() === "hotel" && (
                <input
                    type="date"
                    name="end_date"
                    value={form.end_date}
                    onChange={onChange}
                    placeholder="End date"
                />
            )}
            <button type="submit" className="full">
                Add Expense
            </button>
        </form>
    );
}
