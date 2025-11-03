// backend/src/routes/userRoutes.js
import express from "express";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validate.js";
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

router.post(
    "/register",
    [
        body("name").isString().notEmpty(),
        body("email").isEmail().withMessage("Valid email required"),
        body("password").isLength({ min: 6 }).withMessage("Password required"),
        handleValidationErrors,
    ],
    registerUser
);

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
