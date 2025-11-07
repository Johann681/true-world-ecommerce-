import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToCart,
  removeFromCart,
  getUserCart,
  checkout,
} from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.post("/remove", protect, removeFromCart);
router.get("/", protect, getUserCart);
router.post("/checkout", protect, checkout);

export default router;
