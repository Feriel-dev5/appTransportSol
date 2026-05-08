import api from "./api";

/* ─────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────── */
export const fetchDriverDashboard = async () => {
  const { data } = await api.get("/users/me/driver-dashboard");
  return data;
  // { stats: { missionsToday, upcomingMissions, completedMissions }, nextMissions, latestNotifications }
};

/* ─────────────────────────────────────────────────────────
   MISSIONS
───────────────────────────────────────────────────────── */
export const fetchMyMissions = async (params = {}) => {
  const { data } = await api.get("/missions/my", { params });
  return data;
};

export const fetchMissionById = async (id) => {
  const { data } = await api.get(`/missions/${id}`);
  return data;
};

export const startMission = async (id) => {
  const { data } = await api.put(`/missions/${id}/start`);
  return data;
};

export const endMission = async (id) => {
  const { data } = await api.put(`/missions/${id}/end`);
  return data;
};

export const cancelMission = async (id) => {
  const { data } = await api.put(`/missions/${id}/cancel`);
  return data;
};

/* ─────────────────────────────────────────────────────────
   RÉCLAMATIONS / INCIDENTS
───────────────────────────────────────────────────────── */
export const createIncident = async (payload) => {
  // payload: { description, missionId? }
  const { data } = await api.post("/incidents", payload);
  return data.incident;
};

export const fetchMyIncidents = async (params = {}) => {
  const { data } = await api.get("/incidents/my", { params });
  return data;
};

export const deleteIncident = async (id) => {
  const { data } = await api.delete(`/incidents/${id}`);
  return data;
};

export const deleteAllIncidents = async () => {
  const { data } = await api.delete("/incidents/my/all");
  return data;
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

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export const deleteAllNotifications = async () => {
  const { data } = await api.delete("/notifications");
  return data;
};

/* ─────────────────────────────────────────────────────────
   PROFIL
───────────────────────────────────────────────────────── */
export const fetchMyProfile = async () => {
  const { data } = await api.get("/users/me");
  return data.user;
};

export const updateMyProfile = async (payload) => {
  const { data } = await api.patch("/users/me", payload);
  try {
    const current = JSON.parse(localStorage.getItem("user") || "{}");
    const merged = { ...current, ...data.user };
    localStorage.setItem("user", JSON.stringify(merged));
    window.dispatchEvent(new Event("airops-profile-update"));
  } catch {}
  return data.user;
};

export const updateMyPassword = async (payload) => {
  // payload: { currentPassword, newPassword }
  const { data } = await api.patch("/users/me/password", payload);
  return data;
};

/* ─────────────────────────────────────────────────────────
   MAPPERS
───────────────────────────────────────────────────────── */
const STATUT_MAP = {
  EN_ATTENTE: "CONFIRMÉE",
  EN_COURS:   "EN COURS",
  TERMINEE:   "TERMINÉE",
  ANNULEE:    "ANNULÉE",
};

export const mapMission = (m) => {
  if (!m || !m.requestId || typeof m.requestId !== "object" || !m.requestId.from) return null;
  return {
    _id:      m._id || m.id,
    ref:      `#MSN-${String(m._id || m.id).slice(-4).toUpperCase()}`,
    trajet:   `${m.requestId.from} → ${m.requestId.to}`,
    vers:     m.requestId.to || "",
    depart:   m.requestId.from || "",
    arrivee:  m.requestId.to || "",
    date:     m.requestId.date ? m.requestId.date.slice(0, 10) : (m.createdAt ? m.createdAt.slice(0, 10) : ""),
    heure:    m.requestId.time || "",
    statut:   STATUT_MAP[m.status] ?? m.status,
    statusRaw: m.status,
    client:   m.requestId.userId?.name || "",
    vehicule: m.vehicleId?.name || "",
    passagers: m.requestId.passengers || 1,
    bagage:   m.requestId.comment || "",
    type:     m.requestId.type || "standard",
    raw: m,
  };
};

export const mapIncident = (i) => ({
  id:          i._id || i.id,
  ref:         `#INC-${String(i._id || i.id).slice(-4).toUpperCase()}`,
  description: i.description ?? "",
  statut:      i.status === "RESOLU" ? "resolu" : "ouvert",
  priorite:    i.priority === "high" ? "Haute" : i.priority === "medium" ? "Moyenne" : "Faible",
  date:        i.createdAt ? new Date(i.createdAt).toLocaleDateString("fr-FR") : "",
  missionRef:  i.missionId ? `#MSN-${String(i.missionId._id || i.missionId).slice(-4).toUpperCase()}` : "—",
  raw: i,
});

export const formatTimeAgo = (isoDate) => {
  if (!isoDate) return "";
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60)    return "À l'instant";
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} jour${diff > 172800 ? "s" : ""}`;
};