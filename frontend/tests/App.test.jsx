import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext";
import App from "../src/App";

test("renders login page", () => {
    const mockAuth = { login: jest.fn(), user: null, logout: jest.fn() };

    render(
        <AuthContext.Provider value={mockAuth}>
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        </AuthContext.Provider>
    );

    // Assert the heading specifically (avoids the duplicate "Login" text)
    expect(
        screen.getByRole("heading", { level: 2, name: /login to your account/i })
    ).toBeInTheDocument();

    // Optionally, also assert the button separately (exact text match)
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
});