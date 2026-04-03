import express from "express";
import {
  registerUser,
  verifyRegistrationOTP,
  resendRegistrationOTP,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // ✅ IMPORTANT
router.post("/verify-registration-otp", verifyRegistrationOTP);
router.post("/resend-registration-otp", resendRegistrationOTP);

export default router;