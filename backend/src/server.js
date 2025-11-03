// backend/src/server.js
import app from "./app.js";          // Import the Express app
import { testConnection } from "./db.js";  // Test database connection
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await testConnection();  // Check Neon (Postgres) connection
        const server = app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });
        return server;
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
