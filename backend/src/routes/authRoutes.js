import express from "express";
import {
  registerUser,
  verifyRegistrationOTP,
  resendRegistrationOTP,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-registration-otp", verifyRegistrationOTP);
router.post("/resend-registration-otp", resendRegistrationOTP);

export default router;