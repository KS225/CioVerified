import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: "../.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

try {
  await transporter.verify();
  console.log("Mail transporter verified");

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "OTP test",
    text: "This is a test email",
  });

  console.log("Email sent:", info.response);
} catch (error) {
  console.error("Mail error:", error);
}