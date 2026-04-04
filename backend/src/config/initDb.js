// import db from "./db.js";

// export const initDatabase = async () => {
//   try {
//     console.log("🔄 Initializing Database...");

//     const [dbCheck] = await db.query("SELECT DATABASE() AS db");
//     console.log("CONNECTED DB:", dbCheck[0].db);

//     await db.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id BIGINT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(100) UNIQUE NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         otp VARCHAR(10) DEFAULT NULL,
//         otp_expiry DATETIME DEFAULT NULL,
//         is_verified BOOLEAN DEFAULT FALSE,
//         is_active BOOLEAN DEFAULT TRUE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await db.query(`
//       CREATE TABLE IF NOT EXISTS organizations (
//         id BIGINT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         type ENUM('INTERNAL','CLIENT','AUDITOR') NOT NULL,
//         designation VARCHAR(255) DEFAULT NULL,
//         contact_person VARCHAR(255) DEFAULT NULL,
//         phone_no VARCHAR(15) DEFAULT NULL,
//         reference_source ENUM(
//           'GOOGLE',
//           'LINKEDIN',
//           'REFERRAL',
//           'ADVERTISEMENT',
//           'SOCIAL_MEDIA',
//           'OTHER'
//         ) DEFAULT NULL,
//         other_source VARCHAR(255) DEFAULT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await db.query(`
//       CREATE TABLE IF NOT EXISTS user_organizations (
//         id BIGINT AUTO_INCREMENT PRIMARY KEY,
//         user_id BIGINT NOT NULL,
//         organization_id BIGINT NOT NULL,
//         is_primary BOOLEAN DEFAULT TRUE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
//         UNIQUE KEY unique_user_org (user_id, organization_id)
//       )
//     `);

//     await db.query(`
//       INSERT IGNORE INTO users (id, username, email, password_hash, is_verified) VALUES
//       (1, 'superadmin', 'superadmin@cioverified.com', 'hash1', TRUE),
//       (2, 'auditor1', 'auditor1@auditfirm.com', 'hash2', TRUE),
//       (3, 'reviewer1', 'reviewer1@cioverified.com', 'hash3', TRUE),
//       (4, 'clientuser', 'clientuser@company.com', 'hash4', TRUE)
//     `);

//     console.log("✅ Database initialized successfully!");
//   } catch (error) {
//     console.error("❌ Error initializing database:", error);
//   }
// };
// import db from "./db.js";

// export const initDatabase = async () => {
//   try {
//     console.log("🔄 Initializing Database...");

//     const [dbCheck] = await db.query("SELECT DATABASE() AS db");
//     console.log("CONNECTED DB:", dbCheck[0].db);

//     await db.query(`
//       CREATE TABLE IF NOT EXISTS users (
//         id BIGINT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(100) UNIQUE NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password_hash VARCHAR(255) NOT NULL,
//         otp VARCHAR(10) DEFAULT NULL,
//         otp_expiry DATETIME DEFAULT NULL,
//         is_verified BOOLEAN DEFAULT FALSE,
//         is_active BOOLEAN DEFAULT TRUE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await db.query(`
//       CREATE TABLE IF NOT EXISTS organizations (
//         id BIGINT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         type ENUM('INTERNAL','CLIENT','AUDITOR') NOT NULL,
//         designation VARCHAR(255) DEFAULT NULL,
//         contact_person VARCHAR(255) DEFAULT NULL,
//         phone_no VARCHAR(15) DEFAULT NULL,
//         reference_source ENUM(
//           'GOOGLE',
//           'LINKEDIN',
//           'REFERRAL',
//           'ADVERTISEMENT',
//           'SOCIAL_MEDIA',
//           'OTHER'
//         ) DEFAULT NULL,
//         other_source VARCHAR(255) DEFAULT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);

//     await db.query(`
//       CREATE TABLE IF NOT EXISTS user_organizations (
//         id BIGINT AUTO_INCREMENT PRIMARY KEY,
//         user_id BIGINT NOT NULL,
//         organization_id BIGINT NOT NULL,
//         is_primary BOOLEAN DEFAULT TRUE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//         FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
//         UNIQUE KEY unique_user_org (user_id, organization_id)
//       )
//     `);

//     await db.query(`
//       INSERT IGNORE INTO users (id, username, email, password_hash, is_verified) VALUES
//       (1, 'superadmin', 'superadmin@cioverified.com', 'hash1', TRUE),
//       (2, 'auditor1', 'auditor1@auditfirm.com', 'hash2', TRUE),
//       (3, 'reviewer1', 'reviewer1@cioverified.com', 'hash3', TRUE),
//       (4, 'clientuser', 'clientuser@company.com', 'hash4', TRUE)
//     `);

//     console.log("✅ Database initialized successfully!");
//   } catch (error) {
//     console.error("❌ Error initializing database:", error);
//   }
// };

import db from "./db.js";

export const initDatabase = async () => {
  try {
    console.log("🔄 Initializing Database...");

    const [dbCheck] = await db.query("SELECT DATABASE() AS db");
    console.log("CONNECTED DB:", dbCheck[0].db);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        otp VARCHAR(10) DEFAULT NULL,
        otp_expiry DATETIME DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('INTERNAL','CLIENT','AUDITOR') NOT NULL,
        designation VARCHAR(255) DEFAULT NULL,
        contact_person VARCHAR(255) DEFAULT NULL,
        phone_no VARCHAR(15) DEFAULT NULL,
        reference_source ENUM(
          'GOOGLE',
          'LINKEDIN',
          'REFERRAL',
          'ADVERTISEMENT',
          'SOCIAL_MEDIA',
          'OTHER'
        ) DEFAULT NULL,
        other_source VARCHAR(255) DEFAULT NULL,
        profile_picture VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_organizations (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        organization_id BIGINT NOT NULL,
        is_primary BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_org (user_id, organization_id)
      )
    `);

    console.log("✅ Database initialized successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

export { db };