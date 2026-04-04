import express from "express";
import svgCaptcha from "svg-captcha";

const router = express.Router();

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

  req.session.captcha = captcha.text;
  req.session.captchaExpiresAt = Date.now() + 2 * 60 * 1000;

  req.session.save((err) => {
    if (err) {
      console.error("❌ Session save error:", err);
      return res.status(500).json({
        message: "Failed to generate captcha session",
      });
    }

    return res.status(200).json({
      captcha: captcha.data,
      expiresIn: 120,
      message: "Enter the characters exactly as shown",
    });
  });
});

export default router;