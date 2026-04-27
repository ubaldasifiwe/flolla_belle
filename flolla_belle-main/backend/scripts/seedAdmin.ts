import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs"
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const envPath of [
  path.join(__dirname, "../.env"),
  path.join(__dirname, "../src/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}
if (!process.env.DB_NAME) dotenv.config();

const ADMIN_EMAIL = "admin@florabelle.rw";
const ADMIN_PASSWORD = "florabelle2025";

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "floral_shop",
    multipleStatements: true,
  });

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_admin_users_email (email)
      )
    `);

    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await connection.query(
      `
      INSERT INTO admin_users (email, password_hash)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
      `,
      [ADMIN_EMAIL, password_hash]
    );

    console.log(`Admin user ensured: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("seedAdmin failed:", error);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

seedAdmin();
