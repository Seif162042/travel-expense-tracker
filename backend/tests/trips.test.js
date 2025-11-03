import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
jest.setTimeout(15000);


describe("Trips API", () => {
    let token;
    let tripId;

    beforeAll(async () => {
        // register a fresh user to obtain an auth token
        const suffix = Date.now();
        const reg = await request(app).post("/api/users/register").send({
            name: "Trip Tester",
            email: `triptester${suffix}@example.com`,
            password: "password123",
        });
        token = reg.body.token;
        expect(token).toBeTruthy();
    });

    it("POST /api/trips → 201 create trip with auth", async () => {
        const res = await request(app)
            .post("/api/trips")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Paris Weekend",
                destination: "Paris, France",
                budget: 1200,
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.title).toBe("Paris Weekend");
        tripId = res.body.id;
    });

    it("GET /api/trips → 200 list trips (auth)", async () => {
        const res = await request(app)
            .get("/api/trips?limit=5&offset=0")
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("POST /api/trips → 401 without auth", async () => {
        const res = await request(app).post("/api/trips").send({
            title: "No Auth Trip",
            destination: "Nowhere",
            budget: 10,
        });
        expect(res.statusCode).toBe(401);
    });

    it("POST /api/trips → 400 with empty body", async () => {
        const res = await request(app)
            .post("/api/trips")
            .set("Authorization", `Bearer ${token}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    it("PUT /api/trips/:id → 2xx update trip", async () => {
        const res = await request(app)
            .put(`/api/trips/${tripId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ budget: 1500 });
        // accept any 2xx to be robust across implementations
        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.statusCode).toBeLessThan(300);
    });

    it("DELETE /api/trips/:id → 2xx delete trip", async () => {
        const res = await request(app)
            .delete(`/api/trips/${tripId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.statusCode).toBeLessThan(300);
    });
});

afterAll(() => {
    jest.clearAllTimers();
});
