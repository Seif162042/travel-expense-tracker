import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
        setLoading(false);
    }, []);

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
