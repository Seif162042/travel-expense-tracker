-- brings a database on the old schema up to the current schema.sql
-- run 002_check.sql first, this fails and changes nothing if bad rows are left
BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE trips ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN trip_id SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_dates_check;
ALTER TABLE trips ADD CONSTRAINT trips_dates_check CHECK (end_date >= start_date);

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_amount_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_amount_check CHECK (amount > 0);

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_dates_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_dates_check CHECK (end_date >= date);

ALTER TABLE trip_participants DROP CONSTRAINT IF EXISTS trip_participants_role_check;
ALTER TABLE trip_participants ADD CONSTRAINT trip_participants_role_check CHECK (role IN ('owner', 'editor', 'viewer', 'member'));

ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_no_overlap;
ALTER TABLE trips ADD CONSTRAINT trips_no_overlap EXCLUDE USING gist (user_id WITH =, daterange(start_date, end_date, '[)') WITH &&);

DROP INDEX IF EXISTS idx_user_email;
DROP INDEX IF EXISTS idx_trip_participants_trip;
DROP INDEX IF EXISTS idx_expense_trip;
DROP INDEX IF EXISTS idx_expense_user;

CREATE INDEX IF NOT EXISTS idx_trip_created ON trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expense_user_created ON expenses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expense_user_trip_created ON expenses(user_id, trip_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expense_trip_covering ON expenses(trip_id) INCLUDE (amount, category);
CREATE INDEX IF NOT EXISTS idx_trip_participants_permissions ON trip_participants USING GIN (permissions);

COMMIT;
