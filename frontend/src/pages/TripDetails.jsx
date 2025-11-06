import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import ExpenseChart from "../components/ExpenseChart";

export default function TripDetails() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [expenses, setExpenses] = useState([]);
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
            } catch (e) {
                setErr(e.response?.data?.message || "Failed to load trip");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

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
                            <ExpenseList expenses={expenses} setExpenses={setExpenses} setErr={setErr} />
                        </>
                    )}
                </>
            ) : (
                <p>Trip not found.</p>
            )}
        </div>
    );
}
