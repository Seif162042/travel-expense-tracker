import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const doLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderBottom: "1px solid #ddd",
                marginBottom: 20,
            }}
        >
            <div>
                <Link to="/dashboard" style={{ textDecoration: "none", fontWeight: 700 }}>
                    Travel Expense Tracker
                </Link>
            </div>
            <div>
                <Link to="/dashboard">Dashboard</Link>
            </div>


            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Link to="/feed">Feed</Link>
                <Link to="/profile">Profile</Link>
                {user && <span style={{ opacity: 0.8 }}>Hi, {user.name}</span>}
                <button onClick={doLogout}>Logout</button>
            </div>
        </nav>
    );
}
