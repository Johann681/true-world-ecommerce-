import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
} from "../controllers/orderController.js";

const router = express.Router();

// 🔹 User routes
router.post("/", protect, createOrder); // User creates order
router.get("/my-orders", protect, getUserOrders); // User views own orders

// 🔹 Admin routes
router.get("/all", protect, adminOnly, getAllOrders); // Admin views all orders

export default router;
