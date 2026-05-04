const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  reportIncident,
  reportPassagerIncident,
  getIncidents,
  getDriverIncidents,
  getPassagerIncidents,
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

module.exports = { createIncident, createPassagerIncident, listIncidents, listMyIncidents };