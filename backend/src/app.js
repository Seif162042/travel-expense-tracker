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

const app = express();

/* ---------- Security, CORS, parsing, logging ---------- */

// Security headers
app.use(helmet());

// CORS (lock to your frontend in prod via env)
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));

// JSON body limit
app.use(express.json({ limit: "200kb" }));

// Minimal logging (less noisy in prod)
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));

/* ---------- Landing + health ---------- */

// Redirect root to Swagger (nice DX)
app.get("/", (_req, res) => res.redirect("/docs"));

// Top-level health for Render checks
app.get("/health", (_req, res) => {
    res.status(200).json({
        ok: true,
        uptime: process.uptime(),
        env: process.env.NODE_ENV || "development",
    });
});

// Namespaced health (keep if already referenced)
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
});

/* ---------- Rate limiting (apply to write-heavy routes) ---------- */

const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,                 // tune as you like
    standardHeaders: true,
    legacyHeaders: false,
});

// auth and write endpoints
app.use("/api/users", writeLimiter);
app.use("/api/trips", writeLimiter);
app.use("/api/expenses", writeLimiter);

/* ---------- Routes ---------- */

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/docs", swaggerServe, swaggerSetup);

/* ---------- 404 + Error handling ---------- */

// 404 fallback (after all routes)
app.use((req, res) => {
    return res.status(404).json({ error: "Not found" });
});

// Centralized error handler (keep yours last)
app.use(errorHandler);

export default app;
