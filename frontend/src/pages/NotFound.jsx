/**
 * NotFound Page Component (404 Page)
 * 
 * This page is displayed when a user navigates to a route that doesn't exist.
 * 
 * Functionality:
 * - Shows a 404 error message to inform users the page doesn't exist
 * - Provides a navigation link back to the dashboard
 * - Maintains consistent navigation with the Navbar component
 * 
 * Usage:
 * This component is typically used as a catch-all route in the React Router configuration
 * to handle any undefined routes and provide a user-friendly error page.
 */
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function NotFound() {
    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <Navbar />
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Oops! The page you're looking for doesn’t exist.</p>
            <Link
                to="/dashboard"
                style={{
                    display: "inline-block",
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    borderRadius: "5px",
                    textDecoration: "none",
                }}
            >
                Go to Dashboard
            </Link>
        </div>
    );
}
