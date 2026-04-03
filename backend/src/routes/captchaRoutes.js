import express from "express";
import svgCaptcha from "svg-captcha";

const router = express.Router();

router.get("/", (req, res) => {
  const captcha = svgCaptcha.create({
    size: 5,
    noise: 3,
    color: true,
    background: "#f4f6f8",
    ignoreChars: "0oO1iIl",
  });

  req.session.captcha = captcha.text.toLowerCase();

  res.status(200).json({
    captcha: captcha.data,
  });
});

export default router;