const { AppError } = require("../errors/AppError");
const {
  findMissionById,
  listMissions,
  listMissionsForDriver,
  updateMission,
  createMission,
} = require("../Repository/mission.repository");
const {
  createRequest,
  findRequestById,
  findRequestIdsByDateRange,
  findRequestIdsAfterDate,
  findRequestIdsBeforeDate,
} = require("../Repository/request.repository");
const {
  findUserById,
  updateUserById,
} = require("../Repository/user.repository");
const {
  findVehicleById,
  updateVehicle,
} = require("../Repository/vehicle.repository");
const { notifyUser, notifyResponsables } = require("./notifications.service");
const { logAction } = require("./logs.service");
const { getDayRange } = require("../utils/date");

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const parseRequestDate = (dateInput, timeInput) => {
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Invalid date", 400);
  }

  if (timeInput) {
    if (!timeRegex.test(timeInput)) {
      throw new AppError("Invalid time format", 400);
    }
    const [hours, minutes] = timeInput.split(":").map(Number);
    parsed.setHours(hours, minutes, 0, 0);
  } else if (dateOnlyRegex.test(dateInput)) {
    throw new AppError("Time is required when date has no time", 400);
  }

  return parsed;
};

const resolveRequestIdsForFilter = async ({ date, scope } = {}) => {
  if (date) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError("Invalid date filter", 400);
    }
    const { start, end } = getDayRange(parsed);
    const ids = await findRequestIdsByDateRange(start, end);
    return ids.map((item) => item._id);
  }

  if (!scope || scope === "tout" || scope === "all") {
    return null;
  }

  const now = new Date();
  if (scope === "24h" || scope === "48h") {
    const hours = scope === "24h" ? 24 : 48;
    const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const ids = await findRequestIdsByDateRange(now, end);
    return ids.map((item) => item._id);
  }
  if (scope === "today") {
    const { start, end } = getDayRange(now);
    const ids = await findRequestIdsByDateRange(start, end);
    return ids.map((item) => item._id);
  }

  if (scope === "upcoming") {
    const ids = await findRequestIdsAfterDate(now);
    return ids.map((item) => item._id);
  }

  if (scope === "history") {
    const ids = await findRequestIdsBeforeDate(now);
    return ids.map((item) => item._id);
  }

  throw new AppError("Invalid scope", 400);
};

const getAllMissions = async (pagination, filters) => {
  const requestIds = await resolveRequestIdsForFilter(filters);
  if (Array.isArray(requestIds) && requestIds.length === 0) {
    return [];
  }
  return listMissions({
    skip: pagination.skip,
    take: pagination.limit,
    status: filters?.status,
    requestIds: requestIds && requestIds.length > 0 ? requestIds : undefined,
  });
};

const getDriverMissions = async (driverId, pagination, filters) => {
  const requestIds = await resolveRequestIdsForFilter(filters);
  if (Array.isArray(requestIds) && requestIds.length === 0) {
    return [];
  }
  return listMissionsForDriver(driverId, {
    skip: pagination.skip,
    take: pagination.limit,
    status: filters?.status,
    requestIds: requestIds && requestIds.length > 0 ? requestIds : undefined,
  });
};

const getMissionDetails = async (missionId, actor) => {
  const mission = await findMissionById(missionId);
  if (!mission) {
    throw new AppError("Mission not found", 404);
  }

  if (actor.role === "CHAUFFEUR") {
    const missionDriverId = mission.driverId._id
      ? mission.driverId._id.toString()
      : mission.driverId.toString();
    if (missionDriverId !== actor.id) {
      throw new AppError("Forbidden", 403);
    }
  }

  return mission;
};

