import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // ← only one jwt import
import { successResponse, errorResponse } from "../utils/responseHelpers.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../config/constants.js";
import { JWT_SECRET, JWT_EXPIRY } from "../config/constants.js";
import pool from "../db.js";


const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
);
// Helper to generate JWT
const generateToken = (id, email) =>
    jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc Register new user
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: "All fields are required" });

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0)
            return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        const user = result.rows[0];
        res.status(201).json({
            ...user,
            token: generateToken(user.id, user.email),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id, user.email),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc Get logged-in user profile
export const getProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = $1", [id]);
        res.json(result.rows[0]);
    } catch (err) {
        return successResponse(res, HTTP_STATUS.CREATED, newUser, SUCCESS_MESSAGES.USER_REGISTERED);
    }
};
export default { registerUser, loginUser };
