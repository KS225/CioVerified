import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import dns from "dns";
import { initDatabase, db } from "./config/initDb.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import captchaRoutes from "./routes/captchaRoutes.js";
import { verifyMailer } from "./utils/mailer.js";

dotenv.config();
dns.setDefaultResultOrder("ipv4first");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cio-verified.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🌍 Incoming origin:", origin);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve("uploads")));

await initDatabase();

setInterval(async () => {
  try {
    await db.query("SELECT 1");
    console.log("🟢 DB keep-alive success");
  } catch (err) {
    console.error("🔴 DB keep-alive failed:", err.message);
  }
}, 5 * 60 * 1000);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/captcha", captchaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/applications", applicationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

verifyMailer().catch((error) => {
  console.error("❌ Mail transporter verification failed:", error.message);
});