const Notification = require("./models/notification.model");

const createNotification = (data) => Notification.create(data);

const listNotifications = (userId, { skip, take }) =>
  Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .exec();

module.exports = { createNotification, listNotifications };
