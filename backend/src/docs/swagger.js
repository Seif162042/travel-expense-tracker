import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

/**
 * Bearer auth & basic project metadata
 * apis: points to your routes to pick up JSDoc blocks if present
 * If you don’t have JSDoc route comments yet, the UI will still load.
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
            { url: "http://localhost:4000", description: "Local" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                Trip: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 42 },
                        destination: { type: "string", example: "Paris" },
                        start_date: { type: "string", format: "date", example: "2025-11-01" },
                        end_date: { type: "string", format: "date", example: "2025-11-04" },
                        budget: { type: "number", example: 650 },
                        user_id: { type: "integer", example: 7 }
                    },
                },
                Expense: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 101 },
                        trip_id: { type: "integer", example: 42 },
                        amount: { type: "number", example: 23.5 },
                        category: { type: "string", example: "Food" },
                        note: { type: "string", example: "Croissants & coffee" },
                        date: { type: "string", format: "date", example: "2025-11-02" }
                    },
                },
                AuthToken: {
                    type: "object",
                    properties: { token: { type: "string", example: "eyJhbGciOiJI..." } }
                },
                RegisterRequest: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Alice" },
                        email: { type: "string", example: "alice@mail.com" },
                        password: { type: "string", example: "securepass" }
                    }
                },
                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", example: "alice@mail.com" },
                        password: { type: "string", example: "securepass" }
                    }
                }
            }

        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.js"], // Path to the API docs
});

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
