/**
 * Navbar Component
 * Main navigation bar for the application.
 * Displays links to different pages and handles user logout.
 */
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const doLogout = () => {
        logout();
        navigate("/login");
    };

    const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                Travel Expense Tracker
            </Link>

            <div className="nav-links">
                <NavLink to="/feed" className={linkClass}>Feed</NavLink>
                <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
                <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                {user && <span className="nav-user">Hi, {user.name}</span>}
                <button className="btn-ghost" onClick={doLogout}>Logout</button>
            </div>
        </nav>
    );
}
