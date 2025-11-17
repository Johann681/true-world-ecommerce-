import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Standard response helper
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

/* ============================
   CREATE ORDER FROM CART
   POST /api/order
============================ */
export const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) return sendResponse(res, false, "Cart is empty", null, 400);

    // Check stock
    for (let item of cart.items) {
      if (item.quantity > item.product.stock) {
        return sendResponse(res, false, `Not enough stock for ${item.product.name}`, null, 400);
      }
    }

    // Reduce product stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
    }

    const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = new Order({
      user: req.user._id,
      items: cart.items,
      totalPrice,
      status: "Pending",
    });

    await order.save();
    await Cart.deleteOne({ user: req.user._id });

    sendResponse(res, true, "Order created successfully", order, 201);
  } catch (error) {
    console.error("Error creating order:", error);
    sendResponse(res, false, "Server error", null, 500);
  }
};

/* ============================
   GET USER ORDERS
   GET /api/order/my-orders
============================ */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product");
    sendResponse(res, true, "User orders fetched", { count: orders.length, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    sendResponse(res, false, "Server error", null, 500);
  }
};

/* ============================
   ADMIN: GET ALL ORDERS WITH PAGINATION
   GET /api/order/all?page=1&limit=10
============================ */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    sendResponse(res, true, "All orders fetched", {
      total: totalOrders,
      page,
      limit,
      orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    sendResponse(res, false, "Server error", null, 500);
  }
};
