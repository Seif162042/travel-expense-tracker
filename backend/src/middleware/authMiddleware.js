// backend/src/middleware/auth.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

/**
 * Middleware to verify JWT access tokens.
 * Attaches the decoded payload to req.user if valid.
 * Responds with 401 Unauthorized if missing or invalid.
 */
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // No header or wrong format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1];

        // Verify and decode token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user payload to request
        req.user = decoded;

        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
