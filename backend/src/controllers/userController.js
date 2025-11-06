/**
 * User Controller
 * Handles user authentication and profile management:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - User profile retrieval
 */
// backend/src/controllers/userController.js
import bcrypt from "bcrypt"; // if bcrypt fails on Windows, switch to "bcryptjs"
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import {
    HTTP_STATUS,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    BCRYPT_SALT_ROUNDS,
    JWT_SECRET,
    JWT_EXPIRY,
} from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";

/**
 * Helper function to create JWT token for authenticated users
 */
const makeToken = (id, email) =>
    jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

/**
 * Register a new user
 * Hashes password before storing and returns JWT token
 */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELDS);
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existing.rows.length) {
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.USER_EXISTS);
        }

        const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const result = await pool.query(
            `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
            [name, email, hash]
        );
        const user = result.rows[0];
        const token = makeToken(user.id, user.email);

        return res.status(HTTP_STATUS.CREATED).json({
            ...user,
            token,
            message: SUCCESS_MESSAGES.USER_REGISTERED,
        });
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
    }
};

/**
 * Get the authenticated user's profile
 * Uses user ID from JWT token (set by authMiddleware)
 */
export const getUserProfile = async (req, res) => {
    try {
        // req.user is set by verifyToken: { id, email }
        const { id } = req.user;
        const q = await pool.query(
            "SELECT id, name, email, created_at FROM users WHERE id = $1::uuid",
            [id]
        );
        if (!q.rows.length) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(q.rows[0]);
    } catch (err) {
        console.error("Error in getUserProfile:", err);
        return res.status(500).json({ message: "Failed to load user profile" });
    }
};



/**
 * Authenticate user and return JWT token
 * Compares provided password with hashed password in database
 */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const q = await pool.query("SELECT id, name, email, password FROM users WHERE email = $1", [email]);
        if (!q.rows.length) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
        }
        const user = q.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        const token = makeToken(user.id, user.email);
        return res.status(HTTP_STATUS.OK).json({
            id: user.id,
            name: user.name,
            email: user.email,
            token,
            message: SUCCESS_MESSAGES.USER_LOGGED_IN,
        });
    } catch (err) {
        console.error(err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
    }
};

export default { registerUser, loginUser };
