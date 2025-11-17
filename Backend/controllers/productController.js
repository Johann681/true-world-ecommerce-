import Product from "../models/Product.js";

/* ============================
   📦 ADD A NEW PRODUCT (Admin)
============================ */
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, brand, stock } = req.body;

    if (!name || !description || !price || !image || !category || !brand) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      brand,
      stock,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "✅ Product added successfully.",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error adding product: ${error.message}` });
  }
};

/* ============================
   📦 GET ALL PRODUCTS
============================ */
export const getAllProducts = async (req, res) => {
  try {
    const { category, brand } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error fetching products: ${error.message}` });
  }
};

/* ============================
   📦 GET PRODUCT BY ID
============================ */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error fetching product: ${error.message}` });
  }
};

/* ============================
   ✏️ UPDATE PRODUCT
============================ */
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ success: false, message: "Product not found." });

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error updating product: ${error.message}` });
  }
};

/* ============================
   🗑️ DELETE PRODUCT
============================ */
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found." });

    res.status(200).json({ success: true, message: "🗑️ Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error deleting product: ${error.message}` });
  }
};
