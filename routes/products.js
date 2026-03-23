import { Router } from "express";
import db from "#db/client";
import { requireUser } from "#middleware/requireUser";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/orders", requireUser, async (req, res, next) => {
  try {
    const product = await db.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const result = await db.query(
      "SELECT DISTINCT o.* FROM orders o JOIN orders_products op ON o.id = op.order_id WHERE op.product_id = $1 AND o.user_id = $2",
      [req.params.id, req.user.id]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
