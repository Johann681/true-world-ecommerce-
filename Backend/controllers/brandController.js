import Product from "../models/Product.js";

/* ============================
   🏷️ ADD NEW BRAND (Admin)
============================ */
export const addBrand = async (req, res) => {
  try {
    const { brand } = req.body;
    if (!brand)
      return res.status(400).json({ success: false, message: "Brand name is required." });

    const existingBrands = await Product.distinct("brand");
    if (existingBrands.includes(brand)) {
      return res.status(400).json({ success: false, message: "Brand already exists." });
    }

    res.status(201).json({
      success: true,
      message: `✅ Brand '${brand}' added successfully.`,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error adding brand: ${error.message}` });
  }
};

/* ============================
   🗑️ DELETE BRAND (Admin)
============================ */
export const deleteBrand = async (req, res) => {
  try {
    const { brand } = req.body;
    if (!brand)
      return res.status(400).json({ success: false, message: "Brand name is required." });

    const existingBrands = await Product.distinct("brand");
    if (!existingBrands.includes(brand)) {
      return res.status(404).json({ success: false, message: "Brand not found." });
    }

    await Product.updateMany({ brand }, { $set: { brand: "Unbranded" } });

    res.status(200).json({ success: true, message: `🗑️ Brand '${brand}' deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error deleting brand: ${error.message}` });
  }
};
