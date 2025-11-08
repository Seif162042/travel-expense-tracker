/**
 * App Component Tests
 * Tests the main App component routing:
 * - Rendering the login page when navigating to /login route
 * - Correct page rendering based on route
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext";
import App from "../src/App";

/**
 * Test: Login Page Rendering
 * Verifies that the App component:
 * 1. Renders the login page when route is /login
 * 2. Displays the login heading
 * 3. Displays the login button
 */
test("renders login page", () => {
    const mockAuth = { login: jest.fn(), user: null, logout: jest.fn() };

    // Render App with login route
    render(
        <AuthContext.Provider value={mockAuth}>
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        </AuthContext.Provider>
    );

    // Verify login page heading is displayed
    // Using heading role to avoid duplicate "Login" text matches
    expect(
        screen.getByRole("heading", { level: 2, name: /login to your account/i })
    ).toBeInTheDocument();

    // Verify login button is present with exact text match
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
});
