/**
 * Centralized Error Handler Middleware
 * 
 * Catches all errors thrown in the application and formats them
 * consistently for the client. Must be registered LAST in middleware chain.
 * 
 * Error Flow:
 * 1. Controller throws error → 2. Express catches → 3. This handler formats → 4. Client receives
 * 
 * Error types handled:
 * - Validation errors (400) - Invalid input
 * - Authentication errors (401) - Missing/invalid token
 * - Authorization errors (403) - Insufficient permissions
 * - Not Found errors (404) - Resource doesn't exist
 * - Server errors (500) - Unexpected server issues
 * 
 * @param {Error} err - Error object with status and message properties
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
    console.error("💥 Error:", err.message);
    res.status(err.status || 500).json({
        error: { message: err.message || "Server Error" },
    });
};