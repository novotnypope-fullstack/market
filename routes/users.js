import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "#db/client";
import requireBody from "#middleware/requireBody";

const router = Router();

router.post(
  "/register",
  requireBody("username", "password"),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
        [username, hashedPassword],
      );

      const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET);
      res.status(201).send(token);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/login",
  requireBody("username", "password"),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);

      if (result.rows.length === 0) {
        return res.status(401).send("Invalid credentials");
      }

      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).send("Invalid credentials");
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.send(token);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
