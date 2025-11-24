"use client";

import React from "react";
import { MessageCircle, Instagram, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// --- Custom TikTok Icon (Lucide doesn't have one) ---
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
  </svg>
);

// --- Configuration ---
const CONTACT_INFO = {
  whatsapp: {
    number: "+234 909 827 4267",
    link: "https://wa.me/2349098274267",
    label: "Customer Support"
  },
  instagram: {
    handle: "@trueworld_technology",
    link: "https://instagram.com/trueworld_technology",
    label: "Follow us on Instagram"
  },
  tiktok: {
    handle: "@trueworldphonesandgadgets",
    link: "https://tiktok.com/@trueworldphonesandgadgets",
    label: "Watch on TikTok"
  }
};

export default function ContactSection() {
  return (
    <section className="bg-white py-20 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="w-8 h-[2px] bg-[#1E4AFF]"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-[#1E4AFF]">
              Get in Touch
            </span>
            <span className="w-8 h-[2px] bg-[#1E4AFF]"></span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#0A0F1F] mb-4"
          >
            Here to help.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg font-light"
          >
            Whether you need to verify availability, ask about specs, or check order status, our team is ready.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. WhatsApp (Primary) */}
          <motion.a
            href={CONTACT_INFO.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative bg-[#0A0F1F] rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl shadow-blue-900/10 overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E4AFF] opacity-10 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-6 text-white group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-300">
              <MessageCircle size={28} />
            </div>
            
            <h3 className="text-white text-xl font-bold mb-2">WhatsApp Support</h3>
            <p className="text-gray-400 text-sm mb-6">Fastest response time for orders & inquiries.</p>
            
            <div className="mt-auto flex items-center gap-2 text-white font-semibold group-hover:text-[#25D366] transition-colors">
              <span>{CONTACT_INFO.whatsapp.number}</span>
              <ArrowRight size={16} />
            </div>
          </motion.a>

          {/* 2. Instagram */}
          <motion.a
            href={CONTACT_INFO.instagram.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="group bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center hover:border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-[#0A0F1F] group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-red-500 group-hover:to-purple-500 group-hover:text-white transition-all duration-300">
              <Instagram size={28} />
            </div>
            
            <h3 className="text-[#0A0F1F] text-xl font-bold mb-2">Instagram</h3>
            <p className="text-gray-500 text-sm mb-6">View our latest drops and customer reviews.</p>
            
            <div className="mt-auto text-[#0A0F1F] font-semibold text-sm bg-gray-50 px-4 py-2 rounded-full group-hover:bg-[#0A0F1F] group-hover:text-white transition-colors">
              {CONTACT_INFO.instagram.handle}
            </div>
          </motion.a>

          {/* 3. TikTok */}
          <motion.a
            href={CONTACT_INFO.tiktok.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="group bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center hover:border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-[#0A0F1F] group-hover:bg-black group-hover:text-white transition-all duration-300">
              <TikTokIcon className="w-7 h-7" />
            </div>
            
            <h3 className="text-[#0A0F1F] text-xl font-bold mb-2">TikTok</h3>
            <p className="text-gray-500 text-sm mb-6">Unboxing videos, tutorials, and showcases.</p>
            
            <div className="mt-auto text-[#0A0F1F] font-semibold text-sm bg-gray-50 px-4 py-2 rounded-full group-hover:bg-[#0A0F1F] group-hover:text-white transition-colors">
              {CONTACT_INFO.tiktok.handle}
            </div>
          </motion.a>

        </div>
      </div>
    </section>
  );
}