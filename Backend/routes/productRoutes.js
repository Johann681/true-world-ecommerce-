import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {protect, adminOnly } from "../middleware/authMiddleware.js"; // your admin auth middleware

const router = express.Router();

/* ============================
   Product Routes
============================ */

// Public routes
router.get("/", getAllProducts);          // Get all products
router.get("/:id", getProductById);       // Get single product
// Admin-only routes
router.post("/", protect, adminOnly, addProduct);        // Add product
router.put("/:id", protect, adminOnly, updateProduct);  // Update product
router.delete("/:id", protect, adminOnly, deleteProduct); // Delete product

export default router;
