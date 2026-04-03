import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOTP } from "../utils/mailer.js";

const SOURCE_MAP = {
  google: "GOOGLE",
  linkedin: "LINKEDIN",
  referral: "REFERRAL",
  advertisement: "ADVERTISEMENT",
  social_media: "SOCIAL_MEDIA",
  other: "OTHER",
};

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, identifier, password } = req.body || {};
    const loginValue = (email || identifier || "").trim().toLowerCase();

    console.log("LOGIN ATTEMPT:", {
      email,
      identifier,
      loginValue,
    });

    const [dbName] = await db.query("SELECT DATABASE() AS db");
    console.log("LOGIN DB:", dbName[0].db);

    const [allEmails] = await db.query("SELECT id, email, username FROM users");
    console.log("ALL USERS IN DB:", allEmails);

    const [users] = await db.query(
      `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.password_hash,
        u.is_verified,
        u.is_active,
        uo.organization_id,
        o.name AS organization_name,
        o.type AS organization_type
      FROM users u
      LEFT JOIN user_organizations uo ON u.id = uo.user_id
      LEFT JOIN organizations o ON uo.organization_id = o.id
      WHERE LOWER(TRIM(u.email)) = ? OR LOWER(TRIM(u.username)) = ?
      LIMIT 1
      `,
      [loginValue, loginValue]
    );

    console.log("USERS FOUND:", users.length);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    if (user.is_active === 0) {
      return res.status(403).json({
        message: "Your account is inactive. Please contact support.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: "APPLICANT",
        organizationId: user.organization_id || null,
        organizationName: user.organization_name || null,
        organizationType: user.organization_type || null,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

/* =========================
   REGISTER USER
   save only user + otp
========================= */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, captchaInput } = req.body || {};

    if (!username || !email || !password || !captchaInput) {
      return res.status(400).json({
        message: "Username, email, password and captcha are required",
      });
    }

    const sessionCaptcha = req.session?.captcha;

    if (!sessionCaptcha) {
      return res.status(400).json({
        message: "Captcha expired. Please refresh and try again.",
      });
    }

    if (captchaInput.trim().toLowerCase() !== sessionCaptcha) {
      return res.status(400).json({
        message: "Invalid captcha entered",
      });
    }

    delete req.session.captcha;

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const [existingByEmail] = await db.query(
      "SELECT id, is_verified, username FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingByEmail.length > 0 && existingByEmail[0].is_verified) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const [existingByUsername] = await db.query(
      "SELECT id, email, is_verified FROM users WHERE username = ?",
      [normalizedUsername]
    );

    if (
      existingByUsername.length > 0 &&
      existingByUsername[0].is_verified &&
      existingByUsername[0].email !== normalizedEmail
    ) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    if (existingByEmail.length > 0) {
      await db.query(
        `UPDATE users
         SET username = ?, password_hash = ?, otp = ?, otp_expiry = ?, is_verified = FALSE
         WHERE email = ?`,
        [
          normalizedUsername,
          hashedPassword,
          otp,
          otpExpiry,
          normalizedEmail,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO users (username, email, password_hash, otp, otp_expiry, is_verified)
         VALUES (?, ?, ?, ?, ?, FALSE)`,
        [
          normalizedUsername,
          normalizedEmail,
          hashedPassword,
          otp,
          otpExpiry,
        ]
      );
    }

    await sendOTP(normalizedEmail, otp, "verify");

    return res.status(200).json({
      message: "OTP sent to your registered email",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Failed to process registration" });
  }
};

/* =========================
   VERIFY OTP + CREATE ORG
========================= */
export const verifyRegistrationOTP = async (req, res) => {
  const conn = await db.getConnection();

  try {
    const {
      email,
      otp,
      organizationName,
      contactPerson,
      designation,
      phone,
      source,
      referralName,
      otherSource,
    } = req.body || {};

    if (!email || !otp || !organizationName || !contactPerson || !source) {
      return res.status(400).json({
        message:
          "Email, OTP, organization name, contact person and source are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const referenceSource = SOURCE_MAP[source];

    if (!referenceSource) {
      return res.status(400).json({ message: "Invalid source selected" });
    }

    const [userRows] = await conn.query(
      "SELECT * FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userRows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE users
       SET is_verified = TRUE, otp = NULL, otp_expiry = NULL
       WHERE id = ?`,
      [user.id]
    );

    const [orgResult] = await conn.query(
      `INSERT INTO organizations
       (name, type, designation, contact_person, phone_no, reference_source, other_source)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        organizationName.trim(),
        "CLIENT",
        designation?.trim() || null,
        contactPerson.trim(),
        phone?.trim() || null,
        referenceSource,
        referenceSource === "OTHER"
          ? otherSource?.trim() || null
          : referenceSource === "REFERRAL"
            ? referralName?.trim() || null
            : null,
      ]
    );

    const orgId = orgResult.insertId;

    await conn.query(
      `INSERT INTO user_organizations (user_id, organization_id)
       VALUES (?, ?)`,
      [user.id, orgId]
    );

    await conn.commit();

    return res.status(200).json({
      message: "Email verified and registration completed successfully",
      userId: user.id,
      organizationId: orgId,
    });
  } catch (error) {
    await conn.rollback();
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  } finally {
    conn.release();
  }
};

/* =========================
   RESEND OTP
========================= */
export const resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await db.query(
      "SELECT id, is_verified FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (users[0].is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      `UPDATE users
       SET otp = ?, otp_expiry = ?
       WHERE email = ?`,
      [otp, otpExpiry, normalizedEmail]
    );

    await sendOTP(normalizedEmail, otp, "verify");

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};