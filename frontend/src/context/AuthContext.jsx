/**
 * AuthContext
 * Provides authentication state and methods throughout the application.
 * Manages user login/logout and persists user data in localStorage.
 */
import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Current authenticated user state
    const [user, setUser] = useState(null);
    // Loading state while checking for stored user
    const [loading, setLoading] = useState(true);

    /**
     * Check for stored user data on mount
     * Restores user session from localStorage if available
     */
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

    /**
     * Authenticate user and store token/user data
     * Saves token and user info to localStorage for persistence
     */
    const login = async (email, password) => {
        try {
            const res = await api.post("/users/login", { email, password });
            const { token, name, id } = res.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ id, name, email }));

            setUser({ id, name, email });
            return res.data; // ✅ Return so Login.jsx can await
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            throw err; // ❗ rethrow so Login.jsx catches it
        }
    };

    /**
     * Logout user and clear stored authentication data
     */
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
