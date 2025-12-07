// controllers/payment.controller.js
import paystack from "../Service/paystack.js";

/**
 * 1. Initialize Payment
 */
export const initializePayment = async (req, res) => {
    try {
      const { email, amount, orderId } = req.body;
  
      // 🔍 Debug logs
      console.log("Paystack baseURL:", process.env.PAYSTACK_BASE_URL);
      console.log("Full URL being called:", process.env.PAYSTACK_BASE_URL + "/transaction/initialize");console.log("Paystack object:", paystack);

      console.log("Using secret key (first 10 chars):", process.env.PAYSTACK_SECRET_KEY?.slice(0, 10) + "...");
  
      const response = await paystack.post("/transaction/initialize", {
        email,
        amount: amount * 100, // Paystack uses kobo
        metadata: { orderId },
      });
  
      return res.json({
        status: "success",
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      });
    } catch (error) {
      console.error("Axios/Paystack error:", error.response?.data || error.message);
      return res.status(500).json({
        status: "error",
        message: error.response?.data || error.message,
      });
    }
  };

/**
 * 2. Verify Payment
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await paystack.get(`/transaction/verify/${reference}`);

    if (response.data.data.status === "success") {
      const orderId = response.data.data.metadata.orderId;

      // TODO: Update your order model here
      // Example:
      // await Order.findByIdAndUpdate(orderId, { paid: true });

      return res.json({
        status: "success",
        message: "Payment verified",
        orderId,
      });
    }

    return res.json({
      status: "failed",
      message: "Payment not successful",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.response?.data || error.message,
    });
  }
};

/**
 * 3. Webhook for automatic confirmation
 */
export const paystackWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Validate Paystack signature
    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    // Process payment success event
    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const orderId = event.data.metadata.orderId;

      // update your database
      // await Order.findByIdAndUpdate(orderId, { paid: true });

      console.log("Webhook confirmed payment:", reference);
    }

    res.sendStatus(200);
  } catch (err) {
    res.sendStatus(500);
  }
};
