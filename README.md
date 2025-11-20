# Travel Expense Tracker

A full-stack web application for tracking travel expenses across multiple trips with real-time analytics and budget management.

[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://travel-expense-tracker-frtd.onrender.com)
[![Backend API](https://img.shields.io/badge/api-live-blue.svg)](https://travel-expense-tracker-n1wt.onrender.com/docs)

---

## Screenshots


![Dashboard](./screenshots/dashboard.png)
![Trip Details](./screenshots/trip-details.png)
![Analytics](./screenshots/analytics.png)

---

## Live Demo

- **Frontend Application:** https://travel-expense-tracker-frtd.onrender.com
- **Backend API:** https://travel-expense-tracker-n1wt.onrender.com/api
- **API Documentation (Swagger):** https://travel-expense-tracker-n1wt.onrender.com/docs

**Try it out:** Register a new account to explore all features!

---

## Architecture

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
- Serverless PostgreSQL on Neon
- Auto-scaling with connection pooling
- Relational data structure
- Four main tables: users, trips, expenses, trip_participants
- Parameterized queries prevent SQL injection
- Indexed columns for performance

**Entity-Relationship Diagram:**

![ER Diagram](./docs/ER-diagram.png)

*Database schema showing tables, relationships, and cardinality. Includes many-to-many relationship via trip_participants junction table.*

### Data Flow

1. **User → Frontend:** User interacts with React interface via HTTPS
2. **Frontend → Backend:** Authenticated REST API calls with JWT tokens in headers
3. **Backend → Database:** Secure SQL queries via connection pool to Neon PostgreSQL
4. **Response Flow:** Data flows back through all layers to the user interface

### Deployment Stack

| Component | Platform | URL/Notes |
|-----------|----------|-----------|
| Frontend | Render Static Site | https://travel-expense-tracker-frtd.onrender.com |
| Backend | Render Web Service | https://travel-expense-tracker-n1wt.onrender.com |
| Database | Neon PostgreSQL | Serverless, auto-scaling |
| API Docs | Backend /docs | Swagger UI |

---

## Features

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

## Testing

### Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:**
- 7 test suites
- 24 tests
- Controllers, routes, and middleware

### Frontend Tests

```bash
cd frontend
npm test
```

**Test Coverage:**
- 8 test suites
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
|   |   |   ├── tripParticipantsController.js
│   │   │   └── userController.js
│   │   ├── routes/           # API endpoints
│   │   │   ├── expensesRoutes.js
|   |   |   ├── tripParticipantsRoutes.js
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
|   |   |   ├──AddParticipantForm.jsx
│   │   │   ├── DashboardCharts.jsx
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── ExpenseChart.jsx
│   │   │   ├── ExpenseFilters.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   ├── Navbar.jsx
|   |   |   ├── ParticipantsList.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TripForm.jsx
│   │   │   └── TripList.jsx
│   │   ├── pages/            # Route-level pages
|   |   |   ├── AddExpense.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
|   |   |   ├── Feed.jsx
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
- **Testing:** Jest + Supertest (24 tests, 7 test suites)
- **Validation:** express-validator for input validation
- **Security:** Helmet, rate limiting, JWT authentication, bcrypt password hashing
- **API Docs:** Swagger UI for interactive documentation
- **Error Handling:** Centralized error handling middleware

### Frontend
- **Testing:** Vitest + React Testing Library (16 tests, 8 test suites)
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

### Code Analysis Tools

**Backend:**
- **ESLint:** Enforces JavaScript best practices and catches common errors
  - Run: `npm run lint` (from backend directory)
- **Jest:** Testing framework with 24 tests across 7 test suites
  - Run: `npm test`
  - Coverage: Controllers, routes, middleware, and business logic

**Frontend:**
- **ESLint:** Code quality checking for React components
  - Run: `npm run lint` (from frontend directory)
- **Vitest:** Fast unit testing framework with 16 tests across 8 test suites
  - Run: `npm test`
  - Coverage: Components, pages, context, and user interactions

**Running All Analysis:**
```bash
# Run all backend checks
cd backend && npm test && npm run lint

# Run all frontend checks
cd frontend && npm test && npm run lint
```

---

## Security Features

- **Authentication:** JWT-based with secure token storage
- **Password Security:** bcrypt hashing with salt rounds
- **Input Validation:** express-validator on all endpoints
- **Rate Limiting:** Prevents brute force attacks (100 requests per 15 minutes)
- **Security Headers:** Helmet middleware for HTTP headers
- **CORS:** Configured for allowed origins only
- **SQL Injection Prevention:** Parameterized queries throughout
- **XSS Prevention:** Input sanitization and validation

---

## Data Volume and Generation

### Production Database
Currently contains: **16 users, 2 trips, 1 expense, 2 trip participants**
- Database hosted on Neon (serverless PostgreSQL)
- Scales automatically based on usage

![Database Data Volume](./screenshots/database-volume.png)
*Current production database counts as of November 2025*

### Development Data
- Test data manually created during development
- Sample dataset includes multiple test users, trips, and expenses across various categories
- Generated through API endpoints during development and testing

### Test Data
- 24 backend tests with programmatically generated fixture data
- Tests use in-memory/test database instances
- Each test suite creates isolated test data (users, trips, expenses, participants)

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

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process
- Branch naming conventions

---

## Author

**Seifeldin**
- GitHub: [@Seif162042](https://github.com/Seif162042)
- Project Repository: [travel-expense-tracker](https://github.com/Seif162042/travel-expense-tracker)

---

## License

This project is licensed under the MIT License.

---

## Support & Feedback

For issues, questions, or feedback:
1. Check the [API Documentation](https://travel-expense-tracker-n1wt.onrender.com/docs)
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Open an issue on [GitHub](https://github.com/Seif162042/travel-expense-tracker/issues)

---

**Last Updated:** November 2025

**Live Demo:** https://travel-expense-tracker-frtd.onrender.com 🚀
