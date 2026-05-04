const Notification = require("./models/notification.model");

const createNotification = (data) => Notification.create(data);

const findNotificationById = (id) => Notification.findById(id).exec();

const listNotifications = (userId, { skip, take }) =>
  Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .exec();

const markNotificationAsRead = (id) =>
  Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();

const markAllNotificationsAsRead = (userId) =>
  Notification.updateMany({ userId, isRead: false }, { isRead: true }).exec();

module.exports = {
  createNotification,
  findNotificationById,
  listNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};