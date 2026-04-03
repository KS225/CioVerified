import express from "express";
import {
  getCompanyProfile,
  updateCompanyProfile,
  changePassword,
} from "../controllers/profileController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import uploadProfilePicture from "../middleware/uploadProfilePicture.js";

const router = express.Router();

router.get("/", authenticateUser, getCompanyProfile);

router.put(
  "/company",
  authenticateUser,
  uploadProfilePicture.single("profilePicture"),
  updateCompanyProfile
);

router.put("/change-password", authenticateUser, changePassword);

export default router;