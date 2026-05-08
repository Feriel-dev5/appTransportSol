const bcrypt = require("bcryptjs");
const { AppError } = require("../errors/AppError");
const {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByCin,
  findUserByPassport,
  updateUserById,
  deleteUserById,
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
const { countAvailableVehicles, countVehicles } = require("../Repository/vehicle.repository");
const { countIncidents, countIncidentsForUser } = require("../Repository/incident.repository");
const { countAvis } = require("../Repository/avis.repository");
const { listNotifications } = require("../Repository/notification.repository");
const { sanitizeUser } = require("./auth.service");
const { getDayRange } = require("../utils/date");
const { logAction } = require("./logs.service");

const createUserAccount = async (data) => {
  const normalizedEmail = data.email.toLowerCase();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    throw new AppError("Cet email est déjà utilisé.", 409);
  }

  if (data.cin) {
    const existingCin = await findUserByCin(data.cin);
    if (existingCin) {
      throw new AppError("Ce numéro de CIN est déjà utilisé.", 409);
    }
  }

  if (data.passportNumber) {
    const existingPass = await findUserByPassport(data.passportNumber);
    if (existingPass) {
      throw new AppError("Ce numéro de passeport est déjà utilisé.", 409);
    }
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
  if (payload.photo !== undefined) {
    updates.photo = payload.photo;
  }

  if (payload.email) {
    const normalizedEmail = payload.email.toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing && String(existing._id) !== String(userId)) {
      throw new AppError("Cet email est déjà utilisé.", 409);
    }
    updates.email = normalizedEmail;
  }

  if (payload.cin) {
    const existing = await findUserByCin(payload.cin);
    if (existing && String(existing._id) !== String(userId)) {
      throw new AppError("Ce numéro de CIN est déjà utilisé.", 409);
    }
    updates.cin = payload.cin;
  }

  if (payload.passportNumber) {
    const existing = await findUserByPassport(payload.passportNumber);
    if (existing && String(existing._id) !== String(userId)) {
      throw new AppError("Ce numéro de passeport est déjà utilisé.", 409);
    }
    updates.passportNumber = payload.passportNumber;
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

  if (payload.email) {
    const normalizedEmail = payload.email.toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing && existing.id !== targetUserId) {
      throw new AppError("Cet email est déjà utilisé.", 409);
    }
    updates.email = normalizedEmail;
  }

  if (payload.cin) {
    const existing = await findUserByCin(payload.cin);
    if (existing && existing.id !== targetUserId) {
      throw new AppError("Ce numéro de CIN est déjà utilisé.", 409);
    }
    updates.cin = payload.cin;
  }

  if (payload.passportNumber) {
    const existing = await findUserByPassport(payload.passportNumber);
    if (existing && existing.id !== targetUserId) {
      throw new AppError("Ce numéro de passeport est déjà utilisé.", 409);
    }
    updates.passportNumber = payload.passportNumber;
  }

  if (payload.password) {
    updates.password = await bcrypt.hash(payload.password, 10);
  }
  if (payload.photo !== undefined) {
    updates.photo = payload.photo;
  }

  if (Object.keys(updates).length === 0) {
    return sanitizeUser(user);
  }

  const updated = await updateUserById(targetUserId, updates);
  await logAction(actorId, `USER_UPDATED:${targetUserId}`);
  return sanitizeUser(updated);
};
const removeUser = async (targetUserId, actorId) => {
  const user = await findUserById(targetUserId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  await deleteUserById(targetUserId);
  await logAction(actorId, `USER_DELETED:${targetUserId}`);
  return true;
};

const getPassengerDashboard = async (userId) => {
  const now = new Date();
  const [totalRequests, pendingRequests, approvedRequests, rejectedRequests, alerts] =
    await Promise.all([
      countRequests({ userId }),
      countRequests({ userId, status: "EN_ATTENTE" }),
      countRequests({ userId, status: "APPROUVEE" }),
      countRequests({ userId, status: "REJETEE" }),
      countIncidentsForUser({ passagerId: userId, status: "OUVERT" }),
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
      alerts,
      upcomingMissions: nextMissions.length,
    },
    nextMissions,
    latestNotifications,
  };
};

const getDriverDashboard = async (driverId) => {
  const now = new Date();
  const { start, end } = getDayRange(now);
  const [todayRequestIds, upcomingRequestIds, pastRequestIds, alerts] =
    await Promise.all([
      findRequestIdsByDateRange(start, end),
      findRequestIdsAfterDate(now),
      findRequestIdsBeforeDate(now),
      countIncidentsForUser({ driverId, status: "OUVERT" }),
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

  // Build last 7 days chart data
  const DAYS_FR = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
  const weekChartPromises = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const { start: s, end: e } = getDayRange(d);
    weekChartPromises.push(
      findRequestIdsByDateRange(s, e).then(async (ids) => {
        const rIds = ids.map((x) => x._id);
        const count = rIds.length
          ? await countDriverMissions({ driverId, requestIds: rIds })
          : 0;
        return {
          jour: DAYS_FR[d.getDay()],
          val: count,
          active: i === 0,
        };
      }),
    );
  }
  const weekChartRaw = await Promise.all(weekChartPromises);
  const maxVal = Math.max(...weekChartRaw.map((x) => x.val), 1);
  const weekChart = weekChartRaw.map((x) => ({
    ...x,
    h: Math.round((x.val / maxVal) * 100),
  }));

  return {
    stats: {
      missionsToday,
      upcomingMissions,
      completedMissions,
      alerts,
      weekChart,
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

const getAdminDashboard = async (adminId) => {
  const now = new Date();
  const { start, end } = getDayRange(now);
  const todayRequestIds = await findRequestIdsByDateRange(start, end);
  const todayIds = todayRequestIds.map((item) => item._id);

  // Build last 7 days chart data
  const DAYS_FR = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
  const weekChartPromises = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const { start: s, end: e } = getDayRange(d);
    weekChartPromises.push(
      findRequestIdsByDateRange(s, e).then(async (ids) => {
        const rIds = ids.map((x) => x._id);
        const count = rIds.length ? await countMissions({ requestIds: rIds }) : 0;
        return { jour: DAYS_FR[d.getDay()], val: count, date: d.toISOString().split("T")[0] };
      })
    );
  }

  // Build last 4 weeks chart data
  const monthChartPromises = [];
  for (let i = 3; i >= 0; i--) {
    const dEnd = new Date(now);
    dEnd.setDate(dEnd.getDate() - i * 7);
    const dStart = new Date(dEnd);
    dStart.setDate(dStart.getDate() - 6);
    const s = new Date(dStart.setHours(0, 0, 0, 0));
    const e = new Date(dEnd.setHours(23, 59, 59, 999));

    monthChartPromises.push(
      findRequestIdsByDateRange(s, e).then(async (ids) => {
        const rIds = ids.map((x) => x._id);
        const count = rIds.length ? await countMissions({ requestIds: rIds }) : 0;
        return { jour: `S${4 - i}`, val: count, label: `Semaine ${4 - i}`, missions: count };
      })
    );
  }

  const [
    pendingRequests,
    missionsToday,
    availableDrivers,
    availableVehicles,
    totalVehicles,
    alerts,
    avisAcceptes,
    usersCount,
    adminUser,
    weekChart,
    monthChart,
  ] = await Promise.all([
    countRequests({ status: "EN_ATTENTE" }),
    todayIds.length ? countMissions({ requestIds: todayIds }) : 0,
    countDriversByAvailability("DISPONIBLE"),
    countAvailableVehicles(),
    countVehicles(),
    countIncidents("OUVERT"),
    countAvis({ statut: "ACCEPTER" }),
    countUsers(),
    findUserById(adminId),
    Promise.all(weekChartPromises),
    Promise.all(monthChartPromises),
  ]);

  return {
    user: adminUser ? sanitizeUser(adminUser) : null,
    stats: {
      pendingRequests,
      missionsToday,
      availableDrivers,
      availableVehicles,
      totalVehicles,
      alerts,
      avisAcceptes,
      usersCount,
    },
    weekChart, // [{ jour, val, date }] last 7 days
    monthChart, // [{ jour, val, label, missions }] last 4 weeks
  };
};

module.exports = {
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
};
