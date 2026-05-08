const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  getNotifications,
  getNotificationDetails,
  markAsRead,
  markAllAsRead,
  removeNotification,
  removeAllForUser,
} = require("../Services/notifications.service");

const listNotifications = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const notifications = await getNotifications(req.user.id, {
    skip: pagination.skip,
    take: pagination.limit,
  });
  res.json({
    page: pagination.page,
    limit: pagination.limit,
    data: notifications,
  });
});

const getNotificationById = asyncHandler(async (req, res) => {
  const result = await getNotificationDetails(req.params.id, req.user);
  res.json(result);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notif = await markAsRead(req.params.id, req.user);
  res.json({ notification: notif });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.id);
  res.json({ message: "All notifications marked as read" });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await removeNotification(req.params.id, req.user);
  res.json({ message: "Notification deleted successfully" });
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  await removeAllForUser(req.user.id);
  res.json({ message: "All notifications deleted successfully" });
});

module.exports = {
  listNotifications,
  getNotificationById,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
};