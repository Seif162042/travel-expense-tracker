/**
 * 
 * Description:
 *  This frontend test verifies that the login page renders correctly
 *  when navigating to the `/login` route within the App component.
 *
 * Test Coverage Includes:
 *  - Rendering App inside a MemoryRouter for isolated routing
 *  - Providing a mock AuthContext to simulate authentication state
 *  - Verifying the presence of key UI elements on the login screen
 *
 * 
 */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext";
import App from "../src/App";

test("renders login page", () => {
    // Mock the authentication context — user is not logged in
    const mockAuth = { login: jest.fn(), user: null, logout: jest.fn() };

    // Render the App inside a memory-based router starting at /login
    render(
        <AuthContext.Provider value={mockAuth}>
            <MemoryRouter initialEntries={["/login"]}>
                <App />
            </MemoryRouter>
        </AuthContext.Provider>
    );

    // ✅ Assert: Login heading should be visible (not duplicate text)
    expect(
        screen.getByRole("heading", { level: 2, name: /login to your account/i })
    ).toBeInTheDocument();

    // ✅ Assert: "Login" button is present and correctly labeled
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
});
