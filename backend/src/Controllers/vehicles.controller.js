const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  addVehicle,
  getVehicles,
  editVehicle,
  removeVehicle,
} = require("../Services/vehicles.service");

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await addVehicle(req.body, req.user.id);
  res.status(201).json({ vehicle });
});

const listVehicles = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const vehicles = await getVehicles(pagination);
  res.json({ page: pagination.page, limit: pagination.limit, data: vehicles });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await editVehicle(req.params.id, req.body, req.user.id);
  res.json({ vehicle });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  await removeVehicle(req.params.id, req.user.id);
  res.json({ message: "Vehicle deleted successfully" });
});

module.exports = { createVehicle, listVehicles, updateVehicle, deleteVehicle };
