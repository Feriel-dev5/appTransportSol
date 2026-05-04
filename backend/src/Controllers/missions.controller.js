const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  getAllMissions,
  getDriverMissions,
  getMissionDetails,
  createManualMission,
  updateMissionByManager,
  startMission,
  endMission,
} = require("../Services/missions.service");

const listMissions = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const missions = await getAllMissions(pagination, req.query);
  res.json({ page: pagination.page, limit: pagination.limit, data: missions });
});

const listMyMissions = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const missions = await getDriverMissions(req.user.id, pagination, req.query);
  res.json({ page: pagination.page, limit: pagination.limit, data: missions });
});

const getMissionById = asyncHandler(async (req, res) => {
  const mission = await getMissionDetails(req.params.id, req.user);
  res.json({ mission });
});

const createMission = asyncHandler(async (req, res) => {
  const mission = await createManualMission(req.body, req.user.id);
  res.status(201).json({ mission });
});

const updateMission = asyncHandler(async (req, res) => {
  const mission = await updateMissionByManager(
    req.params.id,
    req.body,
    req.user.id,
  );
  res.json({ mission });
});

const startMissionHandler = asyncHandler(async (req, res) => {
  const mission = await startMission(req.params.id, req.user.id);
  res.json({ mission });
});

const endMissionHandler = asyncHandler(async (req, res) => {
  const mission = await endMission(req.params.id, req.user.id);
  res.json({ mission });
});

module.exports = {
  listMissions,
  listMyMissions,
  getMissionById,
  createMission,
  updateMission,
  startMissionHandler,
  endMissionHandler,
};
