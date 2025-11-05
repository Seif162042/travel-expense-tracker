import { validationResult } from "express-validator";

// ✅ Converts empty strings to undefined (so validators skip them)
export const emptyToUndefined = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        for (const key in req.body) {
            if (req.body[key] === "") req.body[key] = undefined;
        }
    }
    next();
};

// ✅ Handles validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    next();
};
