/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../components/Homepage/CartContext";
import { motion, AnimatePresence } from "framer-motion";

// --- Icons ---
const LockIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export default function Checkout() {
  const { cart, loading, clearCart, getTotal, getCartSummary } = useCart();

  const formatPrice = (price: number | string) =>
    typeof price === "number" ? `₦${price.toLocaleString()}` : price || "";

  const totalPrice = getTotal();

  // --- Handlers ---
  const handleWhatsApp = () => {
    const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";
    const items = getCartSummary()
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(", ");
    const msg = encodeURIComponent(
      `Hello, I'd like to pay for my order: ${items}. Total: ₦${totalPrice.toLocaleString()}.`
    );
    window.open(
      `https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`,
      "_blank"
    );
  };

  const handlePaystack = () => {
    // Ensure Paystack script is loaded in layout or here
    if (!(window as any).PaystackPop) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email: "customer@example.com", // Ideally, get this from a form input
      amount: totalPrice * 100, // Kobo
      metadata: {
        products: getCartSummary(),
      },
      callback: (response: any) => {
        alert(`Payment successful. Ref: ${response.reference}`);
        clearCart();
      },
      onClose: () => console.log("Payment window closed"),
    });

    handler.openIframe();
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            Loading Cart...
          </p>
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Your bag is empty
          </h2>
          <p className="text-gray-500 mb-8 font-light">
            You haven't added any luxury items yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-4 text-xs font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-colors rounded-sm"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-12">
          <div className="flex items-center gap-2">
            <LockIcon className="w-4 h-4 text-gray-400" />
            <h1 className="text-lg font-bold uppercase tracking-widest">
              Secure Checkout
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black flex items-center gap-2 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-7">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              Order Details
            </h2>
            <div className="space-y-8">
              {cart.map((item) => {
                const p = item.product;
                const img = p.image?.startsWith("http")
                  ? p.image
                  : "/placeholder.jpg";

                return (
                  <motion.div
                    key={item.product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-6 border-b border-gray-50 pb-8 last:border-0"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-medium text-gray-900">
                            {p.name}
                          </h3>
                          <span className="text-sm font-semibold">
                            {formatPrice(p.price * item.quantity)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{p.brand}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-xs text-gray-400">
                          Unit: {formatPrice(p.price)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Summary & Payment */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 p-8 lg:p-10 rounded-sm sticky top-10">
              <h2 className="text-lg font-light mb-8">Order Summary</h2>

              <div className="space-y-4 text-sm border-b border-gray-200 pb-6 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-400 italic">
                    Calculated at next step
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-10">
                <span className="text-base font-bold uppercase tracking-wide">
                  Total
                </span>
                <span className="text-2xl font-bold">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePaystack}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-sm shadow-lg"
                >
                  <CreditCardIcon className="w-4 h-4" /> Pay Now
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 text-gray-900 text-xs font-bold uppercase tracking-widest hover:border-green-500 hover:text-green-600 transition-all rounded-sm"
                >
                  <WhatsAppIcon className="w-4 h-4" /> Order via WhatsApp
                </button>
              </div>

              {/* Clear Cart Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your cart?"))
                      clearCart();
                  }}
                  className="text-xs text-gray-400 hover:text-red-600 transition-colors underline decoration-gray-300 underline-offset-4"
                >
                  Clear Shopping Bag
                </button>
              </div>

              {/* Security Badge */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-center gap-2 text-gray-400">
                <LockIcon className="w-3 h-3" />
                <span className="text-[10px] uppercase tracking-widest">
                  Encrypted Payment Processing
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
