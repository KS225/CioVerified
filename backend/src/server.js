// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { initDatabase, db } from "./config/initDb.js";
// import session from "express-session";
// import authRoutes from "./routes/authRoutes.js";
// import profileRoutes from "./routes/profileRoutes.js";
// import applicationRoutes from "./routes/applicationRoutes.js";
// import captchaRoutes from "./routes/captchaRoutes.js";
// import { verifyMailer } from "./utils/mailer.js";

// dotenv.config({ path: "../.env" });

// const app = express();
// app.set("trust proxy", 1);

// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://cio-verified.vercel.app",
// ];

// const isProduction = process.env.NODE_ENV === "production";

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       return callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use("/uploads", express.static(path.resolve("uploads")));

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "captcha-secret",
//     resave: false,
//     saveUninitialized: true,
//     proxy: isProduction,
//     cookie: {
//       secure: isProduction,
//       httpOnly: true,
//       sameSite: isProduction ? "none" : "lax",
//     },
//   })
// );

// await initDatabase();

// // DB Keep Alive
// setInterval(async () => {
//   try {
//     await db.query("SELECT 1");
//     console.log("🟢 DB keep-alive success");
//   } catch (err) {
//     console.error("🔴 DB keep-alive failed:", err.message);
//   }
// }, 5 * 60 * 1000);

// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// app.get("/health", (req, res) => {
//   res.status(200).json({ status: "OK" });
// });

// app.use("/api/captcha", captchaRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/applications", applicationRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// verifyMailer().catch((error) => {
//   console.error("❌ Mail transporter verification failed:", error.message);
// });
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

await initDatabase();

// DB keep-alive
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