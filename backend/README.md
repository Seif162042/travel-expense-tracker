# 🧭 Travel Expense Tracker — Backend

## 📘 Overview
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

## 🚀 How to Run Locally

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

## 🧪 Run Tests
Execute all Jest + Supertest endpoint tests:

    npm test

Expected output:

    PASS  tests/users.test.js
    PASS  tests/trips.test.js
    Test Suites: 2 passed, 2 total
    Tests:       4 passed, 4 total

---

## 📜 API Documentation
Swagger UI is available at:  
http://localhost:4000/docs

You can explore and test all endpoints interactively.

---

## 🧩 Project Structure

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

## 🛡️ Security & Performance
- Helmet: adds secure HTTP headers  
- Rate limiter: prevents brute-force or DoS attacks  
- Validation: sanitizes all inputs using express-validator  
- Error handler: unified JSON error responses  

---

## 🧱 Technologies

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

## 📌 Example Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | /api/users/register | Register a new user |
| POST | /api/users/login | Login existing user |
| GET  | /api/trips | Get all trips (paginated) |
| POST | /api/trips | Create a new trip |
| GET  | /api/expenses | Get all expenses |
| POST | /api/expenses | Add a new expense |

---

## 🌐 Deployment
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