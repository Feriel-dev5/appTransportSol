const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  reportIncident,
  reportPassagerIncident,
  getIncidents,
  getDriverIncidents,
  getPassagerIncidents,
  removeIncident,
  removeAllMyIncidents,
} = require("../Services/incidents.service");

const createIncident = asyncHandler(async (req, res) => {
  const incident = await reportIncident(req.user.id, req.body);
  res.status(201).json({ incident });
});

const createPassagerIncident = asyncHandler(async (req, res) => {
  const incident = await reportPassagerIncident(req.user.id, req.body);
  res.status(201).json({ incident });
});

const listIncidents = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const incidents = await getIncidents(pagination, req.query.status);
  res.json({ page: pagination.page, limit: pagination.limit, data: incidents });
});

const listMyIncidents = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  let incidents;
  if (req.user.role === "PASSAGER") {
    incidents = await getPassagerIncidents(req.user.id, pagination, req.query.status);
  } else {
    incidents = await getDriverIncidents(req.user.id, pagination, req.query.status);
  }
  res.json({ page: pagination.page, limit: pagination.limit, data: incidents });
});

const deleteIncident = asyncHandler(async (req, res) => {
  await removeIncident(req.params.id, req.user.id, req.user.role);
  res.json({ message: "Incident deleted successfully" });
});

const deleteAllMyIncidents = asyncHandler(async (req, res) => {
  await removeAllMyIncidents(req.user.id, req.user.role);
  res.json({ message: "All incidents deleted successfully" });
});

module.exports = {
  createIncident,
  createPassagerIncident,
  listIncidents,
  listMyIncidents,
  deleteIncident,
  deleteAllMyIncidents,
};