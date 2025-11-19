/**
 * Mock axios instance for Jest tests
 * This mock avoids import.meta.env which Jest can't handle
 */

// Create a mock axios instance for testing
const api = {
    // Mock baseURL without import.meta.env
    defaults: {
        baseURL: 'http://localhost:4000/api'
    },

    // Mock HTTP methods
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} })),

    // Mock interceptors
    interceptors: {
        request: {
            use: jest.fn(),
            eject: jest.fn()
        },
        response: {
            use: jest.fn(),
            eject: jest.fn()
        }
    }
};

export default api;
