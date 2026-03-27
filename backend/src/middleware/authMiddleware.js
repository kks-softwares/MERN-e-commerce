import jwt from "jsonwebtoken";

import User from "../models/User.js";

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    return next(new Error("Not authorized, token missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      return next(new Error("User not found for this token"));
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error("Not authorized, token invalid"));
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }

  next();
};

export { protect, adminOnly };
