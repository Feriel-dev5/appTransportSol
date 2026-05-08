const {
  createNotification,
  listNotifications,
  findNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  deleteAllNotificationsForUser,
} = require("../Repository/notification.repository");
const { findMissionById } = require("../Repository/mission.repository");
const { findRequestById } = require("../Repository/request.repository");
const { findIncidentById } = require("../Repository/incident.repository");
const { listUsers } = require("../Repository/user.repository");
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

const notifyResponsables = async (message, context = {}) => {
  const responsables = await listUsers({ skip: 0, take: 100, role: "RESPONSABLE" });
  const promises = (responsables || []).map((r) => notifyUser(r.id || r._id, message, context));
  return Promise.all(promises);
};

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

module.exports = {
  notifyUser,
  notifyResponsables,
  getNotifications,
  getNotificationDetails,
  markAsRead,
  markAllAsRead,
  removeNotification,
  removeAllForUser,
};

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

async function removeNotification(notificationId, actor) {
  const notification = await findNotificationById(notificationId);
  if (!notification) throw new AppError("Notification not found", 404);
  const ownerId = notification.userId._id
    ? notification.userId._id.toString()
    : notification.userId.toString();
  if (ownerId !== actor.id && !["ADMIN", "RESPONSABLE"].includes(actor.role)) {
    throw new AppError("Forbidden", 403);
  }
  return deleteNotificationById(notificationId);
}

async function removeAllForUser(userId) {
  return deleteAllNotificationsForUser(userId);
}