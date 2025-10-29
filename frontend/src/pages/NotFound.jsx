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
