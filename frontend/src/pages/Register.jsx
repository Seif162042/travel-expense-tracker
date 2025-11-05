import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await api.post("/users/register", { name, email, password });
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError("Registration failed. Please try again.");
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "var(--bg)",
            }}
        >
            <div
                className="card"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <h2 style={{ marginBottom: "1.5rem" }}>Create Your Account</h2>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            fontWeight: "600",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                            boxSizing: "border-box",
                        }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            fontWeight: "600",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                            boxSizing: "border-box",
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            fontWeight: "600",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                            boxSizing: "border-box",
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "10px",
                            fontWeight: "600",
                        }}
                    >
                        Sign Up
                    </button>
                </form>

                {error && (
                    <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
                )}

                <p style={{ marginTop: "1rem" }}>
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{ color: "var(--primary)", fontWeight: "500" }}
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
