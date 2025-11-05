import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function TripDetails() {
    const { id } = useParams(); // trip id
    const [trip, setTrip] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [form, setForm] = useState({
        category: "",
        amount: "",
        description: "",
        date: "",
    });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const load = async () => {
        setErr("");
        try {
            const [tRes, eRes] = await Promise.all([
                api.get(`/trips/${id}`),
                api.get(`/expenses/trip/${id}`),
            ]);
            setTrip(tRes.data);
            setExpenses(eRes.data);
        } catch (e) {
            console.error("Error loading trip details:", e);
            setErr(e.response?.data?.message || "Failed to load trip");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        load();
    }, [id]);

    const onChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const addExpense = async (e) => {
        e.preventDefault();
        setErr("");
        if (!form.category || !form.amount) return;

        try {
            const res = await api.post("/expenses", {
                trip_id: id,
                category: form.category,
                amount: Number(form.amount),
                description: form.description || null,
                date: form.date || null,
            });

            // ✅ handle successResponse wrapper correctly
            const newExpense = res.data.data || res.data;

            setExpenses((prev) => [newExpense, ...prev]);
            setForm({ category: "", amount: "", description: "", date: "" });
        } catch (e2) {
            setErr(e2.response?.data?.message || "Failed to add expense");
        }
    };


    const removeExpense = async (expenseId) => {
        try {
            await api.delete(`/expenses/${expenseId}`);
            setExpenses((prev) => prev.filter((x) => x.id !== expenseId));
        } catch (e3) {
            setErr(e3.response?.data?.message || "Failed to delete expense");
        }
    };

    // ===== UI =====//
    if (loading) return <p>Loading…</p>;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Navbar />

            <Link to="/dashboard">{`← Back to trips`}</Link>

            {err && <p style={{ color: "red" }}>{err}</p>}

            {trip ? (
                <>
                    <h2 style={{ marginTop: 10 }}>{trip.destination}</h2>
                    <p>
                        {trip.start_date?.slice(0, 10)} → {trip.end_date?.slice(0, 10)}
                    </p>
                    <p>Budget: ${trip.budget}</p>
                    {trip.notes && <p>Notes: {trip.notes}</p>}

                    <h3 style={{ marginTop: 24 }}>Add expense</h3>

                    <form
                        onSubmit={addExpense}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            width: "100%",
                        }}
                    >
                        <input
                            name="category"
                            placeholder="Category (Hotel, Food, …)"
                            value={form.category}
                            onChange={onChange}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                boxSizing: "border-box",
                            }}
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            value={form.amount}
                            onChange={onChange}
                            required
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                boxSizing: "border-box",
                            }}
                        />
                        <input
                            name="description"
                            placeholder="Description"
                            value={form.description}
                            onChange={onChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                boxSizing: "border-box",
                            }}
                        />
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={onChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #ccc",
                                fontSize: "1rem",
                                boxSizing: "border-box",
                            }}
                        />
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
                            onMouseOver={(e) => (e.target.style.backgroundColor = "var(--primary-hover)")}
                            onMouseOut={(e) => (e.target.style.backgroundColor = "var(--primary)")}
                        >
                            Add Expense
                        </button>
                    </form>



                    <h3 style={{ marginTop: 24 }}>
                        Expenses{" "}
                        {expenses.length > 0 && (
                            <>
                                <span style={{ fontWeight: 500, fontSize: "1rem", color: "#555" }}>
                                    — Total Spent: $
                                    {expenses
                                        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                                        .toFixed(2)}
                                </span>
                                <br />
                                <span
                                    style={{
                                        fontWeight: 500,
                                        fontSize: "0.95rem",
                                        color:
                                            expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) >
                                                trip.budget
                                                ? "red"
                                                : "green",
                                    }}
                                >
                                    Budget Left: $
                                    {(
                                        trip.budget -
                                        expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
                                    ).toFixed(2)}
                                </span>
                            </>
                        )}
                    </h3>

                    {expenses.length === 0 ? (
                        <p>No expenses yet.</p>
                    ) : (
                        <ul style={{ padding: 0, listStyle: "none", marginTop: "1rem" }}>
                            {expenses.map((ex) => (
                                <li
                                    key={ex.id}
                                    className="card"
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
                                    <div>
                                        <strong>{ex.category || "Expense"}</strong>
                                        {ex.amount !== undefined && <span> — ${ex.amount}</span>}
                                        {ex.date && <span style={{ opacity: 0.7 }}> on {ex.date.slice(0, 10)}</span>}
                                        {ex.description && (
                                            <div style={{ marginTop: "4px", fontSize: "0.9rem", opacity: 0.8 }}>
                                                {ex.description}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => removeExpense(ex.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    )}



                </>
            ) : (
                <p>Trip not found.</p>
            )}
        </div>
    );
}
