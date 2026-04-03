// import mysql from "mysql2";
// import dotenv from "dotenv";

// dotenv.config({ path: "../.env" }); // keep this

// const db = mysql.createPool({
//   host: process.env.DB_HOST?.trim(),
//   port: Number(process.env.DB_PORT), // ✅ IMPORTANT
//   user: process.env.DB_USER?.trim(),
//   password: process.env.DB_PASSWORD?.trim(),
//   database: process.env.DB_NAME?.trim(),

//   waitForConnections: true,
//   connectionLimit: 10,

//   ssl: {
//     rejectUnauthorized: false, // ✅ REQUIRED for Aiven
//   },
// });

// // Better debug log
// console.log("DB CONFIG:", {
//   host: process.env.DB_HOST?.trim(),
//   user: process.env.DB_USER?.trim(),
//   password: process.env.DB_PASSWORD ? "<redacted>" : undefined,
//   database: process.env.DB_NAME?.trim(),
//   port: process.env.DB_PORT,
// });

// export default db.promise();
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST?.trim(),
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD?.trim(),
  database: process.env.DB_NAME?.trim(),
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("DB CONFIG:", {
  host: process.env.DB_HOST?.trim(),
  user: process.env.DB_USER?.trim(),
  password: process.env.DB_PASSWORD ? "<redacted>" : undefined,
  database: process.env.DB_NAME?.trim(),
  port: process.env.DB_PORT,
});

export default db.promise();