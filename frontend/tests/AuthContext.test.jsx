/**
 * AuthContext Tests
 * Tests the authentication context provider including:
 * - Login functionality and localStorage persistence
 * - Logout functionality and state clearing
 * - Authentication state updates
 */
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, AuthContext } from "../src/context/AuthContext";

// Mock axios to simulate API login responses
// Must match the exact import path used in AuthContext.jsx
// FIXED: Mock now returns the correct structure { token, user: {...} }
jest.mock("../api/axios", () => ({
    post: jest.fn(() =>
        Promise.resolve({
            data: {
                token: "mock-token",
                user: {
                    id: 1,
                    name: "MockUser",
                    email: "mock@example.com"
                }
            },
        })
    ),
}));

beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
});

describe("AuthContext", () => {
    /**
     * Test: Login Functionality
     * Verifies that login:
     * 1. Sets user state in context
     * 2. Stores authentication token in localStorage
     * 3. Stores user data in localStorage
     */
    test("login sets user and token in localStorage", async () => {
        const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

        await act(async () => {
            await result.current.login("mock@example.com", "password123");
        });

        expect(result.current.user).toEqual({
            id: 1,
            name: "MockUser",
            email: "mock@example.com",
        });
        expect(localStorage.getItem("token")).toBe("mock-token");
    });

    /**
     * Test: Logout Functionality
     * Verifies that logout:
     * 1. Clears user state from context (sets to null)
     * 2. Removes token from localStorage
     * 3. Removes user data from localStorage
     */
    test("logout clears user and token", async () => {
        const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

        // Login first, then logout
        await act(async () => {
            await result.current.login("mock@example.com", "password123");
            result.current.logout();
        });

        // Verify user state and localStorage are cleared
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
    });

    /**
     * Test: Authentication State Update
     * Verifies that login correctly updates the authentication state:
     * - User name is set correctly
     * - Token is stored in localStorage
     */
    test("login updates authentication state correctly", async () => {
        const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
        const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

        await act(async () => {
            await result.current.login("mock@example.com", "password123");
        });

        expect(result.current.user.name).toBe("MockUser");
        expect(localStorage.getItem("token")).toBe("mock-token");
    });
});
