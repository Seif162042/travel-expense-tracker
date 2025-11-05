import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


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
            await login(email, password); // Calls AuthContext login()
            navigate("/feed");// Redirect on success
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
                flexDirection: "column",
            }}
        >
            <h2>Login to Your Account</h2>
            <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", width: "300px" }}
            >
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <button type="submit" style={{ padding: "8px", cursor: "pointer" }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: "1rem", textAlign: "center" }}>
                Don’t have an account?{" "}
                <Link to="/register" style={{ color: "purple", textDecoration: "underline" }}>
                    Register here
                </Link>
            </p>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
