import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [ok, setOk] = useState(false);
    const navigate = useNavigate();

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setOk(false);
        try {
            await api.post("/users/register", form);
            setOk(true);
            // give a tiny moment then go to login
            setTimeout(() => navigate("/login"), 600);
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed";
            setError(msg);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: "5rem auto" }}>
            <h2>Create account</h2>
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
                <input
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={onChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={onChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={onChange}
                    required
                />
                <button type="submit">Sign up</button>
            </form>
            {ok && <p style={{ color: "green" }}>Account created — redirecting…</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <p style={{ marginTop: 10 }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
