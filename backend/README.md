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
Execute all Jest + Supertest endpoint tests:

    npm test

Expected output:

    PASS  tests/users.test.js
    PASS  tests/trips.test.js
    PASS  tests/expenses.test.js
    Test Suites: 7 passed, 7 total
    Tests:       24 passed, 24 total

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

**Linting:**
- **ESLint:** Enforces JavaScript best practices and catches common errors
  - Configuration: `.eslintrc.json` (or package.json)
  - Run: `npm run lint`
  - Checks: Code style, potential bugs, best practices

**Testing:**
- **Jest:** Unit and integration testing framework
  - Run: `npm test`
  - Coverage: 7 test suites, 24 tests
  - Tests: Controllers, routes, middleware, authentication, error handling

**Security Analysis:**
- **express-validator:** Input validation and sanitization
- **Helmet:** Security headers inspection
- **Rate limiting:** DDoS protection testing

**Running All Checks:**
```bash
# Run tests
npm test

# Run linting
npm run lint

# Run both
npm run lint && npm test
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
    JWT_SECRET
    PORT

After deployment, visit your live docs at:

    https://<your-app-name>.onrender.com/docs

---

## Database Schema

### Entity-Relationship Diagram

![ER Diagram](./DB_docs/ER-diagram.png)

### Schema Overview

The database consists of 4 main tables:

**users**
- Primary key: `id` (UUID)
- Stores: name, email, hashed password
- Relationships: 1:many with trips, 1:many with expenses, many:many with trips (via trip_participants)

**trips**
- Primary key: `id` (UUID)
- Foreign key: `user_id` → users(id)
- Stores: title, destination, budget, start_date, end_date, notes
- Relationships: 1:many with expenses, many:many with users (via trip_participants)

**expenses**
- Primary key: `id` (UUID)
- Foreign keys: `trip_id` → trips(id), `user_id` → users(id)
- Stores: description, amount, category, date
- Relationships: Many:1 with trips, many:1 with users

**trip_participants** (Junction Table)
- Composite primary key: (`trip_id`, `user_id`)
- Foreign keys: Both columns reference their respective tables
- Stores: role (owner/editor/viewer/member), permissions (JSONB), joined_at
- Purpose: Implements many-to-many relationship between users and trips
- Enables: Multi-user collaboration with role-based permissions

### Indexes

Performance indexes are created on:
- `users.email` - For login queries
- `trips.user_id` - For fetching user's trips
- `expenses.trip_id` - For fetching trip expenses
- `expenses.user_id` - For fetching user's expenses
- `trip_participants.trip_id` - For participant queries
- `trip_participants.user_id` - For user's shared trips

See [schema.sql](./db/schema.sql) for complete schema definition.