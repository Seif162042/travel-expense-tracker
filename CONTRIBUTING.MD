# Contributing to Travel Expense Tracker

Thank you for your interest in contributing to the Travel Expense Tracker! This guide will help you get started with development and ensure smooth collaboration.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **Git** installed
- **Code editor** (VS Code recommended)
- **npm** or **yarn** package manager

### Initial Setup

#### 1. Fork the Repository
- Go to https://github.com/Seif162042/travel-expense-tracker
- Click the **"Fork"** button in the top right
- This creates your own copy of the repository

#### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/travel-expense-tracker.git
cd travel-expense-tracker
```

#### 3. Add Upstream Remote
```bash
git remote add upstream https://github.com/Seif162042/travel-expense-tracker.git
```

This allows you to keep your fork updated with the original repository.

#### 4. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

#### 5. Set Up Database

```bash
# Create database
createdb travel_expense_tracker

# If there's a schema file
psql -d travel_expense_tracker -f backend/schema.sql
```

#### 6. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/travel_expense_tracker
JWT_SECRET=your_development_secret_key_here
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000/api
```

#### 7. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔄 Development Workflow

### 1. Before Starting Work

Always start with an updated main branch:

```bash
# Switch to main branch
git checkout main

# Pull latest changes from upstream
git fetch upstream
git merge upstream/main

# Push to your fork
git push origin main
```

### 2. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

**Branch Naming Conventions:**

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/export-expenses` |
| `fix/` | Bug fixes | `fix/date-validation-bug` |
| `docs/` | Documentation changes | `docs/update-api-guide` |
| `refactor/` | Code refactoring | `refactor/expense-controller` |
| `test/` | Adding/updating tests | `test/trip-validation` |
| `style/` | Code formatting (no logic change) | `style/format-components` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

**Examples:**
```bash
git checkout -b feature/expense-categories
git checkout -b fix/trip-overlap-validation
git checkout -b docs/add-api-examples
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the code style guidelines (see below)
- Add comments for complex logic
- Update documentation if needed
- Write or update tests

### 4. Test Your Changes

**Backend Tests:**
```bash
cd backend
npm test
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

**All tests must pass before submitting a PR!**

### 5. Commit Your Changes

Follow the commit message guidelines (see below):

```bash
git add .
git commit -m "feat: add expense category filter"
```

### 6. Keep Your Branch Updated

Before creating a PR, sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

If there are conflicts, resolve them and continue:

```bash
# After resolving conflicts
git add .
git rebase --continue
```

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Create Pull Request

1. Go to your fork on GitHub
2. Click **"Compare & pull request"**
3. Fill out the PR template (see below)
4. Submit the PR

---

## 📝 Code Style Guidelines

### General Principles

1. **Write self-documenting code**
   - Use clear, descriptive names
   - Keep functions small and focused
   - Add comments only for complex logic

2. **Follow the Single Responsibility Principle**
   - Each function should do one thing
   - Each component should have one responsibility

3. **DRY (Don't Repeat Yourself)**
   - Extract repeated code into functions
   - Create reusable components
   - Use utility functions

4. **YAGNI (You Ain't Gonna Need It)**
   - Don't add features "just in case"
   - Implement only what's needed now
   - Refactor when requirements change

---

### JavaScript/JSX Style

#### Naming Conventions

```javascript
// Variables and functions: camelCase
const userName = "John";
const tripStartDate = new Date();
function calculateBudget() {}

// Components and classes: PascalCase
function TripForm() {}
class TripService {}

// Constants: UPPERCASE with underscores
const MAX_TRIPS = 100;
const API_TIMEOUT = 5000;

// Private variables: prefix with underscore (optional)
const _internalCache = {};

// Boolean variables: prefix with "is", "has", "can", "should"
const isAuthenticated = true;
const hasExpenses = false;
const canEdit = true;
```

#### Variables

```javascript
// Prefer const over let, never use var
const API_URL = "http://localhost:4000";
let counter = 0;

// Use template literals for string interpolation
const greeting = `Hello, ${userName}!`;

