/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useCart } from "../components/Homepage/CartContext";
import axios from "axios";
import { motion } from "framer-motion";

export default function Checkout() {
  const { cart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrderOnServer = async () => {
    const res = await axios.post("/api/orders/create");
    return res.data.order;
  };

  const handlePaystack = async () => {
    setError(null);
    setLoading(true);
    try {
      const order = await createOrderOnServer();

      const init = await axios.post("/api/payments/paystack/initialize", {
        orderId: order._id,
        email:
          order?.user?.email ||
          (localStorage.getItem("authUser")
            ? JSON.parse(localStorage.getItem("authUser")!).email
            : ""),
        amount: order.totalPrice,
      });

      const { authorization_url } = init.data.data || {};
      if (!authorization_url) throw new Error("No authorization URL from Paystack");

      window.location.href = authorization_url;
    } catch (err: any) {
      console.error("Paystack flow error:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || err.message || "Checkout failed");
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";
    const items = cart.map((i) => `${i.quantity}x ${i.name}`).join(", ");
    const msg = encodeURIComponent(
      `Hello, I'd like to pay for my order: ${items}. Total: ₦${totalPrice}.`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-gray-500 text-lg">
        Your cart is empty.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex justify-center items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        {/* 🛍 Header */}
        <h2 className="text-3xl font-bold text-center mb-6">
          Checkout <span className="text-blue-400">Summary</span>
        </h2>

        {/* Cart Items */}
        <div className="divide-y divide-white/10 mb-6">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between py-3 text-sm sm:text-base"
            >
              <div>
                <div className="font-medium text-gray-100">{item.name}</div>
                <div className="text-gray-400 text-xs">Qty: {item.quantity}</div>
              </div>
              <div className="font-semibold text-gray-200">
                ₦{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-4">
          <div className="text-gray-400">Total</div>
          <div className="text-2xl font-bold text-blue-400">
            ₦{totalPrice.toLocaleString()}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-400/30 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handlePaystack}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 transition rounded-xl font-semibold"
          >
            {loading ? "Preparing Payment..." : "Pay with Card (Paystack)"}
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 transition rounded-xl font-semibold text-white"
          >
            Pay via WhatsApp
          </button>
        </div>

        {/* User info note */}
        <div className="mt-6 text-center text-sm text-gray-400 leading-relaxed">
          After successful payment, you’ll receive a{" "}
          <span className="text-blue-300 font-medium">confirmation email</span> and a{" "}
          <span className="text-blue-300 font-medium">phone call 4 days before delivery.</span>
          <br />
          Please ensure your contact details are correct.
        </div>
      </motion.div>
    </section>
  );
}
