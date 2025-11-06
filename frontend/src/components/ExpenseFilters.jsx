// frontend/src/components/ExpenseFilters.jsx
import { useMemo, useState, useEffect } from "react";

export default function ExpenseFilters({ expenses, onChange }) {
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("date");

    const categories = useMemo(
        () => ["all", ...Array.from(new Set(expenses.map(e => e.category).filter(Boolean)))],
        [expenses]
    );

    useEffect(() => {
        let list = [...expenses];
        if (filter !== "all") list = list.filter(e => e.category === filter);

        if (sort === "amount") {
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
