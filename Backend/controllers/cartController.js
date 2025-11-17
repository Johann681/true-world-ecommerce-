import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Standard response helper
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

/* ============================
   GET CURRENT USER CART
   GET /api/cart
============================ */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    const items = cart?.items || [];
    return sendResponse(res, true, "Cart fetched successfully.", { items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return sendResponse(res, false, "Server error", { items: [] }, 500);
  }
};

/* ============================
   ADD ITEM TO CART
   POST /api/cart
============================ */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return sendResponse(res, false, "Product ID and quantity required", { items: [] }, 400);
    }

    const product = await Product.findById(productId);
    if (!product) return sendResponse(res, false, "Product not found", { items: [] }, 404);
    if (quantity > product.stock) return sendResponse(res, false, "Not enough stock", { items: [] }, 400);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + quantity;
      if (newQuantity > product.stock) return sendResponse(res, false, "Not enough stock", { items: [] }, 400);
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate("items.product");

    return sendResponse(res, true, "Item added to cart", { items: cart.items }, 201);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return sendResponse(res, false, "Server error", { items: [] }, 500);
  }
};

/* ============================
   REMOVE ITEM FROM CART
   DELETE /api/cart/:productId
============================ */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return sendResponse(res, false, "Cart not found", { items: [] }, 404);

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    await cart.populate("items.product");

    return sendResponse(res, true, "Item removed from cart", { items: cart.items });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return sendResponse(res, false, "Server error", { items: [] }, 500);
  }
};

/* ============================
   CLEAR USER CART
   DELETE /api/cart/clear
============================ */
export const clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ user: req.user._id });
    return sendResponse(res, true, "Cart cleared successfully.", { items: [] });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return sendResponse(res, false, "Server error", { items: [] }, 500);
  }
};
