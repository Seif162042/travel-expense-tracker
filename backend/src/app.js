// backend/src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import expenseRoutes from "./routes/expensesRoutes.js";



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
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/expenses", expenseRoutes);




export default app;
