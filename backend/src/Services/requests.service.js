const { AppError } = require("../errors/AppError");
const {
  createRequest,
  findRequestById,
  listRequestsForUser,
  listRequests,
  updateRequestStatus,
  updateRequestById,
  deleteRequestById,
} = require("../Repository/request.repository");
const {
  createMission,
  updateMission,
  deleteMissionByRequestId,
} = require("../Repository/mission.repository");
const {
  listAvailableDrivers,
  findUserById,
  updateUserById,
} = require("../Repository/user.repository");
const {
  listAvailableVehicles,
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

const buildRequestFilters = ({ status, date } = {}) => {
  if (!date) {
    return { status };
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Invalid date filter", 400);
  }

  const { start, end } = getDayRange(parsed);
  return { status, startDate: start, endDate: end };
};

const createNewRequest = async (userId, payload) => {
  const date = parseRequestDate(payload.date, payload.time);

  const request = await createRequest({
    userId,
    from: payload.from,
    to: payload.to,
    date,
    time: payload.time,
    passengers: payload.passengers,
    comment: payload.comment,
    type: payload.type || "standard",
    phone: payload.phone,
    email: payload.email,
    passengerList: payload.passengerList || [],
    status: "EN_ATTENTE",
  });
  await notifyResponsables(`Nouvelle demande de transport de ${payload.from} vers ${payload.to}`, {
    type: "GENERAL",
    requestId: request.id,
  });
  await logAction(userId, `REQUEST_CREATED:${request.id}`);
  return request;
};

const getMyRequests = async (userId, pagination, filters) => {
  const requestFilters = buildRequestFilters(filters);
  return listRequestsForUser(userId, {
    skip: pagination.skip,
    take: pagination.limit,
    ...requestFilters,
  });
};

const getAllRequests = async (pagination, filters) => {
  const requestFilters = buildRequestFilters(filters);
  return listRequests({
    skip: pagination.skip,
    take: pagination.limit,
    ...requestFilters,
  });
};

const getRequestById = async (requestId, actor) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (actor.role === "PASSAGER") {
    const requestUserId = request.userId._id
      ? request.userId._id.toString()
      : request.userId.toString();
    if (requestUserId !== actor.id) {
      throw new AppError("Forbidden", 403);
    }
  }

  return request;
};

const selectDriverAndVehicle = async (request) => {
  const drivers = await listAvailableDrivers();
  const minCapacity = Number(request.passengers || 1) + 1;

  const selectedDriver = drivers[0] || null;

  if (!selectedDriver) {
    throw new AppError("No available drivers", 409);
  }

  const vehicles = await listAvailableVehicles(minCapacity);
  const selectedVehicle = vehicles[0] || null;

  if (!selectedVehicle) {
    throw new AppError("No available vehicles with required capacity", 409);
  }

  return { driverId: selectedDriver.id, vehicleId: selectedVehicle.id };
};

const approveRequest = async (requestId, actorId) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== "EN_ATTENTE") {
    throw new AppError("Request already processed", 409);
  }

  await updateRequestStatus(requestId, "APPROUVEE");

  const { driverId, vehicleId } = await selectDriverAndVehicle(request);

  const mission = await createMission({
    requestId,
    driverId,
    vehicleId,
  });
  await updateVehicle(vehicleId, { status: "OCCUPE" });
  await updateUserById(driverId, { availability: "OCCUPE" });

  const passengerId = request.userId._id || request.userId;
  await notifyUser(passengerId, `Your request ${request.id} was approved`, {
    type: "REQUEST_APPROVED",
    requestId: request.id,
    missionId: mission.id,
  });
  await notifyUser(driverId, `New mission assigned for request ${request.id}`, {
    type: "MISSION_ASSIGNED",
    requestId: request.id,
    missionId: mission.id,
  });
  await logAction(actorId, `REQUEST_APPROVED:${request.id}`);

  return { requestId, mission };
};

const assignRequest = async (requestId, payload, actorId) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== "EN_ATTENTE") {
    throw new AppError("Request already processed", 409);
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
  if (vehicle.capacity < Number(request.passengers || 1) + 1) {
    throw new AppError("Vehicle capacity is insufficient", 409);
  }

  await updateRequestStatus(requestId, "APPROUVEE");

  const mission = await createMission({
    requestId,
    driverId: driver.id,
    vehicleId: vehicle.id,
  });
  await updateVehicle(vehicle.id, { status: "OCCUPE" });
  await updateUserById(driver.id, { availability: "OCCUPE" });

  const passengerId = request.userId._id || request.userId;
  await notifyUser(passengerId, `Your request ${request.id} was approved`, {
    type: "REQUEST_APPROVED",
    requestId: request.id,
    missionId: mission.id,
  });
  await notifyUser(
    driver.id,
    `New mission assigned for request ${request.id}`,
    {
      type: "MISSION_ASSIGNED",
      requestId: request.id,
      missionId: mission.id,
    },
  );
  await logAction(actorId, `REQUEST_ASSIGNED:${request.id}`);

  return { requestId, mission };
};

