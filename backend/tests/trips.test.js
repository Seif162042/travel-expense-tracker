// tests/trips.test.js
import request from "supertest";
import app from "../src/app.js";

describe("Trips API", () => {
    let token;
    let tripId;

    beforeAll(async () => {
        // Register and login a test user to get a JWT token
        const user = {
            name: "Trip Tester",
            email: `triptester${Date.now()}@example.com`,
            password: "password123",
        };

        const reg = await request(app).post("/api/users/register").send(user);
        token = reg.body.token;

        if (!token) {
            const login = await request(app)
                .post("/api/users/login")
                .send({ email: user.email, password: user.password });
            token = login.body.token;
        }

        expect(token).toBeTruthy();
    });

    it("POST /api/trips → 201 create trip with auth", async () => {
        const res = await request(app)
            .post("/api/trips")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Paris Weekend",
                destination: "Paris, France",
                budget: "1200",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data.title).toBe("Paris Weekend");

        tripId = res.body.data.id;
    });

    it("GET /api/trips → 200 list trips (auth)", async () => {
        const res = await request(app)
            .get("/api/trips?limit=5&offset=0")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data || res.body)).toBe(true);
    });

    it("POST /api/trips → 401 without auth", async () => {
        const res = await request(app).post("/api/trips").send({
            title: "Unauthorized Trip",
            destination: "Nowhere",
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
            .send({ title: "Updated Paris Weekend" });

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
