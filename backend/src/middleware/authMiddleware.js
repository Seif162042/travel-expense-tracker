/**
 * Authentication Middleware
 * 
 * Verifies JWT token from Authorization header and protects routes.
 * 
 * Authentication Flow:
 * 1. Extracts token from "Bearer <token>" format in Authorization header
 * 2. Verifies token signature using JWT_SECRET from environment
 * 3. Decodes token payload containing { id, email }
 * 4. Attaches user data to req.user for use in controllers
 * 
 * Usage:
 * Protected routes must include this middleware:
 * router.get('/protected', verifyToken, controllerFunction)
 * 
 * Controllers can then access:
 * - req.user.id - User's UUID
 * - req.user.email - User's email address
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object  
 * @param {NextFunction} next - Express next middleware function
 */
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

        // Attach user data to request object for use in controllers
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};