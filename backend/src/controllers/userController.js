/**
 * User Controller
 * Handles user authentication and profile management:
 * - User registration with password hashing
 * - User login with JWT token generation
 * - User profile retrieval
 */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";


/**
 * Register a new user
 * POST /api/users/register
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Normalize email to lowercase and trim whitespace
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const checkUserQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUser = await pool.query(checkUserQuery, [normalizedEmail]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user with normalized email
        const insertUserQuery =
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email';
        const result = await pool.query(insertUserQuery, [name, normalizedEmail, hashedPassword]);

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/users/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Normalize email to lowercase and trim whitespace
        const normalizedEmail = email.toLowerCase().trim();

        // Find user by normalized email
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [normalizedEmail]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const query = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { name, email } = req.body;

        // Normalize email if provided
        const normalizedEmail = email ? email.toLowerCase().trim() : null;

        // Check if new email already exists (if email is being changed)
        if (normalizedEmail) {
            const checkEmailQuery = 'SELECT * FROM users WHERE email = $1 AND id != $2';
            const existingUser = await pool.query(checkEmailQuery, [normalizedEmail, userId]);

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (name) {
            updates.push(`name = $${paramCount}`);
            values.push(name);
            paramCount++;
        }

        if (normalizedEmail) {
            updates.push(`email = $${paramCount}`);
            values.push(normalizedEmail);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email`;
        const result = await pool.query(query, values);

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};
