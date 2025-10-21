// backend/src/server.js
import app from "./app.js";
import { testConnection } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    await testConnection(); // check Neon connection
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
