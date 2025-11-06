/**
 * ExpenseFilters Component
 * Provides filtering by category and sorting by date or amount.
 * Automatically applies filters and sorting when expenses or options change.
 */
// frontend/src/components/ExpenseFilters.jsx
import { useMemo, useState, useEffect } from "react";

export default function ExpenseFilters({ expenses, onChange }) {
    // Current filter selection (category)
    const [filter, setFilter] = useState("all");
    // Current sort option (date or amount)
    const [sort, setSort] = useState("date");

    // Extract unique categories from expenses list, memoized for performance
    const categories = useMemo(
        () => ["all", ...Array.from(new Set(expenses.map(e => e.category).filter(Boolean)))],
        [expenses]
    );

    /**
     * Effect hook that applies filtering and sorting whenever expenses, filter, or sort changes
     * Filters by category if not "all", then sorts by the selected option
     */
    useEffect(() => {
        // Create a copy of expenses to avoid mutating the original array
        let list = [...expenses];

        // Apply category filter if not "all"
        if (filter !== "all") list = list.filter(e => e.category === filter);

        // Apply sorting based on selected option
        if (sort === "amount") {
            // Sort by amount (highest first)
            list.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
        } else {
            // Sort by date (oldest first)
            list.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : null;
                const dateB = b.date ? new Date(b.date) : null;

                // Put items without dates at the end
                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                // Sort ascending (oldest first)
                return dateA.getTime() - dateB.getTime();
            });
        }

        // Notify parent component of filtered/sorted list
        onChange(list);
    }, [expenses, filter, sort, onChange]);

    const controlStyle = { padding: "8px", border: "1px solid #ccc", borderRadius: 6 };

    return (
        <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
            <select style={controlStyle} value={filter} onChange={e => setFilter(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
            </select>
            <select style={controlStyle} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="date">Sort by date</option>
                <option value="amount">Sort by amount</option>
            </select>
        </div>
    );
}
