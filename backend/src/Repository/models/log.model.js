const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Log", LogSchema);
