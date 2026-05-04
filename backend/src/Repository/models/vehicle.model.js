const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    plate: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    model: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["BUS", "MINIBUS", "BERLINE"],
      required: true,
      set: (v) => v?.toUpperCase(),
    },
    capacity: { type: Number, required: true, min: 1 },
    year: { type: Number },
    color: { type: String, trim: true },
    fuelType: { type: String, trim: true },
    mileage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["DISPONIBLE", "MAINTENANCE", "OCCUPE"],
      default: "DISPONIBLE",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