const createManualMission = async (payload, actorId) => {
  const passenger = await findUserById(payload.passengerId);
  if (!passenger || passenger.role !== "PASSAGER") {
    throw new AppError("Passenger not found", 404);
  }

  const driver = await findUserById(payload.driverId);
  if (!driver || driver.role !== "CHAUFFEUR") {
    throw new AppError("Driver not found", 404);
  }
  if (!["DISPONIBLE", "AVAILABLE"].includes(driver.availability)) {
    throw new AppError("Driver not available", 409);
  }

  const vehicle = await findVehicleById(payload.vehicleId);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  if (!["DISPONIBLE", "AVAILABLE"].includes(vehicle.status)) {
    throw new AppError("Vehicle not available", 409);
  }
  if (vehicle.capacity < Number(payload.passengers || 1) + 1) {
    throw new AppError("Vehicle capacity is insufficient", 409);
  }

  const date = parseRequestDate(payload.date, payload.time);
  const request = await createRequest({
    userId: passenger.id,
    from: payload.from,
    to: payload.to,
    date,
    time: payload.time,
    passengers: payload.passengers,
    comment: payload.comment,
    status: "APPROUVEE",
  });

  const mission = await createMission({
    requestId: request.id,
    driverId: driver.id,
    vehicleId: vehicle.id,
  });
  await updateVehicle(vehicle.id, { status: "OCCUPE" });

  await notifyUser(
    passenger.id,
    `New mission created for request ${request.id}`,
    {
      type: "MISSION_CREATED",
      requestId: request.id,
      missionId: mission.id,
    },
  );
  await notifyUser(
    driver.id,
    `New mission assigned for request ${request.id}`,
    {
      type: "MISSION_ASSIGNED",
      requestId: request.id,
      missionId: mission.id,
    },
  );
  await logAction(actorId, `MISSION_CREATED:${mission.id}`);
  return mission;
};

const updateMissionByManager = async (missionId, payload, actorId) => {
  const mission = await findMissionById(missionId);
  if (!mission) {
    throw new AppError("Mission not found", 404);
  }

  if (["ANNULEE", "EN_COURS"].includes(mission.status)) {
    throw new AppError("Mission cannot be updated in current status", 409);
  }

  const previousDriverId = mission.driverId._id
    ? mission.driverId._id.toString()
    : mission.driverId.toString();
  const previousVehicleId = mission.vehicleId._id
    ? mission.vehicleId._id.toString()
    : mission.vehicleId.toString();

  const requestId = mission.requestId?._id || mission.requestId;
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  const updates = {};

  if (payload.driverId) {
    const driver = await findUserById(payload.driverId);
    if (!driver || driver.role !== "CHAUFFEUR") {
      throw new AppError("Driver not found", 404);
    }
    if (!["DISPONIBLE", "AVAILABLE"].includes(driver.availability)) {
      throw new AppError("Driver not available", 409);
    }
    updates.driverId = driver.id;
  }

  if (payload.vehicleId) {
    const vehicle = await findVehicleById(payload.vehicleId);
    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }
    if (
      vehicle.id !== previousVehicleId &&
      !["DISPONIBLE", "AVAILABLE"].includes(vehicle.status)
    ) {
      throw new AppError("Vehicle not available", 409);
    }
    if (vehicle.capacity < Number(request.passengers || 1) + 1) {
      throw new AppError("Vehicle capacity is insufficient", 409);
    }
    updates.vehicleId = vehicle.id;
  }

  if (payload.status) {
    updates.status = payload.status;
    if (payload.status === "EN_COURS") {
      updates.startTime = mission.startTime || new Date();
      await updateUserById(mission.driverId, { availability: "OCCUPE" });
    }
    if (payload.status === "TERMINEE") {
      updates.endTime = new Date();
      await updateUserById(mission.driverId, { availability: "DISPONIBLE" });
    }
    if (payload.status === "ANNULEE") {
      await updateUserById(mission.driverId, { availability: "DISPONIBLE" });
    }
  }

  const updated = await updateMission(missionId, updates);

  if (payload.vehicleId && payload.vehicleId !== previousVehicleId) {
    await updateVehicle(previousVehicleId, { status: "DISPONIBLE" });
    await updateVehicle(payload.vehicleId, { status: "OCCUPE" });
  }

  if (payload.status === "TERMINEE" || payload.status === "ANNULEE") {
    const vehicleId = updates.vehicleId || previousVehicleId;
    await updateVehicle(vehicleId, { status: "DISPONIBLE" });
  }

  if (payload.driverId && payload.driverId !== previousDriverId) {
    await notifyUser(payload.driverId, `New mission assigned ${mission.id}`, {
      type: "MISSION_ASSIGNED",
      requestId: request.id,
      missionId: mission.id,
    });
    await notifyUser(previousDriverId, `Mission ${mission.id} was reassigned`, {
      type: "MISSION_REASSIGNED",
      requestId: request.id,
      missionId: mission.id,
    });
  }

  if (payload.status === "ANNULEE") {
    const driverId = mission.driverId._id || mission.driverId;
    const passengerId = request.userId._id || request.userId;
    await notifyUser(driverId, `Mission ${mission.id} was cancelled`, {
      type: "MISSION_CANCELLED",
      requestId: request.id,
      missionId: mission.id,
    });
    await notifyUser(passengerId, `Mission ${mission.id} was cancelled`, {
      type: "MISSION_CANCELLED",
      requestId: request.id,
      missionId: mission.id,
    });
  }

  await logAction(actorId, `MISSION_UPDATED:${missionId}`);
  return updated;
};

