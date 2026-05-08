const { Router } = require("express");
const {
  listNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../Controllers/notifications.controller");
const { verifyToken } = require("../middlewares/verifyToken");
const { validateRequest } = require("../utils/validateRequest");
const {
  listNotificationsSchema,
  notificationActionSchema,
} = require("../Validation/notifications.validation");

const router = Router();

router.get(
  "/",
  verifyToken,
  validateRequest(listNotificationsSchema),
  listNotifications,
);

router.patch("/read-all", verifyToken, markAllNotificationsRead);

router.get(
  "/:id",
  verifyToken,
  validateRequest(notificationActionSchema),
  getNotificationById,
);

router.patch(
  "/:id/read",
  verifyToken,
  validateRequest(notificationActionSchema),
  markNotificationRead,
);

router.delete("/", verifyToken, deleteAllNotifications);
router.delete("/:id", verifyToken, validateRequest(notificationActionSchema), deleteNotification);

module.exports = router;