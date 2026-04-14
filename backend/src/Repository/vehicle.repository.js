const Vehicle = require("./models/vehicle.model");

const createVehicle = (data) => Vehicle.create(data);

const findVehicleById = (id) => Vehicle.findById(id).exec();

const listVehicles = ({ skip, take }) =>
  Vehicle.find().sort({ createdAt: -1 }).skip(skip).limit(take).exec();

const updateVehicle = (id, data) =>
  Vehicle.findByIdAndUpdate(id, data, { new: true }).exec();

const listAvailableVehicles = (minCapacity = 1) =>
  Vehicle.find({
    status: { $in: ["DISPONIBLE", "AVAILABLE"] },
    capacity: { $gte: minCapacity },
  })
    .sort({ createdAt: 1 })
    .exec();

const countAvailableVehicles = () =>
  Vehicle.countDocuments({
    status: { $in: ["DISPONIBLE", "AVAILABLE"] },
  }).exec();

module.exports = {
  createVehicle,
  findVehicleById,
  listVehicles,
  updateVehicle,
  listAvailableVehicles,
  countAvailableVehicles,
};
