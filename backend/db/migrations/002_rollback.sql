-- undoes 002_hand_in.sql
-- expenses.end_date is kept, the app reads it and dropping it would lose data
BEGIN;

ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_no_overlap;
ALTER TABLE trips DROP CONSTRAINT IF EXISTS trips_dates_check;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_amount_check;
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_dates_check;
ALTER TABLE trip_participants DROP CONSTRAINT IF EXISTS trip_participants_role_check;

ALTER TABLE trips ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE expenses ALTER COLUMN trip_id DROP NOT NULL;
ALTER TABLE expenses ALTER COLUMN user_id DROP NOT NULL;

DROP INDEX IF EXISTS idx_trip_created;
DROP INDEX IF EXISTS idx_expense_user_trip_created;
DROP INDEX IF EXISTS idx_expense_trip_covering;
DROP INDEX IF EXISTS idx_trip_participants_permissions;

CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_trip_participants_trip ON trip_participants(trip_id);

DROP EXTENSION IF EXISTS btree_gist;

COMMIT;
