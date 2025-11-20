# Travel Expense Tracker - Frontend

React-based frontend application for managing travel expenses with real-time analytics.

## Live Demo

**Deployed Application:** https://travel-expense-tracker-frtd.onrender.com

Try it out: Register a new account to explore all features!

---

## Architecture

Built with React 19 and Vite, following a component-based architecture with Context API for global state management.

### Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library with hooks | 19.x |
| **Vite** | Fast build tool and dev server | 6.x |
| **React Router** | Client-side routing | 7.x |
| **Context API** | Global authentication state | Built-in |
| **Axios** | HTTP client with interceptors | 1.x |
| **Recharts** | Data visualization charts | 2.x |
| **Tailwind CSS** | Utility-first styling | 3.x |
| **Vitest** | Testing framework | 2.x |
| **React Testing Library** | Component testing | 16.x |

---

## Component Structure

```
src/
├── pages/              # Route-level components
│   ├── Dashboard.jsx       # Main dashboard with trip list
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   ├── TripDetails.jsx    # Individual trip details with expenses
│   ├── Analytics.jsx      # Analytics and charts
│   ├── Profile.jsx        # User profile
│   └── NotFound.jsx       # 404 page
│
├── components/         # Reusable UI components
│   ├── Navbar.jsx              # Navigation bar
│   ├── TripList.jsx            # List of trips with edit/delete
│   ├── TripForm.jsx            # Form for creating/editing trips
│   ├── ExpenseList.jsx         # List of expenses with inline editing
│   ├── ExpenseForm.jsx         # Form for adding expenses
│   ├── ExpenseChart.jsx        # Single expense chart component
│   ├── DashboardCharts.jsx     # Multiple analytics charts
│   ├── DashboardOverview.jsx   # Dashboard summary cards
│   ├── ExpenseFilters.jsx      # Filter/search expenses
│   └── ProtectedRoute.jsx      # Route guard for authentication
│
├── context/           # Global state management
│   └── AuthContext.jsx    # Authentication state and methods
│
├── api/               # API layer
│   └── axios.jsx          # Configured Axios instance
│
├── assets/            # Static assets
│
├── App.jsx            # Main app component with routes
└── main.jsx           # Application entry point
```

---

## Key Features

### State Management

**Authentication (Context API):**
- User state and JWT token stored in AuthContext
- Token persisted in localStorage for session persistence
- Axios interceptors automatically add token to requests
- Automatic logout on token expiration

**Component State:**
- Local state with `useState` hook for component-specific data
- Side effects managed with `useEffect` hook
- Form state management with controlled components

### Routing

**React Router v7** for client-side routing:
- **Protected Routes:** Authentication-required pages wrapped with `ProtectedRoute`
- **Public Routes:** Login, Register
- **Private Routes:** Dashboard, Trip Details, Analytics, Profile

**Route Structure:**
```javascript
/                  → Dashboard (protected)
/login             → Login page
/register          → Register page
/trips/:id         → Trip details (protected)
/analytics         → Analytics page (protected)
/profile           → User profile (protected)
*                  → 404 Not Found
```

### API Integration

**Axios Configuration:**
- Base URL from environment variable
- Automatic token injection via interceptors
- Centralized error handling
- Request/response transformation

```javascript
// Axios automatically adds JWT token
Authorization: Bearer <jwt_token>

// Token stored in localStorage
localStorage.setItem('token', token);
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Backend API running (see [backend README](../backend/README.md))

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Variables

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:4000/api
```

For production (Render), use:
```env
VITE_API_URL=https://travel-expense-tracker-n1wt.onrender.com/api
```

### Available Scripts

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
npm run lint         # Run ESLint
```

---

## Testing

### Test Framework

- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation

### Test Coverage
```
Test Suites: 8 passed, 8 total
Tests: 16 passed, 16 total

Coverage:
- Components: 80%+
- Context: 90%+
- Pages: 75%+
```

### Test Files

```
tests/
├── App.test.jsx           # App routing and navigation tests
├── AuthContext.test.jsx   # Authentication context tests
├── Dashboard.test.jsx     # Dashboard rendering tests
├── ExpenseForm.test.jsx   # Expense form validation tests
├── ExpenseList.test.jsx   # Expense list display tests
├── Login.test.jsx         # Login functionality tests
├── Register.test.jsx      # Registration flow tests
└── TripDetails.test.jsx   # Trip details page tests
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```


---

## Code Analysis Tools

### Linting
- **ESLint:** Enforces React and JavaScript best practices
  - Configuration: `.eslintrc.json` or `eslintConfig` in package.json
  - Run: `npm run lint`
  - Checks: React hooks rules, accessibility, code style

### Testing
- **Vitest:** Fast unit testing framework
  - Run: `npm test`
  - Coverage: 8 test suites, 16 tests
  - Tests: Components, pages, context, user interactions
- **React Testing Library:** Component testing utilities
  - Focuses on user-centric testing
  - Tests component behavior, not implementation

### Running All Checks
```bash
# Run all frontend checks
npm run lint && npm test

# With coverage report
npm run lint && npm run test:coverage
```

**Pre-commit Hooks (if configured):**
- Husky + lint-staged can automatically run linting before commits
- Ensures all committed code meets quality standards
```

---

## Styling

### Tailwind CSS

