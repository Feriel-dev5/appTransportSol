const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    numeroPermis: { type: String, trim: true, required: false },

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
      // default: "RESPONSABLE",
    },
    availability: {
      type: String,
      enum: ["DISPONIBLE", "OCCUPE", "INDISPONIBLE"],
      default: "DISPONIBLE",
    },
    phone: { type: String },
    passportNumber: { type: String, trim: true },
    cin: { type: String, trim: true },
    address: { type: String, trim: true },
    photo: { type: String },
  },

  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
