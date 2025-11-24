/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  Edit2,
  Trash2,
  Plus,
  LogOut,
  Send,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/*
  AdminDashboard (Complete)
  - Full CRUD for Products / Categories / Cars / Orders / Users
  - Image upload UX: Drag & drop, Paste, Reorder
  - Supports Cloudinary/URL or Direct File Uploads
  - Car Form includes dedicated Image URL input
  - FIX: Car Image Paste functionality is now disabled (per user request)
*/

type Product = {
  _id?: string;
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  image?: string; // legacy single-image
  images?: string[]; // new multiple images
  category?: string;
  stock?: number;
};

type Car = {
  _id?: string;
  name: string;
  brand?: string;
  price?: number;
  description?: string;
  image?: string; // Added for single URL posting
  images?: string[];
  contactType?: "whatsapp" | "instagram";
  contactLink?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const safeData = (res: any) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return res?.data ?? [];
};

const isCancel = (err: any) =>
  axios.isCancel?.(err) ||
  err?.name === "CanceledError" ||
  err?.message === "canceled";
const formatPrice = (n?: number | string) =>
  typeof n === "number" ? `₦${n.toLocaleString()}` : n ? `₦${n}` : "₦0";

const useToasts = () => {
  const [toasts, setToasts] = useState<
    { id: string; type: string; text: string }[]
  >([]);
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

  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const axiosInstance = useMemo(() => {
    const headers: any = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    return axios.create({ baseURL: API_URL, timeout: 30_000, headers });
  }, [token]);

  useEffect(() => {
    if (!token) router.push("/AdminSection");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [tab, setTab] = useState<
    "dashboard" | "products" | "categories" | "cars" | "orders" | "users"
  >("dashboard");
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // --- Products State ---
  const initialProductForm: Product = {
    name: "",
    brand: "",
    price: 0,
    description: "",
    image: "",
    images: [],
    category: "",
    stock: 0,
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<Product>(initialProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodLoading, setProdLoading] = useState(false);
  const productFilesRef = useRef<(File | string)[]>([]);

  // --- Categories State ---
  const [categories, setCategories] = useState<
    { name: string; label?: string }[]
  >([]);
  const [newCategory, setNewCategory] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  // --- Cars State ---
  const initialCarForm: Car = {
    name: "",
    brand: "",
    price: 0,
    description: "",
    image: "",
    images: [],
    contactType: "whatsapp",
    contactLink: "",
  };
  const [cars, setCars] = useState<Car[]>([]);
  const [carForm, setCarForm] = useState<Car>(initialCarForm);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carLoading, setCarLoading] = useState(false);
  const carFilesRef = useRef<(File | string)[]>([]);

  // --- Other State ---
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const controllers = useRef<AbortController[]>([]);
  useEffect(() => () => controllers.current.forEach((c) => c.abort()), []);
  const newAbort = () => {
    const c = new AbortController();
    controllers.current.push(c);
    return c;
  };

  // --- Fetch Logic ---
  const fetchAll = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchCars(),
        fetchOrders(),
        fetchUsers(),
      ]);
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
      const res = await axiosInstance.get("/api/products", {
        signal: ctrl.signal,
      });
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
      const res = await axiosInstance.get("/api/categories", {
        signal: ctrl.signal,
      });
      const body = res?.data?.data ?? res?.data ?? {};
      const catList = body.categories ?? body?.categories ?? body;

      const parsedCats = Array.isArray(catList)
        ? catList.map((c: any) =>
            typeof c === "string"
              ? { name: c, label: c }
              : { name: c.name ?? c._id ?? c, label: c.label ?? c.name ?? c }
          )
        : [];

      setCategories(parsedCats);
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error("fetchCategories", err);
        push({ type: "error", text: "Failed to fetch categories" });
      }
      setCategories([]);
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
      const res = await axiosInstance.get("/api/orders", {
        signal: ctrl.signal,
      });
      setOrders(safeData(res.data));
    } catch (err) {
      console.warn(err);
      setOrders([]);
    }
  };

  const fetchUsers = async () => {
    const ctrl = newAbort();
    try {
      const res = await axiosInstance.get("/api/users", {
        signal: ctrl.signal,
      });
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

  /* ------------------- Image upload helpers ------------------- */

  const uploadFileToServer = async (file: File): Promise<string> => {
    try {
      const f = new FormData();
      f.append("file", file);
      const res = await axiosInstance.post("/api/upload", f, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res?.data?.url ?? res?.data?.data?.url ?? null;
      if (url) return url;
      if (typeof res?.data === "string") return res.data;
      throw new Error("No upload URL returned");
    } catch (err) {
      console.warn("uploadFileToServer failed:", err);
      throw err;
    }
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const resolveFilesToUrls = async (
    items: (File | string)[]
  ): Promise<string[]> => {
    const urls: string[] = [];
    for (const it of items) {
      if (!it) continue;
      if (typeof it === "string") {
        // Keeps existing Cloudinary/Remote URLs
        urls.push(it);
        continue;
      }
      try {
        // Attempt to upload new file to Cloudinary/server
        const uploaded = await uploadFileToServer(it);
        urls.push(uploaded);
      } catch (err) {
        // Fallback to Data URL if upload fails (e.g., local preview)
        try {
          const data = await fileToDataUrl(it);
          urls.push(data);
        } catch (e) {
          console.error("file->dataURL failed", e);
        }
      }
    }
    return urls.filter(
      (url) => url.startsWith("http") || url.startsWith("data:")
    );
  };

  /* ------------------- Products CRUD + Image UX ------------------- */

  const openEditProduct = (p: Product) => {
    setEditingProductId(p._id ?? null);

    // Determine the source of existing images
    const existingImages =
      p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];

    setProductForm({
      name: p.name ?? "",
      brand: p.brand ?? "",
      price: p.price ?? 0,
      description: p.description ?? "",
      image: p.image ?? existingImages[0] ?? "",
      images: existingImages,
      category: p.category ?? "",
      stock: p.stock ?? 0,
    });
    productFilesRef.current = existingImages.slice();
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm(initialProductForm);
    productFilesRef.current = [];
  };

  const handleProductPaste = async (
    e: React.ClipboardEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const items = Array.from(e.clipboardData.items || []);
    const files: (File | string)[] = [];
    let hasNewFile = false;

    for (const it of items) {
      if (it.kind === "file") {
        const file = it.getAsFile();
        if (file) {
          files.push(file);
          hasNewFile = true;
        }
      } else if (it.kind === "string") {
        const text = await new Promise<string>((res) => it.getAsString(res));
        // Check for URL (Cloudinary/External)
        if (text && text.match(/^(https?:\/\/|data:image)/)) {
          files.push(text);
        }
      }
    }

    if (files.length) {
      productFilesRef.current = [...productFilesRef.current, ...files];
      setProductForm((s) => ({
        ...s,
        images: (s.images ?? []).concat(
          files.map((f) => (typeof f === "string" ? f : URL.createObjectURL(f)))
        ),
      }));
      if (hasNewFile)
        push({
          type: "info",
          text: "Pasted images added. Click 'Create/Save' to upload.",
        });
    }
  };

  const handleProductDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length) {
      productFilesRef.current = [...productFilesRef.current, ...list];
      setProductForm((s) => ({
        ...s,
        images: (s.images ?? []).concat(
          list.map((f) => URL.createObjectURL(f))
        ),
      }));
      push({
        type: "info",
        text: `Added ${list.length} dropped images. Click 'Create/Save' to upload.`,
      });
    }
  };

  const handleProductFileSelect = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    productFilesRef.current = [...productFilesRef.current, ...arr];
    setProductForm((s) => ({
      ...s,
      images: (s.images ?? []).concat(arr.map((f) => URL.createObjectURL(f))),
    }));
    push({
      type: "info",
      text: `Added ${arr.length} selected images. Click 'Create/Save' to upload.`,
    });
  };

  const removeProductFileAt = (index: number) => {
    if (prodLoading) return;
    productFilesRef.current.splice(index, 1);
    setProductForm((s) => ({
      ...s,
      images: (s.images ?? []).filter((_, i) => i !== index),
    }));
  };

  const moveProductFile = (i: number, dir: -1 | 1) => {
    if (prodLoading) return;
    const arr = productFilesRef.current;
    const newIndex = i + dir;
    if (newIndex < 0 || newIndex >= arr.length) return;
    const copy = [...arr];
    const tmp = copy[i];
    copy[i] = copy[newIndex];
    copy[newIndex] = tmp;
    productFilesRef.current = copy;
    setProductForm((s) => ({
      ...s,
      images: (s.images ?? []).map((_, idx) => {
        const val = copy[idx];
        if (typeof val === "string") return val;
        return URL.createObjectURL(val as File);
      }),
    }));
  };

  const createOrUpdateProduct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!productForm.name.trim())
      return push({ type: "error", text: "Product name required" });
    setProdLoading(true);
    try {
      const resolvedUrls = await resolveFilesToUrls(productFilesRef.current);
      const payload: any = { ...productForm, images: resolvedUrls };
      if (resolvedUrls.length) payload.image = resolvedUrls[0];

      const price = Number(productForm.price);
      if (isNaN(price)) throw new Error("Price must be a valid number.");
      payload.price = price;

      if (editingProductId) {
        await axiosInstance.put(`/api/products/${editingProductId}`, payload);
        push({ type: "success", text: "Product updated successfully." });
      } else {
        await axiosInstance.post("/api/products", payload);
        push({ type: "success", text: "Product created successfully." });
      }
      await fetchProducts();
      resetProductForm();
    } catch (err: any) {
      if (!isCancel(err)) {
        console.error("createOrUpdateProduct", err);
        const msg =
          (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
          err?.message ??
          "Product save failed.";
        push({ type: "error", text: String(msg) });
      }
    } finally {
      setProdLoading(false);
    }
  };

  const deleteProduct = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axiosInstance.delete(`/api/products/${id}`);
      push({ type: "success", text: "Product deleted." });
      await fetchProducts();
    } catch (err) {
      console.error(err);
      push({ type: "error", text: "Failed to delete product." });
    }
  };

  /* ------------------- Categories CRUD ------------------- */

  const createCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = (newCategory || "").trim();
    if (!name) return push({ type: "error", text: "Category name required." });
    setCatLoading(true);
    try {
      await axiosInstance.post("/api/categories", { category: name });
      setNewCategory("");
      push({ type: "success", text: "Category created." });
      await fetchCategories();
    } catch (err: any) {
      console.error("createCategory", err);
      const msg =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
        err?.message ??
        "Failed to create category.";
      push({ type: "error", text: String(msg) });
    } finally {
      setCatLoading(false);
    }
  };

  const deleteCategory = async (name?: string) => {
    if (
      !name ||
      !confirm(`Are you sure you want to delete category "${name}"?`)
    )
      return;
    try {
      await axiosInstance.delete("/api/categories", {
        data: { category: name },
      });
      push({ type: "success", text: "Category deleted." });
      await fetchCategories();
    } catch (err) {
      console.error("deleteCategory", err);
      push({ type: "error", text: "Failed to delete category." });
    }
  };

  /* ------------------- Cars CRUD + Image UX ------------------- */

  const openEditCar = (c: Car) => {
    setEditingCarId(c._id ?? null);
    // Include image for single URL
    const existingImages =
      c.images && c.images.length > 0 ? c.images : c.image ? [c.image] : [];

    setCarForm({
      name: c.name ?? "",
      brand: c.brand ?? "",
      price: c.price ?? 0,
      description: c.description ?? "",
      image: c.image ?? existingImages[0] ?? "", // Set the single URL field
      images: existingImages,
      contactType: c.contactType ?? "whatsapp",
      contactLink: c.contactLink ?? "",
    });
    carFilesRef.current = existingImages.slice();
    setTab("cars");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetCarForm = () => {
    setEditingCarId(null);
    setCarForm(initialCarForm);
    carFilesRef.current = [];
  };

  const handleCarPaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    // 🛑 USER REQUEST: BLOCK PASTE FUNCTIONALITY FOR CARS
    e.preventDefault();
    push({
      type: "info",
      text: "Image pasting is disabled for Car listings. Use the URL input or Drag & Drop for files.",
    });
  };

  const handleCarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length) {
      carFilesRef.current = [...carFilesRef.current, ...list];
      setCarForm((s) => ({
        ...s,
        images: (s.images ?? []).concat(
          list.map((f) => URL.createObjectURL(f))
        ),
      }));
      push({
        type: "info",
        text: `Added ${list.length} dropped car images. Click 'Create/Save' to upload.`,
      });
    }
  };

  const handleCarFileSelect = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    carFilesRef.current = [...carFilesRef.current, ...arr];
    setCarForm((s) => ({
      ...s,
      images: (s.images ?? []).concat(arr.map((f) => URL.createObjectURL(f))),
    }));
    push({
      type: "info",
      text: `Added ${arr.length} selected car images. Click 'Create/Save' to upload.`,
    });
  };

  const removeCarFileAt = (index: number) => {
    if (carLoading) return;
    carFilesRef.current.splice(index, 1);
    setCarForm((s) => ({
      ...s,
      images: (s.images ?? []).filter((_, i) => i !== index),
    }));
  };

  const moveCarFile = (i: number, dir: -1 | 1) => {
    if (carLoading) return;
    const arr = carFilesRef.current;
    const newIndex = i + dir;
    if (newIndex < 0 || newIndex >= arr.length) return;
    const copy = [...arr];
    const tmp = copy[i];
    copy[i] = copy[newIndex];
    copy[newIndex] = tmp;
    carFilesRef.current = copy;
    setCarForm((s) => ({
      ...s,
      images: (s.images ?? []).map((_, idx) => {
        const val = copy[idx];
        if (typeof val === "string") return val;
        return URL.createObjectURL(val as File);
      }),
    }));
  };

  const createOrUpdateCar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!carForm.name.trim())
      return push({ type: "error", text: "Car name required." });
    setCarLoading(true);
    try {
      const resolved = await resolveFilesToUrls(carFilesRef.current);

      let finalImages = resolved;

      // Logic to handle the single URL input
      const singleUrl = carForm.image?.trim();

      if (singleUrl && singleUrl.startsWith("http")) {
        // If the image list is empty OR if the URL is not already in the list,
        // prepend the single URL as the primary image.
        if (finalImages.length === 0 || finalImages[0] !== singleUrl) {
          finalImages = [
            singleUrl,
            ...finalImages.filter((img) => img !== singleUrl),
          ];
        }
      }

      const payload: any = { ...carForm, images: finalImages };

      const price = Number(carForm.price);
      if (isNaN(price)) throw new Error("Price must be a valid number.");
      payload.price = price;

      if (editingCarId) {
        await axiosInstance.put(`/api/cars/${editingCarId}`, payload);
        push({ type: "success", text: "Car updated successfully." });
      } else {
        await axiosInstance.post("/api/cars", payload);
        push({ type: "success", text: "Car created successfully." });
      }
      await fetchCars();
      resetCarForm();
    } catch (err: any) {
      console.error("createOrUpdateCar", err);
      const msg =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
        err?.message ??
        "Car save failed.";
      push({ type: "error", text: String(msg) });
    } finally {
      setCarLoading(false);
    }
  };

  const deleteCarById = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this car listing?"))
      return;
    try {
      await axiosInstance.delete(`/api/cars/${id}`);
      push({ type: "success", text: "Car deleted." });
      await fetchCars();
    } catch (err) {
      console.error(err);
      push({ type: "error", text: "Failed to delete car." });
    }
  };

  /* ------------------- Orders ------------------- */

  const updateOrderStatus = async (orderId?: string, status?: string) => {
    if (!orderId || !status) return;
    try {
      await axiosInstance.put(`/api/orders/${orderId}`, { status });
      push({ type: "success", text: `Order marked ${status}.` });
      await fetchOrders();
    } catch (err) {
      console.error(err);
      push({ type: "error", text: "Failed to update order status." });
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    router.push("/AdminSection");
  };

  /* ------------------- UI helpers (Render Subcomponents) ------------------- */

  const ImageUploader = ({
    form,
    loading,
    onPaste,
    onDrop,
    onFileSelect,
    onRemoveAt,
    onMoveFile,
    isProduct = true,
  }: {
    form: Product | Car;
    loading: boolean;
    onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onFileSelect: (files: FileList | null) => void;
    onRemoveAt: (index: number) => void;
    onMoveFile: (i: number, dir: -1 | 1) => void;
    isProduct?: boolean;
  }) => {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const images = form.images ?? [];
    const entityName = isProduct ? "Product" : "Car";
    const pasteText = isProduct ? ", paste (Ctrl+V)," : ""; // Dynamically change paste instruction

    return (
      <div className="bg-white border border-dashed border-gray-300 p-4 rounded-xl shadow-inner">
        <div
          tabIndex={0}
          onPaste={onPaste} // This is where the paste event is handled/blocked
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`p-3 rounded-lg text-center cursor-pointer transition-colors ${loading ? "bg-gray-100" : "bg-gray-50 hover:bg-gray-100"}`}
          onClick={() => fileRef.current?.click()}
          role="button"
          aria-label={`Upload or select images for ${entityName}`}
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
            <UploadCloud size={18} className="text-indigo-500" />
            <div>
              Drag & drop{pasteText} or click to select **{entityName} Images**
              <div className="text-xs text-gray-500 mt-0.5">
                Supports Cloudinary URLs (via URL input) and direct file
                uploads.
              </div>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFileSelect(e.target.files)}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.length > 0 ? (
            <AnimatePresence>
              {images.map((src, i) => (
                <motion.div
                  key={src + i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  <img
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute top-0 left-0 bg-indigo-500 text-white text-xs px-1.5 py-0.5 rounded-br-lg font-medium">
                      PRIMARY
                    </span>
                  )}

                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveFile(i, -1);
                        }}
                        title="Move left"
                        className="p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white disabled:opacity-50"
                        disabled={i === 0}
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveFile(i, 1);
                        }}
                        title="Move right"
                        className="p-1.5 bg-white/90 text-gray-800 rounded-full hover:bg-white disabled:opacity-50"
                        disabled={i === images.length - 1}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAt(i);
                      }}
                      title="Remove"
                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-sm text-gray-500 col-span-full py-2 text-center border-t border-gray-100 mt-2">
              No images added yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ------------------- Main Render ------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${t.type === "success" ? "bg-emerald-50 border border-emerald-300 text-emerald-800" : t.type === "error" ? "bg-red-50 border border-red-300 text-red-800" : "bg-slate-50 border border-slate-300 text-slate-800"}`}
            >
              {t.type === "success" && <Zap size={16} />}
              {t.type === "error" && <AlertTriangle size={16} />}
              {t.type === "info" && <span className="text-blue-500">i</span>}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 p-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-white rounded-xl p-4 shadow-xl h-fit sticky top-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Admin Panel</h3>
              <div className="text-xs text-gray-500 font-medium">
                Welcome,{" "}
                {typeof window !== "undefined"
                  ? localStorage.getItem("adminName") || "Admin"
                  : "Admin"}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">
              Navigation
            </h4>
            {[
              { id: "dashboard", label: "Overview" },
              { id: "products", label: "Products" },
              { id: "categories", label: "Categories" },
              { id: "cars", label: "Cars" },
              { id: "orders", label: "Orders" },
              { id: "users", label: "Users" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === item.id ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-100 text-gray-700"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600">
            <div className="mb-3 font-semibold text-gray-700">Quick Stats</div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded">
                <span className="text-gray-500">Products</span>
                <span className="font-bold text-gray-800">
                  {products.length}
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded">
                <span className="text-gray-500">Cars</span>
                <span className="font-bold text-gray-800">{cars.length}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded">
                <span className="text-gray-500">Orders</span>
                <span className="font-bold text-gray-800">{orders.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="bg-white rounded-xl p-5 mb-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Management Overview
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {globalError ? (
                  <span className="text-red-500 font-semibold">
                    {globalError}
                  </span>
                ) : loading ? (
                  "Fetching latest data..."
                ) : (
                  "Manage products, cars, categories, orders, and users."
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-gray-400"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}{" "}
                Refresh All
              </button>
            </div>
          </div>

          <div>
            {/* Dashboard Tab */}
            {tab === "dashboard" && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">
                    Recent Orders
                  </h3>
                  {orders.slice(0, 5).map((o) => (
                    <div
                      key={o._id}
                      className="text-sm text-gray-600 py-3 border-b last:border-b-0 border-gray-100"
                    >
                      <div className="font-medium truncate text-gray-700">
                        #{o._id}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {o.user?.email || "Guest"} • **
                        {formatPrice(o.totalPrice)}**
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-gray-400 text-sm py-3">
                      No recent orders.
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">
                    Recent Users
                  </h3>
                  {users.slice(0, 5).map((u) => (
                    <div
                      key={u._id}
                      className="text-sm text-gray-600 py-3 border-b last:border-b-0 border-gray-100"
                    >
                      <div className="font-medium text-gray-700">
                        {u.name || u.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {u.email}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-gray-400 text-sm py-3">
                      No new users.
                    </div>
                  )}
                </div>

                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">
                    Quick Actions
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setTab("products")}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                    >
                      <Plus size={16} /> Add New Product
                    </button>
                    <button
                      onClick={() => setTab("cars")}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold flex items-center justify-center hover:bg-gray-50 transition"
                    >
                      Add New Car Listing
                    </button>
                  </div>
                </div>
              </section>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Products Tab */}
            {tab === "products" && (
              <section>
                <div className="flex flex-col lg:flex-row gap-6 items-start mb-4">
                  <form
                    onSubmit={createOrUpdateProduct}
                    className="bg-white rounded-xl p-6 shadow-lg flex-1 space-y-4 w-full border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {editingProductId ? "Edit Product" : "Add New Product"}
                      </h2>
                      {editingProductId && (
                        <div className="text-xs text-gray-500">
                          ID: {editingProductId.slice(-6)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        required
                        placeholder="Product Name"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        placeholder="Brand (e.g., Nike, Samsung)"
                        value={productForm.brand}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            brand: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Price (₦)"
                        value={productForm.price || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Stock Quantity"
                        value={productForm.stock || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <input
                      placeholder="Single Image URL (Optional, for quick entry)"
                      value={productForm.image ?? ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.label || c.name}
                        </option>
                      ))}
                    </select>

                    <textarea
                      placeholder="Description"
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />

                    <div>
                      <label className="text-sm font-semibold mb-2 block text-gray-700">
                        Product Images
                      </label>
                      <ImageUploader
                        form={productForm}
                        loading={prodLoading}
                        onPaste={handleProductPaste}
                        onDrop={handleProductDrop}
                        onFileSelect={handleProductFileSelect}
                        onRemoveAt={removeProductFileAt}
                        onMoveFile={moveProductFile}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        disabled={prodLoading}
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-gray-400"
                      >
                        {prodLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}{" "}
                        {editingProductId ? "Save Changes" : "Create Product"}
                      </button>
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={resetProductForm}
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="w-full lg:w-80 bg-white rounded-xl p-4 shadow-lg overflow-y-auto max-h-[700px] border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                      Product List ({products.length})
                    </h3>
                    <div className="space-y-4">
                      {products.map((p) => (
                        <div
                          key={p._id}
                          className="flex gap-4 items-center p-3 border border-gray-100 rounded-lg bg-white shadow-sm"
                        >
                          <img
                            src={
                              (p.images && p.images[0]) ||
                              p.image ||
                              "/placeholder.jpg"
                            }
                            alt={p.name}
                            className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {p.brand} • **{formatPrice(p.price)}**
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="p-2 rounded-full text-red-500 hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="text-sm text-gray-400 py-3 text-center">
                          No products found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Categories Tab */}
            {tab === "categories" && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <form
                    onSubmit={createCategory}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit"
                  >
                    <h3 className="font-bold text-lg mb-3 text-gray-800">
                      Add New Category
                    </h3>
                    <input
                      placeholder="Category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      disabled={catLoading}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
                    >
                      {catLoading ? (
                        <Loader2 size={16} className="animate-spin mx-auto" />
                      ) : (
                        "Create Category"
                      )}
                    </button>
                  </form>

                  <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                      Category List ({categories.length})
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {categories.map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                        >
                          <div>
                            <div className="font-semibold text-gray-700">
                              {c.label || c.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Slug: {c.name}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteCategory(c.name)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium p-1 transition"
                            title="Delete Category"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                      {categories.length === 0 && (
                        <div className="text-gray-400 text-center col-span-2 py-3">
                          No categories defined.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Cars Tab */}
            {tab === "cars" && (
              <section>
                <div className="flex flex-col lg:flex-row gap-6 items-start mb-4">
                  <form
                    onSubmit={createOrUpdateCar}
                    className="bg-white rounded-xl p-6 shadow-lg flex-1 space-y-4 w-full border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-gray-800">
                        {editingCarId ? "Edit Car" : "Add New Car Listing"}
                      </h2>
                      {editingCarId && (
                        <div className="text-xs text-gray-500">
                          ID: {editingCarId.slice(-6)}
                        </div>
                      )}
                    </div>

                    <input
                      required
                      placeholder="Car Name/Model"
                      value={carForm.name}
                      onChange={(e) =>
                        setCarForm({ ...carForm, name: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      placeholder="Brand (e.g., Toyota, BMW)"
                      value={carForm.brand}
                      onChange={(e) =>
                        setCarForm({ ...carForm, brand: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Price (₦)"
                      value={carForm.price || ""}
                      onChange={(e) =>
                        setCarForm({
                          ...carForm,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    {/* DEDICATED URL INPUT FOR CARS */}
                    <input
                      placeholder="Car Primary Image URL (e.g., Cloudinary, AWS S3 link)"
                      value={carForm.image ?? ""}
                      onChange={(e) =>
                        setCarForm({ ...carForm, image: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {/* END URL INPUT */}

                    <div>
                      <label className="text-sm font-semibold mb-2 block text-gray-700">
                        Car Images
                      </label>
                      <ImageUploader
                        form={carForm}
                        loading={carLoading}
                        onPaste={handleCarPaste} // This is the blocked function
                        onDrop={handleCarDrop}
                        onFileSelect={handleCarFileSelect}
                        onRemoveAt={removeCarFileAt}
                        onMoveFile={moveCarFile}
                        isProduct={false}
                      />
                    </div>

                    <textarea
                      placeholder="Description"
                      value={carForm.description}
                      onChange={(e) =>
                        setCarForm({ ...carForm, description: e.target.value })
                      }
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />

                    <div className="flex gap-3">
                      <select
                        value={carForm.contactType}
                        onChange={(e) =>
                          setCarForm({
                            ...carForm,
                            contactType: e.target.value as any,
                          })
                        }
                        className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                      </select>
                      <input
                        placeholder="Contact link (e.g., wa.me/123...)"
                        value={carForm.contactLink}
                        onChange={(e) =>
                          setCarForm({
                            ...carForm,
                            contactLink: e.target.value,
                          })
                        }
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        disabled={carLoading}
                        type="submit"
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-gray-400"
                      >
                        {carLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}{" "}
                        {editingCarId ? "Save Changes" : "Create Listing"}
                      </button>
                      {editingCarId && (
                        <button
                          type="button"
                          onClick={resetCarForm}
                          className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="w-full lg:w-80 bg-white rounded-xl p-4 shadow-lg overflow-y-auto max-h-[700px] border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">
                      Car Listings ({cars.length})
                    </h3>
                    <div className="space-y-4">
                      {cars.map((c) => (
                        <div
                          key={c._id}
                          className="flex gap-4 items-center p-3 border border-gray-100 rounded-lg bg-white shadow-sm"
                        >
                          <img
                            src={c.images?.[0] || "/placeholder-car.jpg"}
                            alt={c.name}
                            className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {c.brand} • **{formatPrice(c.price)}**
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => openEditCar(c)}
                              className="p-2 rounded-full text-indigo-500 hover:bg-indigo-50 transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteCarById(c._id)}
                              className="p-2 rounded-full text-red-500 hover:bg-red-50 transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {cars.length === 0 && (
                        <div className="text-sm text-gray-400 py-3 text-center">
                          No car listings found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Orders Tab */}
            {tab === "orders" && (
              <section>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h2 className="font-bold text-xl mb-4 text-gray-800">
                    Customer Orders
                  </h2>
                  {orders.length === 0 ? (
                    <div className="text-gray-400 py-4 text-center">
                      No orders found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((o) => (
                        <div
                          key={o._id}
                          className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50"
                        >
                          <div className="flex justify-between items-start mb-3 border-b pb-2">
                            <div className="font-semibold text-gray-800">
                              Order #{o._id.slice(-8)}
                            </div>
                            <div className="text-xs text-gray-500 text-right">
                              {new Date(
                                o.createdAt || Date.now()
                              ).toLocaleString()}
                              <br />
                              <span
                                className={`font-medium ${o.status === "delivered" ? "text-emerald-600" : o.status === "shipped" ? "text-blue-600" : "text-orange-600"} uppercase`}
                              >
                                {o.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 font-medium mb-3">
                            **Total: {formatPrice(o.totalPrice)}**
                          </div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">
                            Change Status:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {["processing", "shipped", "delivered"].map((s) => (
                              <button
                                key={s}
                                onClick={() => updateOrderStatus(o._id, s)}
                                disabled={o.status === s}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${o.status === s ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            <hr className="my-6 border-gray-200" />

            {/* Users Tab */}
            {tab === "users" && (
              <section>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                  <h2 className="font-bold text-xl mb-4 text-gray-800">
                    Registered Users
                  </h2>
                  {users.length === 0 ? (
                    <div className="text-gray-400 py-4 text-center">
                      No users found.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {users.map((u) => (
                        <div
                          key={u._id}
                          className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
                        >
                          <div className="font-semibold text-gray-700">
                            {u.name || u.email}
                          </div>
                          <div className="text-xs text-indigo-600 mt-0.5">
                            {u.email}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => alert(JSON.stringify(u, null, 2))}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                            >
                              View Details
                            </button>
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
