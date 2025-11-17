import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  brands: [{ type: String, trim: true }], // optional array of brands under this category
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
