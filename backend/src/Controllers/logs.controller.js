const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const { getLogs } = require("../Services/logs.service");

const listLogs = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const logs = await getLogs({ skip: pagination.skip, take: pagination.limit });
  res.json({ page: pagination.page, limit: pagination.limit, data: logs });
});

module.exports = { listLogs };
