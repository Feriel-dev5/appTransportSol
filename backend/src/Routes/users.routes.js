const { Router } = require("express");
const {
  createUser,
  listUsers,
  getMyProfile,
  updateMyProfile,
  updateUser,
  passengerDashboard,
  driverDashboard,
  responsableDashboard,
} = require("../Controllers/users.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");
const { validateRequest } = require("../utils/validateRequest");
const {
  createUserSchema,
  listUsersSchema,
  updateProfileSchema,
  updateUserSchema,
} = require("../Validation/users.validation");

const router = Router();

router.post(
  "/",
  verifyToken,
  checkRole(["ADMIN"]),
  validateRequest(createUserSchema),
  createUser,
);

router.get(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(listUsersSchema),
  listUsers,
);

router.get("/me", verifyToken, getMyProfile);

router.patch(
  "/me",
  verifyToken,
  validateRequest(updateProfileSchema),
  updateMyProfile,
);

router.patch(
  "/:id",
  verifyToken,
  checkRole(["ADMIN"]),
  validateRequest(updateUserSchema),
  updateUser,
);

router.get(
  "/me/dashboard",
  verifyToken,
  checkRole(["PASSAGER"]),
  passengerDashboard,
);

router.get(
  "/me/driver-dashboard",
  verifyToken,
  checkRole(["CHAUFFEUR"]),
  driverDashboard,
);

router.get(
  "/me/responsable-dashboard",
  verifyToken,
  checkRole(["RESPONSABLE", "ADMIN"]),
  responsableDashboard,
);

module.exports = router;
