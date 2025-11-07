/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useCart } from "../Homepage/CartContext";

export default function ShopPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const { cart, addToCart, removeFromCart, refreshCart } = useCart();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productsCache, setProductsCache] = useState<Record<string, any[]>>({});
  const [addingIds, setAddingIds] = useState<Record<string, boolean>>({});
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});
  const [clearingCart, setClearingCart] = useState(false);

  // Fetch categories
  useEffect(() => {
    const source = axios.CancelToken.source();
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/products/categories`, {
          cancelToken: source.token,
        });
        const cats = res.data?.data?.brands || [];
        setCategories(cats);
        if (cats.length > 0) setCategory((prev) => prev || cats[0].name);
      } catch (err) {
        if (!axios.isCancel(err)) setError("Failed to load brands.");
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
    return () => source.cancel();
  }, [API_URL]);

  // Fetch products
  useEffect(() => {
    if (!category) return;
    if (productsCache[category]) {
      setProducts(productsCache[category]);
      return;
    }

    const source = axios.CancelToken.source();
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/products`, {
          params: { category },
          cancelToken: source.token,
        });
        const fetched = res.data?.data || [];
        setProducts(fetched);
        setProductsCache((c) => ({ ...c, [category]: fetched }));
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    return () => source.cancel();
  }, [category, API_URL, productsCache]);

  const formatPrice = (price: number | string) =>
    typeof price === "number" ? `₦${price.toLocaleString()}` : price || "";

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  const handleAddToCart = useCallback(
    async (product: any) => {
      setAddingIds((s) => ({ ...s, [product._id]: true }));
      try {
        await addToCart(product);
        if (refreshCart) await refreshCart();
      } finally {
        setAddingIds((s) => ({ ...s, [product._id]: false }));
      }
    },
    [addToCart, refreshCart]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      setRemovingIds((s) => ({ ...s, [id]: true }));
      try {
        await removeFromCart(id);
      } finally {
        setRemovingIds((s) => ({ ...s, [id]: false }));
      }
    },
    [removeFromCart]
  );

  const handleClearCart = useCallback(async () => {
    if (cart.length === 0) return;
    setClearingCart(true);
    try {
      await Promise.all(cart.map((it) => removeFromCart(it._id)));
    } finally {
      setClearingCart(false);
    }
  }, [cart, removeFromCart]);

  const ProductCard: React.FC<{ product: any }> = ({ product }) => {
    const isAdding = Boolean(addingIds[product._id]);
    return (
      <article className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-4 flex flex-col">
        <div className="h-52 w-full mb-3 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900 text-sm">{formatPrice(product.price)}</div>
            <div className="text-[11px] text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </div>
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            disabled={product.stock <= 0 || isAdding}
            className={`ml-3 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              product.stock <= 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-4 items-start">
        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-2 bg-white shadow-sm rounded-lg p-3 sticky top-4 h-fit">
          <h3 className="text-base font-semibold mb-3">Brands</h3>
          {catLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-7 w-full bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${
                    category === cat.name ? "bg-black text-white" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {cat.label || cat.name}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Products */}
        <main className="col-span-12 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {category ? `Products — ${category}` : "Products"}
            </h2>
            <div className="text-xs text-gray-500">{products.length} items</div>
          </div>

          {error && <div className="mb-3 text-xs text-red-500">{error}</div>}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-xl shadow-sm animate-pulse h-52" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No products available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
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
            <p className="text-gray-500 text-xs">Your cart is empty.</p>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-y-auto mb-3">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-xs font-medium truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item._id)}
                      disabled={removingIds[item._id]}
                      className="text-[11px] text-red-500 font-semibold"
                    >
                      {removingIds[item._id] ? "..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2">
                <p className="text-sm font-bold text-gray-900">
                  Total: {formatPrice(totalPrice)}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleClearCart}
                    disabled={clearingCart}
                    className="flex-1 py-1.5 rounded border border-gray-300 text-xs"
                  >
                    {clearingCart ? "..." : "Clear"}
                  </button>
                  <button className="flex-1 py-1.5 rounded bg-black text-white text-xs font-semibold">
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
