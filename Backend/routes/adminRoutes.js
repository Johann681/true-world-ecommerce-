import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

// 🔐 Admin Auth Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

export default router;
