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

// tests/expenses.test.js
import request from "supertest";
import app from "../src/app.js";

describe("Expenses API", () => {
    let token;
    let tripId;
    let expenseId;

    beforeAll(async () => {
        // Register a test user and obtain a JWT token
        const user = {
            name: "Expense Tester",
            email: `expensetester${Date.now()}@example.com`,
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

        // Create a trip to attach expenses to (2025-08-01 → 2025-08-15)
        const trip = await request(app)
            .post("/api/trips")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Tokyo Summer",
                destination: "Tokyo, Japan",
                budget: "2000",
                startDate: "2025-08-01",
                endDate: "2025-08-15",
            });

        tripId = trip.body.data?.id;
        expect(tripId).toBeTruthy();
    });

    it("POST /api/expenses → 201 create expense with valid data and auth", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${token}`)
            .send({
                trip_id: tripId,
                description: "Hotel stay",
                amount: 250,
                category: "Hotel",
                date: "2025-08-03",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        expenseId = res.body.id;
    });

    it("POST /api/expenses → 400 with invalid/missing fields", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${token}`)
            .send({ description: "No trip_id or amount" });

        expect(res.statusCode).toBe(400);
    });

    it("POST /api/expenses → 400 for amount that is not positive", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${token}`)
            .send({ trip_id: tripId, description: "Refund", amount: -20, category: "Other", date: "2025-08-04" });

        expect(res.statusCode).toBe(400);
    });

    it("POST /api/expenses → 401 without auth", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .send({ trip_id: tripId, amount: 100, category: "Food" });

        expect(res.statusCode).toBe(401);
    });

    it("GET /api/expenses → 200 list expenses with auth", async () => {
        const res = await request(app)
            .get("/api/expenses")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /api/expenses?trip_id=X → 200 filtered by trip", async () => {
        const res = await request(app)
            .get(`/api/expenses?trip_id=${tripId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("PUT /api/expenses/:id → 2xx update expense", async () => {
        const res = await request(app)
            .put(`/api/expenses/${expenseId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ description: "Updated hotel stay", amount: 300 });

        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.statusCode).toBeLessThan(300);
    });

    it("DELETE /api/expenses/:id → 2xx delete expense", async () => {
        const res = await request(app)
            .delete(`/api/expenses/${expenseId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBeGreaterThanOrEqual(200);
        expect(res.statusCode).toBeLessThan(300);
    });

    it("POST /api/expenses → 400 when expense date is outside trip date range", async () => {
        const res = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${token}`)
            .send({
                trip_id: tripId,
                description: "Out-of-range expense",
                amount: 100,
                category: "Other",
                date: "2025-12-25", // outside 2025-08-01 to 2025-08-15
            });

        expect(res.statusCode).toBe(400);
    });
});
