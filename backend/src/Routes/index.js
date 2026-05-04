const { Router } = require("express");

const authRoutes = require("./auth.routes");
const userRoutes = require("./users.routes");
const requestRoutes = require("./requests.routes");
const missionRoutes = require("./missions.routes");
const vehicleRoutes = require("./vehicles.routes");
const notificationRoutes = require("./notifications.routes");
const logRoutes = require("./logs.routes");
const incidentRoutes = require("./incidents.routes");
const avisRoutes = require("./avis.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/requests", requestRoutes);
router.use("/missions", missionRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/notifications", notificationRoutes);
router.use("/logs", logRoutes);
router.use("/incidents", incidentRoutes);
router.use("/avis", avisRoutes);

module.exports = router;
