const { Router } = require("express");
const {
  createIncident,
  createPassagerIncident,
  listIncidents,
  listMyIncidents,
} = require("../Controllers/incidents.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");
const { validateRequest } = require("../utils/validateRequest");
const {
  createIncidentSchema,
  createPassagerIncidentSchema,
  listIncidentsSchema,
} = require("../Validation/incidents.validation");

const router = Router();

// Chauffeur: signaler un incident de mission
router.post(
  "/",
  verifyToken,
  checkRole(["CHAUFFEUR"]),
  validateRequest(createIncidentSchema),
  createIncident,
);

// Passager: soumettre une réclamation (APPLICATION | CHAUFFEUR | SERVICE)
router.post(
  "/passager",
  verifyToken,
  checkRole(["PASSAGER"]),
  validateRequest(createPassagerIncidentSchema),
  createPassagerIncident,
);

router.get(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(listIncidentsSchema),
  listIncidents,
);

router.get(
  "/my",
  verifyToken,
  checkRole(["CHAUFFEUR", "PASSAGER"]),
  validateRequest(listIncidentsSchema),
  listMyIncidents,
);

module.exports = router;