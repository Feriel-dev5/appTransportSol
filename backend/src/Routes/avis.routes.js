const { Router } = require("express");
const {
  createAvis,
  listAvis,
  modererAvis,
  getAcceptedAvis,
} = require("../Controllers/avis.controller");
const { validateRequest } = require("../utils/validateRequest");
const {
  createAvisSchema,
  listAvisSchema,
  modererAvisSchema,
} = require("../Validation/avis.validation");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");

const router = Router();

router.get("/acceptes", getAcceptedAvis);

router.post("/", verifyToken, validateRequest(createAvisSchema), createAvis);

router.get(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE", "PASSAGER"]),
  validateRequest(listAvisSchema),
  listAvis
);

router.patch(
  "/:id/moderer",
  verifyToken,
  checkRole(["ADMIN"]),
  validateRequest(modererAvisSchema),
  modererAvis
);

module.exports = router;