- Utility-first CSS framework
- Responsive design with breakpoints
- Custom color palette
- Dark mode support (if implemented)

### Responsive Breakpoints

```css
/* Mobile */
< 768px - Mobile devices

/* Tablet */
768px - 1024px - Tablets and small laptops

/* Desktop */
> 1024px - Desktop computers
```

### Design System

```css
/* Primary colors */
--primary: #6A0DAD (purple)
--secondary: #9B5DE5 (violet)

/* Status colors */
--success: #4CAF50 (green)
--error: #b91c1c (red)
--warning: #FFB400 (yellow)
--info: #3b82f6 (blue)
```

---

## Authentication Flow

### JWT-based Authentication

**Login Flow:**
1. User enters credentials in Login page
2. Frontend sends POST to `/api/users/login`
3. Backend validates and returns JWT token
4. Token stored in:
   - AuthContext state (for current session)
   - localStorage (for persistence across sessions)
5. Axios interceptor automatically adds token to all requests

**Token Management:**
```javascript
// Token automatically added to all requests
Authorization: Bearer <jwt_token>

// Token stored for persistence
localStorage.setItem('token', token);

// Token removed on logout
localStorage.removeItem('token');

// Automatic redirect to login on 401 Unauthorized
```

**Protected Routes:**
- Check if user is authenticated in AuthContext
- Redirect to `/login` if not authenticated
- Implemented with `ProtectedRoute` wrapper component

---

## Features Implementation

### Dashboard
- Overview of all trips with summary cards
- Quick stats (total trips, total spent, upcoming trips)
- Trip list with budget usage indicators
- Days remaining calculation for each trip
- Quick actions (create trip, view analytics)

### Trip Management
- Create new trips with destination, dates, and budget
- Edit trip details (destination, dates, budget)
- Delete trips with confirmation modal
- View detailed trip information with all expenses
- Overlap validation (prevents conflicting trip dates)
- Visual budget usage bar

### Expense Tracking
- Add expenses to trips with category selection
- Categories: Hotel, Food, Transport, Activities, Other
- Date range support for multi-day expenses
- Edit expenses inline with form validation
- Delete expenses with confirmation
- Date validation (must be within trip dates)
- Real-time budget calculations

### Analytics
- **Bar Chart:** Budget vs. Actual Spent per trip
- **Pie Chart:** Budget distribution across all trips
- **Line Chart:** Spending trend over time
- Interactive tooltips with detailed information
- Real-time calculations
- Filter by date range (if implemented)

---

## Configuration

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  server: {
    port: 5173,
    open: true,
  },
})
```

### Environment Variables

```env
# Required
VITE_API_URL=<backend-api-url>

# Optional
VITE_APP_NAME=Travel Expense Tracker
```

**Note:** Environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## API Endpoints Used

### Authentication
```javascript
POST /api/users/register    # Register new user
POST /api/users/login        # Login user
```

### Trips
```javascript
GET    /api/trips           # Get all user trips
GET    /api/trips/:id       # Get trip by ID
POST   /api/trips           # Create new trip
PUT    /api/trips/:id       # Update trip
DELETE /api/trips/:id       # Delete trip
```

### Expenses
```javascript
GET    /api/expenses/trip/:tripId  # Get expenses for a trip
POST   /api/expenses               # Create new expense
PUT    /api/expenses/:id           # Update expense
DELETE /api/expenses/:id           # Delete expense
```

**Full API documentation:** https://travel-expense-tracker-n1wt.onrender.com/docs

---

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure backend CORS is configured for your frontend URL
- Check `VITE_API_URL` environment variable is correct
- Verify backend is running and accessible

**2. 401 Unauthorized Errors**
- Token may have expired - try logging in again
- Check if token is being sent in request headers
- Verify JWT_SECRET matches between frontend and backend

**3. API Connection Failed**
- Verify backend is running at the correct URL
- Check `VITE_API_URL` is correctly set
- Ensure backend URL includes `/api` path

**4. Charts Not Displaying**
- Check if trip data exists in the database
- Verify expenses are properly linked to trips
- Check browser console for JavaScript errors
- Ensure Recharts is properly installed

**5. Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node version: `node -v` (should be 18+)
- Verify all dependencies are installed

---

## Deployment

### Render Deployment

**Deployment Configuration:**
```yaml
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: frontend/dist
```

**Environment Variables (on Render):**
```
VITE_API_URL=https://travel-expense-tracker-n1wt.onrender.com/api
```

### Build Output

Production build creates optimized static files:

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Main JavaScript bundle
│   ├── index-[hash].css   # Styles
│   └── [other assets]
```

**Build Statistics:**
- Total size: ~300-500 KB (gzipped)
- React + React-DOM: ~130 KB
- Recharts: ~90 KB
- Application code: ~100 KB

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Code style guidelines
- Component development best practices
- Testing requirements
- Pull request process

---

## License

MIT

---

## Links

- **Main Repository:** [GitHub](https://github.com/Seif162042/travel-expense-tracker)
- **Backend Documentation:** [Backend README](../backend/README.md)
- **API Documentation:** [Swagger](https://travel-expense-tracker-n1wt.onrender.com/docs)
- **Live Application:** [Render](https://travel-expense-tracker-frtd.onrender.com)

---

**Last Updated:** November 2025
