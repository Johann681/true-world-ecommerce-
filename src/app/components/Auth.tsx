/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type FormState = {
  name: string;
  email: string;
  password: string;
};

export default function AuthSection({ redirectTarget = "/" }) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
  });

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && (!form.name.trim() || !form.email.trim() || !form.password)) {
      setError("Please provide name, email, and password.");
      return;
    }
    if (mode === "login" && (!form.email.trim() || !form.password)) {
      setError("Please provide email and password.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/users/register" : "/api/users/login";
      const url = `${API_URL?.replace(/\/$/, "")}${endpoint}`;
      const payload =
        mode === "register"
          ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
          : { email: form.email.trim(), password: form.password };

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const user = res.data.user || res.data;
      const token = res.data.token || "";

      if (!token) throw new Error("Login succeeded but token missing.");

      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("token", token);
      window.dispatchEvent(new Event("authChanged"));
      router.push(redirectTarget);
    } catch (err: any) {
      if (err.response?.data?.message) setError(err.response.data.message);
      else setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4 overflow-hidden">
      {/* 💫 Soft background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,122,255,0.2),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.15),transparent_70%)]" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          {mode === "register" ? "Create Account" : "Welcome Back"}
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-400/30 p-2 rounded-md text-center">
            {error}
          </div>
        )}

        {mode === "register" && (
          <div className="mb-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Full Name"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
            />
          </div>
        )}

        <div className="mb-4">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="Email"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            placeholder={mode === "register" ? "Create password" : "Enter password"}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 transition font-semibold py-2 rounded-lg"
        >
          {loading
            ? mode === "register"
              ? "Creating..."
              : "Signing in..."
            : mode === "register"
            ? "Sign Up"
            : "Sign In"}
        </button>

        <div className="mt-4 text-center text-sm text-gray-400">
          {mode === "register" ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setError("");
            }}
            className="text-blue-400 hover:text-blue-300 ml-1 font-medium"
          >
            {mode === "register" ? "Sign In" : "Create one"}
          </button>
        </div>
      </motion.form>
    </section>
  );
}
