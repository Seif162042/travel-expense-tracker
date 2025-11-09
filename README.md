# 🧳 Travel Expense Tracker

A full-stack web application for tracking travel expenses across multiple trips with real-time analytics and budget management.

[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://travel-expense-tracker-frtd.onrender.com)
[![Backend API](https://img.shields.io/badge/api-live-blue.svg)](https://travel-expense-tracker-n1wt.onrender.com/docs)

---

## 📸 Screenshots


[Dashboard](./screenshots/dashboard.png)
[Trip Details](./screenshots/trip-details.png)
[Analytics](./screenshots/analytics.png)

---

## 🌐 Live Demo

- **Frontend Application:** https://travel-expense-tracker-frtd.onrender.com
- **Backend API:** https://travel-expense-tracker-n1wt.onrender.com/api
- **API Documentation (Swagger):** https://travel-expense-tracker-n1wt.onrender.com/docs

**Try it out:** Register a new account to explore all features!

---

## 🏗️ Architecture

![System Architecture](./docs/architecture.png)

### Architecture Overview

The Travel Expense Tracker follows a **three-tier architecture** pattern:

**Frontend Layer (React + Vite):**
- Deployed on Render as static site
- Handles UI and user interactions
- Client-side routing with React Router v7
- Global authentication state with Context API
- Real-time data visualization with Recharts
- Responsive design with Tailwind CSS

**Backend Layer (Express.js API):**
- Deployed on Render as web service
- RESTful API with JWT authentication
- Business logic in controllers
- Validation with express-validator
- Security with Helmet and rate limiting
- Interactive API documentation with Swagger

**Database Layer (PostgreSQL):**
- Managed PostgreSQL instance on Render
- Relational data structure
- Three main tables: users, trips, expenses
- Parameterized queries prevent SQL injection
- Indexed columns for performance

### Data Flow

1. **User → Frontend:** User interacts with React interface via HTTPS
2. **Frontend → Backend:** Authenticated REST API calls with JWT tokens in headers
3. **Backend → Database:** Secure SQL queries with parameterized statements
4. **Response Flow:** Data flows back through all layers to the user interface

---

## ✨ Features

### User Management
- 🔐 Secure registration and login with JWT authentication
- 👤 Password hashing with bcrypt
- 🔒 Protected routes and session management
- 👋 User profile management

### Trip Management
- ✈️ Create, view, edit, and delete trips
- 📅 Date validation with overlap prevention
- 💰 Budget setting and tracking per trip
- 📊 Real-time expense tracking
- 🗓️ Days remaining calculation
- 🎯 Budget usage percentage display

### Expense Tracking
- 💸 Add expenses with categories (Hotel, Food, Transport, Activities, Other)
- 📝 Detailed descriptions and notes
- 📅 Date range support (for multi-day expenses like hotels)
- ✏️ Inline editing and deletion
- 📊 Automatic budget calculations
- ⚠️ Date validation (expenses must fall within trip dates)

### Analytics & Insights
- 📊 Budget vs. actual spending comparison (Bar chart)
- 🥧 Trip budget distribution visualization (Pie chart)
- 📈 Spending trends over time (Line chart)
- 💹 Real-time budget usage percentage
- 🎨 Interactive charts with Recharts

### UI/UX
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Modern, clean interface with Tailwind CSS
- ⚡ Fast performance with Vite
- 🌈 Visual feedback and error handling
- ✅ Form validation with clear error messages
- 🔄 Loading states for async operations

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI library | 19.x |
| Vite | Build tool and dev server | 6.x |
| React Router | Client-side routing | 7.x |
| Context API | Global state management | Built-in |
| Axios | HTTP client with interceptors | 1.x |
| Recharts | Data visualization | 2.x |
| Tailwind CSS | Utility-first styling | 3.x |
| Vitest | Testing framework | 2.x |
| React Testing Library | Component testing | 16.x |

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime environment | 20.x |
| Express | Web framework | 4.x |
| PostgreSQL | Relational database | 14+ |
| JWT | Authentication tokens | 9.x |
| bcrypt | Password hashing | 5.x |
| express-validator | Input validation | 7.x |
| Helmet | Security headers | 8.x |
| express-rate-limit | Rate limiting | 7.x |
| Swagger | API documentation | 5.x |
| Jest | Testing framework | 29.x |
| Supertest | HTTP testing | 7.x |

### DevOps & Deployment

| Technology | Purpose |
|------------|---------|
| Render | Frontend & backend hosting |
| PostgreSQL (Render) | Database hosting |
| Git + GitHub | Version control |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **npm** or **yarn**
- **Git**

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Seif162042/travel-expense-tracker.git
cd travel-expense-tracker
```

#### 2. Set up Backend

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:

```env
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/travel_expense_tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

Set up the database:

```bash
# Create database
createdb travel_expense_tracker

# Run schema (if you have a schema file)
psql -d travel_expense_tracker -f schema.sql
```

#### 3. Set up Frontend

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/api
```

### Running the Application

#### Start Backend

```bash
cd backend
npm run dev
```

Server runs at: **http://localhost:4000**  
API documentation: **http://localhost:4000/docs**

#### Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

App runs at: **http://localhost:5173**

#### Open Your Browser

Navigate to **http://localhost:5173** and start using the application!

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:**
- 6 test suites
- 21 tests
- Controllers, routes, and middleware

### Frontend Tests

```bash
cd frontend
npm test
```

**Test Coverage:**
- 6 test suites
- 16 tests
- Components, pages, and context

### Run All Tests

```bash
# From project root (if configured)
npm run test:all
```

---

## 📁 Project Structure

```
travel-expense-tracker/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   │   ├── expenseController.js
│   │   │   ├── tripController.js
│   │   │   └── userController.js
│   │   ├── routes/           # API endpoints
│   │   │   ├── expensesRoutes.js
│   │   │   ├── tripRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── middleware/       # Auth, validation, errors
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── utils/            # Helper functions
│   │   │   └── responseHelpers.js
│   │   ├── config/           # Configuration
│   │   │   └── constants.js
│   │   ├── docs/             # Swagger config
│   │   │   └── swagger.js
│   │   ├── db.js             # Database connection
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Entry point
│   ├── tests/                # Jest tests
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── DashboardCharts.jsx
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── ExpenseChart.jsx
│   │   │   ├── ExpenseFilters.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TripForm.jsx
│   │   │   └── TripList.jsx
│   │   ├── pages/            # Route-level pages
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TripDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/          # Global state
│   │   │   └── AuthContext.jsx
│   │   ├── api/              # Axios configuration
│   │   │   └── axios.jsx
│   │   ├── assets/           # Static assets
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static files
│   ├── tests/                # Vitest tests
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── architecture.png      # System architecture diagram
│   └── screenshots/          # Application screenshots
│
├── CONTRIBUTING.md           # Contribution guidelines
├── CLEAN_CODE.md             # Clean code principles
├── README.md                 # This file
└── package.json              # Root package (if monorepo)
```

---

## 📚 Documentation

- **[Backend Documentation](./backend/README.md)** - API setup, endpoints, testing
- **[Frontend Documentation](./frontend/README.md)** - Component architecture, testing
- **[API Documentation (Swagger)](https://travel-expense-tracker-n1wt.onrender.com/docs)** - Interactive API docs
- **[Contributing Guide](./CONTRIBUTING.md)** - Development workflow and guidelines
- **[Clean Code Principles](./CLEAN_CODE.md)** - Code quality standards followed

---

## 🔧 Code Quality & Testing

### Backend
- **Testing:** Jest + Supertest (21 tests, 6 test suites)
- **Validation:** express-validator for input validation
- **Security:** Helmet, rate limiting, JWT authentication, bcrypt password hashing
- **API Docs:** Swagger UI for interactive documentation
- **Error Handling:** Centralized error handling middleware

### Frontend
- **Testing:** Vitest + React Testing Library (16 tests, 6 test suites)
- **State Management:** Context API for authentication
- **Routing:** React Router v7 with protected routes
- **HTTP Client:** Axios with interceptors for token management
- **Styling:** Tailwind CSS with responsive design

### Code Standards
- Clear naming conventions
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Comprehensive error handling
- Input validation on all endpoints
- Strategic code comments (35 files)

---

## 🔐 Security Features

- **Authentication:** JWT-based with secure token storage
- **Password Security:** bcrypt hashing with salt rounds
- **Input Validation:** express-validator on all endpoints
- **Rate Limiting:** Prevents brute force attacks (100 requests per 15 minutes)
- **Security Headers:** Helmet middleware for HTTP headers
- **CORS:** Configured for allowed origins only
- **SQL Injection Prevention:** Parameterized queries throughout
- **XSS Prevention:** Input sanitization and validation

---

## 🌐 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### Trips
- `GET /api/trips` - Get all user trips (authenticated)
- `GET /api/trips/:id` - Get trip by ID (authenticated)
- `POST /api/trips` - Create new trip (authenticated)
- `PUT /api/trips/:id` - Update trip (authenticated)
- `DELETE /api/trips/:id` - Delete trip (authenticated)
- `GET /api/trips/feed` - Get public trip feed

### Expenses
- `GET /api/expenses` - Get all expenses (authenticated)
- `GET /api/expenses/trip/:tripId` - Get expenses for a trip (authenticated)
- `POST /api/expenses` - Create new expense (authenticated)
- `PUT /api/expenses/:id` - Update expense (authenticated)
- `DELETE /api/expenses/:id` - Delete expense (authenticated)

**Full API documentation with examples:** [Swagger Docs](https://travel-expense-tracker-n1wt.onrender.com/docs)

---

## 🚀 Deployment

### Frontend (Render Static Site)

**Configuration:**
```yaml
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: frontend/dist
```

**Environment Variables:**
- `VITE_API_URL` - Backend API URL

### Backend (Render Web Service)

**Configuration:**
```yaml
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Port number (default: 4000)
- `NODE_ENV` - Environment (production)

### Database (Render PostgreSQL)

Managed PostgreSQL instance with automatic backups.

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process
- Branch naming conventions

---

## 👤 Author

**Seifeldin**
- GitHub: [@Seif162042](https://github.com/Seif162042)
- Project Repository: [travel-expense-tracker](https://github.com/Seif162042/travel-expense-tracker)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Built as part of CODE University Software Engineering program
- **Modules:** 
  - SE_07 (Technical Documentation)
  - SE_08 (Clean Code)
  - SE_45 (Frontend Development)
  - SE_46 (Backend Development)

---

## 📞 Support & Feedback

For issues, questions, or feedback:
1. Check the [API Documentation](https://travel-expense-tracker-n1wt.onrender.com/docs)
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Open an issue on [GitHub](https://github.com/Seif162042/travel-expense-tracker/issues)

---

## 🔄 Recent Updates

- ✅ Frontend deployed to Render
- ✅ Backend deployed to Render with PostgreSQL
- ✅ Comprehensive test coverage (37 tests total)
- ✅ Interactive API documentation with Swagger
- ✅ Full authentication and authorization
- ✅ Real-time analytics and data visualization

---

**Last Updated:** November 2025

**Live Demo:** https://travel-expense-tracker-frtd.onrender.com 🚀
