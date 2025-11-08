/**
 * Register Page Component Tests
 * Tests the user registration functionality including:
 * - Form rendering with all required fields
 * - Successful registration and navigation
 * - Error handling for failed registrations
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../src/pages/Register";
import { AuthContext } from "../src/context/AuthContext";

// Mock axios before importing to prevent import.meta crashes in test environment
// Simulates API responses: success for most emails, failure for "taken@example.com"
jest.mock("../src/api/axios", () => ({
    post: jest.fn((url, data) => {
        if (url.includes("/register") && data.email === "taken@example.com") {
            return Promise.reject({ response: { data: "Registration failed. Please try again." } });
        }
        return Promise.resolve({ data: { message: "Registered successfully" } });
    }),
}));

// Mock router navigation to test redirect behavior after registration
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

describe("Register Page", () => {
    /**
     * Test: Form Rendering
     * Verifies that all registration form fields are rendered:
     * - Name input field
     * - Email input field
     * - Password input field
     * - Sign up button
     */
    test("renders registration form", () => {
        render(
            <AuthContext.Provider value={{ register: jest.fn() }}>
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    });

    /**
     * Test: Successful Registration Flow
     * Verifies the complete registration flow:
     * 1. User fills in name, email, and password
     * 2. Submits the form
     * 3. On successful registration, navigates to login page
     */
    test("submits form and navigates on success", async () => {
        await act(async () => {
            render(
                <AuthContext.Provider value={{}}>
                    <MemoryRouter>
                        <Register />
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        // Fill in registration form fields
        fireEvent.change(screen.getByPlaceholderText(/name/i), { target: { value: "Seif" } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: "seif@example.com" } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "123456" } });

        // Submit the form
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
        });

        // Verify navigation to login page after successful registration
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    /**
     * Test: Error Handling
     * Verifies that the form handles registration errors gracefully:
     * - When registration fails (e.g., email already taken)
     * - Form remains visible and doesn't crash
     * - User can retry registration
     */
    test("handles registration error gracefully", async () => {
        await act(async () => {
            render(
                <AuthContext.Provider value={{}}>
                    <MemoryRouter>
                        <Register />
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        // Use email that triggers mock API failure
        fireEvent.change(screen.getByPlaceholderText(/email/i), {
            target: { value: "taken@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/password/i), {
            target: { value: "123456" },
        });

        // Attempt to submit form with taken email
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
        });

        // Verify form is still visible after error (graceful failure, no crash)
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });
});
