const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  createUserAccount,
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUserByAdmin,
  getPassengerDashboard,
  getDriverDashboard,
  getResponsableDashboard,
} = require("../Services/users.service");

const createUser = asyncHandler(async (req, res) => {
  const user = await createUserAccount(req.body);
  res.status(201).json({ user });
});

const listUsers = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const users = await getUsers(pagination, req.query.role);
  res.json({ page: pagination.page, limit: pagination.limit, data: users });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user.id);
  res.json({ user });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user.id, req.body);
  res.json({ user });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await updateUserByAdmin(req.params.id, req.body, req.user.id);
  res.json({ user });
});

const passengerDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getPassengerDashboard(req.user.id);
  res.json(dashboard);
});

const driverDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getDriverDashboard(req.user.id);
  res.json(dashboard);
});

const responsableDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getResponsableDashboard();
  res.json(dashboard);
});

module.exports = {
  createUser,
  listUsers,
  getMyProfile,
  updateMyProfile,
  updateUser,
  passengerDashboard,
  driverDashboard,
  responsableDashboard,
};
