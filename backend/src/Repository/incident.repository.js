const Incident = require("./models/incident.model");

const createIncident = (data) => Incident.create(data);

const findIncidentById = (id) =>
  Incident.findById(id)
    .populate({ path: "driverId", select: "-password" })
    .populate({ path: "passagerId", select: "-password" })
    .populate("missionId")
    .exec();

const listIncidents = ({ skip, take, status }) =>
  Incident.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate({ path: "driverId", select: "-password" })
    .populate({ path: "passagerId", select: "-password" })
    .populate("missionId")
    .exec();

const listIncidentsForDriver = (driverId, { skip, take, status }) =>
  Incident.find({ driverId, ...(status ? { status } : {}) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate("missionId")
    .exec();

const listIncidentsForPassager = (passagerId, { skip, take, status }) =>
  Incident.find({ passagerId, ...(status ? { status } : {}) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate("missionId")
    .exec();

const countIncidents = (status) =>
  Incident.countDocuments(status ? { status } : {}).exec();

const countIncidentsForUser = (query) =>
  Incident.countDocuments(query).exec();

const deleteIncidentById = (id) => Incident.findByIdAndDelete(id).exec();

const deleteAllIncidentsForUser = (query) => Incident.deleteMany(query).exec();

module.exports = {
  createIncident,
  findIncidentById,
  listIncidents,
  listIncidentsForDriver,
  listIncidentsForPassager,
  countIncidents,
  countIncidentsForUser,
  deleteIncidentById,
  deleteAllIncidentsForUser,
};