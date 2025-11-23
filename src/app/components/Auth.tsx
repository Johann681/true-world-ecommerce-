/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // 💡 Assuming you have lucide-react installed

/**
 * AuthSection
 * - Combined Login / Register form
 * - Robust token extraction from many response shapes
 * - Stores token + user safely, sets axios default header
 * - Tries to use a global AuthContext if present, otherwise dispatches a window event
 * - Modern, professional, accessible UI using Tailwind (Enhanced Styling)
 */

type FormState = {
  name: string;
  email: string;
  password: string;
};

export default function AuthSection({ redirectTarget = "/" }) {
  const router = useRouter();
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "" });

  // Accessible focus management & smooth scroll
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Robust token extraction: checks many common shapes
  const extractToken = (data: any) => {
    if (!data) return "";
    return (
      data.token ||
      data.accessToken ||
      data?.data?.token ||
      data?.payload?.token ||
      data?.data?.accessToken ||
      ""
    );
  };

  // Robust user extraction
  const extractUser = (data: any) => {
    if (!data) return null;
    return (
      data.user || data?.data?.user || data?.data || data || null
    );
  };

  const persistAuth = (user: any, token: string) => {
    try {
      if (user) localStorage.setItem("authUser", JSON.stringify(user));
      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to persist auth to localStorage", e);
    }

    // Try to notify a React context if app provides one
    try {
      window.dispatchEvent(new CustomEvent("authChanged", { detail: { user, token } }));
    } catch (e) {
      // graceful
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (mode === "register") {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Please provide name, email, and a password.");
        return;
      }
    } else {
      if (!form.email.trim() || !form.password) {
        setError("Please provide email and password.");
        return;
      }
    }

    if (!API_URL) {
      setError("Server URL not configured. Contact admin.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "register" ? "/api/users/register" : "/api/users/login";
      const url = `${API_URL}${endpoint}`;

      const payload =
        mode === "register"
          ? { name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password.trim() }
          : { email: form.email.trim().toLowerCase(), password: form.password.trim() };

      const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });

      const token = extractToken(res?.data);
      const user = extractUser(res?.data);

      if (!token) {
        console.error("Auth response (no token):", res?.data);
        throw new Error("Authentication succeeded but token is missing.");
      }

      persistAuth(user, token);

      // Slight delay to let storage/update propagate visually
      setTimeout(() => router.push(redirectTarget), 250);
    } catch (err: any) {
      console.error("Auth error:", err?.response?.data ?? err.message ?? err);
      const msg = err?.response?.data?.message || err.message || "Authentication failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (loading) return;
    setMode((m) => (m === "register" ? "login" : "register"));
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white px-4 py-12 overflow-hidden">
      {/* Subtle background blurs - Enhanced sizes/colors for deeper contrast */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-32 w-[600px] h-[600px] bg-indigo-700/15 blur-[100px] rounded-full transform rotate-12" />
        <div className="absolute -right-52 -bottom-40 w-[500px] h-[500px] bg-emerald-600/10 blur-[90px] rounded-full" />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", damping: 15, stiffness: 100 }}
        className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-7 sm:p-10 z-10"
      >
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-white">
            {mode === "register" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "register" ? "Join the community and explore." : "Sign in to manage your orders."}
          </p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="alert" 
            className="mb-6 rounded-xl bg-red-600/15 border border-red-600/30 text-red-300 p-4 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-5">
          {mode === "register" && (
            <label className="block">
              <span className="text-sm font-medium text-slate-200 block mb-1">Full name</span>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-slate-400 transition duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-inner"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-label="Full name"
                required={mode === "register"}
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-200 block mb-1">Email address</span>
            <input
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              type="email"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-slate-400 transition duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-inner"
              placeholder="you@example.com"
              autoComplete="email"
              aria-label="Email address"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200 block mb-1">Password</span>
            <input
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              type="password"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-slate-400 transition duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-inner"
              placeholder={mode === "register" ? "Create a secure password" : "Enter your password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              aria-label="Password"
              required
            />
            {mode === "register" && (
              <p className="mt-2 text-xs text-slate-400 opacity-80">
                Minimum 8 characters. Protect your account.
              </p>
            )}
          </label>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 py-3 px-4 font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:from-indigo-700 hover:to-emerald-600 hover:shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin text-white" />
                <span className="text-white text-base font-semibold tracking-wide">
                  {mode === "register" ? "Creating..." : "Signing in..."}
                </span>
              </>
            ) : (
              <span className="text-white text-base font-semibold tracking-wide">
                {mode === "register" ? "Create Account" : "Sign In"}
              </span>
            )}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          {mode === "register" ? "Already a member?" : "New to our site?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition duration-200 disabled:opacity-50"
          >
            {mode === "register" ? "Sign In" : "Create an account"}
          </button>
        </div>

        <footer className="mt-8 pt-4 border-t border-white/5 text-center text-xs text-slate-500">
          <p>&copy; 2025 Store. All rights reserved.</p>
          <p className="mt-1">By continuing you agree to our Terms and Privacy Policy.</p>
        </footer>
      </motion.form>
    </section>
  );
}