const startMission = async (missionId, driverId) => {
  const mission = await findMissionById(missionId);
  if (!mission) {
    throw new AppError("Mission not found", 404);
  }

  const missionDriverId = mission.driverId._id
    ? mission.driverId._id.toString()
    : mission.driverId.toString();
  if (missionDriverId !== driverId) {
    throw new AppError("Forbidden", 403);
  }

  if (mission.status !== "EN_ATTENTE") {
    throw new AppError("Mission cannot be started", 409);
  }

  const updated = await updateMission(missionId, {
    status: "EN_COURS",
    startTime: new Date(),
  });

  await updateUserById(driverId, { availability: "OCCUPE" });
  await updateVehicle(mission.vehicleId._id || mission.vehicleId, {
    status: "OCCUPE",
  });

  await notifyResponsables(`Mission ${missionId} démarrée par le chauffeur`, {
    type: "MISSION",
    missionId,
  });
  await logAction(driverId, `MISSION_STARTED:${missionId}`);
  return updated;
};

const endMission = async (missionId, driverId) => {
  const mission = await findMissionById(missionId);
  if (!mission) {
    throw new AppError("Mission not found", 404);
  }

  const missionDriverId = mission.driverId._id
    ? mission.driverId._id.toString()
    : mission.driverId.toString();
  if (missionDriverId !== driverId) {
    throw new AppError("Forbidden", 403);
  }

  if (mission.status !== "EN_COURS") {
    throw new AppError("Mission cannot be ended", 409);
  }

  const updated = await updateMission(missionId, {
    status: "TERMINEE",
    endTime: new Date(),
  });

  await updateUserById(driverId, { availability: "DISPONIBLE" });
  await updateVehicle(mission.vehicleId._id || mission.vehicleId, {
    status: "DISPONIBLE",
  });

  await notifyResponsables(`Mission ${missionId} terminée par le chauffeur`, {
    type: "MISSION",
    missionId,
  });
  await logAction(driverId, `MISSION_ENDED:${missionId}`);
  return updated;
};

const cancelMission = async (missionId, driverId) => {
  const mission = await findMissionById(missionId);
  if (!mission) {
    throw new AppError("Mission not found", 404);
  }

  const missionDriverId = mission.driverId._id
    ? mission.driverId._id.toString()
    : mission.driverId.toString();
  if (missionDriverId !== driverId) {
    throw new AppError("Forbidden", 403);
  }

  if (["TERMINEE", "ANNULEE"].includes(mission.status)) {
    throw new AppError("Mission already completed or cancelled", 409);
  }

  const updated = await updateMission(missionId, {
    status: "ANNULEE",
  });

  await updateUserById(driverId, { availability: "DISPONIBLE" });
  await updateVehicle(mission.vehicleId._id || mission.vehicleId, {
    status: "DISPONIBLE",
  });

  await notifyResponsables(`Mission ${missionId} annulée par le chauffeur`, {
    type: "MISSION",
    missionId,
  });
  await logAction(driverId, `MISSION_CANCELLED:${missionId}`);
  return updated;
};

module.exports = {
  getAllMissions,
  getDriverMissions,
  getMissionDetails,
  createManualMission,
  updateMissionByManager,
  startMission,
  endMission,
  cancelMission,
};
