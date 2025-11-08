/**
 * ExpenseForm Component Tests
 * Tests the expense form component:
 * - Rendering all required form fields (category, amount, description)
 * - Submit button presence
 */
import { render, screen } from "@testing-library/react";
import { AuthContext } from "../src/context/AuthContext";
import ExpenseForm from "../src/components/ExpenseForm";

/**
 * Test: Form Field Rendering
 * Verifies that the ExpenseForm component renders all required fields:
 * - Category input field
 * - Amount input field
 * - Description input field
 * - Add Expense submit button
 */
test("renders all form fields", () => {
    const mockAuth = { login: jest.fn(), user: { id: 1 } };

    render(
        <AuthContext.Provider value={mockAuth}>
            <ExpenseForm tripId="1" setExpenses={jest.fn()} setErr={jest.fn()} />
        </AuthContext.Provider>
    );

    expect(screen.getByPlaceholderText(/category/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add expense/i })).toBeInTheDocument();
});
