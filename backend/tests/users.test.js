/* eslint-disable */
import request from "supertest";
import app from "../src/app.js";
import { jest } from "@jest/globals";


describe("Users API", () => {
    it("POST /api/users/register → should reject invalid data", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({ email: "invalid", password: "123" });
        expect(res.statusCode).toBe(400);
    });

    it("POST /api/users/login → should fail with empty body", async () => {
        const res = await request(app).post("/api/users/login").send({});
        expect(res.statusCode).toBe(400);
    });
});

afterAll(async () => {
    // Gracefully close the Express app if it's listening
    if (app && app.close) {
        await app.close();
    }
    jest.clearAllTimers();
});

