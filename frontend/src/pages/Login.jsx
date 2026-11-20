/**
 * Login Page Component
 * 
 * This page handles user authentication by allowing users to log in with their email and password.
 * 
 * Functionality:
 * - Displays a login form with email and password fields
 * - Validates user credentials through the AuthContext
 * - Redirects authenticated users to the feed page
 * - Shows error messages for invalid login attempts
 * - Provides a link to the registration page for new users
 * 
 * Flow:
 * 1. User enters email and password
 * 2. On form submission, calls login function from AuthContext
 * 3. If successful, navigates to /feed
 * 4. If failed, displays error message
 */
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { apiErrorMessage } from "../api/apiError";

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
            setError(apiErrorMessage(err, "Invalid email or password"));
        }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2>Login to Your Account</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>

                {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}

                <p className="auth-alt">
                    Don’t have an account?{" "}
                    <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}
