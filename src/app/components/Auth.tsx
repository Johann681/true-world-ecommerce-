/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/**
 * AuthSection
 * - Combined Login / Register form
 * - Robust token extraction from many response shapes
 * - Stores token + user safely, sets axios default header
 * - Tries to use a global AuthContext if present, otherwise dispatches a window event
 * - Modern, professional, accessible UI using Tailwind
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

  // Accessible focus management
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
    console.log("handleSubmit triggered");
    setError("");

    // Basic validation
    if (mode === "register") {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError("Please provide name, email, and password.");
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

console.log("Full response:", res.data);
console.log("Extracted token:", token);

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
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white px-4 py-12">
      {/* Subtle background blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-20 w-[520px] h-[520px] bg-gradient-to-tr from-indigo-600/20 to-transparent blur-3xl rounded-full transform rotate-12" />
        <div className="absolute -right-40 -bottom-24 w-[400px] h-[400px] bg-gradient-to-bl from-emerald-500/12 to-transparent blur-2xl rounded-full" />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md bg-white/6 backdrop-blur-md border border-white/8 rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">{mode === "register" ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-slate-300">{mode === "register" ? "Join and start shopping" : "Sign in to access your account"}</p>
        </header>

        {error && (
          <div role="alert" className="mb-4 rounded-md bg-red-600/10 border border-red-600/20 text-red-300 p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="text-sm text-slate-200">Full name</span>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="mt-1 w-full rounded-lg bg-white/6 border border-white/8 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-label="Full name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm text-slate-200">Email</span>
            <input
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              type="email"
              className="mt-1 w-full rounded-lg bg-white/6 border border-white/8 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              aria-label="Email address"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-200">Password</span>
            <input
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              type="password"
              className="mt-1 w-full rounded-lg bg-white/6 border border-white/8 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder={mode === "register" ? "Create a strong password" : "Enter your password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              aria-label="Password"
            />
            {mode === "register" && (
              <p className="mt-1 text-xs text-slate-400">At least 8 characters, include letters and numbers.</p>
            )}
          </label>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-500 py-2 px-4 font-semibold shadow-md hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="text-white text-sm">{mode === "register" ? "Creating..." : "Signing in..."}</span>
            ) : (
              <span className="text-white text-sm">{mode === "register" ? "Create account" : "Sign in"}</span>
            )}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-300">
          {mode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="text-indigo-300 hover:text-indigo-200 font-medium ml-1"
          >
            {mode === "register" ? "Sign in" : "Create one"}
          </button>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-500">
          By continuing you agree to our Terms and Privacy.
        </footer>
      </motion.form>
    </section>
  );
}
