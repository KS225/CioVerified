import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDatabase } from "./config/initDb.js";
import authRoutes from "./routes/authRoutes.js";
import { verifyMailer } from "./utils/mailer.js";

dotenv.config({ path: "../.env" });

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cio-verified.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

await initDatabase();
await verifyMailer();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});