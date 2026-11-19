import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db.js";

describe("Ownership between users", () => {
    const stamp = Date.now();
    const emails = [`owner-a${stamp}@example.com`, `other-b${stamp}@example.com`];
    let tokenA;
    let tokenB;
    let tripId;
    let expenseId;

    const register = async (email) => {
        const res = await request(app)
            .post("/api/users/register")
            .send({ name: "Ownership Tester", email, password: "password123" });
        return res.body.token;
    };

    beforeAll(async () => {
        tokenA = await register(emails[0]);
        tokenB = await register(emails[1]);

        const trip = await request(app)
            .post("/api/trips")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ title: "A's Trip", destination: "Madrid", startDate: "2025-03-01", endDate: "2025-03-07" });
        tripId = trip.body.data.id;

        const expense = await request(app)
            .post("/api/expenses")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ trip_id: tripId, description: "Tapas", amount: 40, category: "Food", date: "2025-03-02" });
        expenseId = expense.body.id;
    });

    afterAll(async () => {
        await pool.query("DELETE FROM users WHERE email = ANY($1)", [emails]);
        await pool.end();
    });

    it("PUT /api/trips/:id → 404 for another user's trip", async () => {
        const res = await request(app)
            .put(`/api/trips/${tripId}`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ title: "Taken over" });
        expect(res.statusCode).toBe(404);
    });

    it("DELETE /api/trips/:id → 404 for another user's trip", async () => {
        const res = await request(app)
            .delete(`/api/trips/${tripId}`)
            .set("Authorization", `Bearer ${tokenB}`);
        expect(res.statusCode).toBe(404);
    });

    it("GET /api/trips/:id/participants → 403 for a non participant", async () => {
        const res = await request(app)
            .get(`/api/trips/${tripId}/participants`)
            .set("Authorization", `Bearer ${tokenB}`);
        expect(res.statusCode).toBe(403);
    });

    it("GET /api/expenses/trip/:trip_id → no expenses of another user's trip", async () => {
        const res = await request(app)
            .get(`/api/expenses/trip/${tripId}`)
            .set("Authorization", `Bearer ${tokenB}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it("PUT /api/expenses/:id → 404 for another user's expense", async () => {
        const res = await request(app)
            .put(`/api/expenses/${expenseId}`)
            .set("Authorization", `Bearer ${tokenB}`)
            .send({ amount: 1 });
        expect(res.statusCode).toBe(404);
    });

    it("DELETE /api/expenses/:id → 404 for another user's expense", async () => {
        const res = await request(app)
            .delete(`/api/expenses/${expenseId}`)
            .set("Authorization", `Bearer ${tokenB}`);
        expect(res.statusCode).toBe(404);
    });

    it("owner's trip and expense are unchanged afterwards", async () => {
        const trip = await pool.query("SELECT title FROM trips WHERE id = $1", [tripId]);
        const expense = await pool.query("SELECT amount FROM expenses WHERE id = $1", [expenseId]);
        expect(trip.rows[0].title).toBe("A's Trip");
        expect(expense.rows[0].amount).toBe("40.00");
    });
});
