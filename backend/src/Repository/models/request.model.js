const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, trim: true },
    passengers: { type: Number, required: true, min: 1 },
    comment: { type: String, trim: true },
    type: { type: String, enum: ["standard", "vip"], default: "standard" },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    passengerList: { type: Array, default: [] },
    status: {
      type: String,
      enum: ["EN_ATTENTE", "APPROUVEE", "REJETEE", "ANNULEE"],
      default: "EN_ATTENTE",
    },
  },
  { timestamps: true },
);

RequestSchema.virtual("mission", {
  ref: "Mission",
  localField: "_id",
  foreignField: "requestId",
  justOne: true,
});

RequestSchema.set("toObject", { virtuals: true });
RequestSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Request", RequestSchema);
