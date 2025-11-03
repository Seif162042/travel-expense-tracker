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

// helper to create JWT
const makeToken = (id, email) =>
    jwt.sign({ id, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

// POST /api/users/register
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

// POST /api/users/login
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
