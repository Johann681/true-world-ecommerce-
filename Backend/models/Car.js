import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    images: [{ type: String }], // array of image URLs
    contactType: {
      type: String,
      enum: ["whatsapp", "instagram"],
      default: "whatsapp",
    },
    contactLink: { type: String, required: true }, // e.g., WhatsApp link or Instagram link
  },
  { timestamps: true }
);

const Car = mongoose.models.Car || mongoose.model("Car", carSchema);

export default Car;
