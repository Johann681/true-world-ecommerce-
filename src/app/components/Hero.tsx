"use client";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[75vh] flex flex-col justify-center items-center text-center text-white overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Soft radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_70%)]" />

      {/* Floating blur lights */}
      <motion.div
        className="absolute w-56 h-56 bg-blue-500/25 blur-[100px] rounded-full top-12 left-10"
        animate={{ y: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
      />
      <motion.div
        className="absolute w-56 h-56 bg-indigo-600/25 blur-[100px] rounded-full bottom-12 right-10"
        animate={{ y: [0, -25, 0] }}
        transition={{ repeat: Infinity, duration: 7 }}
      />

      {/* Main heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="text-4xl md:text-5xl font-bold tracking-tight mb-3"
      >
        Welcome to{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          True World Tech
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.9 }}
        className="text-gray-300 text-base md:text-lg max-w-xl mb-6 px-4 leading-relaxed"
      >
        Discover innovation — from premium smartphones to luxury cars.  
        Designed for today, built for tomorrow.
      </motion.p>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <button className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition text-sm font-medium shadow-sm">
          Explore Phones
        </button>
        <button className="px-6 py-2.5 rounded-full border border-white/30 hover:bg-white/10 transition text-sm font-medium">
          View Cars
        </button>
      </motion.div>
    </section>
  );
}
