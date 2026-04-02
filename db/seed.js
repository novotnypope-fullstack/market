import db from "#db/client";
import bcrypt from "bcrypt";

const products = [
  { title: "Laptop", description: "High performance laptop", price: 999.99 },
  { title: "Mouse", description: "Wireless mouse", price: 29.99 },
  { title: "Keyboard", description: "Mechanical keyboard", price: 79.99 },
  { title: "Monitor", description: "4K monitor", price: 399.99 },
  { title: "Headphones", description: "Noise cancelling", price: 199.99 },
  { title: "USB Cable", description: "USB-C cable", price: 9.99 },
  { title: "SSD", description: "1TB SSD", price: 99.99 },
  { title: "RAM", description: "16GB RAM", price: 79.99 },
  { title: "Power Bank", description: "20000mAh", price: 49.99 },
  { title: "Webcam", description: "1080p webcam", price: 59.99 },
];

async function seed() {
  await db.connect();
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const userResult = await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      ["alice", hashedPassword],
    );
    const userId = userResult.rows[0].id;

    for (const product of products) {
      await db.query(
        "INSERT INTO products (title, description, price) VALUES ($1, $2, $3)",
        [product.title, product.description, product.price],
      );
    }

    const orderResult = await db.query(
      "INSERT INTO orders (date, user_id) VALUES ($1, $2) RETURNING id",
      [new Date().toISOString().split("T")[0], userId],
    );
    const orderId = orderResult.rows[0].id;

    for (let i = 1; i <= 5; i++) {
      await db.query(
        "INSERT INTO orders_products (order_id, product_id, quantity) VALUES ($1, $2, $3)",
        [orderId, i, Math.floor(Math.random() * 3) + 1],
      );
    }

    console.log("🌱 Database seeded.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await db.end();
  }
}

await seed();
