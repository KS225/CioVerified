import express from "express";
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getApplications,
  setPricing,
  cancelApplication
} from "../controllers/applicationController.js";
import { upload } from "../middleware/upload.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { hasPermission, loadPermissions } from "../middleware/hasPermission.js";


// ================= POST ROUTE =================

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  loadPermissions,   // ✅ FIRST load permissions
  hasPermission("view_applications"),
  getApplications
);
// ================= GET ROUTES =================
router.get("/my", authenticateUser, getMyApplications);  // ✅ protected
router.get("/:id", authenticateUser, getApplicationById); // ✅ added auth (important)

router.post(
  "/submit",
  authenticateUser,
  upload.fields([
    { name: "gstDoc" },
    { name: "sezDoc" },
    { name: "companyProfile" },
    { name: "pitchDeck" },
    { name: "certifications" },
     { name: "ipProof", maxCount: 20 }  
  ]),
  submitApplication
);

router.post(
  "/set-pricing",
  authenticateUser,
  hasPermission("set_pricing"),
  setPricing
);

router.post(
  "/cancel/:id",
  authenticateUser,
  cancelApplication
);
export default router;