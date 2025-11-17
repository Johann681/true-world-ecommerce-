/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Plus, LogOut, Send, Search } from "lucide-react";

/*
  Polished Admin Dashboard (single-file)
  - Works with endpoints:
      GET  /api/products
      POST /api/products
      PUT  /api/products/:id
      DELETE /api/products/:id

      GET  /api/categories         -> returns { data: { brands: [...], categories: [{name,label}] }}
      POST /api/categories         -> body { category: "Name", label?: "Label" }
      DELETE /api/categories      -> body { category: "Name" }

      GET  /api/cars
      POST /api/cars
      PUT  /api/cars/:id
      DELETE /api/cars/:id

      GET  /api/orders
      PUT  /api/orders/:id

      GET  /api/users

  - Reads admin token from localStorage.adminToken
  - UI: Tailwind, compact, usable on desktop
*/

type Product = {
  _id?: string;
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  image?: string;
  category?: string;
  stock?: number;
};

type Car = {
  _id?: string;
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  images?: string[];
  contactType?: "whatsapp" | "instagram";
  contactLink?: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const safeData = (res: any) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return res?.data ?? [];
};

const isCancel = (err: any) => axios.isCancel?.(err) || err?.name === "CanceledError" || err?.message === "canceled";
const formatPrice = (n?: number | string) => (typeof n === "number" ? `₦${n.toLocaleString()}` : n ? `₦${n}` : "₦0");

const useToasts = () => {
  const [toasts, setToasts] = useState<{ id: string; type: string; text: string }[]>([]);
  const push = (t: { type: string; text: string }) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((s) => [...s, { id, ...t }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4500);
  };
  return { toasts, push };
};

