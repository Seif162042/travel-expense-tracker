/**
 * User Controller
 * Handles user authentication and profile management:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - User profile retrieval
 */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as users from "../data/users.js";
import {
    HTTP_STATUS,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    BCRYPT_SALT_ROUNDS,
    JWT_SECRET,
    JWT_EXPIRY,
} from "../config/constants.js";
import { successResponse, errorResponse } from "../utils/responseHelpers.js";

/** Helper to sign JWT */
const makeToken = (id, email) =>
    jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

/** Register new user */
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELDS);

        // Normalize email to lowercase and trim whitespace
        const normalizedEmail = email.toLowerCase().trim();

        const existing = await users.findUserIdByEmail(normalizedEmail);
        if (existing)
            return errorResponse(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.USER_EXISTS);

        const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const user = await users.createUser(name, normalizedEmail, hash);
        const token = makeToken(user.id, user.email);

        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            user,
            token,
            message: SUCCESS_MESSAGES.USER_REGISTERED,
        });
    } catch (err) {
        console.error("Error in registerUser:", err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
    }
};

/** Login */
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Normalize email to lowercase and trim whitespace
        const normalizedEmail = email.toLowerCase().trim();

        const user = await users.findUserWithPasswordByEmail(normalizedEmail);
        if (!user)
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);

        const token = makeToken(user.id, user.email);
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email },
            token,
            message: SUCCESS_MESSAGES.USER_LOGGED_IN,
        });
    } catch (err) {
        console.error("Error in loginUser:", err);
        return errorResponse(res, HTTP_STATUS.SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
    }
};

/** Get profile */
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await users.findUserById(id);
        if (!user)
            return res.status(404).json({ message: "User not found" });

        return res.status(200).json(user);
    } catch (err) {
        console.error("Error in getUserProfile:", err);
        return res.status(500).json({ message: "Failed to load user profile" });
    }
};

export default { registerUser, loginUser, getUserProfile };
