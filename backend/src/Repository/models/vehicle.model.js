const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["DISPONIBLE", "MAINTENANCE", "OCCUPE"],
      default: "DISPONIBLE",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
