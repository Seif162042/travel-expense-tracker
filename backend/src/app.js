// backend/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { swaggerServe, swaggerSetup } from "./docs/swagger.js";
import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expensesRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// (Swagger is optional for tests; keep simple here)

const app = express();

// Redirect the root to Swagger docs (fastest option)
app.get("/", (_req, res) => {
    res.redirect("/docs");
});

// Simple health endpoint at top-level (useful for Render checks)
app.get("/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        uptime: process.uptime(),
        env: process.env.NODE_ENV || "development",
    });
});

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
    })
);

app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/docs", swaggerServe, swaggerSetup);

// error handler last
app.use(errorHandler);

export default app;
