import express from "express";
import { addBrand, deleteBrand } from "../controllers/brandController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================
   Brand Routes (Admin-only)
============================ */

router.post("/", protect, adminOnly, addBrand);      // Add new brand
router.delete("/", protect, adminOnly, deleteBrand); // Delete brand

export default router;
