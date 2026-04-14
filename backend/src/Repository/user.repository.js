const User = require("./models/user.model");

const createUser = (data) => User.create(data);

const findUserByEmail = (email) =>
  User.findOne({ email: email.toLowerCase() }).exec();

const findUserById = (id) => User.findById(id).exec();

const updateUserById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true }).exec();

const listUsers = ({ skip, take, role }) =>
  User.find(role ? { role } : {})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .exec();

const listDrivers = () =>
  User.find({ role: "CHAUFFEUR" }).sort({ createdAt: 1 }).exec();

const listAvailableDrivers = () =>
  User.find({
    role: "CHAUFFEUR",
    availability: { $in: ["DISPONIBLE", "AVAILABLE"] },
  })
    .sort({ createdAt: 1 })
    .exec();

const countDriversByAvailability = (availability) => {
  if (availability === "DISPONIBLE") {
    return User.countDocuments({
      role: "CHAUFFEUR",
      availability: { $in: ["DISPONIBLE", "AVAILABLE"] },
    }).exec();
  }
  if (availability === "OCCUPE") {
    return User.countDocuments({
      role: "CHAUFFEUR",
      availability: { $in: ["OCCUPE", "BUSY"] },
    }).exec();
  }
  return User.countDocuments({ role: "CHAUFFEUR", availability }).exec();
};

const countUsers = ({ role } = {}) =>
  User.countDocuments(role ? { role } : {}).exec();

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserById,
  listUsers,
  listDrivers,
  listAvailableDrivers,
  countDriversByAvailability,
  countUsers,
};