const rejectRequest = async (requestId, actorId) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  if (request.status !== "EN_ATTENTE") {
    throw new AppError("Request already processed", 409);
  }

  const updated = await updateRequestStatus(requestId, "REJETEE");
  const passengerId = request.userId._id || request.userId;
  await notifyUser(passengerId, `Your request ${request.id} was rejected`, {
    type: "REQUEST_REJECTED",
    requestId: request.id,
  });
  await logAction(actorId, `REQUEST_REJECTED:${request.id}`);
  return updated;
};

const updateRequestByPassenger = async (requestId, userId, payload) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  const requestUserId = request.userId._id
    ? request.userId._id.toString()
    : request.userId.toString();
  if (requestUserId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (request.status !== "EN_ATTENTE") {
    throw new AppError("Only pending requests can be updated", 409);
  }

  const updates = {};
  if (payload.from) updates.from = payload.from;
  if (payload.to) updates.to = payload.to;
  if (payload.passengers !== undefined) {
    updates.passengers = payload.passengers;
  }
  if (payload.comment !== undefined) {
    updates.comment = payload.comment;
  }

  if (payload.date) {
    const date = parseRequestDate(payload.date, payload.time);
    updates.date = date;
    updates.time = payload.time;
  } else if (payload.time) {
    const updatedDate = parseRequestDate(
      request.date.toISOString(),
      payload.time,
    );
    updates.date = updatedDate;
    updates.time = payload.time;
  }

  const updated = await updateRequestById(requestId, updates);
  await logAction(userId, `REQUEST_UPDATED:${requestId}`);
  return updated;
};

const cancelRequestByPassenger = async (requestId, userId) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  const requestUserId = request.userId._id
    ? request.userId._id.toString()
    : request.userId.toString();
  if (requestUserId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (["REJETEE", "ANNULEE"].includes(request.status)) {
    throw new AppError("Request already processed", 409);
  }

  const updatedRequest = await updateRequestStatus(requestId, "ANNULEE");
  if (request.mission) {
    await updateMission(request.mission.id || request.mission._id, {
      status: "ANNULEE",
    });
    if (request.mission.driverId) {
      const driverId = request.mission.driverId._id || request.mission.driverId;
      await notifyUser(
        driverId,
        `Mission for request ${request.id} was cancelled`,
        {
          type: "MISSION_CANCELLED",
          requestId: request.id,
          missionId: request.mission.id || request.mission._id,
        },
      );
      await updateUserById(driverId, { availability: "DISPONIBLE" });
    }
    if (request.mission.vehicleId) {
      const vehicleId =
        request.mission.vehicleId._id || request.mission.vehicleId;
      await updateVehicle(vehicleId, { status: "DISPONIBLE" });
    }
  }

  await logAction(userId, `REQUEST_CANCELLED:${requestId}`);
  return updatedRequest;
};

const deleteRequest = async (requestId, actorId) => {
  const request = await findRequestById(requestId);
  if (!request) {
    throw new AppError("Request not found", 404);
  }

  // 1. If there's a mission, we need to release driver and vehicle
  if (request.mission) {
    const mission = request.mission;
    if (mission.driverId) {
      const dId = mission.driverId._id || mission.driverId;
      await updateUserById(dId, { availability: "DISPONIBLE" });
    }
    if (mission.vehicleId) {
      const vId = mission.vehicleId._id || mission.vehicleId;
      await updateVehicle(vId, { status: "DISPONIBLE" });
    }
    // 2. Delete the mission
    await deleteMissionByRequestId(requestId);
  }

  // 3. Delete the request
  const deleted = await deleteRequestById(requestId);
  await logAction(actorId, `REQUEST_DELETED:${requestId}`);
  return deleted;
};

module.exports = {
  createNewRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  approveRequest,
  assignRequest,
  rejectRequest,
  updateRequestByPassenger,
  cancelRequestByPassenger,
  deleteRequest,
};
