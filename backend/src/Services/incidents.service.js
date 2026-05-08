const { AppError } = require("../errors/AppError");
const IncidentRepository = require("../Repository/incident.repository");
const { findMissionById } = require("../Repository/mission.repository");
const { logAction } = require("./logs.service");
const { notifyResponsables } = require("./notifications.service");

// Chauffeur: signaler un incident de mission
const reportIncident = async (driverId, payload) => {
  let mission = null;
  if (payload.missionId) {
    mission = await findMissionById(payload.missionId);
    if (!mission) throw new AppError("Mission not found", 404);
    const missionDriverId = mission.driverId._id
      ? mission.driverId._id.toString()
      : mission.driverId.toString();
    if (missionDriverId !== driverId) throw new AppError("Forbidden", 403);
  }
  const incident = await IncidentRepository.createIncident({
    driverId,
    missionId: payload.missionId,
    description: payload.description,
    priority: payload.priority || "low",
    categorie: "INCIDENT",
    authorRole: "CHAUFFEUR",
  });
  await notifyResponsables(`Nouvel incident signalé par un chauffeur : ${payload.description.slice(0, 40)}...`, {
    type: "INCIDENT",
    incidentId: incident.id,
  });
  await logAction(driverId, `INCIDENT_REPORTED:${incident.id}`);
  return incident;
};

// Passager: soumettre une réclamation
const reportPassagerIncident = async (passagerId, payload) => {
  const incident = await IncidentRepository.createIncident({
    passagerId,
    missionId: payload.missionId,
    description: payload.description,
    priority: payload.priority || "low",
    categorie: payload.categorie, // APPLICATION | CHAUFFEUR | SERVICE
    authorRole: "PASSAGER",
  });
  await notifyResponsables(`Nouvelle réclamation passager : ${payload.description.slice(0, 40)}...`, {
    type: "INCIDENT",
    incidentId: incident.id,
  });
  await logAction(passagerId, `RECLAMATION_REPORTED:${incident.id}`);
  return incident;
};

const getIncidents = async (pagination, status) =>
  IncidentRepository.listIncidents({ skip: pagination.skip, take: pagination.limit, status });

const getDriverIncidents = async (driverId, pagination, status) =>
  IncidentRepository.listIncidentsForDriver(driverId, { skip: pagination.skip, take: pagination.limit, status });

const getPassagerIncidents = async (passagerId, pagination, status) =>
  IncidentRepository.listIncidentsForPassager(passagerId, { skip: pagination.skip, take: pagination.limit, status });

const getIncidentCount = async (status) => countIncidents(status);

const removeIncident = async (incidentId, userId, role) => {
  const incident = await IncidentRepository.findIncidentById(incidentId);
  if (!incident) throw new AppError("Incident not found", 404);

  // Check ownership
  const ownerId = role === "PASSAGER" ? incident.passagerId : incident.driverId;
  const ownerIdStr = ownerId?._id ? ownerId._id.toString() : ownerId?.toString();

  if (ownerIdStr !== userId && !["ADMIN", "RESPONSABLE"].includes(role)) {
    throw new AppError("Forbidden", 403);
  }

  await IncidentRepository.deleteIncidentById(incidentId);
  return true;
};

const removeAllMyIncidents = async (userId, role) => {
  const query = role === "PASSAGER" ? { passagerId: userId } : { driverId: userId };
  await IncidentRepository.deleteAllIncidentsForUser(query);
  return true;
};

module.exports = {
  reportIncident,
  reportPassagerIncident,
  getIncidents,
  getDriverIncidents,
  getPassagerIncidents,
  getIncidentCount,
  removeIncident,
  removeAllMyIncidents,
};