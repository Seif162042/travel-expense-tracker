// src/routes/users.js
import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import {
    registerUser,
    loginUser,
} from "../controllers/userController.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 * /api/users/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */


const router = express.Router();

/**
 * POST /api/users/register
 */
router.post(
    "/register",
    [
        body("name").isString().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        handleValidationErrors,
    ],
    registerUser
);

/**
 * POST /api/users/login
 */
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email required"),
        body("password").notEmpty().withMessage("Password required"),
        handleValidationErrors,
    ],
    loginUser
);


export default router;
