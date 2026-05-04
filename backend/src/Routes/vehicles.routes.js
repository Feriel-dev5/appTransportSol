const { Router } = require("express");
const {
  createVehicle,
  listVehicles,
  updateVehicle,
} = require("../Controllers/vehicles.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");
const { validateRequest } = require("../utils/validateRequest");
const {
  createVehicleSchema,
  listVehiclesSchema,
  updateVehicleSchema,
} = require("../Validation/vehicles.validation");

const router = Router();

router.post(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(createVehicleSchema),
  createVehicle,
);

router.get("/", verifyToken, validateRequest(listVehiclesSchema), listVehicles);

router.put(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(updateVehicleSchema),
  updateVehicle,
);

module.exports = router;
