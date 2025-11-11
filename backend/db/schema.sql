-- =========================================
-- Travel Expense Tracker - Database Schema
-- =========================================

-- USERS TABLE
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRIPS TABLE
DROP TABLE IF EXISTS trips CASCADE;
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    budget DECIMAL(10,2),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXPENSES TABLE
DROP TABLE IF EXISTS expenses CASCADE;
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_trip_user ON trips(user_id);
CREATE INDEX idx_expense_trip ON expenses(trip_id);
CREATE INDEX idx_expense_user ON expenses(user_id);

-- =========================================
-- TRIP PARTICIPANTS TABLE (Many-to-Many Relationship)
-- =========================================
-- This junction table implements the many-to-many relationship
-- between users and trips, allowing multiple users to participate
-- in a single trip with different roles and permissions.
--
-- Roles: owner, editor, viewer, member
-- Permissions: stored as JSONB for flexibility
-- =========================================

DROP TABLE IF EXISTS trip_participants CASCADE;
CREATE TABLE trip_participants (
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (trip_id, user_id)
);

-- =========================================
-- ADDITIONAL INDEXES FOR TRIP PARTICIPANTS
-- =========================================
CREATE INDEX idx_trip_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user ON trip_participants(user_id);