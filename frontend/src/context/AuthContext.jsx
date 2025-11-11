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

            // Extract user object first, then destructure it
            const { token, user: userData } = res.data;
            const { id, name, email: userEmail } = userData;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ id, name, email: userEmail }));

            setUser({ id, name, email: userEmail });
            return res.data;
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            throw err;
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