export default function AdminDashboard() {
  const router = useRouter();
  const { toasts, push } = useToasts();

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const axiosInstance = useMemo(() => {
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return axios.create({ baseURL: API_URL, timeout: 30_000, headers });
  }, [token]);

  useEffect(() => {
    if (!token) router.push("/adminauth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [tab, setTab] = useState<"dashboard" | "products" | "categories" | "cars" | "orders" | "users">("dashboard");
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<Product>({ name: "", brand: "", price: 0, description: "", image: "", category: "", stock: 0 });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodLoading, setProdLoading] = useState(false);

  const [categories, setCategories] = useState<{ name: string; label?: string }[]>([]);
  const [brands, setBrands] = useState<{ name: string; label?: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const [cars, setCars] = useState<Car[]>([]);
  const [carForm, setCarForm] = useState<Car>({ name: "", brand: "", price: 0, description: "", images: [], contactType: "whatsapp", contactLink: "" });
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carLoading, setCarLoading] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const controllers = useRef<AbortController[]>([]);
  useEffect(() => () => controllers.current.forEach((c) => c.abort()), []);
  const newAbort = () => {
    const c = new AbortController();
    controllers.current.push(c);
    return c;
  };

  const fetchAll = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      await Promise.all([fetchProducts(), fetchCategories(), fetchCars(), fetchOrders(), fetchUsers()]);
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error(err);
        setGlobalError("Failed to load admin data");
        push({ type: "error", text: "Failed to load admin data" });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const ctrl = newAbort();
    setProdLoading(true);
    try {
      const res = await axiosInstance.get("/api/products", { signal: ctrl.signal });
      const list = safeData(res.data) as Product[];
      setProducts(list);
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error("fetchProducts", err);
        push({ type: "error", text: "Failed to fetch products" });
      }
      setProducts([]);
    } finally {
      setProdLoading(false);
    }
  };

  const fetchCategories = async () => {
    const ctrl = newAbort();
    setCatLoading(true);
    try {
      const res = await axiosInstance.get("/api/categories", { signal: ctrl.signal });
      const body = res?.data?.data ?? res?.data ?? {};
      const catList = body.categories ?? body?.categories ?? body;
      const brandList = body.brands ?? body?.brands ?? [];

      const parsedCats = Array.isArray(catList)
        ? catList.map((c: any) => (typeof c === "string" ? { name: c, label: c } : { name: c.name ?? c._id ?? c, label: c.label ?? c.name ?? c }))
        : [];
      const parsedBrands = Array.isArray(brandList)
        ? brandList.map((b: any) => (typeof b === "string" ? { name: b, label: b } : { name: b.name ?? b, label: b.label ?? b }))
        : [];

      setCategories(parsedCats);
      setBrands(parsedBrands);
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error("fetchCategories", err);
        push({ type: "error", text: "Failed to fetch categories" });
      }
      setCategories([]);
      setBrands([]);
    } finally {
      setCatLoading(false);
    }
  };

  const fetchCars = async () => {
    const ctrl = newAbort();
    setCarLoading(true);
    try {
      const res = await axiosInstance.get("/api/cars", { signal: ctrl.signal });
      setCars(safeData(res.data));
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error("fetchCars", err);
        push({ type: "error", text: "Failed to fetch cars" });
      }
      setCars([]);
    } finally {
      setCarLoading(false);
    }
  };

  const fetchOrders = async () => {
    const ctrl = newAbort();
    try {
      const res = await axiosInstance.get("/api/orders", { signal: ctrl.signal });
      setOrders(safeData(res.data));
    } catch (err) {
      console.warn(err);
      setOrders([]);
    }
  };
  const fetchUsers = async () => {
    const ctrl = newAbort();
    try {
      const res = await axiosInstance.get("/api/users", { signal: ctrl.signal });
      setUsers(safeData(res.data));
    } catch (err) {
      console.warn(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* Products CRUD */
  const openEditProduct = (p: Product) => {
    setEditingProductId(p._id ?? null);
    setProductForm({
      name: p.name ?? "",
      brand: p.brand ?? "",
      price: p.price ?? 0,
      description: p.description ?? "",
      image: p.image ?? "",
      category: p.category ?? "",
      stock: p.stock ?? 0,
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm({ name: "", brand: "", price: 0, description: "", image: "", category: "", stock: 0 });
  };

  const createOrUpdateProduct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!productForm.name.trim()) return push({ type: "error", text: "Product name required" });
    setProdLoading(true);
    try {
      if (editingProductId) {
        await axiosInstance.put(`/api/products/${editingProductId}`, productForm);
        push({ type: "success", text: "Product updated" });
      } else {
        await axiosInstance.post("/api/products", productForm);
        push({ type: "success", text: "Product created" });
      }
      await fetchProducts();
      resetProductForm();
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error("createOrUpdateProduct", err);
        const msg =
          (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
          (err?.message ?? "Product save failed");
        push({ type: "error", text: String(msg) });
      }
    } finally {
      setProdLoading(false);
    }
  };

  const deleteProduct = async (id?: string) => {
    if (!id || !confirm("Delete product?")) return;
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      push({ type: "success", text: "Product deleted" });
      await fetchProducts();
    } catch (err) {
      console.error(err);
      push({ type: "error", text: "Failed to delete product" });
    }
  };

  /* Categories CRUD */
  const createCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = (newCategory || "").trim();
    if (!name) return push({ type: "error", text: "Category name required" });
    setCatLoading(true);
    try {
      // merged controller accepts { category }
      await axiosInstance.post("/api/categories", { category: name });
      setNewCategory("");
      push({ type: "success", text: "Category created" });
      await fetchCategories();
    } catch (err: any) {
      console.error("createCategory", err);
      const msg =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
        (err?.message ?? "Failed to create category");
      push({ type: "error", text: String(msg) });
    } finally {
      setCatLoading(false);
    }
  };

  const deleteCategory = async (name?: string) => {
    if (!name || !confirm(`Delete category \"${name}\"?`)) return;
    try {
      // merged controller deletes by body { category }
      await axiosInstance.delete("/api/categories", { data: { category: name } });
      push({ type: "success", text: "Category deleted" });
      await fetchCategories();
    } catch (err) {
      console.error("deleteCategory", err);
      push({ type: "error", text: "Failed to delete category" });
    }
  };

  /* Cars CRUD */
  const openEditCar = (c: Car) => {
    setEditingCarId(c._id ?? null);
    setCarForm({ name: c.name ?? "", brand: c.brand ?? "", price: c.price ?? 0, description: c.description ?? "", images: c.images ? [...c.images] : [], contactType: c.contactType ?? "whatsapp", contactLink: c.contactLink ?? "" });
    setTab("cars");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetCarForm = () => {
    setEditingCarId(null);
    setCarForm({ name: "", brand: "", price: 0, description: "", images: [], contactType: "whatsapp", contactLink: "" });
  };

  const createOrUpdateCar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!carForm.name.trim()) return push({ type: "error", text: "Car name required" });
    setCarLoading(true);
    try {
      if (editingCarId) {
        await axiosInstance.put(`/api/cars/${editingCarId}`, carForm);
        push({ type: "success", text: "Car updated" });
      } else {
        await axiosInstance.post("/api/cars", carForm);
        push({ type: "success", text: "Car created" });
      }
      await fetchCars();
      resetCarForm();
    } catch (err) {
      console.error("createOrUpdateCar", err);
      push({ type: "error", text: "Car save failed" });
    } finally {
      setCarLoading(false);
    }
  };

  const deleteCarById = async (id?: string) => {
    if (!id || !confirm("Delete car?")) return;
    try {
      await axiosInstance.delete(`/api/cars/${id}`);
      push({ type: "success", text: "Car deleted" });
      await fetchCars();
    } catch (err) {
      console.error(err);
      push({ type: "error", text: "Failed to delete car" });
    }
  };

  /* Orders */
  const updateOrderStatus = async (orderId?: string, status?: string) => {
    if (!orderId || !status) return;
    try {
      await axiosInstance.put(`/api/orders/${orderId}`, { status });
      push({ type: "success", text: `Order marked ${status}` });
      await fetchOrders();
    } catch (err) {
      console.error(err);
      push({ type: "error", text: "Failed to update order" });
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    router.push("/adminauth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded shadow text-sm ${t.type === "success" ? "bg-emerald-50 text-emerald-800" : t.type === "error" ? "bg-red-50 text-red-800" : "bg-slate-50 text-slate-800"}`}>
            {t.text}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 p-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-white rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">Admin</h3>
              <div className="text-xs text-gray-500">{localStorage.getItem("adminName") || "Admin"}</div>
            </div>
            <button onClick={logout} className="p-2 rounded bg-red-50 text-red-600" title="Logout"><LogOut size={16} /></button>
          </div>

          <nav className="flex flex-col gap-2">
            <button onClick={() => setTab("dashboard")} className={`text-left px-3 py-2 rounded ${tab === "dashboard" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Overview</button>
            <button onClick={() => setTab("products")} className={`text-left px-3 py-2 rounded ${tab === "products" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Products</button>
            <button onClick={() => setTab("categories")} className={`text-left px-3 py-2 rounded ${tab === "categories" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Categories</button>
            <button onClick={() => setTab("cars")} className={`text-left px-3 py-2 rounded ${tab === "cars" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Cars</button>
            <button onClick={() => setTab("orders")} className={`text-left px-3 py-2 rounded ${tab === "orders" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Orders</button>
            <button onClick={() => setTab("users")} className={`text-left px-3 py-2 rounded ${tab === "users" ? "bg-black text-white" : "hover:bg-gray-100"}`}>Users</button>
          </nav>

          <div className="mt-4 text-xs text-gray-500">
            <div className="mb-2">Quick stats</div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                <span>Products</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                <span>Cars</span>
                <span className="font-medium">{cars.length}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded">
                <span>Orders</span>
                <span className="font-medium">{orders.length}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="bg-white rounded-xl p-4 mb-4 shadow flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">{globalError ?? (loading ? "Loading..." : "Manage products, cars, categories and orders")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchAll} className="px-3 py-1 rounded bg-gradient-to-r from-indigo-600 to-emerald-500 text-white text-sm flex items-center gap-2"><Send size={14} /> Refresh All</button>
            </div>
          </div>

          <div>
            {tab === "dashboard" && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-semibold">Recent Orders</h3>
                  {orders.slice(0, 5).map((o) => (
                    <div key={o._id} className="text-sm text-gray-600 py-2 border-b last:border-b-0">
                      <div className="font-medium">#{o._id}</div>
                      <div className="text-xs">{o.user?.email || "—"} • {formatPrice(o.totalPrice)}</div>
                    </div>
                  ))}
                  {orders.length === 0 && <div className="text-gray-400 text-sm py-3">No orders yet</div>}
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-semibold">Recent Users</h3>
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="text-sm text-gray-600 py-2 border-b last:border-b-0">
                      <div className="font-medium">{u.name || u.email}</div>
                      <div className="text-xs">{u.email}</div>
                    </div>
                  ))}
                  {users.length === 0 && <div className="text-gray-400 text-sm py-3">No users yet</div>}
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                  <h3 className="font-semibold">Quick Actions</h3>
                  <div className="flex flex-col gap-2 mt-3">
                    <button onClick={() => setTab("products")} className="w-full py-2 bg-black text-white rounded flex items-center justify-center gap-2"><Plus size={14} /> Add Product</button>
                    <button onClick={() => setTab("cars")} className="w-full py-2 border rounded flex items-center justify-center">Add Car</button>
                  </div>
                </div>
              </section>
            )}

            {tab === "products" && (
              <section>
                <div className="flex gap-4 items-start mb-4">
                  <form onSubmit={createOrUpdateProduct} className="bg-white rounded-xl p-4 shadow flex-1 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold">{editingProductId ? "Edit Product" : "Add Product"}</h2>
                      <div className="text-xs text-gray-500">{products.length} total</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input required placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full p-2 border rounded" />
                      <input placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className="w-full p-2 border rounded" />
                      <input type="number" placeholder="Price" value={productForm.price as any} onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full p-2 border rounded" />
                      <input type="number" placeholder="Stock" value={productForm.stock as any} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} className="w-full p-2 border rounded" />
                    </div>

                    <input placeholder="Image URL" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="w-full p-2 border rounded" />

                    <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full p-2 border rounded">
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>{c.label || c.name}</option>
                      ))}
                    </select>

                    <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full p-2 border rounded" />

                    <div className="flex gap-2">
                      <button disabled={prodLoading} type="submit" className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"><Plus size={14} /> {editingProductId ? "Save" : "Create"}</button>
                      {editingProductId && <button type="button" onClick={resetProductForm} className="px-3 py-2 border rounded">Cancel</button>}
                    </div>
                  </form>

                  <div className="w-80 bg-white rounded-xl p-3 shadow overflow-y-auto max-h-[520px]">
                    <h3 className="font-semibold mb-3">Products</h3>
                    <div className="space-y-3">
                      {products.map((p) => (
                        <div key={p._id} className="flex gap-3 items-center">
                          <img src={p.image || "/placeholder.jpg"} alt={p.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.brand} • {formatPrice(p.price)}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEditProduct(p)} className="p-2 rounded hover:bg-gray-100"><Edit2 size={14} /></button>
                            <button onClick={() => deleteProduct(p._id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && <div className="text-sm text-gray-400">No products yet</div>}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "categories" && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <form onSubmit={createCategory} className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-semibold mb-2">Add Category</h3>
                    <input placeholder="Category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full p-2 border rounded mb-2" />
                    <button className="w-full py-2 bg-black text-white rounded">Create</button>
                  </form>

                  <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {categories.map((c) => (
                        <div key={c.name} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium">{c.label || c.name}</div>
                            <div className="text-xs text-gray-500">{c.name}</div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => deleteCategory(c.name)} className="text-red-500 text-sm">Delete</button>
                          </div>
                        </div>
                      ))}
                      {categories.length === 0 && <div className="text-gray-400">No categories</div>}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "cars" && (
              <section>
                <div className="flex gap-4 items-start mb-4">
                  <form onSubmit={createOrUpdateCar} className="bg-white rounded-xl p-4 shadow flex-1 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-semibold">{editingCarId ? "Edit Car" : "Add Car"}</h2>
                      <div className="text-xs text-gray-500">{cars.length} total</div>
                    </div>

                    <input required placeholder="Name" value={carForm.name} onChange={(e) => setCarForm({ ...carForm, name: e.target.value })} className="w-full p-2 border rounded" />
                    <input placeholder="Brand" value={carForm.brand} onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })} className="w-full p-2 border rounded" />
                    <input type="number" placeholder="Price" value={carForm.price as any} onChange={(e) => setCarForm({ ...carForm, price: Number(e.target.value) })} className="w-full p-2 border rounded" />

                    <input placeholder="Primary image URL" value={carForm.images?.[0] || ""} onChange={(e) => setCarForm({ ...carForm, images: [e.target.value, ...(carForm.images?.slice(1) || [])] })} className="w-full p-2 border rounded" />
                    <input placeholder="Other images (comma separated)" value={(carForm.images || []).slice(1).join(",")} onChange={(e) => setCarForm({ ...carForm, images: [carForm.images?.[0] || "", ...e.target.value.split(",").map((s) => s.trim()).filter(Boolean)] })} className="w-full p-2 border rounded" />

                    <textarea placeholder="Description" value={carForm.description} onChange={(e) => setCarForm({ ...carForm, description: e.target.value })} className="w-full p-2 border rounded" />

                    <div className="flex gap-2 mb-2">
                      <select value={carForm.contactType} onChange={(e) => setCarForm({ ...carForm, contactType: e.target.value as any })} className="p-2 border rounded">
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                      </select>
                      <input placeholder="Contact link" value={carForm.contactLink} onChange={(e) => setCarForm({ ...carForm, contactLink: e.target.value })} className="flex-1 p-2 border rounded" />
                    </div>

                    <div className="flex gap-2">
                      <button disabled={carLoading} type="submit" className="px-4 py-2 bg-black text-white rounded flex items-center gap-2"><Plus size={14} /> {editingCarId ? "Save" : "Create"}</button>
                      {editingCarId && <button type="button" onClick={resetCarForm} className="px-3 py-2 border rounded">Cancel</button>}
                    </div>
                  </form>

                  <div className="w-80 bg-white rounded-xl p-3 shadow overflow-y-auto max-h-[520px]">
                    <h3 className="font-semibold mb-3">Cars</h3>
                    <div className="space-y-3">
                      {cars.map((c) => (
                        <div key={c._id} className="flex gap-3 items-center">
                          <img src={c.images?.[0] || "/placeholder-car.jpg"} alt={c.name} className="w-12 h-10 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.brand} • {formatPrice(c.price)}</div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => openEditCar(c)} className="p-2 rounded hover:bg-gray-100"><Edit2 size={14} /></button>
                            <button onClick={() => deleteCarById(c._id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                      {cars.length === 0 && <div className="text-sm text-gray-400">No cars yet</div>}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "orders" && (
              <section>
                <div className="bg-white p-4 rounded-xl shadow">
                  <h2 className="font-semibold mb-3">Orders</h2>
                  {orders.length === 0 ? (<div className="text-gray-400">No orders yet</div>) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div key={o._id} className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">Order #{o._id}</div>
                            <div className="text-xs text-gray-500">{new Date(o.createdAt || Date.now()).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-gray-700">Total: {formatPrice(o.totalPrice)}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateOrderStatus(o._id, "processing")} className="px-2 py-1 border rounded text-sm">Mark Processing</button>
                            <button onClick={() => updateOrderStatus(o._id, "shipped")} className="px-2 py-1 border rounded text-sm">Mark Shipped</button>
                            <button onClick={() => updateOrderStatus(o._id, "delivered")} className="px-2 py-1 border rounded text-sm">Mark Delivered</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {tab === "users" && (
              <section>
                <div className="bg-white p-4 rounded-xl shadow">
                  <h2 className="font-semibold mb-3">Users</h2>
                  {users.length === 0 ? (<div className="text-gray-400">No users yet</div>) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {users.map((u) => (
                        <div key={u._id} className="p-3 border rounded">
                          <div className="font-medium">{u.name || u.email}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => alert(JSON.stringify(u, null, 2))} className="px-2 py-1 border rounded text-sm">View</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
