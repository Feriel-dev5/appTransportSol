import api from "./api";

/* ─────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────── */
export const fetchPassengerDashboard = async () => {
  const { data } = await api.get("/users/me/dashboard");
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
   DEMANDES (REQUESTS)
───────────────────────────────────────────────────────── */
export const fetchMyRequests = async (params = {}) => {
  const { data } = await api.get("/requests/my", { params });
  return data;
};

export const createRequest = async (payload) => {
  const { data } = await api.post("/requests", payload);
  return data.request;
};

export const updateRequest = async (id, payload) => {
  const { data } = await api.patch(`/requests/${id}`, payload);
  return data.request;
};

export const cancelRequest = async (id) => {
  const { data } = await api.patch(`/requests/${id}/cancel`);
  return data.request;
};

export const fetchRequestById = async (id) => {
  const { data } = await api.get(`/requests/${id}`);
  return data.request;
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
export const createAvis = async (payload) => {
  const { data } = await api.post("/avis", payload);
  return data.avis;
};

export const fetchAvis = async (params = {}) => {
  const { data } = await api.get("/avis", { params });
  return data;
};

/* ─────────────────────────────────────────────────────────
   RECLAMATIONS (passager -> POST /incidents/passager)
───────────────────────────────────────────────────────── */
export const createReclamation = async (payload) => {
  const { data } = await api.post("/incidents/passager", payload);
  return data.incident;
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
  let statut = STATUT_MAP[req.status] ?? req.status;
  if (req.mission) {
    if (req.mission.status === "EN_COURS") statut = "EN COURS";
    if (req.mission.status === "TERMINEE") statut = "TERMINÉE";
  }
  return {
    _id:    req._id || req.id,
    ref:    `#DEM-${String(req._id || req.id).slice(-4).toUpperCase()}`,
    trajet: `${req.from} → ${req.to}`,
    vers:   req.to,
    date:   req.date ? req.date.slice(0, 10) : "",
    heure:  req.time ?? "—",
    type:   req.type ?? "standard",
    statut,
    passagers: req.passengers ?? 1,
    commentaire: req.comment ?? "",
    from:   req.from,
    to:     req.to,
    chauffeur: req.mission?.driverId?.name ?? null,
    vehicule:  req.mission?.vehicleId?.name ?? null,
    missionId: req.mission?._id || req.mission?.id || null,
    missionStatus: req.mission?.status ?? null,
    detail: {
      passager: req.userId?.name || "Passager",
      depart:   req.from,
      arrivee:  req.to,
      heure:    req.time ?? "—",
      passagers: req.passengers ?? 1,
      commentaire: req.comment ?? "",
    },
    raw: req,
  };
};

export const mapNotification = (notif) => {
  const TYPE_ICON = {
    VALIDATION:        { icon: "✅", bg: "#f0fdf4", label: "Demande acceptée" },
    REQUEST_APPROVED:  { icon: "✅", bg: "#f0fdf4", label: "Demande acceptée" },
    REJET:             { icon: "❌", bg: "#fef2f2", label: "Demande refusée"  },
    REQUEST_REJECTED:  { icon: "❌", bg: "#fef2f2", label: "Demande refusée"  },
    MISSION:           { icon: "🚗", bg: "#eff6ff", label: "Mission"           },
    MISSION_ASSIGNED:  { icon: "🚗", bg: "#eff6ff", label: "Mission assignée"  },
    MISSION_CANCELLED: { icon: "⚠️", bg: "#fff7ed", label: "Mission annulée"   },
    INFO:              { icon: "📋", bg: "#fff7ed", label: "Information"       },
    GENERAL:           { icon: "🔔", bg: "#f5f3ff", label: "Notification"      },
  };
  const cfg = TYPE_ICON[notif.type] ?? TYPE_ICON.GENERAL;
  return {
    id:     notif._id || notif.id,
    icon:   cfg.icon,
    bg:     cfg.bg,
    label:  cfg.label,
    msg:    notif.message || "Nouvelle notification",
    time:   formatTimeAgo(notif.createdAt),
    unread: !notif.isRead,
    type:   notif.type,
    raw:    notif,
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