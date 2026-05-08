const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  createUserAccount,
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUserByAdmin,
  removeUser,
  getPassengerDashboard,
  getDriverDashboard,
  getResponsableDashboard,
  getAdminDashboard,
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

const adminDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getAdminDashboard(req.user.id);
  res.json(dashboard);
});

const deleteUser = asyncHandler(async (req, res) => {
  await removeUser(req.params.id, req.user.id);
  res.json({ message: "User deleted successfully" });
});

module.exports = {
  createUser,
  listUsers,
  getMyProfile,
  updateMyProfile,
  updateUser,
  deleteUser,
  passengerDashboard,
  driverDashboard,
  responsableDashboard,
  adminDashboard,
};
