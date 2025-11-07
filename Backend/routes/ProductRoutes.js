import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductCategories,
} from "../controllers/ProductController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   🏷️ CATEGORY ROUTE (Public)
=============================== */
router.get("/categories", getProductCategories);

/* ===============================
   📦 PUBLIC PRODUCT ROUTES
=============================== */
router.get("/", getAllProducts);
router.get("/:id", getProductById);

/* ===============================
   🔐 ADMIN-ONLY ROUTES
=============================== */
router.post("/", protect, adminOnly, addProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
