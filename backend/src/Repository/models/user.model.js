const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "RESPONSABLE", "CHAUFFEUR", "PASSAGER"],
      required: true,
      default: "PASSAGER",
    },
    availability: {
      type: String,
      enum: ["DISPONIBLE", "OCCUPE"],
      default: "DISPONIBLE",
    },
    phone: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
