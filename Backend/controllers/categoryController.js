import Product from "../models/Product.js";
import mongoose from "mongoose";

// Optional: separate collection for standalone categories
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    label: { type: String, trim: true },
  },
  { timestamps: true }
);
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

/* ============================
   🏷️ GET ALL CATEGORIES & BRANDS
============================ */
export const getProductCategories = async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    const productCategories = await Product.distinct("category");
    const storedCategories = await Category.find({}, "name label");

    const categories = [
      ...new Map(
        [
          ...productCategories.map(c => ({ name: c, label: c })),
          ...storedCategories.map(c => ({ name: c.name, label: c.label || c.name })),
        ].map(c => [c.name, c])
      ).values()
    ];

    res.status(200).json({
      success: true,
      data: {
        brands: brands.map(b => ({ name: b, label: b })),
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error fetching categories: ${error.message}` });
  }
};

/* ============================
   🏷️ ADD NEW CATEGORY (Admin)
============================ */
export const addCategory = async (req, res) => {
  try {
    const { category, label } = req.body;
    if (!category)
      return res.status(400).json({ success: false, message: "Category name is required." });

    const existingCategories = await Product.distinct("category");
    const existingStored = await Category.findOne({ name: category });

    if (existingCategories.includes(category) || existingStored) {
      return res.status(400).json({ success: false, message: "Category already exists." });
    }

    const newCategory = new Category({ name: category, label: label || category });
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: `✅ Category '${category}' added successfully.`,
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error adding category: ${error.message}` });
  }
};

/* ============================
   🗑️ DELETE CATEGORY (Admin)
============================ */
export const deleteCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category)
      return res.status(400).json({ success: false, message: "Category name is required." });

    const existingCategories = await Product.distinct("category");
    const existingStored = await Category.findOne({ name: category });

    if (!existingCategories.includes(category) && !existingStored) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    // Move any products under this category to "Uncategorized"
    await Product.updateMany({ category }, { $set: { category: "Uncategorized" } });

    // Remove from standalone Category collection if exists
    if (existingStored) await existingStored.deleteOne();

    res.status(200).json({ success: true, message: `🗑️ Category '${category}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error deleting category: ${error.message}` });
  }
};
