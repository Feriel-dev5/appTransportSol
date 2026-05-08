import api from "./api";

/* ─────────────────────────────────────────────────────────
   DASHBOARD ADMIN — stats + user profile + week chart
───────────────────────────────────────────────────────── */
export const fetchAdminDashboard = async () => {
  const { data } = await api.get("/users/me/admin-dashboard");
  return data;
};

export const fetchPendingAvisCount = async () => {
  try {
    const { data } = await api.get("/avis", { params: { limit: 500 } });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.filter(a => a.statut === "EN_ATTENTE").length;
  } catch {
    return 0;
  }
};

/* ─────────────────────────────────────────────────────────
   USERS
───────────────────────────────────────────────────────── */
export const fetchUsers = async (params = {}) => {
  // params: { role?, page?, limit? }
  const { data } = await api.get("/users", { params });
  return data; // { page, limit, data: User[] }
};

export const createUser = async (payload) => {
  // payload: { name, email, password, role, phone, cin, passportNumber, address }
  const { data } = await api.post("/users", payload);
  return data.user;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data.user;
};

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
    window.dispatchEvent(new Event("airops-admin-profile-update"));
  } catch {/* ignore */}
  return data.user;
};
export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

export const fetchVehicles = async (params = {}) => {
  const { data } = await api.get("/vehicles", { params });
  return data; // { page, limit, data: Vehicle[] }
};

export const createVehicle = async (payload) => {
  const { data } = await api.post("/vehicles", payload);
  return data;
};

export const updateVehicle = async (id, payload) => {
  const { data } = await api.put(`/vehicles/${id}`, payload);
  return data;
};

export const deleteVehicle = async (id) => {
  const { data } = await api.delete(`/vehicles/${id}`);
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
   MAPPERS
───────────────────────────────────────────────────────── */
export const mapUser = (u) => ({
  _id: u.id || u._id,
  name: u.name ?? "—",
  email: u.email ?? "—",
  role: u.role ?? "—",
  phone: u.phone ?? "—",
  cin: u.cin ?? "",
  passportNumber: u.passportNumber ?? "",
  address: u.address ?? "",
  availability: u.availability ?? "DISPONIBLE",
  initials: (u.name ?? "?")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "??",
});

export const mapVehicle = (v) => ({
  _id: v._id || v.id,
  plate: v.plate ?? "—",
  model: v.model ?? "—",
  type: v.type ?? "—",
  capacity: v.capacity ?? "—",
  status: v.status ?? "DISPONIBLE",
  raw: v,
});

export const formatTimeAgo = (isoDate) => {
  if (!isoDate) return "";
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)} jour${diff > 172800 ? "s" : ""}`;
};
