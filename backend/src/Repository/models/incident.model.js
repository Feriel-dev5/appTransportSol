const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    // Pour les réclamations chauffeur
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Pour les réclamations passager
    passagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
    },
    description: { type: String, required: true, trim: true },
    // Catégorie pour passager: APPLICATION | CHAUFFEUR | SERVICE
    // Catégorie pour chauffeur: INCIDENT (défaut)
    categorie: {
      type: String,
      enum: ["APPLICATION", "CHAUFFEUR", "SERVICE", "INCIDENT"],
      default: "INCIDENT",
    },
    // Qui a créé: CHAUFFEUR | PASSAGER
    authorRole: {
      type: String,
      enum: ["CHAUFFEUR", "PASSAGER"],
      default: "CHAUFFEUR",
    },
    status: {
      type: String,
      enum: ["OUVERT", "RESOLU"],
      default: "OUVERT",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Incident", IncidentSchema);