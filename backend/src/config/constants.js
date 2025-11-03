// backend/src/config/constants.js
export const BCRYPT_SALT_ROUNDS = 10;
export const JWT_EXPIRY = "7d";
export const JWT_ALGORITHM = "HS256";
export const PASSWORD_MIN_LENGTH = 8;
export const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";


export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
    REQUIRED_FIELDS: "All fields are required",
    INVALID_EMAIL: "Invalid email format",
    USER_EXISTS: "User already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    SERVER_ERROR: "Internal server error",
};

export const SUCCESS_MESSAGES = {
    USER_REGISTERED: "User registered successfully",
    USER_LOGGED_IN: "Login successful",
    TRIP_CREATED: "Trip created successfully",
    EXPENSE_CREATED: "Expense added successfully",
};
