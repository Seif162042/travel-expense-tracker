import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: fileURLToPath(new URL("../.env.test", import.meta.url)), override: true });

const url = process.env.DATABASE_URL ?? "";
let host = "";
try {
    host = new URL(url).hostname;
} catch {
    host = "";
}

if (!["localhost", "127.0.0.1"].includes(host) || !url.includes("test")) {
    throw new Error("Refusing to run tests: DATABASE_URL must be a local test database (set it in .env.test)");
}
