import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const getCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT
        o.id,
        o.name AS companyName,
        o.designation,
        o.contact_person AS contactPerson,
        o.phone_no AS phone,
        o.profile_picture AS profilePicture,
        u.username,
        u.email
      FROM organizations o
      JOIN user_organizations uo ON o.id = uo.organization_id
      JOIN users u ON u.id = uo.user_id
      WHERE uo.user_id = ? AND uo.is_primary = TRUE
      LIMIT 1
      `,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Organization not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const uploadedPath = req.file
      ? `/uploads/profile-pictures/${req.file.filename}`
      : null;

    if (!uploadedPath) {
      return res.status(400).json({
        message: "Please upload a profile picture",
      });
    }

    const [orgRows] = await db.query(
      `
      SELECT o.id
      FROM organizations o
      JOIN user_organizations uo ON o.id = uo.organization_id
      WHERE uo.user_id = ? AND uo.is_primary = TRUE
      LIMIT 1
      `,
      [userId]
    );

    if (!orgRows.length) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const orgId = orgRows[0].id;

    await db.query(
      `
      UPDATE organizations
      SET profile_picture = ?
      WHERE id = ?
      `,
      [uploadedPath, orgId]
    );

    const [userRows] = await db.query(
      `
      SELECT username, email
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    return res.json({
      message: "Profile photo updated successfully",
      profilePicture: uploadedPath,
      user: {
        id: userId,
        username: userRows[0]?.username || "",
        email: userRows[0]?.email || "",
        profilePicture: uploadedPath,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error while updating profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      [hashedPassword, userId]
    );

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error while changing password",
    });
  }
};