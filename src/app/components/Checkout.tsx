"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "../components/Homepage/CartContext";
import { motion } from "framer-motion";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [localCart, setLocalCart] = useState(cart);

  // Keep localCart in sync with context (and localStorage)
  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  const totalPrice = localCart.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleWhatsApp = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";
    const items = localCart.map((i) => `${i.quantity}x ${i.product.name}`).join(", ");
    const msg = encodeURIComponent(
      `Hello, I'd like to pay for my order: ${items}. Total: ₦${totalPrice}.`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  if (localCart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-gray-500 text-lg">
        Your cart is empty.
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 flex justify-center items-start px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Checkout Summary</h2>

        <div className="divide-y divide-gray-200 mb-6">
          {localCart.map((item, idx) => (
            <div key={item.product._id ?? idx} className="flex justify-between py-3">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="font-semibold">₦{(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-4 mb-4">
          <span className="text-gray-600 font-medium">Total</span>
          <span className="text-xl font-bold">₦{totalPrice.toLocaleString()}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleWhatsApp}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition"
          >
            Pay via WhatsApp
          </button>
          <button
            onClick={clearCart}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded-xl transition"
          >
            Clear Cart
          </button>
        </div>
      </motion.div>
    </section>
  );
}
