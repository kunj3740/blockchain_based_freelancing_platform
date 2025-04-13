// middleware/auth.js
import jwt from "jsonwebtoken";

export async function auth(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate" });
  }
}

export function isBuyer(req, res, next) {
  if (req.user.role !== "client") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

export function isFreelancer(req, res, next) {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

export function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}
