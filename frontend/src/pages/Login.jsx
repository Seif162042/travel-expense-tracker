import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/feed");
        } catch (err) {
            console.error(err);
            setError("Invalid email or password");
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
                <h2 style={{ marginBottom: "1.5rem" }}>Login to Your Account</h2>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            fontWeight: "600",
                            width: "100%",
                            padding: "10px",
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
                            fontWeight: "600",
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
                            padding: "10px",
                            fontWeight: "600",
                        }}
                    >
                        Login
                    </button>
                </form>

                {error && (
                    <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
                )}

                <p style={{ marginTop: "1rem" }}>
                    Don’t have an account?{" "}
                    <Link
                        to="/register"
                        style={{ color: "var(--primary)", fontWeight: "500" }}
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
