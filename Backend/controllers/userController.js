import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT Token
const generateToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "7d", // shorter expiry for security
  });
};

// Standard response helper
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

// Validate email format
const isValidEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  return password.length >= 6; // can add regex for more rules
};

/* ============================
   Register new user
============================ */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return sendResponse(res, false, "All fields are required", null, 400);
    }

    // Validate email
    if (!isValidEmail(email)) {
      return sendResponse(res, false, "Invalid email format", null, 400);
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return sendResponse(res, false, "Password must be at least 6 characters", null, 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, false, "User already exists", null, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return user + token
    return sendResponse(res, true, "User registered successfully", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: generateToken(user._id, user.isAdmin),
    }, 201);

  } catch (error) {
    console.error("Error registering user:", error);
    return sendResponse(res, false, "Server error", null, 500);
  }
};

/* ============================
   Login user
============================ */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return sendResponse(res, false, "Email and password are required", null, 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, false, "Invalid credentials", null, 401); // uniform message
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, false, "Invalid credentials", null, 401);
    }

    // Return user + token
    return sendResponse(res, true, "Login successful", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: generateToken(user._id, user.isAdmin),
    }, 200);

  } catch (error) {
    console.error("Login error:", error);
    return sendResponse(res, false, "Server error", null, 500);
  }
};
