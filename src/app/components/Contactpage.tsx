/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { PhoneCall, Mail } from "lucide-react"; // Only one icon will be displayed
import { motion } from "framer-motion";

/**
 * ContactSection
 * - Single, prominent call-to-action (CTA) focused on direct contact.
 * - Uses blue/indigo professional styling.
 */

// Define your primary contact details here or fetch them from an API/Environment
const PRIMARY_CONTACT = {
  type: "phone", // or 'whatsapp', 'email'
  value: "+234 803 123 4567",
  link: "tel:+2348031234567", // Direct phone link
  whatsappLink: "https://wa.me/2348031234567", // WhatsApp link
};

export default function ContactSection() {

    const handleCtaClick = () => {
        if (PRIMARY_CONTACT.type === 'phone') {
            window.open(PRIMARY_CONTACT.link, "_self");
        } else if (PRIMARY_CONTACT.type === 'whatsapp') {
            window.open(PRIMARY_CONTACT.whatsappLink, "_blank");
        } else if (PRIMARY_CONTACT.type === 'email') {
            window.open(`mailto:${PRIMARY_CONTACT.value}`, "_self");
        }
    };

    const getIconAndLabel = () => {
        switch (PRIMARY_CONTACT.type) {
            case 'whatsapp':
                return { icon: <PhoneCall size={28} />, label: "Chat on WhatsApp" };
            case 'email':
                return { icon: <Mail size={28} />, label: "Send an Email" };
            case 'phone':
            default:
                return { icon: <PhoneCall size={28} />, label: "Call Us Now" };
        }
    };

    const { icon, label } = getIconAndLabel();

    return (
        <section className="bg-white py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 sm:p-12 shadow-xl"
                >
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                        Need Immediate Assistance?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                        Reach out to our sales team directly for quick inquiries and service requests.
                    </p>

                    <div className="flex justify-center">
                        <motion.button
                            onClick={handleCtaClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-4 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg shadow-blue-400/50 transition duration-300 hover:bg-blue-700"
                        >
                            {/* Only 1 Icon */}
                            {icon} 
                            <span>{label}: **{PRIMARY_CONTACT.value}**</span>
                        </motion.button>
                    </div>

                    <div className="mt-6 text-sm text-gray-500">
                        We aim to respond to all queries within one business hour.
                    </div>
                </motion.div>
            </div>
        </section>
    );
}