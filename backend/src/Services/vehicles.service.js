const { AppError } = require("../errors/AppError");
const {
  createVehicle,
  listVehicles,
  updateVehicle,
} = require("../Repository/vehicle.repository");
const { logAction } = require("./logs.service");

const addVehicle = async (payload, actorId) => {
  const vehicle = await createVehicle(payload);
  await logAction(actorId, `VEHICLE_CREATED:${vehicle.id}`);
  return vehicle;
};

const getVehicles = async (pagination) =>
  listVehicles({ skip: pagination.skip, take: pagination.limit });

const editVehicle = async (id, payload, actorId) => {
  const vehicle = await updateVehicle(id, payload);
  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }
  await logAction(actorId, `VEHICLE_UPDATED:${vehicle.id}`);
  return vehicle;
};

module.exports = { addVehicle, getVehicles, editVehicle };
