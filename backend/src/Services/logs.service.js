const { createLog, listLogs } = require("../Repository/log.repository");

const logAction = async (userId, action) => createLog({ userId, action });

const getLogs = async (pagination) => listLogs(pagination);

module.exports = { logAction, getLogs };
