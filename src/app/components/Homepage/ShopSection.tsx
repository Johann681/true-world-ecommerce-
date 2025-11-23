/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCart } from "../Homepage/CartContext";
import { motion, AnimatePresence } from "framer-motion";

// --- Icons ---
const BagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);
const CloseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

export default function ShopPage() {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const { cart, addToCart, removeFromCart, clearCart, isLoggedIn } = useCart();
  const router = useRouter();

  // ---------------- Filters & State ----------------
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const productsCacheRef = useRef<Record<string, { data: any[]; page: number }>>({});

  // Toast state
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeout.current) window.clearTimeout(toastTimeout.current);
    toastTimeout.current = (window.setTimeout(() => setToast(null), 2000) as unknown) as number;
  };

  const logError = (context: string, err: any) => {
    console.error(`${context}:`, (err?.response?.data ?? err.message) || err);
  };

  // ---------------- Fetch Filters ----------------
  useEffect(() => {
    if (!API_URL) return;
    const controller = new AbortController();

    const fetchFilters = async () => {
      setFiltersLoading(true);
      try {
        const catRes = await axios.get(`${API_URL}/api/categories`, { signal: controller.signal });
        const cats = catRes?.data?.data?.categories ?? [];
        const fetchedBrandsFromCat = catRes?.data?.data?.brands ?? [];
        setCategories(cats);

        if (fetchedBrandsFromCat.length > 0) {
            setBrands(fetchedBrandsFromCat);
        } else {
             try {
                const brandRes = await axios.get(`${API_URL}/api/brands`, { signal: controller.signal });
                const brandData = Array.isArray(brandRes?.data) 
                    ? brandRes.data 
                    : brandRes?.data?.data?.brands ?? brandRes?.data?.data ?? [];
                setBrands(brandData);
             } catch (e) {
                 console.warn("Could not fetch separate brands", e);
             }
        }

      } catch (err: any) {
        if (err?.name !== "CanceledError") logError("fetchFilters error", err);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilters();
    return () => controller.abort();
  }, [API_URL]);

  const cacheKeyBase = useMemo(
    () => `b:${selectedBrand ?? "all"}|c:${selectedCategory ?? "all"}`,
    [selectedBrand, selectedCategory]
  );

  // ---------------- Fetch Products ----------------
  useEffect(() => {
    if (!API_URL || filtersLoading) return;

    setPage(1);
    setProducts([]);
    setHasMore(true);

    const fetchPage = async (p: number) => {
      const cacheKey = `${cacheKeyBase}|p:${p}`;
      const cached = productsCacheRef.current[cacheKey];
      if (cached) {
        setProducts((prev) => (p === 1 ? cached.data : [...prev, ...cached.data]));
        setHasMore(cached.data.length === perPage);
        return;
      }

      setLoading(true);
      try {
        const params: Record<string, any> = { page: p, limit: perPage };
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedCategory) params.category = selectedCategory;

        const res = await axios.get(`${API_URL}/api/products`, { params });
        const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
        productsCacheRef.current[cacheKey] = { data: arr, page: p };
        setProducts((prev) => (p === 1 ? arr : [...prev, ...arr]));
        setHasMore(arr.length === perPage);
      } catch (err: any) {
        if (err?.name !== "CanceledError") {
          logError("fetchProducts error", err);
          setError("Failed to load products.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPage(1);
  }, [cacheKeyBase, API_URL, filtersLoading, perPage]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    const cacheKey = `${cacheKeyBase}|p:${next}`;
    const cached = productsCacheRef.current[cacheKey];
    
    if (cached) {
      setProducts((prev) => [...prev, ...cached.data]);
      setHasMore(cached.data.length === perPage);
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, any> = { page: next, limit: perPage };
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedCategory) params.category = selectedCategory;
      const res = await axios.get(`${API_URL}/api/products`, { params });
      const arr = Array.isArray(res?.data?.data) ? res.data.data : [];
      productsCacheRef.current[cacheKey] = { data: arr, page: next };
      setProducts((prev) => [...prev, ...arr]);
      setHasMore(arr.length === perPage);
    } catch (err: any) {
      if (err?.name !== "CanceledError") setError("Failed to load more products.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | string) =>
    typeof price === "number" ? `₦${price.toLocaleString()}` : price || "";

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 1), 0),
    [cart]
  );

  // ---------------- Sub-Components ----------------
  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const [showDesc, setShowDesc] = useState(false);
    const stock = Number(product?.stock ?? 0);
    const fixedImage = product?.image?.startsWith("http") ? product.image : "/placeholder.jpg";

    // --- UPDATED ADD HANDLER WITH LOGIN CHECK ---
    const handleAdd = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // 1. Check if User is Logged In
      if (!isLoggedIn) {
        showToast("Please log in to shop");
        // Redirect to login page
        router.push("/login");
        return;
      }

      // 2. Proceed to Add to Cart
      addToCart(product, 1);
      setIsCartOpen(true);
    };

    return (
      <div className="group flex flex-col bg-white">
        {/* Image */}
        <div className="aspect-[3/4] w-full overflow-hidden rounded-sm bg-gray-100 relative">
          {stock <= 0 && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs px-2 py-1 uppercase tracking-wider">Sold Out now</span>
            </div>
          )}
          <Image 
            src={fixedImage} 
            alt={product?.name} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          
          {/* Desktop Quick Add */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:block">
             <button onClick={handleAdd} disabled={stock <= 0} className="w-full bg-white text-black font-medium py-3 px-4 shadow-lg hover:bg-gray-50 disabled:bg-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2">
              {stock > 0 ? <><PlusIcon className="w-4 h-4" /> Add</> : "Out of Stock"}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-col items-start gap-1">
            <div className="flex justify-between w-full items-start">
                <h3 className="text-base font-medium text-gray-900 leading-tight cursor-pointer hover:underline decoration-1 underline-offset-2 pr-4">
                    {product?.name}
                </h3>
                <p className="text-base font-semibold text-gray-900 whitespace-nowrap">
                    {formatPrice(product?.price)}
                </p>
            </div>
            
            <p className="text-sm text-gray-500">{product?.brand}</p>

            {/* Expandable Description */}
            <div className="w-full mt-1">
                <button 
                    onClick={() => setShowDesc(!showDesc)}
                    className="text-xs font-medium text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                >
                    {showDesc ? "Hide Details" : "View Details"}
                    <motion.span animate={{ rotate: showDesc ? 180 : 0 }}>
                        <ChevronDownIcon className="w-3 h-3" />
                    </motion.span>
                </button>
                
                <AnimatePresence>
                    {showDesc && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <p className="pt-2 text-sm text-gray-600 leading-relaxed font-light">
                                {product?.description || "No description available."}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Add Button */}
            <button onClick={handleAdd} disabled={stock <= 0} className="w-full mt-4 lg:hidden text-sm border border-gray-300 py-2 rounded-sm font-medium hover:border-black transition-colors">
                {stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
        </div>
      </div>
    );
  };

  const CartDrawer = () => (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col">
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-semibold">Shopping Cart ({cart.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><CloseIcon className="w-6 h-6 text-gray-600" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <BagIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const p = item.product || {};
              const img = p.image?.startsWith("http") ? p.image : "/placeholder.jpg";
              return (
                <div key={`${p._id}-${idx}`} className="flex gap-4">
                  <div className="w-20 h-24 relative bg-gray-100 rounded-sm overflow-hidden flex-shrink-0"><Image src={img} alt={p.name} fill className="object-cover" /></div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start"><h4 className="text-sm font-medium text-gray-900 line-clamp-2">{p.name}</h4><button onClick={() => removeFromCart(p._id)} className="text-gray-400 hover:text-red-500 ml-2"><TrashIcon className="w-4 h-4" /></button></div>
                      <p className="text-xs text-gray-500 mt-1">{p.brand}</p>
                    </div>
                    <div className="flex justify-between items-end"><span className="text-xs text-gray-500">Qty: {item.quantity}</span><span className="font-semibold text-sm">{formatPrice(p.price)}</span></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4"><span className="text-gray-600">Subtotal</span><span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span></div>
            <button onClick={() => router.push("/checkout")} className="w-full bg-black text-white py-3.5 font-medium rounded-sm hover:bg-gray-800 transition-colors">Proceed to Checkout</button>
          </div>
        )}
      </motion.div>
    </>
  );

  // ---------------- Main Render ----------------
  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-black selection:text-white pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Page Title */}
        <div className="mb-8 lg:mb-12 border-b border-gray-100 pb-6">
            <h1 className="text-3xl lg:text-4xl font-light tracking-tight text-gray-900">
                Our Collection
            </h1>
            <p className="mt-2 text-gray-500 text-sm max-w-xl">
                Browse our exclusive selection of products.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-3 space-y-10 sticky top-10 self-start">
            
            {/* CATEGORIES */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Categories</h3>
              {filtersLoading ? (
                <div className="space-y-2 animate-pulse"><div className="h-4 bg-gray-100 rounded w-3/4"/><div className="h-4 bg-gray-100 rounded w-1/2"/></div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => { setSelectedCategory(null); setSelectedBrand(null); }} className={`block text-sm w-full text-left transition-all hover:translate-x-1 ${!selectedCategory ? 'font-bold text-black' : 'text-gray-500 hover:text-black'}`}>All Products</button>
                  {categories.map((c) => (
                    <button key={c?.name} onClick={() => { setSelectedCategory(c?.name); setSelectedBrand(null); }} className={`block text-sm w-full text-left transition-all hover:translate-x-1 ${selectedCategory === c?.name ? "font-bold text-black" : "text-gray-500 hover:text-black"}`}>
                      {c?.label ?? c?.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BRANDS */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">Brands</h3>
                {filtersLoading && <div className="w-3 h-3 border-2 border-gray-200 border-t-black rounded-full animate-spin"/>}
              </div>
              
              <div className="space-y-2">
                {!filtersLoading && brands.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No brands available.</p>
                )}
                {brands.map((b) => (
                  <button
                    key={b?.name}
                    onClick={() => setSelectedBrand(selectedBrand === b?.name ? null : b?.name)}
                    className={`flex items-center text-sm w-full text-left transition-colors group ${selectedBrand === b?.name ? "text-black font-medium" : "text-gray-500"}`}
                  >
                    <span className={`w-3 h-3 border mr-2 flex items-center justify-center rounded-full ${selectedBrand === b?.name ? 'bg-black border-black' : 'border-gray-300 group-hover:border-black'}`}>
                    </span>
                    {b?.label ?? b?.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-9 min-h-[50vh]">
             {/* Mobile Filter Toggles */}
             <div className="lg:hidden mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((c) => (
                <button key={c.name} onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)} className={`whitespace-nowrap px-5 py-2.5 text-sm font-medium rounded-full border transition-colors ${selectedCategory === c.name ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-200"}`}>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Breadcrumb / Result Count */}
            <div className="mb-8 flex items-baseline justify-between">
              <h2 className="text-xl font-light text-gray-900">{selectedCategory || "All Items"}{selectedBrand && <span className="text-gray-400 mx-2">/</span>}{selectedBrand && <span className="font-medium">{selectedBrand}</span>}</h2>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{products.length} PRODUCTS</span>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-sm mb-6 text-sm">{error}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              <AnimatePresence mode="popLayout">
                {products.map((p) => (
                  <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Load More / Empty State */}
            <div className="mt-20 flex justify-center">
              {hasMore ? (
                <button onClick={loadMore} disabled={loading} className="px-10 py-4 text-xs font-bold uppercase tracking-widest bg-white border border-gray-200 hover:border-black transition-colors disabled:opacity-50">{loading ? "Loading..." : "Load More Products"}</button>
              ) : products.length > 0 ? (
                <div className="flex items-center gap-4 text-gray-300 text-xs uppercase tracking-widest"><span className="w-16 h-[1px] bg-gray-200"/>End of Collection<span className="w-16 h-[1px] bg-gray-200"/></div>
              ) : !loading && (
                 <div className="text-center py-10 text-gray-500">No products found. Try changing filters.</div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* --- FLOATING CART BUTTON --- */}
      <AnimatePresence>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="fixed right-6 bottom-6 lg:right-10 lg:bottom-10 z-50 flex items-center justify-center w-16 h-16 bg-black text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-shadow"
          >
            <BagIcon className="w-7 h-7" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </motion.button>
      </AnimatePresence>

      <AnimatePresence>{isCartOpen && <CartDrawer />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed left-1/2 -translate-x-1/2 bottom-24 lg:bottom-10 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl z-[100] flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}