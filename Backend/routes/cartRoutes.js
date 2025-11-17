import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cartController.js";

const router = express.Router();

// Get current user cart
router.get("/", protect, getCart);

// Add item to cart
router.post("/", protect, addToCart);

// Remove item from cart
router.delete("/:productId", protect, removeFromCart);

// Clear entire cart
router.delete("/clear", protect, clearCart);

export default router;
