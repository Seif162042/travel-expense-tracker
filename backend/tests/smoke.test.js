// backend/tests/smoke.test.js
import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db.js";

const unique = () => Date.now().toString().slice(-8);

afterAll(async () => {
    await pool.end();
});

test("health endpoints respond", async () => {
    const r1 = await request(app).get("/health");
    expect(r1.status).toBe(200);
    expect(r1.body.ok).toBe(true);

    const r2 = await request(app).get("/api/health");
    expect(r2.status).toBe(200);
    expect(r2.body.status).toBe("ok");
});

async function registerAndGetToken() {
    const email = `user${unique()}@test.com`;
    const password = "Passw0rd!";
    const name = "Test User";

    const reg = await request(app)
        .post("/api/users/register")
        .send({ name, email, password });

    expect([200, 201]).toContain(reg.status);

    // Support either {token} or {data:{token}} shapes
    const token =
        reg.body?.token ||
        reg.body?.data?.token ||
        reg.body?.data?.user?.token;

    expect(typeof token).toBe("string");
    return token;
}

test("auth + trips + expenses basic flow", async () => {
    const token = await registerAndGetToken();

    // Create a trip
    const createTrip = await request(app)
        .post("/api/trips")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Smoke Trip",
            destination: "Berlin",
            start_date: "2025-11-05",
            end_date: "2025-11-07",
            budget: 321
        });

    expect([200, 201]).toContain(createTrip.status);

    // Trip may be under .data or root; handle both
    const trip = createTrip.body?.data || createTrip.body;
    expect(trip.title).toBe("Smoke Trip");
    expect(typeof trip.id).toBe("string"); // UUID
    const tripId = trip.id;

    // List trips
    const listTrips = await request(app)
        .get("/api/trips")
        .set("Authorization", `Bearer ${token}`);

    expect(listTrips.status).toBe(200);
    expect(Array.isArray(listTrips.body)).toBe(true);
    expect(listTrips.body.find(t => t.id === tripId)).toBeTruthy();

    // Create an expense for that trip
    const createExpense = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
            trip_id: tripId,
            amount: 9.99,
            category: "food",
            description: "Test expense",
            date: "2025-11-06"
        });

    expect([200, 201]).toContain(createExpense.status);

    // List expenses filtered by trip
    const listExpenses = await request(app)
        .get(`/api/expenses`)
        .query({ trip_id: tripId })
        .set("Authorization", `Bearer ${token}`);

    expect(listExpenses.status).toBe(200);
    expect(Array.isArray(listExpenses.body)).toBe(true);
    expect(listExpenses.body.length).toBeGreaterThan(0);
});
