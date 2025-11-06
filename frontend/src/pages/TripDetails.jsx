/**
 * TripDetails Page Component
 * Displays detailed information about a specific trip including:
 * - Trip information (destination, dates, budget)
 * - Form to add new expenses
 * - Chart visualization of expenses
 * - Filtered and sorted list of expenses
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";
import ExpenseFilters from "../components/ExpenseFilters";

export default function TripDetails() {
    // Get trip ID from URL parameters
    const { id } = useParams();
    // State for trip data
    const [trip, setTrip] = useState(null);
    // State for all expenses (unfiltered)
    const [expenses, setExpenses] = useState([]);
    // State for filtered/sorted expenses to display
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    // State for error messages
    const [err, setErr] = useState("");
    // Loading state
    const [loading, setLoading] = useState(true);

    // Load trip and its expenses when component mounts or trip ID changes
    useEffect(() => {
        (async () => {
            try {
                const [tRes, eRes] = await Promise.all([
                    api.get(`/trips/${id}`),
                    api.get(`/expenses/trip/${id}`),
                ]);
                setTrip(tRes.data);
                localStorage.setItem("currentTrip", JSON.stringify(tRes.data));
                setExpenses(eRes.data);
                setFilteredExpenses(eRes.data);
            } catch (e) {
                setErr(e.response?.data?.message || "Failed to load trip");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Sync filtered expenses when expenses change (e.g., after adding/deleting)
    useEffect(() => {
        setFilteredExpenses(expenses);
    }, [expenses]);

    // Show loading indicator while fetching data
    if (loading) return <p>Loading…</p>;

    // Calculate total amount spent across all expenses
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
                            <ExpenseList expenses={filteredExpenses} setExpenses={setExpenses} setErr={setErr} trip={trip} />
                        </>
                    )}
                </>
            ) : (
                <p>Trip not found.</p>
            )}
        </div>
    );
}
