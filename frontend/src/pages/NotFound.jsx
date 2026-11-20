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
        <div className="container" style={{ textAlign: "center" }}>
            <Navbar />
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Oops! The page you're looking for doesn’t exist.</p>
            <Link to="/dashboard">Go to Dashboard</Link>
        </div>
    );
}
