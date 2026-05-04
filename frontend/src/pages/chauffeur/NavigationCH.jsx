import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchMyMissions, mapMission } from "../../services/chauffeurService";

const LS_KEY_NOTIF         = "airops_notif_ch_v1";
const STORAGE_KEY_MISSIONS = "airops_ch_missions_v1";

const NAV_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --brand-dark:#0d2b5e; --brand-mid:#1252aa; --brand-blue:#2980e8; --brand-light:#7ec8ff;
    --accent-orange:#f97316; --accent-green:#16a34a; --accent-red:#ef4444;
    --bg-page:#f0f5fb; --border:#e4ecf4; --text-primary:#0d2b5e; --text-sec:#5a6e88; --text-muted:#94a3b8;
    --sidebar-full:230px; --sidebar-mini:66px; --header-h:64px;
    --shadow-sm:0 2px 12px rgba(13,43,94,0.07); --shadow-md:0 8px 32px rgba(13,43,94,0.13); --shadow-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .chw { display:flex; height:100vh; overflow:hidden; background:var(--bg-page); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--text-primary); }
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
  .sb-badge { background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0; }
  .sidebar.collapsed .sb-badge { opacity:0; }
  .sidebar.collapsed .sb-nav-item::after { content:attr(data-label); position:absolute; left:calc(var(--sidebar-mini)+6px); top:50%; transform:translateY(-50%); background:var(--brand-dark); color:#fff; font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px; white-space:nowrap; pointer-events:none; box-shadow:var(--shadow-md); border:1px solid rgba(255,255,255,0.1); z-index:200; opacity:0; transition:opacity 0.15s; }
  .sidebar.collapsed .sb-nav-item:hover::after { opacity:1; }
  .sb-footer { padding:6px 9px 16px; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
  .sb-logout { width:100%; display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; border:none; background:transparent; color:rgba(255,255,255,0.4); font-size:13.5px; font-weight:500; cursor:pointer; transition:var(--tr); font-family:inherit; white-space:nowrap; overflow:hidden; }
  .sb-logout:hover { color:#fca5a5; background:rgba(239,68,68,0.1); }
  .sb-logout-lbl { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .sidebar.collapsed .sb-logout-lbl { opacity:0; max-width:0; }
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  .nav-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .chh { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .chh-left  { display:flex; align-items:center; gap:12px; }
  .chh-right { display:flex; align-items:center; gap:10px; }
  .chh-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .chh-menu-btn:hover { background:var(--bg-page); }
  .chh-title { font-size:15px; font-weight:700; color:var(--text-primary); }
  .notif-btn { position:relative; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:8px; border-radius:10px; transition:var(--tr); }
  .notif-btn:hover { background:var(--bg-page); color:var(--brand-blue); }
  .notif-dot-hdr { position:absolute; top:6px; right:6px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:1.5px solid #fff; }
  .user-chip { display:flex; align-items:center; gap:9px; }
  .user-name { font-size:13px; font-weight:700; color:var(--text-primary); }
  .user-role { font-size:11px; color:var(--text-muted); }
  .user-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }

  /* Navigation layout */
  .nav-layout { display:flex; gap:16px; flex:1; overflow:hidden; padding:16px 20px; }
  .nav-left { width:320px; flex-shrink:0; display:flex; flex-direction:column; gap:12px; overflow-y:auto; }
  .nav-left::-webkit-scrollbar { width:4px; }
  .nav-left::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }

  .nav-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:16px; box-shadow:var(--shadow-sm); }
  .nav-card-title { font-size:12px; font-weight:800; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:0.5px; }
  .nav-card-icon { width:28px; height:28px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* GPS status */
  .gps-status { display:flex; align-items:center; gap:10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:10px 14px; }
  .gps-dot { width:10px; height:10px; border-radius:50%; background:#22c55e; flex-shrink:0; animation:gpsPulse 1.5s infinite; }
  .gps-dot.searching { background:#f97316; }
  .gps-dot.error { background:#ef4444; animation:none; }
  @keyframes gpsPulse { 0%,100%{opacity:1;transform:scale(1);box-shadow:0 0 0 0 rgba(34,197,94,0.4);} 50%{opacity:0.7;transform:scale(1.2);box-shadow:0 0 0 6px rgba(34,197,94,0);} }
  .gps-text { flex:1; }
  .gps-label { font-size:11px; font-weight:700; color:#15803d; }
  .gps-coords { font-size:10px; color:#166534; font-weight:500; margin-top:1px; }
  .gps-acc { font-size:9px; color:#4ade80; background:#dcfce7; border-radius:6px; padding:1px 6px; font-weight:700; }

  /* Inputs */
  .route-field { margin-bottom:10px; }
  .route-field-label { font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:5px; display:flex; align-items:center; gap:5px; }
  .route-input-wrap { position:relative; }
  .route-input-icon { position:absolute; left:11px; top:50%; transform:translateY(-50%); pointer-events:none; }
  .route-input { width:100%; padding:10px 12px 10px 36px; border:1.5px solid var(--border); border-radius:11px; font-size:13px; font-family:inherit; color:var(--text-primary); outline:none; transition:var(--tr); background:#f8fafc; }
  .route-input:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .route-input.dest:focus { border-color:var(--accent-orange); box-shadow:0 0 0 3px rgba(249,115,22,0.1); }
  .route-input::placeholder { color:var(--text-muted); font-size:12px; }
  .route-input:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-swap { width:100%; display:flex; align-items:center; justify-content:center; gap:7px; padding:7px; background:none; border:1.5px dashed var(--border); border-radius:10px; color:var(--text-muted); font-size:12px; font-weight:600; font-family:inherit; cursor:pointer; transition:var(--tr); margin-bottom:10px; }
  .btn-swap:hover { border-color:var(--brand-blue); color:var(--brand-blue); background:#f0f6ff; }
  .btn-go { width:100%; padding:11px; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(41,128,232,0.35); }
  .btn-go:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(41,128,232,0.45); }
  .btn-go:disabled { opacity:0.55; cursor:not-allowed; transform:none; }
  @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
  .spin { animation:spin 1s linear infinite; }

  /* Route info */
  .route-info-row { display:flex; gap:8px; margin-bottom:12px; }
  .ri-card { flex:1; background:var(--bg-page); border-radius:11px; padding:10px; text-align:center; border:1px solid var(--border); }
  .ri-val { font-size:18px; font-weight:800; letter-spacing:-0.5px; }
  .ri-lbl { font-size:10px; color:var(--text-muted); font-weight:600; margin-top:2px; }

  /* Steps */
  .route-steps-title { font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:8px; }
  .step-item { display:flex; align-items:flex-start; gap:8px; padding:7px 0; border-bottom:1px solid #f1f5f9; }
  .step-item:last-child { border-bottom:none; }
  .step-num { width:20px; height:20px; border-radius:50%; background:var(--brand-blue); color:#fff; font-size:9px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
  .step-num.s { background:#22c55e; }
  .step-num.e { background:#ef4444; }
  .step-text { flex:1; font-size:11px; color:var(--text-primary); font-weight:500; line-height:1.4; }
  .step-dist { font-size:10px; color:var(--text-muted); font-weight:600; white-space:nowrap; }

  /* Mission shortcuts */
  .mission-btn { display:flex; align-items:center; gap:8px; padding:9px 11px; background:var(--bg-page); border:1.5px solid var(--border); border-radius:11px; cursor:pointer; transition:var(--tr); width:100%; margin-bottom:6px; font-family:inherit; }
  .mission-btn:last-child { margin-bottom:0; }
  .mission-btn:hover { background:#eff6ff; border-color:var(--brand-blue); }
  .mb-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .mb-ref { font-size:10px; font-weight:800; color:var(--brand-blue); white-space:nowrap; }
  .mb-traj { font-size:11px; font-weight:600; color:var(--text-primary); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
  .mb-use { font-size:10px; font-weight:700; color:var(--brand-blue); background:#eff6ff; border:none; border-radius:6px; padding:3px 8px; cursor:pointer; font-family:inherit; flex-shrink:0; transition:var(--tr); }
  .mb-use:hover { background:var(--brand-blue); color:#fff; }

  /* Map */
  .nav-map-wrap { flex:1; border-radius:18px; overflow:hidden; border:1.5px solid var(--border); box-shadow:var(--shadow-sm); position:relative; background:#e8eef4; }
  .nav-map-iframe { width:100%; height:100%; border:none; display:block; }
  .map-placeholder { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; background:linear-gradient(135deg,#f0f5fb,#e8f0fb); }
  .map-ph-icon { width:68px; height:68px; border-radius:20px; background:linear-gradient(135deg,#dbeafe,#bfdbfe); display:flex; align-items:center; justify-content:center; }
  .map-ph-title { font-size:15px; font-weight:800; color:var(--brand-dark); }
  .map-ph-sub { font-size:12px; color:var(--text-muted); text-align:center; max-width:240px; line-height:1.5; }
  .map-loading { position:absolute; inset:0; background:rgba(255,255,255,0.8); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; z-index:10; }
  .map-loading-spinner { width:40px; height:40px; border:3px solid var(--border); border-top-color:var(--brand-blue); border-radius:50%; animation:spin 0.8s linear infinite; }
  .map-loading-text { font-size:13px; font-weight:700; color:var(--brand-dark); }

  /* Open in Maps btn overlay */
  .map-open-btn { position:absolute; top:14px; right:14px; display:flex; align-items:center; gap:7px; background:#fff; border:1.5px solid var(--border); border-radius:12px; padding:9px 14px; font-size:12px; font-weight:700; color:var(--brand-dark); text-decoration:none; box-shadow:var(--shadow-sm); transition:var(--tr); }
  .map-open-btn:hover { background:#eff6ff; border-color:var(--brand-blue); color:var(--brand-blue); }
  .map-current-btn { position:absolute; bottom:14px; right:14px; width:44px; height:44px; background:#fff; border:1.5px solid var(--border); border-radius:12px; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:var(--shadow-sm); transition:var(--tr); }
  .map-current-btn:hover { background:#eff6ff; border-color:var(--brand-blue); }

  @media (max-width:960px) { .nav-layout{flex-direction:column;padding:12px 16px;} .nav-left{width:100%;max-height:300px;flex-direction:row;flex-wrap:nowrap;overflow-x:auto;} .nav-card{min-width:260px;} }
  @media (max-width:768px) {
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);} .sidebar.collapsed{transform:translateX(-100%);} .sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;} .chh-menu-btn{display:flex;} .sb-toggle-btn{display:none;}
    .chh{padding:0 16px;} .nav-layout{padding:10px 12px;}
    .user-role{display:none;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-navcss")) {
  const tag = document.createElement("style");
  tag.id = "airops-navcss";
  tag.textContent = NAV_CSS;
  document.head.appendChild(tag);
}

const NAV_ITEMS = [
  { label:"Tableau de Bord",     to:"/dashbordchauffeur", icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Historique Missions", to:"/historiqueM",       icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { label:"Réclamations",        to:"/reclamationsCH",    icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> },
  { label:"Navigation",          to:"/navigationCH",      icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg> },
  { label:"Notifications",       to:"/notificationM",     icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
];

const initialMissions = [
  { ref:"#MSN-4491", trajet:"Hôtel El Ksar → Enfidha",    depart:"Hôtel El Ksar Sousse",   arrivee:"Aéroport Enfidha",          statut:"EN COURS"   },
  { ref:"#MSN-4492", trajet:"Monastir → Carthage",        depart:"Monastir Centre",         arrivee:"Aéroport Carthage",         statut:"EN ATTENTE" },
  { ref:"#MSN-4493", trajet:"Tunis → Hôtel Laico",        depart:"Aéroport Tunis Carthage", arrivee:"Hôtel Laico Tunis",         statut:"ACCEPTÉE"   },
];

export default function NavigationCH() {
  const navigate = useNavigate();
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [depart,        setDepart]        = useState("");
  const [arrivee,       setArrivee]       = useState("");
  const [gpsStatus,     setGpsStatus]     = useState("searching"); // searching | ok | error
  const [gpsLabel,      setGpsLabel]      = useState("Localisation en cours…");
  const [gpsCoords,     setGpsCoords]     = useState(null); // {lat,lng,accuracy}
  const [mapSrc,        setMapSrc]        = useState("");
  const [mapLoading,    setMapLoading]    = useState(false);
  const [routeReady,    setRouteReady]    = useState(false);
  const [routeInfo,     setRouteInfo]     = useState(null);
  const [mapsUrl,       setMapsUrl]       = useState("");
  const watchId = useRef(null);

  const [apiMissions, setApiMissions] = useState([]);
  const loadActiveMissions = useCallback(async () => {
    try {
      const data = await fetchMyMissions({ limit: 20 });
      setApiMissions((data.data || []).map(mapMission));
    } catch {/* silently */}
  }, []);
  useEffect(() => { loadActiveMissions(); }, [loadActiveMissions]);

  const missions = apiMissions;
  const activeMissions = missions.filter(m=>["EN COURS","EN ATTENTE"].includes(m.statut));

  const profile     = (()=>{ try { const u=localStorage.getItem("user"); return u?JSON.parse(u):{name:""}; } catch { return {name:""}; } })();
  const nomCH       = profile.name || "Chauffeur";
  const initials    = nomCH.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"CH";

  const navItemsWithBadge = NAV_ITEMS.map(item=>
    item.to==="/notificationM" ? { ...item, badge: undefined } : item
  );

  /* ── Auto GPS on mount — watchPosition for live updates ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsLabel("Géolocalisation non disponible");
      // Fallback: Tunis
      const fallback = { lat:36.8065, lng:10.1815, accuracy:5000 };
      setGpsCoords(fallback);
      showCurrentPositionOnMap(fallback.lat, fallback.lng);
      return;
    }

    // Initial fast fix
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude:lat, longitude:lng, accuracy } = pos.coords;
        setGpsCoords({ lat, lng, accuracy });
        setGpsStatus("ok");
        setGpsLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        showCurrentPositionOnMap(lat, lng);
      },
      () => {
        // Fallback to Tunis
        const fallback = { lat:36.8065, lng:10.1815, accuracy:1000 };
        setGpsCoords(fallback);
        setGpsStatus("ok");
        setGpsLabel("Tunis (approximatif)");
        showCurrentPositionOnMap(fallback.lat, fallback.lng);
      },
      { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
    );

    // Live tracking
    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        const { latitude:lat, longitude:lng, accuracy } = pos.coords;
        setGpsCoords({ lat, lng, accuracy });
        setGpsStatus("ok");
        setGpsLabel(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      },
      () => {},
      { enableHighAccuracy:true, maximumAge:5000 }
    );

    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);

  /* Show current position on map without route */
  const showCurrentPositionOnMap = (lat, lng) => {
    const zoom = 14;
    const delta = 0.04;
    setMapSrc(`https://www.openstreetmap.org/export/embed.html?bbox=${lng-delta},${lat-delta},${lng+delta},${lat+delta}&layer=mapnik&marker=${lat},${lng}`);
  };

  /* Re-center map to current position */
  const handleRecenter = () => {
    if (gpsCoords) {
      setRouteReady(false);
      setRouteInfo(null);
      showCurrentPositionOnMap(gpsCoords.lat, gpsCoords.lng);
    }
  };

  /* Build route */
  const handleRoute = () => {
    const dep = depart.trim() || gpsLabel;
    const arr = arrivee.trim();
    if (!arr) return;

    setMapLoading(true);
    setRouteReady(false);
    setRouteInfo(null);

    /* Google Maps directions URL (opens in new tab when user clicks) */
    const gUrl = `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(dep)}` +
      `&destination=${encodeURIComponent(arr)}` +
      `&travelmode=driving`;
    setMapsUrl(gUrl);

    /* Use Google Maps embed for the itinerary (shows route on the map) */
    const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(arr)}` +
      `&t=&z=11&ie=UTF8&iwloc=&output=embed`;

    /* Also build OSM routing for display */
    const osmUrl = `https://www.openstreetmap.org/directions?` +
      `engine=fossgis_osrm_car` +
      `&route=${encodeURIComponent(dep)};${encodeURIComponent(arr)}` +
      `#map=10/36.8065/10.1815`;

    // Simulate OSRM-style route info
    setTimeout(() => {
      const distKm   = parseFloat((Math.random()*90+5).toFixed(1));
      const speedKmh = 70;
      const mins     = Math.round((distKm/speedKmh)*60 + Math.random()*8);
      const h        = Math.floor(mins/60);
      const m        = mins%60;

      setRouteInfo({
        distance: `${distKm} km`,
        duree:    h>0 ? `${h}h ${m<10?"0":""}${m}min` : `${m} min`,
        steps: [
          { label:"s", text:`Départ: ${dep.substring(0,35)}${dep.length>35?"...":""}`, dist:"" },
          { label:"1", text:"Continuer tout droit sur la voie principale", dist:`${(distKm*0.15).toFixed(1)} km` },
          { label:"2", text:"Prendre la direction indiquée par le GPS", dist:`${(distKm*0.40).toFixed(1)} km` },
          { label:"3", text:"Rester sur la route nationale", dist:`${(distKm*0.30).toFixed(1)} km` },
          { label:"4", text:"Prendre la sortie vers la destination", dist:`${(distKm*0.15).toFixed(1)} km` },
          { label:"e", text:`Arrivée: ${arr.substring(0,35)}${arr.length>35?"...":""}`, dist:"" },
        ]
      });

      // Show destination on map
      setMapSrc(embedUrl);
      setRouteReady(true);
      setMapLoading(false);
    }, 1100);
  };

  /* Load mission route directly */
  const handleMissionRoute = (m) => {
    setDepart(m.depart);
    setArrivee(m.arrivee);
    setRouteReady(false);
    setRouteInfo(null);
    setMapLoading(true);

    const gUrl = `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(m.depart)}` +
      `&destination=${encodeURIComponent(m.arrivee)}` +
      `&travelmode=driving`;
    setMapsUrl(gUrl);

    setTimeout(() => {
      const distKm   = parseFloat((Math.random()*90+10).toFixed(1));
      const mins     = Math.round((distKm/65)*60 + Math.random()*10);
      const h        = Math.floor(mins/60);
      const mn       = mins%60;

      setRouteInfo({
        distance: `${distKm} km`,
        duree:    h>0 ? `${h}h ${mn<10?"0":""}${mn}min` : `${mn} min`,
        steps:[
          { label:"s", text:`Départ: ${m.depart}`, dist:"" },
          { label:"1", text:"Prendre la route principale vers la destination", dist:`${(distKm*0.4).toFixed(1)} km` },
          { label:"2", text:"Continuer sur la voie rapide", dist:`${(distKm*0.4).toFixed(1)} km` },
          { label:"3", text:"Suivre les panneaux vers la destination", dist:`${(distKm*0.2).toFixed(1)} km` },
          { label:"e", text:`Arrivée: ${m.arrivee}`, dist:"" },
        ]
      });

      setMapSrc(`https://maps.google.com/maps?q=${encodeURIComponent(m.arrivee)}&t=&z=11&ie=UTF8&iwloc=&output=embed`);
      setRouteReady(true);
      setMapLoading(false);
    }, 900);
  };

  return (
    <div className="chw">
      {sidebarMobile && <div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

      {/* Sidebar */}
      <aside className={["sidebar",collapsed?"collapsed":"",sidebarMobile?"open":""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={()=>setCollapsed(v=>!v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={()=>navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE CHAUFFEUR</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItemsWithBadge.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label}
              className={({isActive})=>`sb-nav-item${isActive?" active":""}`}
              onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.badge?<span className="sb-badge">{item.badge}</span>:null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{paddingTop:0}}>Compte</div>
          <button type="button" className="sb-logout" onClick={()=>navigate("/login")}>
            <span style={{flexShrink:0}}><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="nav-main">
        <header className="chh">
          <div className="chh-left">
            <button type="button" className="chh-menu-btn" onClick={()=>setSidebarMobile(v=>!v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="chh-title">Navigation GPS</span>
          </div>
          <div className="chh-right">
            <button type="button" className="notif-btn" onClick={()=>navigate("/notificationM")}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {/* {unreadCount>0 && <span className="notif-dot-hdr"/>}
               */}
               {false && <span className="notif-dot-hdr"/>}
            </button>
            <div className="user-chip">
              <div style={{textAlign:"right"}}><div className="user-name">{nomCH}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{initials}</div>
            </div>
          </div>
        </header>

        <div className="nav-layout">
          {/* Left panel */}
          <div className="nav-left">

            {/* GPS Status */}
            <div className="nav-card">
              <div className="nav-card-title">
                <div className="nav-card-icon" style={{background:"#f0fdf4"}}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2.5}><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
                </div>
                Position en direct
              </div>
              <div className="gps-status" style={gpsStatus==="error"?{background:"#fef2f2",borderColor:"#fecaca"}:{} }>
                <span className={`gps-dot ${gpsStatus!=="ok"?gpsStatus:""}`}/>
                <div className="gps-text">
                  <div className="gps-label" style={gpsStatus==="error"?{color:"#dc2626"}:{}}>
                    {gpsStatus==="searching"?"Localisation…":gpsStatus==="error"?"GPS indisponible":"GPS actif"}
                  </div>
                  <div className="gps-coords">{gpsLabel}</div>
                </div>
                {gpsCoords?.accuracy && gpsStatus==="ok" && (
                  <span className="gps-acc">±{Math.round(gpsCoords.accuracy)}m</span>
                )}
              </div>
            </div>

            {/* Route planner */}
            <div className="nav-card">
              <div className="nav-card-title">
                <div className="nav-card-icon" style={{background:"#eff6ff"}}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg>
                </div>
                Planifier un trajet
              </div>

              {/* Départ */}
              <div className="route-field">
                <div className="route-field-label">
                  <svg width="10" height="10" fill="#22c55e" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                  Départ
                </div>
                <div className="route-input-wrap">
                  <span className="route-input-icon">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
                  </span>
                  <input type="text" className="route-input"
                    placeholder={gpsStatus==="ok" ? `Ma position (${gpsLabel.substring(0,25)}…)` : "Position actuelle…"}
                    value={depart}
                    onChange={e=>setDepart(e.target.value)}
                  />
                </div>
              </div>

              <button type="button" className="btn-swap" onClick={()=>{ setDepart(arrivee); setArrivee(depart); setRouteReady(false); setRouteInfo(null); }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                Inverser
              </button>

              {/* Arrivée */}
              <div className="route-field">
                <div className="route-field-label">
                  <svg width="10" height="10" fill="#ef4444" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4"/></svg>
                  Destination
                </div>
                <div className="route-input-wrap">
                  <span className="route-input-icon">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </span>
                  <input type="text" className="route-input dest"
                    placeholder="Saisir la destination…"
                    value={arrivee}
                    onChange={e=>setArrivee(e.target.value)}
                    onKeyDown={e=>e.key==="Enter" && handleRoute()}
                  />
                </div>
              </div>

              <button type="button" className="btn-go" onClick={handleRoute} disabled={!arrivee.trim()||mapLoading}>
                {mapLoading ? (
                  <><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} className="spin"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Calcul en cours…</>
                ) : (
                  <><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg>Calculer le trajet</>
                )}
              </button>
            </div>

            {/* Route info */}
            {routeReady && routeInfo && (
              <div className="nav-card">
                <div className="nav-card-title" style={{color:"var(--accent-orange)"}}>
                  <div className="nav-card-icon" style={{background:"#fff7ed"}}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  Trajet calculé
                </div>
                <div className="route-info-row">
                  <div className="ri-card">
                    <div className="ri-val" style={{color:"var(--brand-blue)"}}>{routeInfo.distance}</div>
                    <div className="ri-lbl">Distance</div>
                  </div>
                  <div className="ri-card">
                    <div className="ri-val" style={{color:"var(--accent-orange)"}}>{routeInfo.duree}</div>
                    <div className="ri-lbl">Durée</div>
                  </div>
                </div>
                <div className="route-steps-title">Étapes du trajet</div>
                {routeInfo.steps.map((s,i)=>(
                  <div key={i} className="step-item">
                    <div className={`step-num${s.label==="s"?" s":s.label==="e"?" e":""}`}>
                      {s.label==="s"?"D":s.label==="e"?"A":s.label}
                    </div>
                    <div className="step-text">{s.text}</div>
                    {s.dist && <div className="step-dist">{s.dist}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Active missions */}
            {activeMissions.length>0 && (
              <div className="nav-card">
                <div className="nav-card-title">
                  <div className="nav-card-icon" style={{background:"#eff6ff"}}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  Missions actives
                </div>
                {activeMissions.slice(0,4).map(m=>(
                  <button key={m.ref} type="button" className="mission-btn" onClick={()=>handleMissionRoute(m)}>
                    <span className="mb-dot" style={{background:m.statut==="EN COURS"?"#3b82f6":m.statut==="ACCEPTÉE"?"#22c55e":"#f97316"}}/>
                    <div style={{flex:1,minWidth:0,textAlign:"left"}}>
                      <div className="mb-ref">{m.ref}</div>
                      <div className="mb-traj">{m.trajet}</div>
                    </div>
                    <span className="mb-use">Itinéraire</span>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Map */}
          <div className="nav-map-wrap">
            {mapSrc && !mapLoading ? (
              <iframe className="nav-map-iframe" src={mapSrc} title="Navigation GPS" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
            ) : mapLoading ? (
              <div className="map-loading">
                <div className="map-loading-spinner"/>
                <div className="map-loading-text">Calcul de l'itinéraire…</div>
              </div>
            ) : (
              <div className="map-placeholder">
                <div className="map-ph-icon">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <p className="map-ph-title">Carte de navigation</p>
                <p className="map-ph-sub">Votre position GPS est en cours de détection. La carte s'affiche automatiquement.</p>
              </div>
            )}

            {/* Overlay buttons */}
            {routeReady && mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="map-open-btn">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Ouvrir dans Google Maps
              </a>
            )}
            <button type="button" className="map-current-btn" onClick={handleRecenter} title="Recentrer sur ma position">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2.5}><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}