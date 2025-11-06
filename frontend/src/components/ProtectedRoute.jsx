/**
 * ProtectedRoute Component
 * Route guard that ensures only authenticated users can access protected routes.
 * Redirects to login page if user is not authenticated.
 */
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // Show loading state while checking authentication
    if (loading) return <p>Loading...</p>;

    // Render children if user is authenticated, otherwise redirect to login
    return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
