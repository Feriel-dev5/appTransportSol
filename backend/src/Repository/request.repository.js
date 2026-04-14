const Request = require("./models/request.model");

const createRequest = (data) => Request.create(data);

const buildRequestFilter = ({ userId, status, startDate, endDate } = {}) => {
  const filter = {};

  if (userId) {
    filter.userId = userId;
  }

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = startDate;
    }
    if (endDate) {
      filter.date.$lte = endDate;
    }
  }

  return filter;
};

const missionPopulate = {
  path: "mission",
  populate: [{ path: "driverId", select: "-password" }, { path: "vehicleId" }],
};

const findRequestById = (id) =>
  Request.findById(id)
    .populate({ path: "userId", select: "-password" })
    .populate(missionPopulate)
    .exec();

const listRequestsForUser = (
  userId,
  { skip, take, status, startDate, endDate },
) =>
  Request.find(buildRequestFilter({ userId, status, startDate, endDate }))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate(missionPopulate)
    .exec();

const listRequests = ({ skip, take, status, startDate, endDate }) =>
  Request.find(buildRequestFilter({ status, startDate, endDate }))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate({ path: "userId", select: "-password" })
    .populate(missionPopulate)
    .exec();

const countRequests = ({ userId, status, startDate, endDate } = {}) =>
  Request.countDocuments(
    buildRequestFilter({ userId, status, startDate, endDate }),
  ).exec();

const listUpcomingRequestsForUser = (userId, { after, take }) =>
  Request.find({ userId, status: "APPROUVEE", date: { $gte: after } })
    .sort({ date: 1 })
    .limit(take)
    .exec();

const updateRequestById = (id, data) =>
  Request.findByIdAndUpdate(id, data, { new: true }).exec();

const updateRequestStatus = (id, status) =>
  Request.findByIdAndUpdate(id, { status }, { new: true }).exec();

const findRequestIdsByDateRange = (start, end) =>
  Request.find({ date: { $gte: start, $lte: end } })
    .select("_id")
    .exec();

const findRequestIdsAfterDate = (after) =>
  Request.find({ date: { $gte: after } })
    .select("_id")
    .exec();

const findRequestIdsBeforeDate = (before) =>
  Request.find({ date: { $lte: before } })
    .select("_id")
    .exec();

module.exports = {
  createRequest,
  findRequestById,
  listRequestsForUser,
  listRequests,
  countRequests,
  listUpcomingRequestsForUser,
  updateRequestStatus,
  updateRequestById,
  findRequestIdsByDateRange,
  findRequestIdsAfterDate,
  findRequestIdsBeforeDate,
};
