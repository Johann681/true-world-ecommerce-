import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
} from "../controllers/orderController.js"

const router = express.Router();

// ✅ User creates an order (after checkout)
router.post("/", protect, createOrder);

// ✅ User gets their own orders
router.get("/my-orders", protect, getUserOrders);

// ✅ Admin gets all orders
router.get("/all", protect, adminOnly, getAllOrders);

export default router;
