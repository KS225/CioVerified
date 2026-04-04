import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { initDatabase } from "./config/initDb.js";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import captchaRoutes from "./routes/captchaRoutes.js";
import { verifyMailer } from "./utils/mailer.js";

dotenv.config({ path: "../.env" });

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://cio-verified.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve("uploads")));

/* session should come before routes */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "captcha-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // keep false for localhost
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

await initDatabase();

app.get("/", (req, res) => {
  res.send("Backend is running");
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