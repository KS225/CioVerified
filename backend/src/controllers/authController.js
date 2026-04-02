import db from "../config/db.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const {
      organizationName,
      contactPerson,
      designation,
      email,
      phone,
      source,
      referralName,
      otherSource,
      password,
    } = req.body;

    // ✅ Validate
    if (!organizationName || !contactPerson || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Convert source
    const sourceMap = {
      google: "GOOGLE",
      linkedin: "LINKEDIN",
      referral: "REFERRAL",
      advertisement: "ADVERTISEMENT",
      social_media: "SOCIAL_MEDIA",
      other: "OTHER",
    };

    const referenceSource = sourceMap[source];

    // ✅ Check existing user
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user
    const [userResult] = await db.query(
      "INSERT INTO users (email, password_hash) VALUES (?, ?)",
      [email, hashedPassword]
    );

    const userId = userResult.insertId;

    // ✅ Check if organization exists
    const [existingOrg] = await db.query(
      "SELECT id FROM organizations WHERE name = ?",
      [organizationName]
    );

    let orgId;

    if (existingOrg.length > 0) {
      orgId = existingOrg[0].id;
    } else {
      // ✅ Create new org
      const [orgResult] = await db.query(
        `INSERT INTO organizations 
        (name, type, designation, contact_person, phone_no, reference_source, other_source)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          organizationName,
          "CLIENT",
          designation || null,
          contactPerson || null,
          phone || null,
          referenceSource,
          referenceSource === "OTHER"
            ? otherSource
            : referenceSource === "REFERRAL"
            ? referralName
            : null,
        ]
      );

      orgId = orgResult.insertId;
    }

    // ✅ Insert mapping
    await db.query(
      `INSERT INTO user_organizations (user_id, organization_id, is_primary)
       VALUES (?, ?, ?)`,
      [userId, orgId, true]
    );

    return res.status(201).json({
      message: "Registration successful",
      userId,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};