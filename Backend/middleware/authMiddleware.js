import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

/* ============================
   🔒 Protect Routes (User/Admin)
============================ */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if it's a user or admin
      const user = await User.findById(decoded.id).select("-password");
      const admin = await Admin.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
      } else if (admin) {
        req.admin = admin;
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Account not found" });
      }

      next();
    } catch (error) {
      console.error("❌ Token verification error:", error.message);
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  } else {
    console.log("❌ No authorization header provided");
    return res
      .status(401)
      .json({ success: false, message: "No token, not authorized" });
  }
};

/* ============================
   🛡️ Admin-only Access
============================ */
export const adminOnly = (req, res, next) => {
  if (req.admin) {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Admin access only" });
  }
};
