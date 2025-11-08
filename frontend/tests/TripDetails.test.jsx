/**
 * TripDetails Page Component Tests
 * Tests the trip details page functionality:
 * - Loading trip data from API
 * - Loading associated expenses from API
 * - Rendering trip information and expenses
 */
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext";
import TripDetails from "../src/pages/TripDetails";
import api from "../api/axios"; // same path your component uses

// Mock axios to simulate API calls for trip and expense data
jest.mock("../api/axios", () => ({
    get: jest.fn(),
}));

/**
 * Test: Data Loading and Rendering
 * Verifies that the TripDetails component:
 * 1. Fetches trip data from /trips/:id endpoint
 * 2. Fetches expenses from /expenses/trip/:id endpoint
 * 3. Renders trip destination correctly
 * 4. Renders all associated expenses with their amounts
 */
test("loads trip details and expenses from API", async () => {
    const mockTrip = {
        id: 1,
        destination: "Paris Trip",
        budget: 1000,
        start_date: "2025-05-01",
        end_date: "2025-05-10",
    };

    const mockExpenses = [
        { id: 1, title: "Flight", amount: 200 },
        { id: 2, title: "Hotel", amount: 500 },
    ];

    // Mock API responses for trip and expenses endpoints
    // Matches the actual URLs the component calls
    api.get.mockImplementation((url) => {
        if (url === "/trips/1") {
            return Promise.resolve({ data: mockTrip });
        }
        if (url === "/expenses/trip/1") {
            return Promise.resolve({ data: mockExpenses });
        }
        return Promise.reject(new Error(`Unmocked URL: ${url}`));
    });

    const mockAuth = { user: { id: 1 } };

    // Render component with route parameter
    render(
        <AuthContext.Provider value={mockAuth}>
            <MemoryRouter initialEntries={["/trips/1"]}>
                <Routes>
                    <Route path="/trips/:id" element={<TripDetails />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>
    );

    // Wait for trip destination to be rendered (confirms trip data loaded)
    await waitFor(() => {
        expect(screen.getByText(/paris trip/i)).toBeInTheDocument();
    });

    // Verify both expenses are rendered with their amounts
    expect(screen.getByText(/\$200/)).toBeInTheDocument();
    expect(screen.getByText(/\$500/)).toBeInTheDocument();
});
