import api from "./api";

/* ─────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────── */
export const fetchResponsableDashboard = async () => {
  const { data } = await api.get("/users/me/responsable-dashboard");
  return data;
  // { stats: { pendingRequests, missionsToday, availableDrivers, availableVehicles, alerts, usersCount } }
};

/* ─────────────────────────────────────────────────────────
   DEMANDES (REQUESTS)
───────────────────────────────────────────────────────── */
export const fetchRequests = async (params = {}) => {
  const { data } = await api.get("/requests", { params });
  return data; // { page, limit, data: Request[] }
};

export const fetchRequestById = async (id) => {
  const { data } = await api.get(`/requests/${id}`);
  return data.request;
};

// Accepter automatiquement (le système choisit chauffeur+véhicule)
export const approveRequest = async (id) => {
  const { data } = await api.put(`/requests/${id}/approve`);
  return data;
};

export const rejectRequest = async (id) => {
  const { data } = await api.put(`/requests/${id}/reject`);
  return data;
};

export const assignRequest = async (id, payload) => {
  // payload: { driverId, vehicleId }
  const { data } = await api.put(`/requests/${id}/assign`, payload);
  return data;
};

export const deleteRequest = async (id) => {
  const { data } = await api.delete(`/requests/${id}`);
  return data;
};

/* ─────────────────────────────────────────────────────────
   MISSIONS
───────────────────────────────────────────────────────── */
export const fetchMissions = async (params = {}) => {
  const { data } = await api.get("/missions", { params });
  return data;
};

export const updateMission = async (id, payload) => {
  const { data } = await api.put(`/missions/${id}`, payload);
  return data;
};

/* ─────────────────────────────────────────────────────────
   USERS (chauffeurs disponibles / passagers)
───────────────────────────────────────────────────────── */
export const fetchUsers = async (params = {}) => {
  const { data } = await api.get("/users", { params });
  return data;
};

export const fetchAvailableDrivers = async () => {
  const { data } = await api.get("/users", { params: { role: "CHAUFFEUR" } });
  return (data.data || []).filter(u => u.availability === "DISPONIBLE");
};

export const createUser = async (payload) => {
  const { data } = await api.post("/users", payload);
  return data.user;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data.user;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

/* ─────────────────────────────────────────────────────────
   VEHICLES
───────────────────────────────────────────────────────── */
export const fetchVehicles = async (params = {}) => {
  const { data } = await api.get("/vehicles", { params });
  return data;
};

export const createVehicle = async (payload) => {
  const { data } = await api.post("/vehicles", payload);
  return data.vehicle;
};

export const updateVehicle = async (id, payload) => {
  const { data } = await api.put(`/vehicles/${id}`, payload);
  return data.vehicle;
};

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`/vehicles/${id}`);
  return data;
};

export const fetchAvailableVehicles = async () => {
  const { data } = await api.get("/vehicles");
  return (data.data || []).filter(v => v.status === "DISPONIBLE");
};

/* ─────────────────────────────────────────────────────────
   NOTIFICATIONS
───────────────────────────────────────────────────────── */
export const fetchNotifications = async (params = {}) => {
  const { data } = await api.get("/notifications", { params });
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};

/* ─────────────────────────────────────────────────────────
   AVIS
───────────────────────────────────────────────────────── */
export const fetchAvis = async (params = {}) => {
  const { data } = await api.get("/avis", { params });
  return data;
};

/* ─────────────────────────────────────────────────────────
   MAPPERS
───────────────────────────────────────────────────────── */
const STATUT_MAP = {
  EN_ATTENTE: "EN ATTENTE",
  APPROUVEE:  "CONFIRMÉE",
  REJETEE:    "REFUSÉE",
  ANNULEE:    "ANNULÉE",
};

export const mapRequest = (req) => {
  if (!req || !req.userId || !req.from) return null; // Force null if broken
  let statut = STATUT_MAP[req.status] ?? req.status ?? "EN ATTENTE";
  if (req.mission) {
    if (req.mission.status === "EN_COURS") statut = "EN COURS";
    if (req.mission.status === "TERMINEE") statut = "TERMINÉE";
  }
  const passagerName = req.userId?.name || req.userName || "";
  if (!passagerName) return null;

  return {
    _id:      req._id || req.id,
    ref:      `#DEM-${String(req._id || req.id).slice(-4).toUpperCase()}`,
    passager: passagerName,
    avatar:   passagerName.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??",
    trajet:   `${req.from} → ${req.to}`,
    depart:   req.from,
    arrivee:  req.to,
    date:     req.date ? req.date.slice(0, 10) : (req.createdAt ? req.createdAt.slice(0, 10) : ""),
    heure:    req.time || "",
    type:     req.type || "standard",
    statut,
    chauffeur: req.mission?.driverId?.name ?? "Non affecté",
    vehicule:  req.mission?.vehicleId?.name ?? "",
    passagers: req.passengers ?? 1,
    raw: req,
  };
};

export const mapMission = (m) => {
  const MISSION_STATUT = {
    EN_ATTENTE: "EN ATTENTE",
    EN_COURS:   "EN COURS",
    TERMINEE:   "TERMINÉE",
    ANNULEE:    "ANNULÉE",
  };
  return {
    _id:      m._id || m.id,
    ref:      `#MSN-${String(m._id || m.id).slice(-4).toUpperCase()}`,
    trajet:   m.requestId ? `${m.requestId.from} → ${m.requestId.to}` : "—",
    depart:   m.requestId?.from ?? "—",
    arrivee:  m.requestId?.to ?? "—",
    date:     m.requestId?.date ? m.requestId.date.slice(0, 10) : "",
    heure:    m.requestId?.time ?? "—",
    statut:   MISSION_STATUT[m.status] ?? m.status,
    chauffeur: m.driverId?.name ?? "—",
    vehicule:  m.vehicleId?.name ?? "—",
    client:   m.requestId?.userId?.name ?? "—",
    passagers: m.requestId?.passengers ?? 1,
    raw: m,

  };
};

export const formatTimeAgo = (isoDate) => {
  if (!isoDate) return "";
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} jour${diff > 172800 ? "s" : ""}`;
};