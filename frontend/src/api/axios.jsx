import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});
console.log("AXIOS BASE URL =>", import.meta.env.VITE_API_URL);

// ✅ REQUEST INTERCEPTOR: Add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log("JEST-TEST URL:", config.url);
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR: Handle 401 errors gracefully
api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
        // If we get a 401 Unauthorized, DON'T auto-logout
        // Let the component handle it instead
        if (error.response?.status === 401) {
            console.warn("401 Unauthorized - Token may be invalid or expired");
            // Don't clear localStorage here - let the user stay logged in
            // The component will handle redirects if needed
        }
        return Promise.reject(error);
    }
);

export default api;