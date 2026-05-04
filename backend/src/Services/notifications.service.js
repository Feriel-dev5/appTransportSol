const {
  createNotification,
  findNotificationById,
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../Repository/notification.repository");
const { findMissionById } = require("../Repository/mission.repository");
const { findRequestById } = require("../Repository/request.repository");
const { findIncidentById } = require("../Repository/incident.repository");
const { AppError } = require("../errors/AppError");

const notifyUser = async (userId, message, context = {}) =>
  createNotification({
    userId,
    message,
    type: context.type || "GENERAL",
    requestId: context.requestId,
    missionId: context.missionId,
    incidentId: context.incidentId,
  });

const getNotifications = async (userId, pagination) =>
  listNotifications(userId, pagination);

const getNotificationDetails = async (notificationId, actor) => {
  const notification = await findNotificationById(notificationId);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  const notificationUserId = notification.userId._id
    ? notification.userId._id.toString()
    : notification.userId.toString();
  if (
    notificationUserId !== actor.id &&
    !["ADMIN", "RESPONSABLE"].includes(actor.role)
  ) {
    throw new AppError("Forbidden", 403);
  }

  const details = {};
  if (notification.requestId) {
    details.request = await findRequestById(notification.requestId);
  }
  if (notification.missionId) {
    details.mission = await findMissionById(notification.missionId);
  }
  if (notification.incidentId) {
    details.incident = await findIncidentById(notification.incidentId);
  }

  return { notification, details };
};

module.exports = { notifyUser, getNotifications, getNotificationDetails, markAsRead, markAllAsRead };

async function markAsRead(notificationId, actor) {
  const notification = await findNotificationById(notificationId);
  if (!notification) throw new (require("../errors/AppError").AppError)("Notification not found", 404);
  const ownerId = notification.userId._id
    ? notification.userId._id.toString()
    : notification.userId.toString();
  if (ownerId !== actor.id && !["ADMIN", "RESPONSABLE"].includes(actor.role)) {
    throw new (require("../errors/AppError").AppError)("Forbidden", 403);
  }
  return markNotificationAsRead(notificationId);
}

async function markAllAsRead(userId) {
  return markAllNotificationsAsRead(userId);
}