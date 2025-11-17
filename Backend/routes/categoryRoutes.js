import express from "express";
import {
  getProductCategories,
  addCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   Category Routes
============================ */

// Public route: get all categories & brands
router.get("/", getProductCategories);

// Admin-only routes
router.post("/", protect, adminOnly, addCategory);      // Add new category
router.delete("/", protect, adminOnly, deleteCategory); // Delete category

export default router;
