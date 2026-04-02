import db from "../config/db.js";
import bcrypt from "bcryptjs";

/* =========================
   CREATE USER (UPDATED 🔥)
========================= */
export const createUser = async (req, res) => {
  try {
    const { username, auth_groups } = req.body;

    // ✅ Validate auth groups
    if (!Array.isArray(auth_groups) || auth_groups.length === 0) {
      return res.status(400).json({
        message: "Select at least one auth group",
      });
    }

    // 🔐 Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ Handle auto username
    let finalUsername = username;
    if (!finalUsername) {
      const random = Math.floor(1000 + Math.random() * 9000);
      finalUsername = `user_${random}`;
    }

    // 🔹 Insert user (email is nullable now ✅)
    const [result] = await db.query(
      `INSERT INTO users 
      (username, email, password, role, is_verified, is_temp_password, is_active)
      VALUES (?, ?, ?, 'ADMIN', false, true, true)`,
      [finalUsername, null, hashedPassword]
    );

    const userId = result.insertId;

    // ❗ FIX: MySQL IN clause
    const placeholders = auth_groups.map(() => "?").join(",");

    const [groups] = await db.query(
      `SELECT id FROM auth_groups WHERE name IN (${placeholders})`,
      auth_groups
    );

    if (groups.length !== auth_groups.length) {
      return res.status(400).json({
        message: "Invalid auth groups selected",
      });
    }

    // ❗ FIX: Safe insert instead of bulk
    for (const g of groups) {
      await db.query(
        `INSERT INTO user_auth_groups (user_id, group_id) VALUES (?, ?)`,
        [userId, g.id]
      );
    }

    return res.status(201).json({
      username: finalUsername,
      tempPassword,
    });

  } catch (err) {
    console.error("🔥 Create User Error:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
/* =========================
   GET USERS (UPDATED 🔥)
========================= */
export const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.username,
        u.role,
        u.is_active,
        u.email,
        i.full_name,
        GROUP_CONCAT(ag.name) AS auth_groups

      FROM users u

      LEFT JOIN internal_users i 
        ON u.id = i.user_id

      LEFT JOIN user_auth_groups uag 
        ON u.id = uag.user_id

      LEFT JOIN auth_groups ag 
        ON uag.group_id = ag.id

      WHERE u.role = 'ADMIN'

      GROUP BY u.id
    `);

    res.json(users);

  } catch (err) {
    console.error("Get Users Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET AUTH GROUPS (NEW 🔥)
========================= */
export const getAuthGroups = async (req, res) => {
  try {
    const [groups] = await db.query(
      "SELECT id, name, description FROM auth_groups"
    );

    res.json(groups);
  } catch (err) {
    console.error("Get Auth Groups Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   DEACTIVATE USER
========================= */
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.id;

    if (parseInt(id) === loggedInUserId) {
      return res.status(400).json({
        message: "You cannot deactivate your own account",
      });
    }

    await db.query(
      "UPDATE users SET is_active = false WHERE id = ?",
      [id]
    );

    res.json({ message: "User deactivated" });

  } catch (err) {
    console.error("Deactivate Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ACTIVATE USER
========================= */
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.id;

    if (parseInt(id) === loggedInUserId) {
      return res.status(400).json({
        message: "Invalid action",
      });
    }

    await db.query(
      "UPDATE users SET is_active = true WHERE id = ?",
      [id]
    );

    res.json({ message: "User activated" });

  } catch (err) {
    console.error("Activate Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.id;

    if (parseInt(id) === loggedInUserId) {
      return res.status(400).json({
        message: "Use profile settings to reset your password",
      });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(tempPassword, 10);

    await db.query(
      "UPDATE users SET password=?, is_temp_password=true WHERE id=?",
      [hashed, id]
    );

    res.json({ tempPassword });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const getUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const [permissions] = await db.query(`
      SELECT 
        p.id,
        p.name,
        CASE 
          WHEN up.is_revoked = TRUE THEN 1
          ELSE 0
        END AS is_revoked

      FROM user_auth_groups uag

      JOIN auth_group_permissions agp 
        ON uag.group_id = agp.group_id

      JOIN permissions p 
        ON agp.permission_id = p.id

      LEFT JOIN user_permissions up 
        ON up.user_id = uag.user_id 
        AND up.permission_id = p.id

      WHERE uag.user_id = ?
    `, [id]);

    res.json(permissions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching permissions" });
  }
};

export const updateUserPermission = async (req, res) => {
  try {
    const { userId, permissionId, is_revoked } = req.body;

    // 🔹 Check if exists
    const [existing] = await db.query(
      `SELECT * FROM user_permissions 
       WHERE user_id=? AND permission_id=?`,
      [userId, permissionId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE user_permissions 
         SET is_revoked=? 
         WHERE user_id=? AND permission_id=?`,
        [is_revoked, userId, permissionId]
      );
    } else {
      await db.query(
        `INSERT INTO user_permissions 
         (user_id, permission_id, is_revoked)
         VALUES (?, ?, ?)`,
        [userId, permissionId, is_revoked]
      );
    }

    res.json({ message: "Permission updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating permission" });
  }
};
/* =========================
   DASHBOARD STATS
========================= */
export const getDashboardStats = async (req, res) => {
  try {
    const [total] = await db.query(
      "SELECT COUNT(*) as count FROM applications"
    );

    const [pending] = await db.query(
      "SELECT COUNT(*) as count FROM applications WHERE status = 'PENDING'"
    );

    const [paymentPending] = await db.query(
      "SELECT COUNT(*) as count FROM applications WHERE status = 'PAYMENT_PENDING'"
    );

    const [completed] = await db.query(
      "SELECT COUNT(*) as count FROM applications WHERE status = 'COMPLETED'"
    );

    res.json({
      total: total[0].count,
      pending: pending[0].count,
      paymentPending: paymentPending[0].count,
      completed: completed[0].count,
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   Get ALL PENDING ASSESSORS
=============================== */

export const getPendingAuditors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT ap.*, ai.email
      FROM assessor_profiles_temp ap
      JOIN assessor_invitations ai ON ap.invitation_id = ai.id
      WHERE ai.status = 'FILLED'
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching auditors" });
  }
};

/* =========================
VERIFY AUDITOR
========================= */
export const verifyAuditor = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const { id } = req.params;

    await conn.beginTransaction();

    // 🔥 FIX: JOIN to get email
    const [rows] = await conn.query(`
      SELECT ap.*, ai.email
      FROM assessor_profiles_temp ap
      JOIN assessor_invitations ai 
        ON ap.invitation_id = ai.id
      WHERE ap.id = ?
    `, [id]);

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Auditor not found" });
    }

    const auditor = rows[0];

    // 🔐 Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ❌ Check duplicate
    const [existingUser] = await conn.query(
      "SELECT id FROM users WHERE email = ?",
      [auditor.email]
    );

    if (existingUser.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // ✅ Create user
    const [result] = await conn.query(
      `INSERT INTO users 
       (username, email, password, role, is_verified, is_temp_password, is_active)
       VALUES (?, ?, ?, 'AUDITOR', ?, ?, ?)`,
      [
        auditor.email,
        auditor.email,
        hashedPassword,
        true,
        true,
        true,
      ]
    );

    const userId = result.insertId;

    // ✅ Insert final table
    await conn.query(
      `INSERT INTO auditor_profiles (
        user_id,
        type,
        full_name,
        email,
        phone,
        experience_years,
        resume,
        company_name,
        gstin,
        years_in_operation,
        company_profile,
        specialization,
        address,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`,
      [
        userId,
        auditor.type ? auditor.type.toUpperCase() : "INDIVIDUAL",
        auditor.full_name,
        auditor.email,
        auditor.phone,
        auditor.experience_years,
        auditor.resume,
        auditor.company_name,
        auditor.gstin,
        auditor.years_in_operation,
        auditor.company_profile,
        auditor.specialization,
        auditor.address,
      ]
    );

    // ✅ Update temp
    await conn.query(
      `UPDATE assessor_profiles_temp 
       SET status = 'SUPERADMIN_APPROVED' 
       WHERE id = ?`,
      [id]
    );

    // ✅ Update invitation
    await conn.query(
      `UPDATE assessor_invitations 
       SET status = 'SUPERADMIN_APPROVED' 
       WHERE id = ?`,
      [auditor.invitation_id]
    );

    await conn.commit();

    res.json({
      message: "Auditor verified ✅",
      credentials: {
        email: auditor.email,   // ✅ NOW WORKS
        password: tempPassword,
      },
    });

  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  } finally {
    conn.release();
  }
};