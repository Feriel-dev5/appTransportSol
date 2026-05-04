const { Router } = require("express");
const { listLogs } = require("../Controllers/logs.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");
const { validateRequest } = require("../utils/validateRequest");
const { listLogsSchema } = require("../Validation/logs.validation");

const router = Router();

router.get(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(listLogsSchema),
  listLogs,
);

module.exports = router;
