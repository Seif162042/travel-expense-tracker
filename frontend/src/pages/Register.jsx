/**
 * Register Page Component
 * 
 * This page handles new user registration by allowing users to create an account.
 * 
 * Functionality:
 * - Displays a registration form with name, email, and password fields
 * - Submits user data to the backend API to create a new account
 * - Redirects users to the login page after successful registration
 * - Shows error messages if registration fails
 * - Provides a link to the login page for existing users
 * 
 * Flow:
 * 1. User enters name, email, and password
 * 2. On form submission, sends POST request to /users/register
 * 3. If successful, navigates to /login
 * 4. If failed, displays error message
 */
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
        <div className="auth-page">
            <div className="card auth-card">
                <h2>Create Your Account</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <button type="submit">Sign Up</button>
                </form>

                {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}

                <p className="auth-alt">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
