/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import axios from "axios";

/* Types */
interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  brand?: string;
  description?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

/* Context */
const CartContext = createContext<CartContextType | null>(null);

/* Helper: safe parse */
const safeJsonParse = <T,>(str: string | null, fallback: T): T => {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // refs for latest values + mounted guard
  const mountedRef = useRef(true);
  const cartRef = useRef<CartItem[]>(cart);
  const pendingOpsRef = useRef<Record<string, boolean>>({}); // per-product lock
  const refreshInProgressRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    cartRef.current = cart;
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {
      // ignore local storage write errors quietly
    }
  }, [cart]);

  const getAuthToken = useCallback(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (!raw) return null;
      const user = JSON.parse(raw);
      return user?.token ?? null;
    } catch {
      return null;
    }
  }, []);

  // hydrate cart at mount: prefer localStorage (guest) then attempt backend sync if logged in
  useEffect(() => {
    const localCart = safeJsonParse<CartItem[] | null>(
      localStorage.getItem("cart"),
      null
    );
    if (localCart && Array.isArray(localCart) && localCart.length > 0) {
      setCart(localCart);
    }

    // try to sync from backend (if token present)
    const token = getAuthToken();
    if (token) {
      // fire-and-forget; refreshCart handles its own mounted checks
      refreshCart().catch((err) => {
        // don't break mount; log for debugging
        console.debug("Initial cart refresh failed", err?.message ?? err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Utility: set cart only if mounted */
  const setCartIfMounted = useCallback((updater: (prev: CartItem[]) => CartItem[] | CartItem[]) => {
    if (!mountedRef.current) return;
    setCart((prev) => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      cartRef.current = next;
      return next;
    });
  }, []);

  /* Refresh cart from backend (if logged in). Keeps local cart if no token (guest). */
  const refreshCart = useCallback(async (): Promise<void> => {
    const token = getAuthToken();
    if (!token) return; // guest - nothing to refresh from server

    // prevent concurrent refresh storms
    if (refreshInProgressRef.current) return;
    refreshInProgressRef.current = true;
    setLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items: CartItem[] =
        (res.data?.items || []).map((i: any) => ({
          ...i.product,
          quantity: i.quantity,
        })) || [];

      if (mountedRef.current) {
        setCart(items);
      }
    } catch (err: any) {
      // if the server returns 401 or similar, keep guest cart instead of clearing
      console.debug("refreshCart error:", err?.response?.status ?? err?.message ?? err);
    } finally {
      refreshInProgressRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, [API_URL, getAuthToken]);

  /* Add to cart with optimistic update and rollback */
  const addToCart = useCallback(async (product: Product, quantity = 1): Promise<void> => {
    const productId = product._id;
    // prevent concurrent ops on the same product
    if (pendingOpsRef.current[productId]) return;
    pendingOpsRef.current[productId] = true;

    const token = getAuthToken();

    // Snapshot for rollback
    const prev = cartRef.current.slice();

    // Optimistic UI update
    setCartIfMounted((prevCart) => {
      const existing = prevCart.find((i) => i._id === productId);
      if (existing) {
        return prevCart.map((i) =>
          i._id === productId ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });

    // Guest flow: persist only locally
    if (!token) {
      pendingOpsRef.current[productId] = false;
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // best-effort: refresh server state (lightweight)
      await refreshCart();
    } catch (err: any) {
      // rollback to previous state on error
      console.error("addToCart failed:", err?.response?.status ?? err?.message ?? err);
      if (mountedRef.current) setCart(prev);
      throw err;
    } finally {
      pendingOpsRef.current[productId] = false;
    }
  }, [API_URL, getAuthToken, refreshCart, setCartIfMounted]);

  /* Remove from cart (optimistic) */
  const removeFromCart = useCallback(async (productId: string): Promise<void> => {
    if (pendingOpsRef.current[productId]) return;
    pendingOpsRef.current[productId] = true;

    const token = getAuthToken();
    const prev = cartRef.current.slice();

    setCartIfMounted((prevCart) => prevCart.filter((i) => i._id !== productId));

    if (!token) {
      pendingOpsRef.current[productId] = false;
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshCart();
    } catch (err: any) {
      console.error("removeFromCart failed:", err?.message ?? err);
      if (mountedRef.current) setCart(prev);
      throw err;
    } finally {
      pendingOpsRef.current[productId] = false;
    }
  }, [API_URL, getAuthToken, refreshCart, setCartIfMounted]);

  /* Totals (memoized) */
  const totalItems = useMemo(() => cart.reduce((s, it) => s + it.quantity, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((s, it) => s + it.price * it.quantity, 0), [cart]);

  /* Provider value */
  const value = useMemo(
    () => ({
      cart,
      loading,
      totalItems,
      totalPrice,
      addToCart,
      removeFromCart,
      refreshCart,
    }),
    [cart, loading, totalItems, totalPrice, addToCart, removeFromCart, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/* Hook */
export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

