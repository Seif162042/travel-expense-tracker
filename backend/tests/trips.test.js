/* eslint-disable */
import request from "supertest";
import app from "../src/app.js";   // import the Express app
import { jest } from "@jest/globals";

describe("Trips API", () => {
    it("GET /api/trips → should return 200 and array", async () => {
        const res = await request(app).get("/api/trips");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /api/trips → should fail with empty body", async () => {
        const res = await request(app).post("/api/trips").send({});
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

