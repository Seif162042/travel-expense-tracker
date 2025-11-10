/**
 * 
 * Description:
 *  This test suite verifies the functionality of the corresponding backend API routes.
 *  It ensures correct CRUD operations, validation behavior, and authentication flow.
 *
 * Test Coverage Includes:
 *  - Endpoint response codes and payload structure
 *  - Authentication/Authorization handling
 *  - Error handling and validation checks
 *  - Integration with database and controllers
 *
 * 
 */

import { verifyToken } from "../src/middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../src/config/constants.js";
import { jest } from "@jest/globals";


describe("Middleware: verifyToken", () => {
    it("should reject requests without token", () => {
        const req = { headers: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should reject invalid token", () => {
        const req = { headers: { authorization: "Bearer invalidtoken" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("should pass with a valid token", () => {
        const token = jwt.sign({ id: "123", email: "t@e.com" }, JWT_SECRET);
        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        verifyToken(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toHaveProperty("email");
    });
});
