// backend/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ===== Health Check Route =====
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "travel-expense-tracker",
        time: new Date().toISOString(),
    });
});


export default app;
