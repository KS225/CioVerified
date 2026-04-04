import express from "express";
import svgCaptcha from "svg-captcha";
import crypto from "crypto";

const router = express.Router();

// In-memory captcha store
// key: captchaId
// value: { text, expiresAt }
const captchaStore = new Map();

// Cleanup expired captchas every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of captchaStore.entries()) {
    if (value.expiresAt <= now) {
      captchaStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

router.get("/", (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 2,
    color: true,
    background: "#f8fafc",
    ignoreChars: "0oO1iIl",
    width: 180,
    height: 60,
    fontSize: 50,
  });

  const captchaId = crypto.randomUUID();
  const expiresAt = Date.now() + 2 * 60 * 1000;

  captchaStore.set(captchaId, {
    text: captcha.text,
    expiresAt,
  });

  return res.status(200).json({
    captcha: captcha.data,
    captchaId,
    expiresIn: 120,
    message: "Enter the characters exactly as shown",
  });
});

export const getCaptchaStore = () => captchaStore;

export default router;