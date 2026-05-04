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

/* ─────────────────────────────────────────────────────────
   MAPPERS
───────────────────────────────────────────────────────── */
const STATUT_MAP = {
  EN_ATTENTE: "EN ATTENTE",
  EN_COURS:   "EN COURS",
  TERMINEE:   "TERMINÉE",
  ANNULEE:    "ANNULÉE",
};

export const mapMission = (m) => ({
  _id:      m._id || m.id,
  ref:      `#MSN-${String(m._id || m.id).slice(-4).toUpperCase()}`,
  trajet:   m.requestId ? `${m.requestId.from} → ${m.requestId.to}` : "—",
  vers:     m.requestId?.to ?? "—",
  depart:   m.requestId?.from ?? "—",
  arrivee:  m.requestId?.to ?? "—",
  date:     m.requestId?.date ? m.requestId.date.slice(0, 10) : "",
  heure:    m.requestId?.time ?? "—",
  statut:   STATUT_MAP[m.status] ?? m.status,
  statusRaw: m.status,
  client:   m.requestId?.userId?.name ?? "—",
  vehicule: m.vehicleId?.name ?? "—",
  passagers: m.requestId?.passengers ?? 1,
  bagage:   m.requestId?.comment ?? "",
  type:     m.requestId?.type ?? "standard",
  raw: m,
});

export const mapIncident = (i) => ({
  id:          i._id || i.id,
  ref:         `#RCL-${String(i._id || i.id).slice(-4).toUpperCase()}`,
  description: i.description ?? "",
  statut:      i.status === "RESOLU" ? "resolu" : "ouvert",
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