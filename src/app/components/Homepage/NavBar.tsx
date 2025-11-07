"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, ShoppingCart, Car, User, LogOut, PhoneCall } from "lucide-react";

export default function GlassNavbar() {
  const [authUser, setAuthUser] = useState<{ name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
    try {
      const raw = localStorage.getItem("authUser");
      setAuthUser(raw ? JSON.parse(raw) : null);
    } catch {
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setAuthUser(null);
    setMenuOpen(false);
    window.dispatchEvent(new Event("authChanged"));
  };

  if (!hydrated) return null;

  return (
    <>
      {/* Desktop Navbar */}
      <header className="hidden md:block sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3">
          <nav className="relative rounded-xl px-4 py-2.5 backdrop-blur-md bg-white/80 border border-white/10 shadow flex items-center justify-between">
            {/* Logo only (longer image, no text) */}
            <div className="relative w-36 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Company Logo"
                fill
                sizes="144px"
                className="object-contain"
                priority
              />
            </div>

            {/* Links */}
            <ul className="flex items-center gap-5 text-sm font-medium text-gray-800">
              <li>
                <Link href="/" className="hover:text-blue-500 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="hover:text-blue-500 transition">
                  Cars
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-500 transition">
                  Contact
                </Link>
              </li>
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/checkout"
                className="p-1.5 rounded-md hover:bg-white/30 transition"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
              </Link>

              {authUser ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((s) => !s)}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold"
                  >
                    {authUser.name[0].toUpperCase()}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-lg backdrop-blur-md bg-white/80 border border-white/10 shadow-lg py-1">
                      <Link
                        href="/profile"
                        className="block px-3 py-1.5 text-sm text-gray-800 hover:bg-white/50"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-white/50 flex items-center gap-2"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed left-3 right-3 bottom-3 z-50">
        <div className="rounded-full px-3 py-2 backdrop-blur-md bg-white/85 border border-white/10 shadow flex items-center justify-between text-[11px] text-gray-700">
          <Link href="/" className="flex flex-col items-center">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link href="/explore-cars" className="flex flex-col items-center">
            <Car size={18} />
            <span>Cars</span>
          </Link>
          <Link href="/contact" className="flex flex-col items-center">
            <PhoneCall size={18} />
            <span>Contact</span>
          </Link>
          <Link href="/checkout" className="flex flex-col items-center relative">
            <ShoppingCart size={18} />
            <span>Cart</span>
          </Link>
          <Link href="/auth" className="flex flex-col items-center">
            <User size={18} />
            <span>Account</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
