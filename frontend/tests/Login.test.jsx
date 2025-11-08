/**
 * Login Page Component Tests
 * Tests the login page functionality including:
 * - Form rendering with email and password fields
 * - Form submission and authentication context integration
 * - Validation to prevent submission with empty fields
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react";
import { AuthContext } from "../src/context/AuthContext";
import Login from "../src/pages/Login";

describe("Login Page", () => {
    /**
     * Test: Form Rendering
     * Verifies that the login form renders all required elements:
     * - Email input field
     * - Password input field
     * - Login button
     */
    test("renders login form with inputs and button", () => {
        render(
            <AuthContext.Provider value={{ login: jest.fn() }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    /**
     * Test: Form Submission
     * Verifies that submitting the login form:
     * 1. Collects email and password from form fields
     * 2. Calls the login function from AuthContext with correct credentials
     * 3. Integrates properly with authentication context
     */
    test("submits login form and calls context login", async () => {
        const mockLogin = jest.fn();

        render(
            <AuthContext.Provider value={{ login: mockLogin }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        // Fill in login form
        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: "user@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: "password123" },
        });

        // Submit the form
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /login/i }));
        });

        // Verify login was called with correct credentials
        expect(mockLogin).toHaveBeenCalledWith("user@example.com", "password123");
    });

    /**
     * Test: Form Validation
     * Verifies that the login form prevents submission when fields are empty:
     * - Login function should not be called
     * - Form should not submit with empty email or password
     */
    test("does not call login when fields are empty", async () => {
        const mockLogin = jest.fn();

        render(
            <AuthContext.Provider value={{ login: mockLogin }}>
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /login/i }));
        });

        expect(mockLogin).not.toHaveBeenCalled();
    });
});
