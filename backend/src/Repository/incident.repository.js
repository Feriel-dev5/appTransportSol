const Incident = require("./models/incident.model");

const createIncident = (data) => Incident.create(data);

const listIncidents = ({ skip, take, status }) =>
  Incident.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate({ path: "driverId", select: "-password" })
    .populate("missionId")
    .exec();

const listIncidentsForDriver = (driverId, { skip, take, status }) =>
  Incident.find({ driverId, ...(status ? { status } : {}) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate("missionId")
    .exec();

const countIncidents = (status) =>
  Incident.countDocuments(status ? { status } : {}).exec();

module.exports = {
  createIncident,
  listIncidents,
  listIncidentsForDriver,
  countIncidents,
};
