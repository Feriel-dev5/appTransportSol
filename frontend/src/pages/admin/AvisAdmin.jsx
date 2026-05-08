import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../services/api";

const avisAdminCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand-dark:   #0d2b5e;
    --brand-mid:    #1252aa;
    --brand-blue:   #2980e8;
    --brand-light:  #7ec8ff;
    --accent-orange:#f97316;
    --accent-green: #16a34a;
    --accent-red:   #ef4444;
    --accent-yellow:#f59e0b;
    --bg-page:      #f0f5fb;
    --border:       #e4ecf4;
    --text-primary: #0d2b5e;
    --text-sec:     #334155;
    --text-muted:   #64748b;
    --sidebar-full: 230px;
    --sidebar-mini: 66px;
    --header-h:     64px;
    --shadow-sm:    0 2px 12px rgba(13,43,94,0.07);
    --shadow-md:    0 8px 32px rgba(13,43,94,0.13);
    --shadow-lg:    0 20px 50px rgba(13,43,94,0.18);
    --tr:           all 0.25s ease;
  }

  .aaw { display:flex; height:100vh; overflow:hidden; background:var(--bg-page); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--text-primary); }

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
  .sb-badge { background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0; transition:opacity 0.2s; margin-left:auto; }
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

  .aam { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .aah { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .aah-left  { display:flex; align-items:center; gap:12px; }
  .aah-right { display:flex; align-items:center; gap:14px; }
  .aah-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .aah-menu-btn:hover { background:var(--bg-page); }
  .aah-title { font-size:15px; font-weight:700; color:var(--text-primary); }
  .user-chip { display:flex; align-items:center; gap:9px; }
  .user-info-adm { text-align:right; }
  .user-name-adm  { font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; }
  .user-role-adm  { font-size:10px; color:var(--text-muted); letter-spacing:0.8px; text-transform:uppercase; }
  .user-avatar-adm { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; cursor:pointer; }
  .user-avatar-adm img { width:100%; height:100%; object-fit:cover; }

  .aac { flex:1; overflow-y:auto; padding:26px; }

  .page-title { font-size:clamp(22px,3vw,30px); font-weight:800; color:var(--brand-dark); letter-spacing:-0.5px; margin-bottom:4px; }
  .page-title span { color:var(--brand-blue); }
  .page-sub { font-size:13px; color:var(--text-muted); margin-bottom:22px; }

  .av-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .av-sc { background:#fff; border:1px solid var(--border); border-radius:20px; padding:18px 20px; box-shadow:var(--shadow-sm); position:relative; overflow:hidden; transition:var(--tr); cursor:default; }
  .av-sc::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0; }
  .av-sc.yellow::before { background:var(--accent-yellow); }
  .av-sc.green::before  { background:var(--accent-green); }
  .av-sc.red::before    { background:var(--accent-red); }
  .av-sc.blue::before   { background:var(--brand-blue); }
  .av-sc:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
  .av-sc-icon { font-size:26px; margin-bottom:8px; }
  .av-sc-val { font-size:28px; font-weight:800; color:var(--brand-dark); line-height:1; }
  .av-sc-lbl { font-size:11px; color:var(--text-muted); margin-top:4px; font-weight:600; }

  .av-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .av-filter-btn { padding:7px 16px; border-radius:20px; border:1.5px solid var(--border); background:#fff; color:var(--text-sec); font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); display:flex; align-items:center; gap:6px; }
  .av-filter-btn:hover { border-color:var(--brand-blue); color:var(--brand-blue); }
  .av-filter-btn.active { background:var(--brand-blue); color:#fff; border-color:var(--brand-blue); box-shadow:0 2px 8px rgba(41,128,232,0.25); }
  .av-filter-btn.green.active { background:var(--accent-green); border-color:var(--accent-green); }
  .av-filter-btn.red.active   { background:var(--accent-red);   border-color:var(--accent-red);   }
  .av-filter-btn.yellow.active{ background:var(--accent-yellow); border-color:var(--accent-yellow);}
  .av-count { margin-left:auto; font-size:12px; color:var(--text-muted); font-weight:600; }

  .av-search-wrap { position:relative; }
  .av-search-wrap svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
  .av-search { padding:8px 12px 8px 32px; border:1.5px solid var(--border); border-radius:22px; font-size:13px; font-family:inherit; background:var(--bg-page); color:var(--text-primary); outline:none; width:220px; transition:var(--tr); }
  .av-search:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }

  .av-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:18px; }

  .av-card { background:#fff; border:1px solid var(--border); border-radius:20px; padding:22px; box-shadow:var(--shadow-sm); transition:var(--tr); position:relative; overflow:hidden; display:flex; flex-direction:column; gap:14px; }
  .av-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0; }
  .av-card.en-attente::before { background:var(--accent-yellow); }
  .av-card.accepter::before   { background:var(--accent-green); }
  .av-card.refuser::before    { background:var(--accent-red); }
  .av-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }

  .av-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
  .av-author { display:flex; align-items:center; gap:10px; }
  .av-avatar { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; flex-shrink:0; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); }
  .av-author-info { display:flex; flex-direction:column; }
  .av-author-name { font-size:13px; font-weight:700; color:var(--text-primary); }
  .av-author-role { font-size:11px; color:var(--text-muted); }

  .av-statut-badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; padding:4px 11px; border-radius:20px; white-space:nowrap; flex-shrink:0; text-transform:uppercase; letter-spacing:0.5px; }
  .av-statut-badge.en-attente { background:#fefce8; color:#a16207; border:1px solid #fde68a; }
  .av-statut-badge.accepter   { background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; }
  .av-statut-badge.refuser    { background:#fef2f2; color:#991b1b; border:1px solid #fecaca; }

  .av-cat-badge { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; background:#eff6ff; color:var(--brand-blue); }

  .av-stars { display:flex; gap:2px; }
  .av-star { font-size:14px; }
  .av-text { font-size:13px; color:var(--text-sec); line-height:1.65; }
  .av-date { font-size:11px; color:var(--text-muted); }

  .av-actions { display:flex; gap:8px; margin-top:4px; flex-wrap:wrap; }
  .av-btn-accept { display:flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; border:none; background:var(--accent-green); color:#fff; font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); }
  .av-btn-accept:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); }
  .av-btn-accept:disabled { opacity:0.5; cursor:not-allowed; }
  .av-btn-refuse { display:flex; align-items:center; gap:6px; padding:9px 18px; border-radius:10px; border:none; background:var(--accent-red); color:#fff; font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); }
  .av-btn-refuse:hover:not(:disabled) { background:#b91c1c; transform:translateY(-1px); }
  .av-btn-refuse:disabled { opacity:0.5; cursor:not-allowed; }

  .av-empty { text-align:center; padding:60px 20px; color:var(--text-muted); grid-column:1/-1; }
  .av-empty-icon { font-size:52px; margin-bottom:12px; }
  .av-empty-title { font-size:16px; font-weight:700; color:var(--text-sec); margin-bottom:6px; }

  .av-loading { display:flex; align-items:center; justify-content:center; padding:60px; grid-column:1/-1; }
  .av-spinner { width:36px; height:36px; border:3px solid var(--border); border-top-color:var(--brand-blue); border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
  @keyframes spin { to { transform:rotate(360deg); } }

  .av-toast { position:fixed; top:18px; right:18px; z-index:200000; background:var(--brand-dark); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); border-left:3px solid var(--brand-light); animation:toastIn 0.3s ease; pointer-events:none; }
  @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

  .aaf { background:#fff; border-top:1px solid var(--border); padding:14px 26px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; font-size:11px; color:var(--text-muted); }
  .aaf-brand { display:flex; align-items:center; gap:8px; }

  @media (max-width:1100px) { .av-stats { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:768px) {
    .sidebar { position:fixed; left:0; top:0; bottom:0; z-index:30; transform:translateX(-100%); width:var(--sidebar-full) !important; transition:transform 0.3s ease !important; }
    .sidebar.open { transform:translateX(0); }
    .sidebar.collapsed { transform:translateX(-100%); }
    .sidebar.collapsed.open { transform:translateX(0); }
    .sb-overlay { display:block; }
    .aah-menu-btn { display:flex; }
    .sb-toggle-btn { display:none; }
    .aac { padding:16px; }
    .aah { padding:0 16px; }
    .av-grid { grid-template-columns:1fr; }
    .av-toolbar { gap:6px; }
    .av-search { width:160px; }
  }
  @media (max-width:480px) {
    .av-stats { grid-template-columns:1fr 1fr; }
    .user-info-adm { display:none; }
    .aac { padding:12px; }
    .page-title { font-size:20px; }
    .av-search { width:120px; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("avis-admin-css")) {
  const tag = document.createElement("style");
  tag.id = "avis-admin-css";
  tag.textContent = avisAdminCSS;
  document.head.appendChild(tag);
}

function getAdminInfo() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const name = u.name || "Admin";
    const initials = name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "A";
    const photo = localStorage.getItem("airops_admin_profil_photo_v1") || "";
    return { name, initials, photo };
  } catch {
    return { name: "Admin", initials: "A", photo: "" };
  }
}

function passengerAbbrev(name) {
  if (!name) return "Anonyme";
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const prenom = parts[0];
  const nom = parts[parts.length - 1];
  return `${nom}.${prenom[0].toUpperCase()}`;
}

function avatarInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

const CAT_ICONS = { chauffeur: "🚗", services: "🛎️", application: "📱" };
const CAT_LABELS = { chauffeur: "Chauffeur", services: "Services", application: "Application" };

function Stars({ note }) {
  return (
    <div className="av-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="av-star" style={{ filter: i <= note ? "none" : "grayscale(1)" }}>⭐</span>
      ))}
    </div>
  );
}

const navItems = [
  {
    label: "Tableau de Bord", to: "/dashbordADMIN",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  },
  {
    label: "Liste des Utilisateurs", to: "/listeU",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    label: "Liste des Véhicules", to: "/listeV",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2" /><circle cx="7" cy="21" r="2" /><circle cx="17" cy="21" r="2" /></svg>,
  },
  {
    label: "Ajouter Utilisateur", to: "/ajouterU",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg>,
  },
  {
    label: "Ajouter Véhicule", to: "/ajouterVehicule",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>,
  },
  {
    label: "Gestion des Avis", to: "/avisAdmin",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  {
    label: "Mon Profil", to: "/profilA",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
];

export default function AvisAdmin() {
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("EN_ATTENTE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [avisList, setAvisList] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  const stats = {
    total: avisList.length,
    enAttente: avisList.filter(a => a.statut === "EN_ATTENTE").length,
    acceptes: avisList.filter(a => a.statut === "ACCEPTER").length,
    refuses: avisList.filter(a => a.statut === "REFUSER").length,
  };

  const fetchAvis = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/avis", { params: { limit: 200 } });
      setAvisList(Array.isArray(data?.data) ? data.data : []);
    } catch {
      showToast("❌ Erreur lors du chargement des avis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAvis(); }, [fetchAvis]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const handleModerer = async (id, statut) => {
    setActionLoading(prev => ({ ...prev, [id]: statut }));
    try {
      await api.patch(`/avis/${id}/moderer`, { statut });
      setAvisList(prev => prev.map(a => a._id === id ? { ...a, statut } : a));
      showToast(
        statut === "ACCEPTER"
          ? "✅ Avis accepté — il s'affiche maintenant sur la page d'accueil."
          : "🚫 Avis refusé avec succès."
      );
    } catch {
      showToast("❌ Erreur lors de la modération.");
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const filtered = avisList.filter(a => {
    const matchStatut = filter === "TOUS" ? true : a.statut === filter;
    const q = search.trim().toLowerCase();
    const matchSearch = q
      ? (a.message?.toLowerCase().includes(q) ||
        a.userId?.name?.toLowerCase().includes(q) ||
        a.categorie?.toLowerCase().includes(q))
      : true;
    return matchStatut && matchSearch;
  });

  const FILTERS = [
    { key: "EN_ATTENTE", label: "En attente", color: "yellow" },
    { key: "ACCEPTER", label: "Acceptés", color: "green" },
    { key: "REFUSER", label: "Refusés", color: "red" },
    { key: "TOUS", label: "Tous", color: "" },
  ];

  return (
    <div className="aaw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      {/* ── Sidebar ── */}
      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon">
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />
            </svg>
          </div>
          <div className="sb-brand-text">
            <span className="sb-brand-name">AirOps</span>
            <span className="sb-brand-sub">ESPACE ADMIN</span>
          </div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label}
              className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`}
              onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.label === "Gestion des Avis" && stats.enAttente > 0 && (
                <span className="sb-badge">{stats.enAttente}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => { localStorage.clear(); navigate("/login", { replace: true }); }}>
            <span className="sb-logout-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="aam">

        {/* Header */}
        <header className="aah">
          <div className="aah-left">
            <button type="button" className="aah-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="aah-title">Gestion des Avis Passagers</span>
          </div>
          <div className="aah-right">
            <div className="user-chip">
              <div className="user-info-adm">
                <div className="user-name-adm">{adminInfo.name}</div>
                <div className="user-role-adm">Administrateur</div>
              </div>
              <div className="user-avatar-adm" onClick={() => navigate("/profilA")} title="Mon profil">
                {adminInfo.photo
                  ? <img src={adminInfo.photo} alt="profil" />
                  : <span>{adminInfo.initials}</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="aac">
          <h1 className="page-title">Avis des <span>Passagers</span></h1>
          <p className="page-sub">
            Modérez les avis soumis par les passagers. Les avis acceptés s'affichent automatiquement sur la page d'accueil avec l'abréviation du nom du passager.
          </p>

          {/* Toolbar */}
          <div className="av-toolbar">
            {FILTERS.map(f => (
              <button key={f.key} type="button"
                className={`av-filter-btn${f.color ? ` ${f.color}` : ""}${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}>
                {f.icon} {f.label}
              </button>
            ))}
            <div className="av-search-wrap">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" className="av-search" placeholder="Rechercher…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <span className="av-count">{filtered.length} avis</span>
          </div>

          {/* Grid */}
          <div className="av-grid">
            {loading ? (
              <div className="av-loading"><div className="av-spinner" /></div>
            ) : filtered.length === 0 ? (
              <div className="av-empty">
                <div className="av-empty-icon">💬</div>
                <div className="av-empty-title">Aucun avis trouvé</div>
                <p style={{ fontSize: 13 }}>
                  {filter === "EN_ATTENTE"
                    ? "Tous les avis ont été traités. Bonne gestion !"
                    : "Aucun avis ne correspond à ce filtre."}
                </p>
              </div>
            ) : filtered.map(avis => {
              const authorName = avis.userId?.name || "Anonyme";
              const abbrev = passengerAbbrev(authorName);
              const initials = avatarInitials(authorName);
              const statutRaw = avis.statut || "EN_ATTENTE";
              const statutCls = statutRaw.toLowerCase().replace("_", "-");
              const isLoading = actionLoading[avis._id];

              return (
                <div key={avis._id} className={`av-card ${statutCls}`}>

                  {/* Top : auteur + badge statut */}
                  <div className="av-card-top">
                    <div className="av-author">
                      <div className="av-avatar">
                        {avis.userId?.photo ? (
                          <img src={avis.userId.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="av-author-info">
                        <span className="av-author-name">{abbrev}</span>
                        <span className="av-author-role">Passager</span>
                      </div>
                    </div>
                    <span className={`av-statut-badge ${statutCls}`}>
                      {statutRaw === "EN_ATTENTE" && "⏳ En attente"}
                      {statutRaw === "ACCEPTER" && "✅ Accepté"}
                      {statutRaw === "REFUSER" && "🚫 Refusé"}
                    </span>
                  </div>

                  {/* Catégorie + étoiles */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className="av-cat-badge">
                      {CAT_ICONS[avis.categorie] || "💬"} {CAT_LABELS[avis.categorie] || avis.categorie}
                    </span>
                    <Stars note={avis.note} />
                  </div>

                  {/* Message */}
                  <p className="av-text">"{avis.message}"</p>

                  {/* Date */}
                  <span className="av-date">
                    📅 {avis.createdAt
                      ? new Date(avis.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric",
                      })
                      : "—"}
                  </span>

                  {/* Boutons d'action (seulement si EN_ATTENTE) */}
                  {statutRaw === "EN_ATTENTE" && (
                    <div className="av-actions">
                      <button type="button" className="av-btn-accept"
                        disabled={!!isLoading}
                        onClick={() => handleModerer(avis._id, "ACCEPTER")}>
                        {isLoading === "ACCEPTER" ? (
                          <><span className="av-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Traitement…</>
                        ) : (
                          <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Accepter</>
                        )}
                      </button>
                      <button type="button" className="av-btn-refuse"
                        disabled={!!isLoading}
                        onClick={() => handleModerer(avis._id, "REFUSER")}>
                        {isLoading === "REFUSER" ? (
                          <><span className="av-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Traitement…</>
                        ) : (
                          <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> Refuser</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Info si accepté */}
                  {statutRaw === "ACCEPTER" && (
                    <p style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Affiché sur la Home sous le nom « {abbrev} »
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer className="aaf">
          <div className="aaf-brand">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Système de modération sécurisé — AirOps Transport 2026
          </div>
          {stats.enAttente > 0 && (
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>
              ⏳ {stats.enAttente} avis en attente de modération
            </span>
          )}
        </footer>
      </div>

      {toast && <div className="av-toast">{toast}</div>}
    </div>
  );
}