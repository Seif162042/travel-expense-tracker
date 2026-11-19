-- lists rows that would make 002_hand_in.sql fail, no rows means it is safe to run
-- to_jsonb is used for expenses.end_date because the old schema may not have that column yet
SELECT 'expense amount <= 0' AS problem, 'expenses' AS table_name, id::text AS id, amount::text AS details
FROM expenses
WHERE amount <= 0

UNION ALL
SELECT 'trip end_date < start_date', 'trips', id::text, start_date || ' to ' || end_date
FROM trips
WHERE end_date < start_date

UNION ALL
SELECT 'expense end_date < date', 'expenses', e.id::text, e.date || ' to ' || (to_jsonb(e) ->> 'end_date')
FROM expenses e
WHERE (to_jsonb(e) ->> 'end_date')::date < e.date

UNION ALL
SELECT 'invalid participant role', 'trip_participants', trip_id || ' / ' || user_id, role
FROM trip_participants
WHERE role NOT IN ('owner', 'editor', 'viewer', 'member')

UNION ALL
SELECT 'trip without user_id', 'trips', id::text, title
FROM trips
WHERE user_id IS NULL

UNION ALL
SELECT 'expense without trip_id', 'expenses', id::text, description
FROM expenses
WHERE trip_id IS NULL

UNION ALL
SELECT 'expense without user_id', 'expenses', id::text, description
FROM expenses
WHERE user_id IS NULL

UNION ALL
-- same '[)' ranges as trips_no_overlap, missing dates count as open ended like in the constraint
SELECT 'overlapping trips', 'trips', a.id || ' / ' || b.id,
       'user ' || a.user_id || ': ' || coalesce(a.start_date::text, '-') || ' to ' || coalesce(a.end_date::text, '-')
       || ' and ' || coalesce(b.start_date::text, '-') || ' to ' || coalesce(b.end_date::text, '-')
FROM trips a
JOIN trips b ON a.user_id = b.user_id AND a.id < b.id
WHERE coalesce(a.end_date >= a.start_date, true)
  AND coalesce(b.end_date >= b.start_date, true)
  AND daterange(a.start_date, a.end_date, '[)') && daterange(b.start_date, b.end_date, '[)')

ORDER BY 1, 3;
