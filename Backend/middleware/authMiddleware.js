import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// 🔒 Protect route for both user and admin
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try finding user or admin
      const user = await User.findById(decoded.id).select("-password");
      const admin = await Admin.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
      } else if (admin) {
        req.admin = admin;
      } else {
        return res.status(401).json({ message: "Not authorized, no account found" });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, not authorized" });
  }
};

// 🛡️ Admin-only access
export const adminOnly = (req, res, next) => {
  if (req.admin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
