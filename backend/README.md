# Travel Expense Tracker — Backend

## Live Demo

**API Base URL:** https://travel-expense-tracker-n1wt.onrender.com/api  
**API Documentation (Swagger):** https://travel-expense-tracker-n1wt.onrender.com/docs

Try it out: Visit the Swagger docs to test API endpoints interactively!

---

## Overview
This is the backend API for the **Travel Expense Tracker** project.  
It is built with **Node.js, Express, and PostgreSQL**, following a modular architecture with controllers, routes, and middleware.

The backend provides RESTful APIs for:
- ✈️ Managing trips  
- 💸 Tracking expenses  
- 👤 Registering and logging in users  

It also includes:
- Input validation (express-validator)  
- Security (helmet, express-rate-limit)  
- Pagination and global error handling  
- Automated tests (Jest + Supertest)  
- Interactive API documentation with Swagger UI  

---

## How to Run Locally

### 1️⃣ Install Dependencies
Run the following command inside the backend folder:

    npm install

### 2️⃣ Configure Environment Variables
Copy the `.env.example` file to `.env` and fill in your values:

    PORT=4000
    DATABASE_URL=postgres://user:password@localhost:5432/travel
    JWT_SECRET=supersecret

### 3️⃣ Start the Server
Start the development server:

    npm run dev

Server will run at:  
http://localhost:4000

---

## Run Tests
Tests need a local PostgreSQL test database in `.env.test` (copy `.env.test.example`, load `db/schema.sql` into it). They refuse to run against anything that is not `localhost` with `test` in the url.

Execute all Jest + Supertest endpoint tests:

    npm test

Expected output:

    PASS  tests/users.test.js
    PASS  tests/trips.test.js
    PASS  tests/expenses.test.js
    ...
    Test Suites: 10 passed, 10 total
    Tests:       46 passed, 46 total

---

## API Documentation
Swagger UI is available at:  
http://localhost:4000/docs

You can explore and test all endpoints interactively.

---

## Project Structure

    backend/
    ├── src/
    │   ├── controllers/        # Route logic
    │   ├── middleware/         # Validation, errors, auth
    │   ├── routes/             # API endpoints
    │   ├── db.js               # Database connection
    │   ├── app.js              # Express app configuration
    │   └── server.js           # Entry point
    │
    ├── tests/                  # Jest + Supertest tests
    │   ├── trips.test.js
    │   └── users.test.js
    │
    ├── package.json
    ├── jest.config.js
    └── README.md

---

## Code Analysis Tools

**Testing:**
- **Jest:** Unit and integration testing framework
  - Run: `npm test`
  - Coverage: 10 test suites, 46 tests
  - Tests: Controllers, routes, middleware, authentication, error handling

**Security Analysis:**
- **express-validator:** Input validation and sanitization
- **Helmet:** Security headers inspection
- **Rate limiting:** DDoS protection testing

**Running All Checks:**
```bash
# Run tests
npm test
```

---

## Security & Performance
- Helmet: adds secure HTTP headers  
- Rate limiter: prevents brute-force or DoS attacks  
- Validation: sanitizes all inputs using express-validator  
- Error handler: unified JSON error responses  

---

## Technologies

| Category | Tools |
|-----------|-------|
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL |
| Validation | express-validator |
| Security | helmet, express-rate-limit |
| Testing | jest, supertest |
| Docs | swagger-jsdoc, swagger-ui-express |

---

## Example Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/users/register | Register a new user |
| POST | /api/users/login | Login existing user |
| GET  | /api/trips | Get all trips (paginated) |
| POST | /api/trips | Create a new trip |
| GET  | /api/expenses | Get all expenses |
| POST | /api/expenses | Add a new expense |

---

## Deployment
This backend can be deployed easily to:
- Render (https://render.com)
- Railway (https://railway.app)

Required environment variables:

    DATABASE_URL
    DATABASE_SSL   (leave unset for Neon, false for a local Postgres without SSL)
    JWT_SECRET
    PORT

After deployment, visit your live docs at:

    https://<your-app-name>.onrender.com/docs

---

## Database Schema

### Entity-Relationship Diagram

![ER Diagram](./DB_Docs/ER-diagram.png)

### Schema Overview

The database consists of 4 main tables:

**users**
- Primary key: `id` (UUID)
- Stores: name, email, hashed password
- Relationships: 1:many with trips, 1:many with expenses, many:many with trips (via trip_participants)

**trips**
- Primary key: `id` (UUID)
- Foreign key: `user_id` → users(id), NOT NULL
- Stores: title, destination, budget, start_date, end_date, notes
- Constraints: `end_date >= start_date`, no overlapping trips per user (`trips_no_overlap`, needs `btree_gist`)
- Relationships: 1:many with expenses, many:many with users (via trip_participants)

**expenses**
- Primary key: `id` (UUID)
- Foreign keys: `trip_id` → trips(id), `user_id` → users(id), both NOT NULL
- Stores: description, amount, category, date, end_date
- Constraints: `amount > 0`, `end_date >= date`
- Relationships: Many:1 with trips, many:1 with users

**trip_participants** (Junction Table)
- Composite primary key: (`trip_id`, `user_id`)
- Foreign keys: Both columns reference their respective tables
- Stores: role (owner/editor/viewer/member), permissions (JSONB), joined_at
- Purpose: Implements many-to-many relationship between users and trips
- Enables: Multi-user collaboration with role-based permissions

### Indexes

Indexes in `db/schema.sql`:
- `users_email_key` (unique on `email`) - login and duplicate checks
- `idx_trip_user (user_id)` - a user's trips
- `idx_trip_created (created_at DESC)` - the feed
- `idx_expense_user_created (user_id, created_at DESC)` - a user's latest expenses
- `idx_expense_user_trip_created (user_id, trip_id, created_at DESC)` - a user's expenses for one trip
- `idx_expense_trip_covering (trip_id) INCLUDE (amount, category)` - per trip totals and cascade deletes
- primary key `(trip_id, user_id)` on trip_participants - participants of a trip
- `idx_trip_participants_user (user_id)` - trips a user takes part in
- `idx_trip_participants_permissions` (GIN on `permissions`) - permission lookups

Existing databases are upgraded with `db/migrations/002_check.sql`, then `002_hand_in.sql` (`002_rollback.sql` undoes it).

See [schema.sql](./db/schema.sql) for complete schema definition.