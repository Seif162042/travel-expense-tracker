import request from "supertest";
import app from "../src/app.js";
import { pool } from "../src/db.js";

describe("Create trip transaction", () => {
    const email = `tx-tester${Date.now()}@example.com`;
    let token;

    beforeAll(async () => {
        // makes the owner insert fail for this one trip title so we can check the trip insert is rolled back
        await pool.query(`
            CREATE OR REPLACE FUNCTION fail_rollback_trip_owner() RETURNS trigger AS $$
            BEGIN
                IF (SELECT title FROM trips WHERE id = NEW.trip_id) = 'Rollback Trip' THEN
                    RAISE EXCEPTION 'forced owner insert failure';
                END IF;
                RETURN NEW;
            END $$ LANGUAGE plpgsql`);
        await pool.query(`
            CREATE TRIGGER fail_rollback_trip_owner BEFORE INSERT ON trip_participants
            FOR EACH ROW EXECUTE FUNCTION fail_rollback_trip_owner()`);

        const reg = await request(app)
            .post("/api/users/register")
            .send({ name: "Tx Tester", email, password: "password123" });
        token = reg.body.token;
        expect(token).toBeTruthy();
    });

    afterAll(async () => {
        await pool.query("DROP TRIGGER IF EXISTS fail_rollback_trip_owner ON trip_participants");
        await pool.query("DROP FUNCTION IF EXISTS fail_rollback_trip_owner()");
        await pool.query("DELETE FROM users WHERE email = $1", [email]);
        await pool.end();
    });

    it("POST /api/trips → no trip row left when the owner insert fails", async () => {
        const res = await request(app)
            .post("/api/trips")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Rollback Trip",
                destination: "Oslo",
                startDate: "2025-09-01",
                endDate: "2025-09-05",
            });

        expect(res.statusCode).toBe(500);

        const left = await pool.query(
            `SELECT count(*)::int AS n FROM trips t JOIN users u ON u.id = t.user_id WHERE u.email = $1`,
            [email]
        );
        expect(left.rows[0].n).toBe(0);
    });

    it("POST /api/trips → only one of two parallel overlapping trips is created", async () => {
        const create = () =>
            request(app)
                .post("/api/trips")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Race Trip", destination: "Bergen", startDate: "2025-10-01", endDate: "2025-10-08" });

        const results = await Promise.all([create(), create()]);
        const statuses = results.map((r) => r.statusCode).sort();

        expect(statuses).toEqual([201, 400]);
        expect(results.find((r) => r.statusCode === 400).body.message).toBe("Trip overlaps existing one");
    });
});
