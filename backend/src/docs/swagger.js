// backend/src/docs/swagger.js
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

/**
 * OpenAPI definition
 * - IDs are UUID strings (not integers)
 * - Expense uses `description` (alias of notes at the router), not `note`
 * - Dates are strings with format: date
 * - Production server first (picked by default in hosted /docs)
 */
const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Travel Expense Tracker API",
            version: "1.0.0",
            description: "API documentation for the Travel Expense Tracker backend",
        },
        servers: [
            {
                url: process.env.SWAGGER_SERVER || "https://travel-expense-tracker-n1wt.onrender.com",
                description: "Production",
            },
            { url: "http://localhost:4000", description: "Local" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
            },
            schemas: {
                Trip: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid", example: "705e6e02-0b93-4521-aa90-892625f37a8a" },
                        user_id: { type: "string", format: "uuid", example: "a24c938d-8d4b-4216-8004-8e504aa7ff20" },
                        title: { type: "string", example: "Berlin getaway" },
                        destination: { type: "string", example: "Berlin" },
                        start_date: { type: "string", format: "date", example: "2025-11-05" },
                        end_date: { type: "string", format: "date", example: "2025-11-07" },
                        budget: { type: "number", example: 650 },
                        created_at: { type: "string", example: "2025-11-04T21:35:00.000Z" }
                    },
                },
                TripCreateRequest: {
                    type: "object",
                    required: ["title", "destination"],
                    properties: {
                        title: { type: "string", example: "Berlin getaway" },
                        destination: { type: "string", example: "Berlin" },
                        start_date: { type: "string", format: "date", example: "2025-11-05" },
                        end_date: { type: "string", format: "date", example: "2025-11-07" },
                        budget: { type: "number", example: 650 }
                    }
                },
                Expense: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid", example: "2d3f2a1e-9b9e-4c93-8f5a-1e2d3c4b5a6f" },
                        trip_id: { type: "string", format: "uuid", example: "705e6e02-0b93-4521-aa90-892625f37a8a" },
                        user_id: { type: "string", format: "uuid", example: "a24c938d-8d4b-4216-8004-8e504aa7ff20" },
                        amount: { type: "number", example: 23.5 },
                        category: { type: "string", example: "food" },
                        description: { type: "string", nullable: true, example: "Croissants & coffee" },
                        date: { type: "string", format: "date", nullable: true, example: "2025-11-02" },
                        created_at: { type: "string", example: "2025-11-04T21:40:00.000Z" }
                    },
                },
                ExpenseCreateRequest: {
                    type: "object",
                    required: ["trip_id", "amount", "category"],
                    properties: {
                        trip_id: { type: "string", format: "uuid", example: "705e6e02-0b93-4521-aa90-892625f37a8a" },
                        amount: { type: "number", example: 23.5 },
                        category: { type: "string", example: "food" },
                        description: { type: "string", nullable: true, example: "Croissants & coffee" },
                        date: { type: "string", format: "date", nullable: true, example: "2025-11-02" }
                    }
                },
                AuthToken: {
                    type: "object",
                    properties: { token: { type: "string", example: "eyJhbGciOiJI..." } }
                },
                RegisterRequest: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Alice Example" },
                        email: { type: "string", example: "alice@mail.com" },
                        password: { type: "string", example: "SecurePassw0rd!" }
                    }
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", example: "alice@mail.com" },
                        password: { type: "string", example: "SecurePassw0rd!" }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }],
    },
    // picks up JSDoc blocks from all route files
    apis: ["./src/routes/*.js"],
});

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
