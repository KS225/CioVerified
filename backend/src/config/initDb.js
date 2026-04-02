import db from "./db.js";

export const initDatabase = async () => {
  try {
    console.log("🔄 Initializing Database...");

// Create DB 
  await db.query("CREATE DATABASE IF NOT EXISTS CIO_VerifiedFinal"); 
  // Use DB 
  await db.query("USE CIO_VerifiedFinal");

    // Create table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
      
    await db.query(`CREATE TABLE IF NOT EXISTS organizations (
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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    // Insert data
    await db.query(`
      INSERT IGNORE INTO users (id, email, password_hash) VALUES
      (1, 'superadmin@cioverified.com', 'hash1'),
      (2, 'auditor1@auditfirm.com', 'hash2'),
      (3, 'reviewer1@cioverified.com', 'hash3'),
      (4, 'clientuser@company.com', 'hash4')
      ON DUPLICATE KEY UPDATE email = VALUES(email)
    `);


    // ✅ MAPPING TABLE
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