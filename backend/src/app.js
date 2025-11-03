// backend/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expensesRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";


const app = express();

// ===== Swagger Setup =====
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Travel Expense Tracker API",
            version: "1.0.0",
            description: "API documentation for the backend project",
        },
        servers: [{ url: "http://localhost:5000" }],
    },
    apis: ["./src/routes/*.js"],
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));
app.use(express.json());




// ===== Health Check Route =====
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "travel-expense-tracker",
        time: new Date().toISOString(),
    });
});
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);

// ===== Error Handling Middleware =====
app.use(errorHandler);




export default app;
