import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initDatabase, db } from "./config/initDb.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import captchaRoutes from "./routes/captchaRoutes.js";
import { verifyMailer } from "./utils/mailer.js";

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://cio-verified.vercel.app",
];

const allowedOriginPatterns = [
  /^https:\/\/cio-verified-[a-z0-9-]+-ks225s-projects\.vercel\.app$/,
  /^https:\/\/cio-verified-[a-z0-9-]+\.vercel\.app$/,
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
};

app.use(
  cors({
    origin(origin, callback) {
      console.log("🌍 Incoming origin:", origin);

      if (isAllowedOrigin(origin)) {
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

/* =========================
   DB INIT
========================= */
await initDatabase();

/* =========================
   DB KEEP ALIVE
========================= */
setInterval(async () => {
  try {
    await db.query("SELECT 1");
    console.log("🟢 DB keep-alive success");
  } catch (err) {
    console.error("🔴 DB keep-alive failed:", err.message);
  }
}, 5 * 60 * 1000);

/* =========================
   ROUTES
========================= */
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

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* =========================
   MAILER VERIFY
========================= */
verifyMailer().catch((error) => {
  console.error("❌ Mail transporter verification failed:", error.message);
});