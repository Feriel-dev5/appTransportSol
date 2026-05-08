import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { fetchVehicles, updateVehicle, deleteVehicle, mapVehicle, fetchPendingAvisCount } from "../../services/adminService";

/* ══════════════════════════ CSS ══════════════════════════ */
const listeCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand-dark:   #0d2b5e;
    --brand-mid:    #1252aa;
    --brand-blue:   #2980e8;
    --brand-light:  #7ec8ff;
    --accent-green: #16a34a;
    --accent-red:   #ef4444;
    --accent-orange:#f97316;
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

  .lw { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

  /* ── Sidebar ── */
  .sidebar { width: var(--sidebar-full); background: var(--brand-dark); display: flex; flex-direction: column; flex-shrink: 0; position: relative; z-index: 30; transition: width 0.3s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.2); overflow: hidden; }
  .sidebar.collapsed { width: var(--sidebar-mini); }
  .sb-brand { display: flex; align-items: center; gap: 10px; padding: 18px 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); cursor: pointer; flex-shrink: 0; min-height: 68px; overflow: hidden; }
  .sb-brand-icon { width: 40px; height: 40px; min-width: 40px; background: var(--brand-blue); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(41,128,232,0.4); }
  .sb-brand-text { overflow: hidden; white-space: nowrap; opacity: 1; transition: opacity 0.2s ease; }
  .sidebar.collapsed .sb-brand-text { opacity: 0; }
  .sb-brand-name { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.4px; display: block; }
  .sb-brand-sub  { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 1.8px; font-weight: 600; display: block; }
  .sb-toggle-btn { position: absolute; top: 22px; right: 10px; width: 22px; height: 22px; background: rgba(255,255,255,0.12); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: var(--tr); flex-shrink: 0; border: none; }
  .sb-toggle-btn:hover { background: var(--brand-blue); }
  .sb-toggle-btn svg { transition: transform 0.3s ease; }
  .sidebar.collapsed .sb-toggle-btn svg { transform: rotate(180deg); }
  .sb-label { font-size: 9px; font-weight: 700; letter-spacing: 1.8px; color: rgba(255,255,255,0.25); padding: 14px 14px 5px; text-transform: uppercase; white-space: nowrap; overflow: hidden; transition: opacity 0.2s; }
  .sidebar.collapsed .sb-label { opacity: 0; }
  .sb-nav { padding: 0 9px; flex: 1; overflow-y: auto; overflow-x: hidden; }
  .sb-nav::-webkit-scrollbar { display: none; }
  .sb-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 12px; text-decoration: none; font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.58); transition: var(--tr); margin-bottom: 3px; position: relative; overflow: hidden; white-space: nowrap; }
  .sb-nav-item:hover { color: #fff; background: rgba(255,255,255,0.09); }
  .sb-nav-item.active { color: #fff; font-weight: 700; background: linear-gradient(135deg, var(--brand-blue), #1a6fd4); box-shadow: 0 4px 16px rgba(41,128,232,0.35); }
  .sb-nav-item.active::before { content: ''; position: absolute; left: -9px; top: 50%; transform: translateY(-50%); width: 3px; height: 55%; background: var(--brand-light); border-radius: 0 3px 3px 0; }
  .sb-nav-icon { flex-shrink: 0; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
  .sb-nav-lbl  { flex: 1; overflow: hidden; transition: opacity 0.2s, max-width 0.3s; max-width: 160px; }
  .sidebar.collapsed .sb-nav-lbl { opacity: 0; max-width: 0; }
  .sb-badge { background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; flex-shrink: 0; transition: opacity 0.2s; margin-left: auto; }
  .sidebar.collapsed .sb-badge { opacity: 0; }
  .sidebar.collapsed .sb-nav-item::after { content: attr(data-label); position: absolute; left: calc(var(--sidebar-mini) + 6px); top: 50%; transform: translateY(-50%); background: var(--brand-dark); color: #fff; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 8px; white-space: nowrap; pointer-events: none; box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.1); z-index: 200; opacity: 0; transition: opacity 0.15s; }
  .sidebar.collapsed .sb-nav-item:hover::after { opacity: 1; }
  .sb-footer { padding: 6px 9px 16px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
  .sb-logout { width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 12px; border: none; background: transparent; color: rgba(255,255,255,0.4); font-size: 13.5px; font-weight: 500; cursor: pointer; transition: var(--tr); font-family: inherit; white-space: nowrap; overflow: hidden; }
  .sb-logout:hover { color: #fca5a5; background: rgba(239,68,68,0.1); }
  .sb-logout-icon { flex-shrink: 0; }
  .sb-logout-lbl  { transition: opacity 0.2s, max-width 0.3s; max-width: 160px; overflow: hidden; }
  .sidebar.collapsed .sb-logout-lbl { opacity: 0; max-width: 0; }
  .sb-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 25; backdrop-filter: blur(2px); }

  /* ── Main ── */
  .lm { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .lh { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .lh-left  { display: flex; align-items: center; gap: 12px; }
  .lh-right { display: flex; align-items: center; gap: 14px; }
  .lh-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .lh-menu-btn:hover { background: var(--bg-page); color: var(--text-primary); }
  .lh-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  .search-input { width: 220px; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 22px; background: var(--bg-page); font-size: 13px; font-family: inherit; color: var(--text-primary); outline: none; transition: var(--tr); }
  .search-input:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color: var(--text-muted); }

  .user-chip { display: flex; align-items: center; gap: 9px; }
  .user-info  { text-align: right; }
  .user-name  { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }
  .user-role  { font-size: 10px; color: var(--text-muted); letter-spacing: 0.8px; text-transform: uppercase; }
  .user-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); flex-shrink: 0; overflow: hidden; cursor: pointer; }
  .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Content ── */
  .lc { flex: 1; overflow-y: auto; padding: 26px; }
  .page-title { font-size: 25px; font-weight: 800; color: var(--brand-dark); letter-spacing: -0.5px; margin-bottom: 4px; }
  .page-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }


  /* ── Toolbar ── */
  .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .filter-bar { display: flex; align-items: center; gap: 1px; background: #f1f5f9; border-radius: 10px; padding: 2px; flex-wrap: wrap; }
  .filter-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; border: none; background: transparent; color: var(--text-sec); cursor: pointer; font-family: inherit; transition: var(--tr); white-space: nowrap; }
  .filter-btn.active { background: #fff; color: var(--brand-dark); box-shadow: var(--shadow-sm); }
  .filter-btn:hover:not(.active) { color: var(--text-primary); }
  .add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); color: #fff; border: none; border-radius: 12px; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); white-space: nowrap; }
  .add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }

  /* ── Table card ── */
  .tbl-card { background: #fff; border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-sm); overflow: visible; transition: var(--tr); }
  .tbl-card:hover { box-shadow: var(--shadow-md); }
  .tbl-head { display: grid; grid-template-columns: 200px 1fr 140px 140px 140px 60px; padding: 10px 22px; background: #f8fafc; border-bottom: 1px solid var(--border); font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; border-radius: 20px 20px 0 0; }
  .tbl-row { display: grid; grid-template-columns: 200px 1fr 140px 140px 140px 60px; align-items: center; padding: 13px 22px; border-bottom: 1px solid #f1f5f9; transition: background 0.18s; position: relative; }
  .tbl-row:last-child { border-bottom: none; }
  .tbl-row:hover { background: #f0f5fb; }
  
  .cell-plate { font-size: 13.5px; font-weight: 800; color: var(--brand-dark); font-family: 'DM Sans', sans-serif; letter-spacing: 1px; background: #f8fafc; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); width: fit-content; }
  .cell-model { font-size: 13.5px; font-weight: 700; color: var(--text-primary); }
  .cell-type  { font-size: 12px; font-weight: 600; color: var(--text-sec); }
  .cell-cap   { font-size: 13px; font-weight: 700; color: var(--brand-mid); }

  .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; width: fit-content; text-transform: uppercase; }
  .status-DISPONIBLE { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .status-MAINTENANCE { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .status-OCCUPE { background: #eff6ff; color: #1d4ed8; border: 1px solid #bbf7d0; }
  .sdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: currentColor; }

  /* ── Action menu ── */
  .am-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
  .am-btn { width: 32px; height: 32px; border-radius: 8px; background: none; border: 1px solid transparent; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--tr); }
  .am-btn:hover { background: #f0f5fb; border-color: var(--border); color: var(--brand-blue); }
  .am-drop { position: fixed; z-index: 99999; width: 180px; background: #fff; border-radius: 14px; box-shadow: 0 8px 40px rgba(13,43,94,0.22); border: 1px solid var(--border); overflow: hidden; animation: dropIn 0.18s ease; }
  @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: none; } }
  .am-item { width: 100%; display: flex; align-items: center; gap: 9px; padding: 11px 15px; background: none; border: none; font-size: 13px; font-weight: 500; font-family: inherit; text-align: left; cursor: pointer; color: var(--text-primary); transition: background 0.15s; }
  .am-item:hover { background: #f0f5fb; }
  .am-item.am-red { color: var(--accent-red); }
  .am-item.am-red:hover { background: #fef2f2; }
  .am-sep { height: 1px; background: var(--border); margin: 3px 0; }

  /* ── Pagination ── */
  .pag { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
  .pag-info { font-size: 12px; color: var(--text-muted); }
  .pag-controls { display: flex; align-items: center; gap: 3px; }
  .pag-btn { min-width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #fff; color: var(--text-sec); font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--tr); }
  .pag-btn:hover:not(:disabled) { border-color: var(--brand-blue); color: var(--brand-blue); }
  .pag-btn:disabled { opacity: 0.35; }
  .pag-btn.active { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); }

  /* ── Modal ── */
  .modal-ov { position: fixed; inset: 0; z-index: 100; background: rgba(13,43,94,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal-box { background: #fff; border-radius: 24px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
  .mh { background: linear-gradient(135deg, var(--brand-dark), var(--brand-mid)); padding: 22px 24px; color: #fff; }
  .mh-title { font-size: 20px; font-weight: 800; }
  .mf-grid { padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ef { display: flex; flex-direction: column; gap: 5px; }
  .ef.full { grid-column: 1 / -1; }
  .ef-lbl { font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
  .ef-input, .ef-sel { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: inherit; outline: none; transition: var(--tr); }
  .ef-input:focus, .ef-sel:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid var(--border); }
  .btn-cancel { padding: 10px 20px; font-size: 13px; border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer; }
  .btn-save { padding: 10px 24px; font-size: 13px; font-weight: 700; color: #fff; border: none; border-radius: 10px; background: var(--brand-blue); cursor: pointer; }

  /* ── Toast ── */
  .toast { position: fixed; top: 18px; right: 18px; z-index: 999999; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }

  .av-loading { display: flex; align-items: center; justify-content: center; padding: 60px; }
  .av-spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--brand-blue); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 1000px) {
    .tbl-head, .tbl-row { grid-template-columns: 140px 1fr 120px 60px; }
    .col-cap, .col-status { display: none; }
  }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; }
    .sidebar.open { transform: translateX(0); }
    .lh-menu-btn { display: flex; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("liste-vehicules-css")) {
  const tag = document.createElement("style");
  tag.id = "liste-vehicules-css";
  tag.textContent = listeCSS;
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

const navItems = [
  { label: "Tableau de Bord", to: "/dashbordADMIN", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
  { label: "Liste des Utilisateurs", to: "/listeU", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
  { label: "Liste des Véhicules", to: "/listeV", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2" /><circle cx="7" cy="21" r="2" /><circle cx="17" cy="21" r="2" /></svg> },
  { label: "Ajouter Utilisateur", to: "/ajouterU", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="16" y1="11" x2="22" y2="11" /></svg> },
  { label: "Ajouter Véhicule", to: "/ajouterVehicule", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg> },
  { label: "Gestion des Avis", to: "/avisAdmin", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
  { label: "Mon Profil", to: "/profilA", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
];

export default function ListeVehicules() {
  const navigate = useNavigate();
  const adminInfo = getAdminInfo();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [openMenu, setOpenMenu] = useState(null);
  const [editVeh, setEditVeh] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState("");
  const [pendingAvis, setPendingAvis] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, avisCount] = await Promise.all([
        fetchVehicles({ limit: 500 }),
        fetchPendingAvisCount()
      ]);
      setVehicles(res.data || []);
      setPendingAvis(avisCount);
    } catch {
      showToast("❌ Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
    const matchFilter = filter === "Tous" ? true : v.type === filter;
    return matchSearch && matchFilter;
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);


  const handleDelete = async (id) => {
    try {
      await deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v._id !== id));
      showToast("✅ Véhicule supprimé.");
    } catch {
      showToast("❌ Erreur lors de la suppression.");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const formattedPayload = {
        ...payload,
        plate: payload.plate.trim().toUpperCase(),
        capacity: parseInt(payload.capacity, 10),
      };
      await updateVehicle(editVeh._id, formattedPayload);
      setVehicles(prev => prev.map(v => v._id === editVeh._id ? { ...v, ...formattedPayload } : v));
      setEditVeh(null);
      showToast("✅ Véhicule mis à jour.");
    } catch {
      showToast("❌ Erreur lors de la mise à jour.");
    }
  };

  return (
    <div className="lw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${sidebarMobile ? 'open' : ''}`}>
        <button className="sb-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
          </div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ADMIN</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => `sb-nav-item ${isActive ? 'active' : ''}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.label === "Gestion des Avis" && pendingAvis > 0 && <span className="sb-badge">{pendingAvis}</span>}
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

      <div className="lm">
        <header className="lh">
          <div className="lh-left">
            <button className="lh-menu-btn" onClick={() => setSidebarMobile(true)}><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <span className="lh-title">Gestion de la Flotte</span>
          </div>
          <div className="lh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" className="search-input" placeholder="Rechercher un véhicule..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="user-chip">
              <div className="user-info">
                <div className="user-name">{adminInfo.name}</div>
                <div className="user-role">Administrateur</div>
              </div>
              <div className="user-avatar" onClick={() => navigate("/profilA")}>
                {adminInfo.photo ? <img src={adminInfo.photo} alt="p" /> : <span>{adminInfo.initials}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="lc">
          <h1 className="page-title">Véhicules de la <span>Flotte</span></h1>
          <p className="page-sub">Gérez les véhicules, surveillez leur état et mettez à jour les informations techniques.</p>


          <div className="toolbar">
            <div className="filter-bar">
              {["Tous", "BERLINE", "MINIBUS", "BUS"].map(t => (
                <button key={t} className={`filter-btn ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
              ))}
            </div>
            <button className="add-btn" onClick={() => navigate("/ajouterVehicule")}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path d="M12 5v14M5 12h14" /></svg>
              Nouveau Véhicule
            </button>
          </div>

          <div className="tbl-card">
            <div className="tbl-head">
              <div>Immatriculation</div>
              <div>Modèle</div>
              <div className="col-type">Type</div>
              <div className="col-cap">Capacité</div>
              <div className="col-status">Statut</div>
              <div></div>
            </div>
            <div className="tbl-body">
              {loading ? (
                <div className="av-loading"><div className="av-spinner" /></div>
              ) : paginated.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Aucun véhicule trouvé.</div>
              ) : paginated.map(v => (
                <div key={v._id} className="tbl-row">
                  <div><span className="cell-plate">{v.plate}</span></div>
                  <div className="cell-model">{v.model}</div>
                  <div className="cell-type">{v.type}</div>
                  <div className="cell-cap">{v.capacity} places</div>
                  <div className="cell-status">
                    <span className={`status-badge status-${v.status}`}>
                      <span className="sdot" /> {v.status === "MAINTENANCE" ? "EN PANNE" : v.status}
                    </span>
                  </div>
                  <div className="am-wrap">
                    <button className="am-btn" onClick={() => setOpenMenu(openMenu === v._id ? null : v._id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>
                    {openMenu === v._id && (
                      <div className="am-drop" style={{ right: 0, top: 35 }}>
                        <button className="am-item" onClick={() => { setEditVeh(v); setOpenMenu(null); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          Modifier
                        </button>
                        <div className="am-sep" />
                        <button className="am-item am-red" onClick={() => { setConfirmDelete(v); setOpenMenu(null); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pag">
              <span className="pag-info">{filtered.length} véhicules au total</span>
              <div className="pag-controls">
                <button className="pag-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} className={`pag-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="pag-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {editVeh && (
        <div className="modal-ov" onClick={() => setEditVeh(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="mh"><h2 className="mh-title">Modifier Véhicule</h2></div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(Object.fromEntries(new FormData(e.target))); }}>
              <div className="mf-grid">
                <div className="ef"><label className="ef-lbl">Immatriculation</label><input className="ef-input" name="plate" defaultValue={editVeh.plate} required /></div>
                <div className="ef"><label className="ef-lbl">Modèle</label><input className="ef-input" name="model" defaultValue={editVeh.model} required /></div>
                <div className="ef"><label className="ef-lbl">Type</label>
                  <select className="ef-sel" name="type" defaultValue={editVeh.type}>
                    <option value="BERLINE">BERLINE</option>
                    <option value="MINIBUS">MINIBUS</option>
                    <option value="BUS">BUS</option>
                  </select>
                </div>
                <div className="ef"><label className="ef-lbl">Capacité</label><input className="ef-input" name="capacity" type="number" defaultValue={editVeh.capacity} required /></div>
                <div className="ef full"><label className="ef-lbl">Statut</label>
                  <select className="ef-sel" name="status" defaultValue={editVeh.status}>
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="OCCUPE">OCCUPE</option>
                    <option value="MAINTENANCE">MAINTENANCE (EN PANNE)</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditVeh(null)}>Annuler</button>
                <button type="submit" className="btn-save">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-ov" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background: 'var(--accent-red)' }}><h2 className="mh-title">Confirmer suppression</h2></div>
            <div style={{ padding: 24, fontSize: 14, color: '#5a6e88' }}>
              Voulez-vous vraiment supprimer le véhicule <b>{confirmDelete.plate}</b> ({confirmDelete.model}) ? Cette action est irréversible.
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Annuler</button>
              <button className="btn-save" style={{ background: 'var(--accent-red)' }} onClick={() => { handleDelete(confirmDelete._id); setConfirmDelete(null); }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