// Destructure when appropriate
const { id, name, email } = user;
const [first, second, ...rest] = array;

// Use meaningful names
// Good
const userAuthenticationToken = generateToken();

// Bad
const t = generateToken();
```

#### Functions

```javascript
// Use arrow functions for callbacks
const numbers = [1, 2, 3].map(n => n * 2);
const filtered = trips.filter(trip => trip.budget > 100);

// Use async/await over promises
// Good
async function fetchTrips() {
  try {
    const response = await api.get("/trips");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    throw error;
  }
}

// Avoid (unless necessary)
function fetchTrips() {
  return api.get("/trips")
    .then(response => response.data)
    .catch(error => {
      console.error(error);
      throw error;
    });
}

// Keep functions small (< 20 lines ideally)
// Extract complex logic into helper functions

// Good - small, focused functions
function calculateBudgetUsed(spent, budget) {
  if (!budget) return 0;
  return Math.min((spent / budget) * 100, 100);
}

function getDaysRemaining(endDate) {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
```

#### Error Handling

```javascript
// Always use try-catch for async operations
async function createTrip(tripData) {
  try {
    const result = await api.post('/trips', tripData);
    return result.data;
  } catch (error) {
    // Handle specific error types
    if (error.response?.status === 400) {
      throw new Error('Invalid trip data');
    }
    throw error;
  }
}

// Provide meaningful error messages
if (!trip.budget || trip.budget <= 0) {
  throw new Error('Budget must be a positive number');
}
```

---

### React Guidelines

#### Component Structure

```javascript
// Functional components with hooks
function TripList({ trips, onDelete, onEdit }) {
  // 1. Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 2. Event handlers
  const handleDelete = (id) => {
    // handler logic
  };
  
  // 3. useEffect hooks
  useEffect(() => {
    // side effects
  }, [dependency]);
  
  // 4. Early returns for loading/error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // 5. Main render
  return (
    <div>
      {trips.map(trip => (
        <TripCard 
          key={trip.id} 
          trip={trip} 
          onDelete={handleDelete} 
        />
      ))}
    </div>
  );
}

// Add PropTypes or use TypeScript
TripList.propTypes = {
  trips: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
};
```

#### State Management

```javascript
// Group related state
const [formData, setFormData] = useState({
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0,
});

// Use functional updates when depending on previous state
setCount(prevCount => prevCount + 1);

// Don't mutate state directly
// Bad
formData.destination = 'Paris';

// Good
setFormData({ ...formData, destination: 'Paris' });
```

#### useEffect

```javascript
// Include all dependencies
useEffect(() => {
  fetchData(userId, tripId);
}, [userId, tripId]);

// Clean up side effects
useEffect(() => {
  const subscription = api.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// Avoid empty dependency arrays unless necessary
// Only use [] when effect should run once on mount
```

---

### Backend Guidelines

#### Express Routes

```javascript
// Use descriptive route names
router.get('/trips', getTrips);
router.post('/trips', validateTrip, createTrip);
router.put('/trips/:id', validateTrip, updateTrip);
router.delete('/trips/:id', deleteTrip);

// Group related routes
const tripRoutes = require('./routes/tripRoutes');
const expenseRoutes = require('./routes/expensesRoutes');

app.use('/api/trips', tripRoutes);
app.use('/api/expenses', expenseRoutes);
```

#### Controllers

```javascript
// Keep controllers thin - delegate to services if needed
export const createTrip = async (req, res, next) => {
  try {
    // 1. Extract data (already validated by middleware)
    const { user_id } = req.user;
    const tripData = req.body;
    
    // 2. Business logic
    const trip = await TripService.create(user_id, tripData);
    
    // 3. Return response
    return res.status(201).json({
      success: true,
      data: trip
    });
  } catch (error) {
    // 4. Error handling (middleware handles this)
    next(error);
  }
};
```

#### Database Queries

```javascript
// ALWAYS use parameterized queries (prevent SQL injection)
// Good
const result = await pool.query(
  'SELECT * FROM trips WHERE user_id = $1 AND id = $2',
  [userId, tripId]
);

// Bad - NEVER do this!
const result = await pool.query(
  `SELECT * FROM trips WHERE user_id = ${userId}`
);

// Use descriptive variable names
const trips = result.rows;
const trip = result.rows[0];
```

---

### Comments

#### When to Comment

```javascript
// ✅ DO comment:

// 1. Complex business logic
// Trip overlap validation using De Morgan's law
// Overlap exists when NOT (end <= other_start OR start >= other_end)
const hasOverlap = !(endDate <= otherStartDate || startDate >= otherEndDate);

// 2. Non-obvious decisions
// Using string comparison for ISO dates (YYYY-MM-DD)
// This works because of lexicographic ordering
if (expense.start_date <= expense.end_date) { }

// 3. Workarounds or hacks
// TODO: Replace with proper date library when refactoring
const dateString = date.toISOString().split('T')[0];

// 4. Complex algorithms
/**
 * Calculate budget usage percentage
 * Caps at 100% to avoid confusing UI when over budget
 * @param {number} spent - Total amount spent
 * @param {number} budget - Trip budget
 * @returns {number} Percentage (0-100)
 */
function calculateBudgetUsed(spent, budget) {
  if (!budget) return 0;
  return Math.min((spent / budget) * 100, 100);
}
```

```javascript
// ❌ DON'T comment:

// 1. Obvious code
// Bad
const userId = user.id; // Get user ID

// 2. Self-documenting code
// Bad - function name is clear
// Calculate the total
function calculateTotal(items) { }

// 3. Bad code instead of fixing it
// Bad
// This is a hack but it works
const x = y * 2.5 + 17;
```

---

## 🧪 Testing Requirements

### What to Test

#### Backend Testing

**Required:**
- All API endpoints (status codes, response format)
- Controller functions (business logic)
- Middleware (authentication, validation)
- Error handling
- Edge cases

**Example:**
```javascript
describe('POST /api/trips', () => {
  it('should create a trip with valid data', async () => {
    const tripData = {
      destination: 'Paris',
      start_date: '2024-01-01',
      end_date: '2024-01-07',
      budget: 1000
    };
    
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${validToken}`)
      .send(tripData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.destination).toBe('Paris');
  });
  
  it('should reject trip with overlapping dates', async () => {
    // Test edge case
  });
});
```

#### Frontend Testing

**Required:**
- Component rendering
- User interactions (clicks, form submissions)
- Form validation
- API integration (mocked)
- Authentication flow

**Example:**
```javascript
describe('ExpenseForm', () => {
  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    
    render(<ExpenseForm onSubmit={mockSubmit} trip={mockTrip} />);
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Hotel stay' }
    });
    
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '150' }
    });
    
    fireEvent.click(screen.getByText('Add Expense'));
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Hotel stay',
          amount: 150
        })
      );
    });
  });
});
```

### Test Coverage

- Aim for **70%+ coverage** minimum
- Critical paths should have **90%+ coverage**
- All new features must include tests

### Running Tests

```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report

# Frontend
cd frontend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

**All tests must pass before creating a PR!**

---

## 💬 Commit Message Guidelines

We follow the **Conventional Commits** specification for clear and meaningful commit history.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add expense category filter` |
| `fix` | Bug fix | `fix: resolve trip overlap validation` |
| `docs` | Documentation only | `docs: update API examples` |
| `style` | Code formatting (no logic change) | `style: format trip controller` |
| `refactor` | Code refactoring | `refactor: extract validation logic` |
| `test` | Adding or updating tests | `test: add expense form tests` |
| `chore` | Maintenance tasks | `chore: update dependencies` |
| `perf` | Performance improvements | `perf: optimize trip queries` |

### Examples

```bash
# Simple commit
git commit -m "feat: add expense category filter"

# With scope
git commit -m "fix(backend): resolve JWT token expiration"

# With body
git commit -m "feat: add trip budget alerts

- Add notification when 80% budget reached
- Add warning when budget exceeded
- Include visual indicators in UI"

# Breaking change
git commit -m "feat!: change API response format

BREAKING CHANGE: API now returns data in { success, data } format
instead of raw data. Update all API calls accordingly."
```

### Rules

1. **Use lowercase** for type and subject
2. **No period** at the end of subject
3. **Imperative mood** ("add" not "added" or "adds")
4. **50 characters max** for subject line
5. **72 characters max** for body lines
6. **Blank line** between subject and body

---

## 🔍 Code Review Checklist

Before submitting a PR, verify:

### Code Quality
- [ ] Code follows style guidelines
- [ ] No `console.log` in production code (use proper logging)
- [ ] No commented-out code (delete it)
- [ ] Functions are small and focused (< 20 lines ideally)
- [ ] Variable names are descriptive
- [ ] No magic numbers (use constants)
- [ ] DRY principle followed (no code duplication)

### Testing
- [ ] All existing tests pass
- [ ] New tests added for new features
- [ ] Edge cases are tested
- [ ] Test coverage maintained or improved
- [ ] No test files skipped or disabled

### Documentation
- [ ] Code comments added for complex logic
- [ ] README updated if needed
- [ ] API documentation updated (Swagger) if endpoints changed
- [ ] CHANGELOG updated (if applicable)

### Security
- [ ] No sensitive data in code (API keys, passwords, tokens)
- [ ] Input validation in place
- [ ] SQL queries are parameterized
- [ ] XSS prevention (proper escaping)
- [ ] Authentication required where needed

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Large lists are paginated

### Git
- [ ] Commits are atomic (one change per commit)
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main
- [ ] No merge conflicts

---

## 📤 Pull Request Process

### 1. Create Pull Request

Go to your fork on GitHub and create a PR to the upstream main branch.

### 2. PR Title

Use the same format as commit messages:

```
feat: add expense category filter
fix: resolve trip date validation
docs: update installation guide
```

### 3. PR Description

Use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How to Test
1. Step one
2. Step two
3. Expected result

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged
```

### 4. Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainer
3. **Requested changes** (if needed) - address them and push updates
4. **Approval** from maintainer
5. **Merge** to main branch

### 5. After Merge

```bash
# Delete your feature branch locally
git branch -d feature/your-feature-name

# Delete remote branch
git push origin --delete feature/your-feature-name

# Update your main branch
git checkout main
git pull upstream main
git push origin main
```

---

## 🏗️ Project Architecture

### Backend Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers, business logic
│   ├── routes/         # API route definitions
│   ├── middleware/     # Express middleware (auth, validation, errors)
│   ├── utils/          # Helper functions
│   ├── config/         # Configuration files
│   ├── docs/           # Swagger API documentation
│   ├── db.js           # Database connection
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
└── tests/             # Jest test files
```

**Key principles:**
- Controllers handle HTTP requests/responses
- Business logic in controllers or separate services
- Middleware for cross-cutting concerns (auth, validation)
- Routes only define endpoints

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/         # Route-level components (Dashboard, Login, etc.)
│   ├── components/    # Reusable UI components
│   ├── context/       # Global state (AuthContext)
│   ├── api/           # API configuration (Axios)
│   ├── assets/        # Static assets
│   ├── App.jsx        # Main app with routes
│   └── main.jsx       # Entry point
└── tests/            # Vitest test files
```

**Key principles:**
- Pages are route-level components
- Components are reusable and composable
- Context API for global state (authentication)
- Axios for API calls

---

## 🆘 Getting Help

### Questions or Issues?

1. **Check existing documentation:**
   - [Main README](./README.md)
   - [Backend README](./backend/README.md)
   - [Frontend README](./frontend/README.md)
   - [API Documentation](https://travel-expense-tracker-n1wt.onrender.com/docs)

2. **Search existing issues:**
   - Check if someone already asked your question
   - Look for closed issues with solutions

3. **Ask a question:**
   - Open a new issue with the `question` label
   - Provide context and what you've tried
   - Include error messages and screenshots if applicable

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
Add screenshots if applicable.

**Environment:**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 90]
- Node version: [e.g. 18.0.0]
```

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Thank you for contributing to Travel Expense Tracker! Your efforts help make this project better for everyone.

**Happy coding!** 🚀
