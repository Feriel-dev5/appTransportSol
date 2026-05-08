const { Router } = require("express");
const {
  createUser,
  listUsers,
  getMyProfile,
  updateMyProfile,
  updateUser,
  deleteUser,
  passengerDashboard,
  driverDashboard,
  responsableDashboard,
  adminDashboard,
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
  checkRole(["ADMIN", "RESPONSABLE"]),
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
  checkRole(["ADMIN", "RESPONSABLE"]),
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

router.get(
  "/me/admin-dashboard",
  verifyToken,
  checkRole(["ADMIN"]),
  adminDashboard,
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  deleteUser
);

module.exports = router;
