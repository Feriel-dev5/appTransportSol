const Log = require("./models/log.model");

const createLog = (data) => Log.create(data);

const listLogs = ({ skip, take }) =>
  Log.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate({ path: "userId", select: "-password" })
    .exec();

module.exports = { createLog, listLogs };
