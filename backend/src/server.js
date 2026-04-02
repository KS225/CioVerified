import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./config/initDB.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ✅ FIX CORS ISSUE
app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());

// ✅ RUN DB INIT
await initDatabase();

// ✅ ROUTES
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});