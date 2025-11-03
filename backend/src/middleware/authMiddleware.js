// backend/src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/constants.js";

export const verifyToken = (req, res, next) => {
    try {
        const h = req.headers.authorization;
        if (!h || !h.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }
        const token = h.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
