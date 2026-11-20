import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: process.argv[2] ?? ".env" });

const url = process.env.DATABASE_URL ?? "";
let host = "";
try {
    host = new URL(url).hostname;
} catch {
    host = "";
}

if (!["localhost", "127.0.0.1"].includes(host)) {
    console.error("Refusing to seed: DATABASE_URL must point to a local database");
    process.exit(1);
}

const USERS = 200;
const TRIPS_PER_USER = 15;
const EXPENSES_PER_TRIP = 20;

// fixed salt so every run gives the same hash (password is password123)
const passwordHash = await bcrypt.hash("password123", "$2b$10$seedsaltseedsaltseedsa");

const OWNER_PERMISSIONS = {
    can_edit_trip: true,
    can_delete_trip: true,
    can_add_expenses: true,
    can_edit_expenses: true,
    can_delete_expenses: true,
    can_manage_participants: true,
};
const VIEWER_PERMISSIONS = {
    can_edit_trip: false,
    can_delete_trip: false,
    can_add_expenses: false,
    can_edit_expenses: false,
    can_delete_expenses: false,
    can_manage_participants: false,
};

const client = new pg.Client({
    connectionString: url,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
});

await client.connect();

try {
    await client.query("BEGIN");

    await client.query("DELETE FROM users WHERE email LIKE 'seed-user-%@example.com'");

    await client.query(
        `INSERT INTO users (id, name, email, password, created_at)
         SELECT md5(format('seed-user-%s', u))::uuid,
                'Seed User ' || u,
                format('seed-user-%s@example.com', lpad(u::text, 3, '0')),
                $2,
                timestamp '2024-01-01' + u * interval '1 hour'
         FROM generate_series(1, $1::int) AS u`,
        [USERS, passwordHash]
    );

    // each trip gets its own 24 day slot and lasts at most 20 days, so trips of one user never overlap
    await client.query(
        `INSERT INTO trips (id, user_id, title, destination, budget, start_date, end_date, created_at)
         SELECT md5(format('seed-trip-%s-%s', u, k))::uuid,
                md5(format('seed-user-%s', u))::uuid,
                format('Trip %s of user %s', k + 1, u),
                (ARRAY['Berlin','Paris','Rome','Lisbon','Tokyo','New York','Barcelona','Prague','Vienna','Amsterdam'])[1 + (u + k) % 10],
                500 + (u * 37 + k * 101) % 4500,
                s.start_date,
                s.start_date + 2 + (u * 7 + k * 3) % 13,
                timestamp '2024-01-01' + (k * $1::int + u) * interval '1 hour'
         FROM generate_series(1, $1::int) AS u,
              generate_series(0, $2::int - 1) AS k,
              LATERAL (SELECT date '2024-01-01' + k * 24 + u % 7 AS start_date) s`,
        [USERS, TRIPS_PER_USER]
    );

    await client.query(
        `INSERT INTO trip_participants (trip_id, user_id, role, permissions, joined_at)
         SELECT md5(format('seed-trip-%s-%s', u, k))::uuid,
                md5(format('seed-user-%s', u))::uuid,
                'owner',
                $3::jsonb,
                timestamp '2024-01-01' + (k * $1::int + u) * interval '1 hour'
         FROM generate_series(1, $1::int) AS u, generate_series(0, $2::int - 1) AS k
         UNION ALL
         SELECT md5(format('seed-trip-%s-%s', u, k))::uuid,
                md5(format('seed-user-%s', u % $1::int + 1))::uuid,
                'viewer',
                $4::jsonb,
                timestamp '2024-01-01' + (k * $1::int + u) * interval '1 hour' + interval '1 day'
         FROM generate_series(1, $1::int) AS u, generate_series(0, $2::int - 1) AS k
         WHERE (u + k) % 4 = 0`,
        [USERS, TRIPS_PER_USER, OWNER_PERMISSIONS, VIEWER_PERMISSIONS]
    );

    await client.query(
        `INSERT INTO expenses (id, trip_id, user_id, description, amount, category, date, end_date, created_at)
         SELECT md5(format('seed-expense-%s-%s-%s', u, k, e))::uuid,
                md5(format('seed-trip-%s-%s', u, k))::uuid,
                md5(format('seed-user-%s', u))::uuid,
                format('%s #%s', x.category, e),
                round(5 + ((u * 131 + k * 71 + e * 29) % 2000) / 10.0, 2),
                x.category,
                x.day,
                CASE WHEN x.category = 'Hotel' THEN least(x.day + 1, t.end_date) END,
                x.day + ((u + e) % 24) * interval '1 hour'
         FROM generate_series(1, $1::int) AS u,
              generate_series(0, $2::int - 1) AS k,
              generate_series(1, $3::int) AS e,
              LATERAL (SELECT date '2024-01-01' + k * 24 + u % 7 AS start_date,
                              2 + (u * 7 + k * 3) % 13 AS length) s,
              LATERAL (SELECT s.start_date + s.length AS end_date) t,
              LATERAL (SELECT (ARRAY['Hotel','Food','Transport','Activities','Other'])[1 + (u + k + e) % 5] AS category,
                              s.start_date + e % (s.length + 1) AS day) x`,
        [USERS, TRIPS_PER_USER, EXPENSES_PER_TRIP]
    );

    await client.query("COMMIT");
    await client.query("ANALYZE users, trips, trip_participants, expenses");

    const counts = await client.query(
        `SELECT (SELECT count(*) FROM users WHERE email LIKE 'seed-user-%@example.com') AS users,
                (SELECT count(*) FROM trips t JOIN users u ON u.id = t.user_id WHERE u.email LIKE 'seed-user-%@example.com') AS trips,
                (SELECT count(*) FROM expenses x JOIN users u ON u.id = x.user_id WHERE u.email LIKE 'seed-user-%@example.com') AS expenses,
                (SELECT count(*) FROM trip_participants p JOIN users u ON u.id = p.user_id WHERE u.email LIKE 'seed-user-%@example.com') AS participants`
    );
    console.log("Seeded:", counts.rows[0]);
} catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
} finally {
    await client.end();
}
