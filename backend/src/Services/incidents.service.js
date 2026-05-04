const { AppError } = require("../errors/AppError");
const {
  createIncident,
  listIncidents,
  listIncidentsForDriver,
  listIncidentsForPassager,
  countIncidents,
} = require("../Repository/incident.repository");
const { findMissionById } = require("../Repository/mission.repository");
const { logAction } = require("./logs.service");

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
  const incident = await createIncident({
    driverId,
    missionId: payload.missionId,
    description: payload.description,
    categorie: "INCIDENT",
    authorRole: "CHAUFFEUR",
  });
  await logAction(driverId, `INCIDENT_REPORTED:${incident.id}`);
  return incident;
};

// Passager: soumettre une réclamation
const reportPassagerIncident = async (passagerId, payload) => {
  const incident = await createIncident({
    passagerId,
    missionId: payload.missionId,
    description: payload.description,
    categorie: payload.categorie, // APPLICATION | CHAUFFEUR | SERVICE
    authorRole: "PASSAGER",
  });
  await logAction(passagerId, `RECLAMATION_REPORTED:${incident.id}`);
  return incident;
};

const getIncidents = async (pagination, status) =>
  listIncidents({ skip: pagination.skip, take: pagination.limit, status });

const getDriverIncidents = async (driverId, pagination, status) =>
  listIncidentsForDriver(driverId, { skip: pagination.skip, take: pagination.limit, status });

const getPassagerIncidents = async (passagerId, pagination, status) =>
  listIncidentsForPassager(passagerId, { skip: pagination.skip, take: pagination.limit, status });

const getIncidentCount = async (status) => countIncidents(status);

module.exports = {
  reportIncident,
  reportPassagerIncident,
  getIncidents,
  getDriverIncidents,
  getPassagerIncidents,
  getIncidentCount,
};