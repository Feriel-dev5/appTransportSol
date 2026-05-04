const mongoose = require("mongoose");

const AvisSchema = new mongoose.Schema(
  {
    categorie: {
      type: String,
      enum: ["chauffeur", "services", "application"],
      required: true,
    },
    note: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Avis", AvisSchema);
