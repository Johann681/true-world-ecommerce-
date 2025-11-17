import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { createCar, getCars, deleteCar } from "../controllers/carController.js";

const router = express.Router();

// 🌍 Public routes
router.get("/", getCars);

// 🔐 Admin-only routes
router.post("/", protect, adminOnly, createCar);
router.delete("/:id", protect, adminOnly, deleteCar);

export default router;
