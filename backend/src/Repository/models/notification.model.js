const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true },
    type: { type: String, required: true },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", NotificationSchema);
