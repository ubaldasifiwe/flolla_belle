import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { seedCategories, seedProducts } from "./seedCatalog.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const envPath of [
  path.join(__dirname, "../.env"),
  path.join(__dirname, "../src/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}
if (!process.env.DB_NAME) dotenv.config();

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "floral_shop",
    multipleStatements: true,
  });

  try {
    await connection.beginTransaction();

    // Clear old data so re-seeding is clean and deterministic
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("TRUNCATE TABLE order_items");
    await connection.query("TRUNCATE TABLE orders");
    await connection.query("TRUNCATE TABLE product_sizes");
    await connection.query("TRUNCATE TABLE product_images");
    await connection.query("TRUNCATE TABLE products");
    await connection.query("TRUNCATE TABLE categories");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Insert categories and keep map from frontend category id -> db numeric id
    const categoryMap = new Map<string, number>();

    for (const cat of seedCategories) {
      const [result] = await connection.query<mysql.ResultSetHeader>(
        `
        INSERT INTO categories (slug, name, image_url, emoji)
        VALUES (?, ?, ?, ?)
        `,
        [cat.id, cat.name, cat.image, cat.emoji || "🌸"]
      );
      categoryMap.set(cat.id, result.insertId);
    }

    // Insert products + images + sizes
    for (const p of seedProducts) {
      const categoryId = categoryMap.get(p.category);
      if (!categoryId) {
        throw new Error(`Category not found for product: ${p.name}`);
      }

      const [productResult] = await connection.query<mysql.ResultSetHeader>(
        `
        INSERT INTO products (
          category_id, name, slug, base_price, original_price, flower_type,
          rating, review_count, in_stock, badge, short_description, description, main_image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          categoryId,
          p.name,
          slugify(p.name),
          p.price,
          p.originalPrice ?? null,
          p.flowerType,
          p.rating ?? 0,
          p.reviewCount ?? 0,
          p.inStock ? 1 : 0,
          p.badge ?? null,
          p.shortDescription ?? null,
          p.description ?? null,
          p.image ?? null,
        ]
      );

      const productId = productResult.insertId;

      // product images
      for (let i = 0; i < p.images.length; i++) {
        await connection.query(
          `
          INSERT INTO product_images (product_id, image_url, position)
          VALUES (?, ?, ?)
          `,
          [productId, p.images[i], i]
        );
      }

      // product sizes
      for (const s of p.sizes) {
        await connection.query(
          `
          INSERT INTO product_sizes (product_id, label, price)
          VALUES (?, ?, ?)
          `,
          [productId, s.label, s.price]
        );
      }
    }

    await connection.commit();
    console.log("Seeding completed successfully.");
    console.log(`Inserted categories: ${seedCategories.length}`);
    console.log(`Inserted products: ${seedProducts.length}`);
  } catch (error) {
    await connection.rollback();
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

seed();