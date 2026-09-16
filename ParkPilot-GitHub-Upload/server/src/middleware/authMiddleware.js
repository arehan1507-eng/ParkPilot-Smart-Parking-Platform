import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const jwtSecret = process.env.JWT_SECRET || "dev-secret-key-change-in-production";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized. Missing token." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission for this action." });
  }

  next();
};
