const { Router } = require("express");
const {
  createRequest,
  listMyRequests,
  listRequests,
  getRequestByIdHandler,
  assignRequestHandler,
  approveRequestHandler,
  rejectRequestHandler,
  updateMyRequestHandler,
  cancelMyRequestHandler,
} = require("../Controllers/requests.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");
const { validateRequest } = require("../utils/validateRequest");
const {
  createRequestSchema,
  listRequestsSchema,
  requestActionSchema,
  assignRequestSchema,
  updateRequestSchema,
  cancelRequestSchema,
} = require("../Validation/requests.validation");

const router = Router();

router.post(
  "/",
  verifyToken,
  checkRole(["PASSAGER"]),
  validateRequest(createRequestSchema),
  createRequest,
);

router.get(
  "/my",
  verifyToken,
  checkRole(["PASSAGER"]),
  validateRequest(listRequestsSchema),
  listMyRequests,
);

router.get(
  "/",
  verifyToken,
  checkRole(["RESPONSABLE", "ADMIN"]),
  validateRequest(listRequestsSchema),
  listRequests,
);

router.get(
  "/:id",
  verifyToken,
  checkRole(["PASSAGER", "RESPONSABLE", "ADMIN"]),
  validateRequest(requestActionSchema),
  getRequestByIdHandler,
);

router.patch(
  "/:id",
  verifyToken,
  checkRole(["PASSAGER"]),
  validateRequest(updateRequestSchema),
  updateMyRequestHandler,
);

router.patch(
  "/:id/cancel",
  verifyToken,
  checkRole(["PASSAGER"]),
  validateRequest(cancelRequestSchema),
  cancelMyRequestHandler,
);

router.put(
  "/:id/assign",
  verifyToken,
  checkRole(["RESPONSABLE", "ADMIN"]),
  validateRequest(assignRequestSchema),
  assignRequestHandler,
);

router.put(
  "/:id/approve",
  verifyToken,
  checkRole(["RESPONSABLE"]),
  validateRequest(requestActionSchema),
  approveRequestHandler,
);

router.put(
  "/:id/reject",
  verifyToken,
  checkRole(["RESPONSABLE"]),
  validateRequest(requestActionSchema),
  rejectRequestHandler,
);

module.exports = router;
