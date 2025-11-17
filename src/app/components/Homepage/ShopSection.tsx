/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { useCart } from "../Homepage/CartContext";

export default function ShopPage() {
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const { cart, addToCart, removeFromCart, clearCart, isLoggedIn } = useCart();
  const router = useRouter();

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productsCacheRef = useRef<Record<string, any[]>>({});

  // ------------------- Error helper -------------------
  const logError = (context: string, err: any) => {
    console.error(`${context}:`, (err?.response?.data ?? err.message) || err);
  };

  // ------------------- Fetch categories & brands -------------------
  useEffect(() => {
    if (!API_URL) {
      setError("API base URL not configured.");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchFilters = async () => {
      setCatLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/categories`, { signal });

        const fetchedBrands = res?.data?.data?.brands ?? [];
        const fetchedCategories = res?.data?.data?.categories ?? [];

        setBrands(fetchedBrands);
        setCategories(fetchedCategories);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        logError("fetchFilters error", err);
        setError("Failed to load brands & categories.");
      } finally {
        setCatLoading(false);
      }
    };

    fetchFilters();
    return () => controller.abort();
  }, [API_URL]);

  // ------------------- Fetch products -------------------
  useEffect(() => {
    if (!API_URL || catLoading) return;

    const cacheKey = `${selectedBrand ?? "all"}-${selectedCategory ?? "all"}`;
    const cached = productsCacheRef.current[cacheKey];
    if (cached) {
      setProducts(cached);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (selectedBrand) params.brand = selectedBrand;
        if (selectedCategory) params.category = selectedCategory;

        const res = await axios.get(`${API_URL}/api/products`, {
          params,
          signal,
        });
        const arr = Array.isArray(res?.data?.data) ? res.data.data : [];

        setProducts(arr);
        productsCacheRef.current[cacheKey] = arr;
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        logError("fetchProducts error", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [selectedBrand, selectedCategory, API_URL, catLoading]);

  // ------------------- Price formatter -------------------
  const formatPrice = (price: number | string) =>
    typeof price === "number" ? `₦${price.toLocaleString()}` : price || "";

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.product?.price || 0) * Number(item.quantity || 1),
        0
      ),
    [cart]
  );

  // ------------------- Product Card -------------------
  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const id = product?._id ?? product?.id;
    const stock = Number(product?.stock ?? 0);
    const name = product?.name ?? "Untitled";
    const price = Number(product?.price ?? 0);
    const image = product?.image ?? "/placeholder.jpg";

    return (
      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 flex flex-col">
        <div className="h-52 w-full mb-3 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>

        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
          {name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{product?.brand ?? ""}</p>
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
          {product?.description ?? ""}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900 text-sm">
              {formatPrice(price)}
            </div>
            <div className="text-[11px] text-gray-500">
              {stock > 0 ? `${stock} in stock` : "Out of stock"}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={stock <= 0 || !isLoggedIn}
            className={`ml-3 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              stock <= 0 || !isLoggedIn
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
            title={!isLoggedIn ? "Log in to add items to cart" : undefined}
          >
            Add
          </button>
        </div>
      </article>
    );
  };

  // ------------------- Render -------------------
  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-4 items-start">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-2 bg-white shadow-sm rounded-lg p-3 sticky top-4 h-fit">
          <h3 className="text-base font-semibold mb-3">Categories</h3>
          {catLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-7 w-full bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            categories.map((c) => (
              <button
                key={c?.name ?? JSON.stringify(c)}
                onClick={() => {
                  setSelectedCategory(c?.name ?? null);
                  setSelectedBrand(null); // Reset brand when category changes
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${
                  selectedCategory === c?.name
                    ? "bg-black text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {c?.label ?? c?.name ?? "Category"}
              </button>
            ))
          )}

          {selectedCategory && (
            <>
              <h3 className="text-base font-semibold mt-4 mb-3">Brands</h3>
              {brands.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No brands for this category
                </p>
              ) : (
                brands.map((b) => (
                  <button
                    key={b?.name ?? JSON.stringify(b)}
                    onClick={() => setSelectedBrand(b?.name ?? null)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${
                      selectedBrand === b?.name
                        ? "bg-black text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {b?.label ?? b?.name ?? "Brand"}
                  </button>
                ))
              )}
            </>
          )}
        </aside>

        {/* Products */}
        <main className="col-span-12 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Products {selectedBrand ? `— ${selectedBrand}` : ""}{" "}
              {selectedCategory ? `(${selectedCategory})` : ""}
            </h2>
            <div className="text-xs text-gray-500">{products.length} items</div>
          </div>

          {error && <div className="mb-3 text-xs text-red-500">{error}</div>}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-xl shadow-sm animate-pulse h-52"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No products available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p?._id ?? JSON.stringify(p)} product={p} />
              ))}
            </div>
          )}
        </main>

        {/* Cart */}
        <aside className="col-span-12 lg:col-span-3 bg-white shadow-sm rounded-lg p-3 sticky top-4 h-fit">
          <div className="flex justify-between mb-2">
            <h3 className="text-base font-semibold">Cart</h3>
            <span className="text-xs text-gray-500">{cart.length} items</span>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-xs">
              {isLoggedIn ? "Your cart is empty." : "Log in to see your cart."}
            </p>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-y-auto mb-3">
                {cart.map((item, idx) => {
                  if (!item.product) return null; // Prevent crashes if product is null
                  return (
                    <div
                      key={item.product._id ?? idx}
                      className="flex items-center justify-between mb-3"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product.image ?? "/placeholder.jpg"}
                          alt={item.product.name ?? "item"}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-xs font-medium truncate">
                            {item.product.name ?? "Item"}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {formatPrice(item.product.price)} ×{" "}
                            {item.quantity ?? 1}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-[11px] text-red-500 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-2">
                <p className="text-sm font-bold text-gray-900">
                  Total: {formatPrice(totalPrice)}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={clearCart}
                    className="flex-1 py-1.5 rounded border border-gray-300 text-xs"
                  >
                    Clear
                  </button>
                  <button
  onClick={() => router.push("/checkout")}
  className="flex-1 py-1.5 rounded bg-black text-white text-xs font-semibold"
>
  Checkout
</button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
