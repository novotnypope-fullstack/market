import db from "#db/client";
import { verifyToken } from "#utils/jwt";

/** Attaches the user to the request if a valid token is provided */
export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];
  try {
    const { id } = verifyToken(token);
    const {
      rows: [user],
    } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send("Invalid token.");
  }
}
