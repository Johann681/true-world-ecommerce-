import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ============================
   🔑 Helper: Generate JWT Token
============================ */
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* ============================
   🔐 Register Admin
   POST /api/admin/register
============================ */
export const registerAdmin = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    // Password strength validation (min 8 chars, at least one letter and one number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long and include at least one letter and one number." 
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role to 'admin' if not provided
    role = role || "admin";

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await admin.save();

    // Generate token for auto-login
    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      message: "✅ Admin registered successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ============================
   🔐 Login Admin
   POST /api/admin/login
============================ */
export const loginAdmin = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Generate token
    const token = generateToken(admin);

    res.status(200).json({
      success: true,
      message: "✅ Login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
