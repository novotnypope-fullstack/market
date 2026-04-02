import { Router } from "express";
import db from "#db/client";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

const router = Router();

router.post("/", requireUser, requireBody("date"), async (req, res, next) => {
  try {
    const { date, note } = req.body;
    const result = await db.query(
      "INSERT INTO orders (date, note, user_id) VALUES ($1, $2, $3) RETURNING *",
      [date, note || null, req.user.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/", requireUser, async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM orders WHERE user_id = $1", [
      req.user.id,
    ]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireUser, async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM orders WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/products",
  requireUser,
  requireBody("productId", "quantity"),
  async (req, res, next) => {
    try {
      const order = await db.query("SELECT * FROM orders WHERE id = $1", [
        req.params.id,
      ]);

      if (order.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.rows[0].user_id !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { productId, quantity } = req.body;

      const product = await db.query("SELECT * FROM products WHERE id = $1", [
        productId,
      ]);
      if (product.rows.length === 0) {
        return res.status(400).json({ error: "Product not found" });
      }

      const result = await db.query(
        "INSERT INTO orders_products (order_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [req.params.id, productId, quantity],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id/products", requireUser, async (req, res, next) => {
  try {
    const order = await db.query("SELECT * FROM orders WHERE id = $1", [
      req.params.id,
    ]);

    if (order.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await db.query(
      "SELECT p.* FROM products p JOIN orders_products op ON p.id = op.product_id WHERE op.order_id = $1",
      [req.params.id],
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
