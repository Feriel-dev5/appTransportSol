const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
    },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["OUVERT", "RESOLU"],
      default: "OUVERT",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Incident", IncidentSchema);
