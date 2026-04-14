const mongoose = require("mongoose");

const MissionSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
      unique: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    status: {
      type: String,
      enum: ["EN_ATTENTE", "EN_COURS", "TERMINEE", "ANNULEE"],
      default: "EN_ATTENTE",
    },
    startTime: { type: Date },
    endTime: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mission", MissionSchema);
