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

import { jest } from "@jest/globals";

jest.unstable_mockModule("express-validator", () => ({
    validationResult: jest.fn(),
}));

const { validationResult } = await import("express-validator");
const { handleValidationErrors } = await import("../src/middleware/validate.js");

describe("Middleware: handleValidationErrors", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if validation errors exist", () => {
        const fakeErrors = { isEmpty: () => false, array: () => ["invalid field"] };
        validationResult.mockReturnValue(fakeErrors);

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        handleValidationErrors(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: ["invalid field"] });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() if no errors", () => {
        validationResult.mockReturnValue({ isEmpty: () => true });
        const req = {};
        const res = {};
        const next = jest.fn();

        handleValidationErrors(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
