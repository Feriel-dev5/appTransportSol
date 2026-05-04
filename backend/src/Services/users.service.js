const bcrypt = require("bcryptjs");
const { AppError } = require("../errors/AppError");
const {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserById,
  listUsers,
  countDriversByAvailability,
  countUsers,
} = require("../Repository/user.repository");
const {
  countRequests,
  findRequestIdsByDateRange,
  findRequestIdsAfterDate,
  findRequestIdsBeforeDate,
  listUpcomingRequestsForUser,
} = require("../Repository/request.repository");
const {
  listMissionsByRequestIds,
  listMissionsForDriver,
  countMissions,
  countDriverMissions,
} = require("../Repository/mission.repository");
const { countAvailableVehicles } = require("../Repository/vehicle.repository");
const { countIncidents } = require("../Repository/incident.repository");
const { listNotifications } = require("../Repository/notification.repository");
const { sanitizeUser } = require("./auth.service");
const { getDayRange } = require("../utils/date");
const { logAction } = require("./logs.service");

const createUserAccount = async (data) => {
  const normalizedEmail = data.email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    ...data,
    email: normalizedEmail,
    password: hashed,
  });
  return sanitizeUser(user);
};

const getUsers = async (pagination, role) => {
  const users = await listUsers({
    skip: pagination.skip,
    take: pagination.limit,
    role,
  });
  return users.map(sanitizeUser);
};

const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return sanitizeUser(user);
};

const updateUserProfile = async (userId, payload) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updates = {};

  if (payload.name) {
    updates.name = payload.name;
  }

  if (payload.phone !== undefined) {
    updates.phone = payload.phone;
  }

  if (payload.passportNumber !== undefined) {
    updates.passportNumber = payload.passportNumber;
  }

  if (payload.cin !== undefined) {
    updates.cin = payload.cin;
  }

  if (payload.address !== undefined) {
    updates.address = payload.address;
  }

  if (payload.email) {
    const normalizedEmail = payload.email.toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing && existing.id !== userId) {
      throw new AppError("Email already registered", 409);
    }
    updates.email = normalizedEmail;
  }

  if (payload.password) {
    updates.password = await bcrypt.hash(payload.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return sanitizeUser(user);
  }

  const updated = await updateUserById(userId, updates);
  return sanitizeUser(updated);
};

const updateUserByAdmin = async (targetUserId, payload, actorId) => {
  const user = await findUserById(targetUserId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const updates = {};

  if (payload.name) {
    updates.name = payload.name;
  }

  if (payload.phone !== undefined) {
    updates.phone = payload.phone;
  }

  if (payload.passportNumber !== undefined) {
    updates.passportNumber = payload.passportNumber;
  }

  if (payload.cin !== undefined) {
    updates.cin = payload.cin;
  }

  if (payload.address !== undefined) {
    updates.address = payload.address;
  }

  if (payload.role) {
    updates.role = payload.role;
  }

  if (payload.availability) {
    updates.availability = payload.availability;
  }

  if (payload.email) {
    const normalizedEmail = payload.email.toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing && existing.id !== targetUserId) {
      throw new AppError("Email already registered", 409);
    }
    updates.email = normalizedEmail;
  }

  if (payload.password) {
    updates.password = await bcrypt.hash(payload.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return sanitizeUser(user);
  }

  const updated = await updateUserById(targetUserId, updates);
  await logAction(actorId, `USER_UPDATED:${targetUserId}`);
  return sanitizeUser(updated);
};

const getPassengerDashboard = async (userId) => {
  const now = new Date();
  const [totalRequests, pendingRequests, approvedRequests, rejectedRequests] =
    await Promise.all([
      countRequests({ userId }),
      countRequests({ userId, status: "EN_ATTENTE" }),
      countRequests({ userId, status: "APPROUVEE" }),
      countRequests({ userId, status: "REJETEE" }),
    ]);

  const upcomingRequests = await listUpcomingRequestsForUser(userId, {
    after: now,
    take: 5,
  });
  const requestIds = upcomingRequests.map((request) => request.id);

  const missions = requestIds.length
    ? await listMissionsByRequestIds(requestIds, {
        status: ["EN_ATTENTE", "EN_COURS"],
      })
    : [];

  const missionByRequestId = new Map(
    missions.map((mission) => [mission.requestId.id, mission]),
  );
  const nextMissions = upcomingRequests
    .map((request) => missionByRequestId.get(request.id))
    .filter(Boolean);

  const latestNotifications = await listNotifications(userId, {
    skip: 0,
    take: 5,
  });

  return {
    stats: {
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      upcomingMissions: nextMissions.length,
    },
    nextMissions,
    latestNotifications,
  };
};

const getDriverDashboard = async (driverId) => {
  const now = new Date();
  const { start, end } = getDayRange(now);
  const [todayRequestIds, upcomingRequestIds, pastRequestIds] =
    await Promise.all([
      findRequestIdsByDateRange(start, end),
      findRequestIdsAfterDate(now),
      findRequestIdsBeforeDate(now),
    ]);

  const todayIds = todayRequestIds.map((item) => item._id);
  const upcomingIds = upcomingRequestIds.map((item) => item._id);
  const pastIds = pastRequestIds.map((item) => item._id);

  const [missionsToday, upcomingMissions, completedMissions] =
    await Promise.all([
      todayIds.length
        ? countDriverMissions({ driverId, requestIds: todayIds })
        : 0,
      upcomingIds.length
        ? countDriverMissions({
            driverId,
            status: ["EN_ATTENTE", "EN_COURS"],
            requestIds: upcomingIds,
          })
        : 0,
      pastIds.length
        ? countDriverMissions({
            driverId,
            status: "TERMINEE",
            requestIds: pastIds,
          })
        : 0,
    ]);

  const nextMissions = upcomingIds.length
    ? await listMissionsForDriver(driverId, {
        skip: 0,
        take: 5,
        status: ["EN_ATTENTE", "EN_COURS"],
        requestIds: upcomingIds,
      })
    : [];

  const latestNotifications = await listNotifications(driverId, {
    skip: 0,
    take: 5,
  });

  return {
    stats: {
      missionsToday,
      upcomingMissions,
      completedMissions,
    },
    nextMissions,
    latestNotifications,
  };
};

const getResponsableDashboard = async () => {
  const now = new Date();
  const { start, end } = getDayRange(now);
  const todayRequestIds = await findRequestIdsByDateRange(start, end);
  const todayIds = todayRequestIds.map((item) => item._id);

  const [
    pendingRequests,
    missionsToday,
    availableDrivers,
    availableVehicles,
    alerts,
    usersCount,
  ] = await Promise.all([
    countRequests({ status: "EN_ATTENTE" }),
    todayIds.length ? countMissions({ requestIds: todayIds }) : 0,
    countDriversByAvailability("DISPONIBLE"),
    countAvailableVehicles(),
    countIncidents("OUVERT"),
    countUsers(),
  ]);

  return {
    stats: {
      pendingRequests,
      missionsToday,
      availableDrivers,
      availableVehicles,
      alerts,
      usersCount,
    },
  };
};

module.exports = {
  createUserAccount,
  getUsers,
  getUserProfile,
  updateUserProfile,
  updateUserByAdmin,
  getPassengerDashboard,
  getDriverDashboard,
  getResponsableDashboard,
};
