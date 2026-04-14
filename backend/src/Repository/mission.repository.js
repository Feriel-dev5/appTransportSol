const Mission = require("./models/mission.model");

const missionPopulate = [
  { path: "requestId", populate: { path: "userId", select: "-password" } },
  { path: "driverId", select: "-password" },
  "vehicleId",
];

const missionStatusAliases = {
  EN_ATTENTE: ["EN_ATTENTE", "PENDING"],
  EN_COURS: ["EN_COURS", "IN_PROGRESS"],
  TERMINEE: ["TERMINEE", "DONE"],
  ANNULEE: ["ANNULEE", "CANCELLED"],
  PENDING: ["PENDING", "EN_ATTENTE"],
  IN_PROGRESS: ["IN_PROGRESS", "EN_COURS"],
  DONE: ["DONE", "TERMINEE"],
  CANCELLED: ["CANCELLED", "ANNULEE"],
};

const normalizeMissionStatus = (status) => {
  if (!status) return null;
  const values = Array.isArray(status) ? status : [status];
  const expanded = values.flatMap(
    (value) => missionStatusAliases[value] || [value],
  );
  return [...new Set(expanded)];
};

const createMission = (data) =>
  Mission.create(data).then((mission) => mission.populate(missionPopulate));

const findMissionById = (id) =>
  Mission.findById(id).populate(missionPopulate).exec();

const buildMissionFilter = ({ driverId, status, requestIds } = {}) => {
  const filter = {};

  if (driverId) {
    filter.driverId = driverId;
  }

  if (status) {
    const normalized = normalizeMissionStatus(status);
    filter.status =
      normalized.length === 1 ? normalized[0] : { $in: normalized };
  }

  if (requestIds && requestIds.length > 0) {
    filter.requestId = { $in: requestIds };
  }

  return filter;
};

const listMissions = ({ skip, take, status, requestIds }) =>
  Mission.find(buildMissionFilter({ status, requestIds }))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate(missionPopulate)
    .exec();

const listMissionsForDriver = (driverId, { skip, take, status, requestIds }) =>
  Mission.find(buildMissionFilter({ driverId, status, requestIds }))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate(missionPopulate)
    .exec();

const updateMission = (id, data) =>
  Mission.findByIdAndUpdate(id, data, { new: true }).exec();

const countDriverActiveMissions = (driverId, requestIds) => {
  const normalized = normalizeMissionStatus(["EN_ATTENTE", "EN_COURS"]);
  return Mission.countDocuments({
    driverId,
    status: { $in: normalized },
    requestId: { $in: requestIds },
  }).exec();
};

const findVehicleConflict = (vehicleId, requestIds) => {
  const normalized = normalizeMissionStatus(["EN_ATTENTE", "EN_COURS"]);
  return Mission.findOne({
    vehicleId,
    status: { $in: normalized },
    requestId: { $in: requestIds },
  }).exec();
};

const listMissionsByRequestIds = (requestIds, { status } = {}) => {
  const filter = { requestId: { $in: requestIds } };
  if (status && status.length > 0) {
    const normalized = normalizeMissionStatus(status);
    filter.status = { $in: normalized };
  }

  return Mission.find(filter).populate(missionPopulate).exec();
};

const countMissions = ({ status, requestIds } = {}) =>
  Mission.countDocuments(buildMissionFilter({ status, requestIds })).exec();

const countDriverMissions = ({ driverId, status, requestIds } = {}) =>
  Mission.countDocuments(
    buildMissionFilter({ driverId, status, requestIds }),
  ).exec();

module.exports = {
  createMission,
  findMissionById,
  listMissions,
  listMissionsForDriver,
  updateMission,
  countDriverActiveMissions,
  findVehicleConflict,
  listMissionsByRequestIds,
  countMissions,
  countDriverMissions,
};
