import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
jest.setTimeout(15000);


describe("Users API", () => {
    const unique = Date.now();
    const validUser = {
        name: "Test User",
        email: `user${unique}@example.com`,
        password: "password123",
    };

    it("POST /api/users/register → 201 with token for valid data", async () => {
        const res = await request(app).post("/api/users/register").send(validUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.email).toBe(validUser.email);
    });

    it("POST /api/users/register → 400 for duplicate email", async () => {
        // try registering same user again
        const res = await request(app).post("/api/users/register").send(validUser);
        expect(res.statusCode).toBe(400);
    });

    it("POST /api/users/register → 400 for invalid email", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({ name: "X", email: "not-an-email", password: "password123" });
        expect(res.statusCode).toBe(400);
    });

    it("POST /api/users/register → 400 for weak password", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({ name: "X", email: `weak${unique}@ex.com`, password: "123" });
        expect(res.statusCode).toBe(400);
    });

    it("POST /api/users/login → 200 with token for valid credentials", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({ email: validUser.email, password: validUser.password });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    it("POST /api/users/login → 401 for invalid credentials", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({ email: "nope@example.com", password: "wrongpass" });
        expect(res.statusCode).toBe(401);
    });
});

afterAll(() => {
    jest.clearAllTimers();
});
