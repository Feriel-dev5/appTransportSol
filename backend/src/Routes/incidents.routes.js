const { Router } = require("express");
const {
  createIncident,
  createPassagerIncident,
  listIncidents,
  listMyIncidents,
  deleteIncident,
  deleteAllMyIncidents,
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

router.delete(
  "/my/all",
  verifyToken,
  checkRole(["CHAUFFEUR", "PASSAGER"]),
  deleteAllMyIncidents,
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(["CHAUFFEUR", "PASSAGER", "ADMIN", "RESPONSABLE"]),
  deleteIncident,
);

module.exports = router;