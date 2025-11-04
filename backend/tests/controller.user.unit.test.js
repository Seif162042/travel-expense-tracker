import { jest } from "@jest/globals";


jest.unstable_mockModule("bcrypt", () => ({
    default: { hash: jest.fn() },
}));

jest.unstable_mockModule("../src/db.js", () => ({
    pool: { query: jest.fn() },
}));

const { registerUser } = await import("../src/controllers/userController.js");
const { pool } = await import("../src/db.js");
const bcryptModule = await import("bcrypt");
const bcrypt = bcryptModule.default;

describe("User Controller: registerUser (unit)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if fields are missing", async () => {
        const req = { body: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        await registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should insert user when valid", async () => {
        bcrypt.hash.mockResolvedValue("hashed");
        pool.query
            .mockResolvedValueOnce({ rows: [] }) // no existing user
            .mockResolvedValueOnce({ rows: [{ id: "1", email: "a@b.com", name: "t" }] });

        const req = { body: { name: "test", email: "a@b.com", password: "123" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await registerUser(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
    });
});
