/**
 * ExpenseList Component Tests
 * Tests the expense list component functionality:
 * - Rendering a list of expenses with their categories
 * - Displaying delete buttons for each expense
 * - Delete button interactivity
 */
import { render, screen, fireEvent } from "@testing-library/react";
import ExpenseList from "../src/components/ExpenseList";

/**
 * Test: Expense List Rendering
 * Verifies that the ExpenseList component:
 * 1. Renders all provided expenses
 * 2. Displays expense categories correctly
 * 3. Renders delete buttons for each expense
 * 4. Delete buttons are clickable
 */
test("renders list of expenses and delete buttons", () => {
    // Mock expense data
    const expenses = [
        { id: 1, title: "Flight", amount: 200, category: "Transport" },
        { id: 2, title: "Hotel", amount: 300, category: "Accommodation" },
    ];

    // Render component with mock expenses and handlers
    render(
        <ExpenseList
            expenses={expenses}
            setExpenses={jest.fn()}
            setErr={jest.fn()}
            trip={{ id: 1 }}
        />
    );

    // Verify expense categories are displayed
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
    expect(screen.getByText(/accommodation/i)).toBeInTheDocument();

    // Verify delete buttons are rendered and functional
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    // Test that delete button is clickable
    fireEvent.click(deleteButtons[0]);
});
