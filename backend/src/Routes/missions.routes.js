const { Router } = require("express");
const {
  listMissions,
  listMyMissions,
  getMissionById,
  createMission,
  updateMission,
  startMissionHandler,
  endMissionHandler,
  cancelMissionHandler,
} = require("../Controllers/missions.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { checkRole } = require("../middlewares/checkRole");
const { validateRequest } = require("../utils/validateRequest");
const {
  listMissionsSchema,
  missionActionSchema,
  createMissionSchema,
  updateMissionSchema,
} = require("../Validation/missions.validation");

const router = Router();

router.get(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(listMissionsSchema),
  listMissions,
);

router.post(
  "/",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(createMissionSchema),
  createMission,
);

router.get(
  "/my",
  verifyToken,
  checkRole(["CHAUFFEUR"]),
  validateRequest(listMissionsSchema),
  listMyMissions,
);

router.get(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE", "CHAUFFEUR"]),
  validateRequest(missionActionSchema),
  getMissionById,
);

router.put(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "RESPONSABLE"]),
  validateRequest(updateMissionSchema),
  updateMission,
);

router.put(
  "/:id/start",
  verifyToken,
  checkRole(["CHAUFFEUR"]),
  validateRequest(missionActionSchema),
  startMissionHandler,
);

router.put(
  "/:id/end",
  verifyToken,
  checkRole(["CHAUFFEUR"]),
  validateRequest(missionActionSchema),
  endMissionHandler,
);

router.put(
  "/:id/cancel",
  verifyToken,
  checkRole(["CHAUFFEUR"]),
  validateRequest(missionActionSchema),
  cancelMissionHandler,
);

module.exports = router;
