import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProfileSync } from "../../services/useProfileSync";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  mapNotification,
} from "../../services/passengerService";
import { logout } from "../../services/authService";

const notifCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --brand-dark:#0d2b5e;--brand-mid:#1252aa;--brand-blue:#2980e8;--brand-light:#7ec8ff;
    --accent-orange:#f97316;--accent-green:#16a34a;--accent-red:#ef4444;
    --bg-page:#f0f5fb;--border:#e4ecf4;--text-primary:#0d2b5e;--text-sec:#5a6e88;--text-muted:#94a3b8;
    --sidebar-full:230px;--sidebar-mini:66px;--header-h:64px;
    --shadow-sm:0 2px 12px rgba(13,43,94,0.07);--shadow-md:0 8px 32px rgba(13,43,94,0.13);--shadow-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .nw { display:flex; height:100vh; overflow:hidden; background:var(--bg-page); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--text-primary); }
  .sidebar { width:var(--sidebar-full); background:var(--brand-dark); display:flex; flex-direction:column; flex-shrink:0; position:relative; z-index:30; transition:width 0.3s ease; box-shadow:4px 0 24px rgba(0,0,0,0.2); overflow:hidden; }
  .sidebar.collapsed { width:var(--sidebar-mini); }
  .sb-brand { display:flex; align-items:center; gap:10px; padding:18px 13px 16px; border-bottom:1px solid rgba(255,255,255,0.07); cursor:pointer; flex-shrink:0; min-height:68px; overflow:hidden; }
  .sb-brand-icon { width:40px; height:40px; min-width:40px; background:var(--brand-blue); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(41,128,232,0.4); }
  .sb-brand-text { overflow:hidden; white-space:nowrap; opacity:1; transition:opacity 0.2s ease; }
  .sidebar.collapsed .sb-brand-text { opacity:0; }
  .sb-brand-name { font-size:17px; font-weight:800; color:#fff; letter-spacing:-0.4px; display:block; }
  .sb-brand-sub  { font-size:9px; color:rgba(255,255,255,0.4); letter-spacing:1.8px; font-weight:600; display:block; }
  .sb-toggle-btn { position:absolute; top:22px; right:10px; width:22px; height:22px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; transition:var(--tr); flex-shrink:0; }
  .sb-toggle-btn:hover { background:var(--brand-blue); border-color:var(--brand-blue); }
  .sb-toggle-btn svg { transition:transform 0.3s ease; }
  .sidebar.collapsed .sb-toggle-btn svg { transform:rotate(180deg); }
  .sb-label { font-size:9px; font-weight:700; letter-spacing:1.8px; color:rgba(255,255,255,0.25); padding:14px 14px 5px; text-transform:uppercase; white-space:nowrap; overflow:hidden; transition:opacity 0.2s; }
  .sidebar.collapsed .sb-label { opacity:0; }
  .sb-nav { padding:0 9px; flex:1; overflow-y:auto; overflow-x:hidden; }
  .sb-nav::-webkit-scrollbar { display:none; }
  .sb-nav-item { display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; text-decoration:none; font-size:13.5px; font-weight:500; color:rgba(255,255,255,0.58); transition:var(--tr); margin-bottom:3px; position:relative; overflow:hidden; white-space:nowrap; }
  .sb-nav-item:hover { color:#fff; background:rgba(255,255,255,0.09); }
  .sb-nav-item.active { color:#fff; font-weight:700; background:linear-gradient(135deg,var(--brand-blue),#1a6fd4); box-shadow:0 4px 16px rgba(41,128,232,0.35); }
  .sb-nav-item.active::before { content:''; position:absolute; left:-9px; top:50%; transform:translateY(-50%); width:3px; height:55%; background:var(--brand-light); border-radius:0 3px 3px 0; }
  .sb-nav-icon { flex-shrink:0; width:18px; height:18px; display:flex; align-items:center; justify-content:center; }
  .sb-nav-lbl  { flex:1; overflow:hidden; transition:opacity 0.2s,max-width 0.3s; max-width:160px; }
  .sidebar.collapsed .sb-nav-lbl { opacity:0; max-width:0; }
  .sb-badge { background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0; transition:opacity 0.2s; }
  .sidebar.collapsed .sb-badge { opacity:0; }
  .sidebar.collapsed .sb-nav-item::after { content:attr(data-label); position:absolute; left:calc(var(--sidebar-mini) + 6px); top:50%; transform:translateY(-50%); background:var(--brand-dark); color:#fff; font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px; white-space:nowrap; pointer-events:none; box-shadow:var(--shadow-md); border:1px solid rgba(255,255,255,0.1); z-index:200; opacity:0; transition:opacity 0.15s; }
  .sidebar.collapsed .sb-nav-item:hover::after { opacity:1; }
  .sb-footer { padding:6px 9px 16px; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
  .sb-logout { width:100%; display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; border:none; background:transparent; color:rgba(255,255,255,0.4); font-size:13.5px; font-weight:500; cursor:pointer; transition:var(--tr); font-family:inherit; white-space:nowrap; overflow:hidden; }
  .sb-logout:hover { color:#fca5a5; background:rgba(239,68,68,0.1); }
  .sb-logout-icon { flex-shrink:0; }
  .sb-logout-lbl  { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .sidebar.collapsed .sb-logout-lbl { opacity:0; max-width:0; }
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  .nm { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .nh { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .nh-left  { display:flex; align-items:center; gap:12px; }
  .nh-right { display:flex; align-items:center; gap:10px; }
  .nh-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .nh-menu-btn:hover { background:var(--bg-page); color:var(--text-primary); }
  .nh-title { font-size:15px; font-weight:700; color:var(--text-primary); }
  .search-wrap { position:relative; }
  .search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
  .search-input { width:230px; padding:9px 12px 9px 34px; border:1.5px solid var(--border); border-radius:22px; background:var(--bg-page); font-size:13px; font-family:inherit; color:var(--text-primary); outline:none; transition:var(--tr); }
  .search-input:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color:var(--text-muted); }
  .user-chip { display:flex; align-items:center; gap:9px; cursor:default; }
  .user-info-r { text-align:right; }
  .user-name { font-size:13px; font-weight:700; color:var(--text-primary); }
  .user-role { font-size:11px; color:var(--text-muted); }
  .user-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; }

  .nc { flex:1; overflow-y:auto; padding:26px; }
  .page-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom:22px; flex-wrap:wrap; }
  .page-title { font-size:clamp(22px,3vw,34px); font-weight:800; color:var(--brand-blue); letter-spacing:-0.8px; line-height:1; }
  .page-subtitle { font-size:13px; color:var(--text-muted); margin-top:6px; }
  .unread-card { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--shadow-sm); padding:18px 24px; min-width:200px; display:flex; flex-direction:column; gap:4px; transition:var(--tr); flex-shrink:0; }
  .unread-card:hover { box-shadow:var(--shadow-md); }
  .unread-label { font-size:9px; font-weight:700; letter-spacing:2px; color:var(--text-muted); text-transform:uppercase; }
  .unread-count { font-size:38px; font-weight:800; color:var(--text-primary); letter-spacing:-1px; }
  .mark-all-btn { font-size:13px; font-weight:700; color:var(--brand-blue); background:none; border:none; cursor:pointer; padding:0; text-align:left; font-family:inherit; transition:color 0.2s; margin-top:4px; }
  .mark-all-btn:hover { color:var(--brand-mid); }
  .notif-card { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--shadow-sm); overflow:hidden; transition:var(--tr); margin-bottom:20px; }
  .notif-card:hover { box-shadow:var(--shadow-md); }
  .notif-toolbar { display:flex; align-items:center; justify-content:space-between; padding:14px 22px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:10px; }
  .filter-tabs { display:flex; align-items:center; gap:2px; background:#f0f5fb; border-radius:14px; padding:4px; }
  .filter-btn { padding:8px 16px; border-radius:12px; border:none; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:var(--tr); background:transparent; color:var(--text-sec); }
  .filter-btn:hover { color:var(--text-primary); background:rgba(255,255,255,0.7); }
  .filter-btn.active { background:#fff; color:var(--brand-blue); box-shadow:var(--shadow-sm); }
  .notif-count { font-size:12px; color:var(--text-muted); white-space:nowrap; }
  .notif-list {}
  .notif-item { display:flex; align-items:flex-start; gap:16px; padding:18px 22px; border-bottom:1px solid #f1f5f9; transition:background 0.18s; }
  .notif-item:last-child { border-bottom:none; }
  .notif-item:hover { background:#f8fafc; }
  .notif-icon-wrap { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .notif-body { flex:1; min-width:0; }
  .notif-title-row { display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap; }
  .notif-title { font-size:13.5px; font-weight:700; color:var(--text-primary); }
  .notif-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .notif-msg { font-size:13px; color:var(--text-sec); line-height:1.55; }
  .notif-time { font-size:11px; color:var(--text-muted); margin-top:8px; }
  .notif-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end; }
  .btn-toggle-read { padding:7px 13px; font-size:12px; font-weight:600; border-radius:10px; border:1px solid var(--border); background:#f8fafc; color:var(--text-sec); cursor:pointer; font-family:inherit; transition:var(--tr); white-space:nowrap; }
  .btn-toggle-read:hover { background:#eff6ff; color:var(--brand-blue); border-color:#bfdbfe; }
  .btn-delete { padding:7px 13px; font-size:12px; font-weight:600; border-radius:10px; border:1px solid #fecaca; background:#fef2f2; color:var(--accent-red); cursor:pointer; font-family:inherit; transition:var(--tr); white-space:nowrap; }
  .btn-delete:hover { background:#fee2e2; border-color:#fca5a5; }
  .empty-state { display:flex; flex-direction:column; align-items:center; padding:60px 20px; text-align:center; }
  .empty-icon { width:64px; height:64px; border-radius:20px; background:#f0f5fb; display:flex; align-items:center; justify-content:center; margin-bottom:16px; }
  .empty-title { font-size:17px; font-weight:700; color:var(--text-primary); margin-bottom:6px; }
  .empty-sub   { font-size:13px; color:var(--text-muted); }
  .toast { position:fixed; top:18px; right:18px; z-index:200; background:var(--brand-dark); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); border-left:3px solid var(--brand-light); animation:toastIn 0.3s ease; pointer-events:none; }
  @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

  @media (max-width:768px) {
    .sidebar { position:fixed; left:0; top:0; bottom:0; z-index:30; transform:translateX(-100%); width:var(--sidebar-full) !important; transition:transform 0.3s ease !important; }
    .sidebar.open { transform:translateX(0); } .sidebar.collapsed { transform:translateX(-100%); } .sidebar.collapsed.open { transform:translateX(0); }
    .sb-overlay { display:block; } .nh-menu-btn { display:flex; } .sb-toggle-btn { display:none; }
    .nc { padding:16px; } .nh { padding:0 16px; } .page-header { flex-direction:column; } .unread-card { width:100%; }
    .notif-item { flex-wrap:wrap; gap:12px; } .notif-actions { width:100%; justify-content:flex-start; }
  }
  @media (max-width:480px) {
    .search-wrap { display:none; } .user-info-r { display:none; } .nc { padding:12px; }
    .notif-toolbar { flex-direction:column; align-items:flex-start; }
    .filter-tabs { width:100%; justify-content:space-between; }
    .filter-btn { flex:1; text-align:center; padding:7px 8px; font-size:12px; }
    .notif-item { padding:14px 14px; }
    .notif-actions { gap:6px; }
    .btn-toggle-read,.btn-delete { font-size:11px; padding:6px 10px; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("notif-page-css")) {
  const tag = document.createElement("style");
  tag.id = "notif-page-css";
  tag.textContent = notifCSS;
  document.head.appendChild(tag);
}

/* Mapping type backend → type UI pour les icônes */
const TYPE_MAP = {
  VALIDATION: "validation",
  REJET: "annulation",
  MISSION: "rappel",
  INFO: "info",
  GENERAL: "info",
};

const typeConfig = {
  validation: { iconBg: "#dcfce7", iconColor: "#16a34a", dot: "#22c55e", itemBg: "#f0fdf4" },
  attente: { iconBg: "#fff7ed", iconColor: "#ea580c", dot: "#f97316", itemBg: "#fff7ed" },
  rappel: { iconBg: "#eff6ff", iconColor: "#2563eb", dot: "#3b82f6", itemBg: "#eff6ff" },
  annulation: { iconBg: "#fef2f2", iconColor: "#dc2626", dot: "#ef4444", itemBg: "#fef2f2" },
  info: { iconBg: "#f1f5f9", iconColor: "#64748b", dot: "#94a3b8", itemBg: "#f8fafc" },
};

const navItems = [
  {
    label: "Tableau de bord",
    to: "/dashbordP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  },
  {
    label: "Réserver demande",
    to: "/reserverD",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>,
  },
  {
    label: "Notifications",
    to: "/notificationP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  },
  {
    label: "Avis des acteurs",
    to: "/avisP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  },
  {
    label: "Profile",
    to: "/profilP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  },
];

function NotifIcon({ type }) {
  const cfg = typeConfig[type] || typeConfig.info;
  return (
    <div className="notif-icon-wrap" style={{ background: cfg.iconBg }}>
      {type === "validation" && <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={cfg.iconColor} strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
      {type === "attente" && <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={cfg.iconColor} strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      {type === "rappel" && <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={cfg.iconColor} strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg>}
      {type === "annulation" && <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={cfg.iconColor} strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
      {type === "info" && <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={cfg.iconColor} strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
    </div>
  );
}

export default function NotificationP() {
  const navigate = useNavigate();

  /* ── Synchronisation nom + photo ── */
  const { nom, photo, initials } = useProfileSync();

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Chargement des notifications depuis l'API
  useEffect(() => {
    let cancelled = false;
    setLoadingNotifs(true);
    fetchNotifications({ limit: 50 })
      .then(res => {
        if (cancelled) return;
        const mapped = (res.data || []).map(n => ({
          id: n._id || n.id,
          type: TYPE_MAP[n.type] || "info",
          title: n.message || "Notification",
          message: n.message || "",
          time: mapNotification(n).time,
          unread: !n.isRead,
          _raw: n,
        }));
        setNotifications(mapped);
      })
      .catch(() => { if (!cancelled) setNotifications([]); })
      .finally(() => { if (!cancelled) setLoadingNotifs(false); });
    return () => { cancelled = true; };
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const filtered = useMemo(() => notifications.filter(n => {
    const matchFilter = filter === "Toutes" ? true : filter === "Non lues" ? n.unread : !n.unread;
    const q = search.trim().toLowerCase();
    return matchFilter && (q === "" || `${n.title} ${n.message}`.toLowerCase().includes(q));
  }), [notifications, filter, search]);

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      setToast("Toutes les notifications marquées comme lues.");
    } catch {
      setToast("❌ Erreur lors de la mise à jour.");
    }
  };
  const toggleRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;
    if (notif.unread) {
      try {
        await markNotificationAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      } catch { setToast("❌ Erreur."); }
    } else {
      // Marquer comme non-lu : juste localement (pas d'API pour ça)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: true } : n));
    }
  };
  const removeNotification = id => { setNotifications(prev => prev.filter(n => n.id !== id)); setToast("Notification supprimée."); };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navWithBadge = navItems.map(item => item.to === "/notificationP" ? { ...item, badge: unreadCount > 0 ? unreadCount : null } : item);

  return (
    <div className="nw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}><div className="sb-brand-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" /></svg></div><div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE PASSAGER</span></div></div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navWithBadge.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span><span className="sb-nav-lbl">{item.label}</span>
              {item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={handleLogout}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="nm">
        <header className="nh">
          <div className="nh-left">
            <button type="button" className="nh-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="nh-title">Notifications</span>
          </div>
          <div className="nh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" className="search-input" placeholder="Rechercher une notification…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {/* ── Avatar synchronisé ── */}
            <div className="user-chip">
              <div className="user-info-r">
                <div className="user-name">{nom}</div>
                <div className="user-role">Passager</div>
              </div>
              <div className="user-avatar">
                {photo ? <img src={photo} alt="profil" /> : initials}
              </div>
            </div>
          </div>
        </header>

        <main className="nc">
          <div className="page-header">
            <div>
              <h1 className="page-title">Centre de notifications</h1>
              <p className="page-subtitle">Consultez toutes les mises à jour liées à vos demandes de transport.</p>
            </div>
            <div className="unread-card">
              <span className="unread-label">Non lues</span>
              <span className="unread-count">{unreadCount}</span>
              <button type="button" className="mark-all-btn" onClick={markAllAsRead} disabled={unreadCount === 0} style={{ opacity: unreadCount === 0 ? 0.4 : 1, cursor: unreadCount === 0 ? "default" : "pointer" }}>
                Tout marquer comme lu
              </button>
            </div>
          </div>

          <div className="notif-card">
            <div className="notif-toolbar">
              <div className="filter-tabs">
                {["Toutes", "Non lues", "Lues"].map(tab => (
                  <button key={tab} type="button" className={`filter-btn${filter === tab ? " active" : ""}`} onClick={() => setFilter(tab)}>{tab}</button>
                ))}
              </div>
              <span className="notif-count">{filtered.length} notification{filtered.length > 1 ? "s" : ""}</span>
            </div>
            <div className="notif-list">
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" /></svg></div>
                  <p className="empty-title">Aucune notification trouvée</p>
                  <p className="empty-sub">Essayez un autre filtre ou une autre recherche.</p>
                </div>
              ) : filtered.map(item => {
                const cfg = typeConfig[item.type] || typeConfig.info;
                return (
                  <div key={item.id} className="notif-item" style={{ background: item.unread ? cfg.itemBg : "transparent" }}>
                    <NotifIcon type={item.type} />
                    <div className="notif-body">
                      <div className="notif-title-row">
                        <span className="notif-title">{item.title}</span>
                        {item.unread && <span className="notif-dot" style={{ background: cfg.dot }} />}
                      </div>
                      <p className="notif-msg">{item.message}</p>
                      <p className="notif-time">{item.time}</p>
                    </div>
                    <div className="notif-actions">
                      <button type="button" className="btn-toggle-read" onClick={() => toggleRead(item.id)}>{item.unread ? "Marquer lu" : "Marquer non lu"}</button>
                      <button type="button" className="btn-delete" onClick={() => removeNotification(item.id)}>Supprimer</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", padding: "4px 0 10px", letterSpacing: 1, textTransform: "uppercase" }}>© 2026 AirOps Transport Management</div>
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}