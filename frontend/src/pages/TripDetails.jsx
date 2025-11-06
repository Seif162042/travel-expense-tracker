import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import ExpenseFilters from "../components/ExpenseFilters";

export default function TripDetails() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const filteredExpensesRef = useRef([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    // Load trip + expenses
    useEffect(() => {
        (async () => {
            try {
                const [tRes, eRes] = await Promise.all([
                    api.get(`/trips/${id}`),
                    api.get(`/expenses/trip/${id}`),
                ]);
                setTrip(tRes.data);
                setExpenses(eRes.data);
                setFilteredExpenses(eRes.data);
                filteredExpensesRef.current = eRes.data;
            } catch (e) {
                setErr(e.response?.data?.message || "Failed to load trip");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Sync filtered expenses when expenses change
    useEffect(() => {
        setFilteredExpenses(expenses);
        filteredExpensesRef.current = expenses;
    }, [expenses]);

    // Update ref whenever filteredExpenses changes
    useEffect(() => {
        filteredExpensesRef.current = filteredExpenses;
    }, [filteredExpenses]);

    // Wrapper function to update actual expenses (not filtered)
    const updateExpenses = (updater) => {
        setExpenses((actualExpenses) => {
            if (typeof updater === 'function') {
                // Use ref to get the latest filtered expenses
                const currentFiltered = filteredExpensesRef.current;
                // Execute the updater on filtered list to see what changed
                const updatedFiltered = updater(currentFiltered);

                // Find which expense was updated by comparing each expense by ID
                for (const updated of updatedFiltered) {
                    const original = currentFiltered.find(fe => fe.id === updated.id);
                    if (original && JSON.stringify(updated) !== JSON.stringify(original)) {
                        // This expense was updated, apply the update to actual expenses
                        return actualExpenses.map(e => e.id === updated.id ? updated : e);
                    }
                }

                // For delete operations (length decreased)
                if (updatedFiltered.length < currentFiltered.length) {
                    const deletedId = currentFiltered.find(fe =>
                        !updatedFiltered.some(ue => ue.id === fe.id)
                    )?.id;
                    if (deletedId) {
                        return actualExpenses.filter(e => e.id !== deletedId);
                    }
                }

                // If no change detected, return as-is
                return actualExpenses;
            }
            return updater;
        });
    };

    if (loading) return <p>Loading…</p>;

    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Navbar />
            <Link to="/dashboard">← Back to trips</Link>
            {err && <p style={{ color: "red" }}>{err}</p>}

            {trip ? (
                <>
                    <h2>{trip.destination}</h2>
                    <p>
                        {trip.start_date?.slice(0, 10)} → {trip.end_date?.slice(0, 10)}
                    </p>
                    <p>Budget: ${trip.budget}</p>
                    {trip.notes && <p>Notes: {trip.notes}</p>}

                    <ExpenseForm trip={trip} tripId={id} setExpenses={setExpenses} setErr={setErr} />
                    {expenses.length > 0 && (
                        <>
                            <ExpenseChart expenses={expenses} />
                            <h3 style={{ marginTop: 20 }}>
                                Total Spent: ${totalSpent.toFixed(2)} | Budget Left: $
                                {(trip.budget - totalSpent).toFixed(2)}
                            </h3>
                            <ExpenseFilters expenses={expenses} onChange={setFilteredExpenses} />
                            <ExpenseList expenses={filteredExpenses} setExpenses={updateExpenses} setErr={setErr} />
                        </>
                    )}
                </>
            ) : (
                <p>Trip not found.</p>
            )}
        </div>
    );
}
