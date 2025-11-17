import Car from "../models/Car.js";

/* ============================
   🧑‍💼 Admin: Create new car
   POST /api/cars
============================ */
export const createCar = async (req, res) => {
  try {
    const { name, brand, price, description, images, contactType, contactLink } = req.body;

    if (!name || !brand || !price || !contactLink) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided (name, brand, price, contactLink).",
      });
    }

    const newCar = new Car({
      name,
      brand,
      price,
      description: description || "",
      images: Array.isArray(images) ? images : [],
      contactType: contactType || "whatsapp",
      contactLink,
    });

    await newCar.save();

    res.status(201).json({
      success: true,
      message: "✅ Car created successfully.",
      data: newCar,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error creating car: ${error.message}` });
  }
};

/* ============================
   🌍 Public: Get all cars
   GET /api/cars
============================ */
export const getCars = async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error fetching cars: ${error.message}` });
  }
};

/* ============================
   🧑‍💼 Admin: Delete a car
   DELETE /api/cars/:id
============================ */
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) return res.status(404).json({ success: false, message: "Car not found." });

    res.status(200).json({
      success: true,
      message: "🗑️ Car deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error deleting car: ${error.message}` });
  }
};

/* ============================
   🧑‍💼 Admin: Update a car
   PUT /api/cars/:id
============================ */
export const updateCar = async (req, res) => {
  try {
    const { name, brand, price, description, images, contactType, contactLink } = req.body;

    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: "Car not found." });

    car.name = name || car.name;
    car.brand = brand || car.brand;
    car.price = price || car.price;
    car.description = description || car.description;
    car.images = Array.isArray(images) ? images : car.images;
    car.contactType = contactType || car.contactType;
    car.contactLink = contactLink || car.contactLink;

    await car.save();

    res.status(200).json({
      success: true,
      message: "✏️ Car updated successfully.",
      data: car,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Error updating car: ${error.message}` });
  }
};
