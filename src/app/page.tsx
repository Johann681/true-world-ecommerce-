"use client";
import Home from './components/Hero';
import Footer from './components/Homepage/Footer';
// import React from 'react';
import Navbar from './components/Homepage/NavBar';
import ShopSection from './components/Homepage/ShopSection';
import { CartProvider } from './components/Homepage/CartContext'; // import provider

const Page = () => {
  return (
    <CartProvider>
      <Navbar />
      <Home />
      <ShopSection />
      <Footer/>
    </CartProvider>
  );
};

export default Page;
