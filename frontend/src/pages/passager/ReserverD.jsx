import { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProfileSync } from "./useProfileSync";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bd:#0d2b5e;--bm:#1252aa;--bb:#2980e8;--bl:#7ec8ff;
    --bg:#f0f5fb;--white:#ffffff;--border:#e4ecf4;
    --ts:#0d2b5e;--tsec:#5a6e88;--tm:#94a3b8;--red:#ef4444;--green:#16a34a;
    --sw:230px;--sw-min:66px;--hh:64px;
    --r-sm:0 2px 12px rgba(13,43,94,0.07);--r-md:0 8px 32px rgba(13,43,94,0.13);--r-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .rd-wrap { display:flex; height:100vh; overflow:hidden; background:var(--bg); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--ts); }
  .rd-sidebar { width:var(--sw); background:var(--bd); display:flex; flex-direction:column; flex-shrink:0; position:relative; z-index:30; transition:width 0.3s ease; box-shadow:4px 0 24px rgba(0,0,0,0.2); overflow:hidden; }
  .rd-sidebar.collapsed { width:var(--sw-min); }
  .rd-sb-brand { display:flex; align-items:center; gap:10px; padding:18px 13px 16px; border-bottom:1px solid rgba(255,255,255,0.07); cursor:pointer; flex-shrink:0; min-height:68px; overflow:hidden; }
  .rd-sb-brand-icon { width:40px; height:40px; min-width:40px; background:var(--bb); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(41,128,232,0.4); }
  .rd-sb-brand-text { overflow:hidden; white-space:nowrap; opacity:1; transition:opacity 0.2s; }
  .rd-sidebar.collapsed .rd-sb-brand-text { opacity:0; }
  .rd-sb-brand-name { font-size:17px; font-weight:800; color:#fff; letter-spacing:-0.4px; display:block; }
  .rd-sb-brand-sub  { font-size:9px; color:rgba(255,255,255,0.4); letter-spacing:1.8px; font-weight:600; display:block; }
  .rd-sb-toggle { position:absolute; top:22px; right:10px; width:22px; height:22px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; transition:var(--tr); }
  .rd-sb-toggle:hover { background:var(--bb); border-color:var(--bb); }
  .rd-sb-toggle svg { transition:transform 0.3s; }
  .rd-sidebar.collapsed .rd-sb-toggle svg { transform:rotate(180deg); }
  .rd-sb-lbl { font-size:9px; font-weight:700; letter-spacing:1.8px; color:rgba(255,255,255,0.25); padding:14px 14px 5px; text-transform:uppercase; white-space:nowrap; overflow:hidden; transition:opacity 0.2s; }
  .rd-sidebar.collapsed .rd-sb-lbl { opacity:0; }
  .rd-sb-nav { padding:0 9px; flex:1; overflow-y:auto; overflow-x:hidden; }
  .rd-sb-nav::-webkit-scrollbar { display:none; }
  .rd-nav-item { display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; text-decoration:none; font-size:13.5px; font-weight:500; color:rgba(255,255,255,0.58); transition:var(--tr); margin-bottom:3px; position:relative; overflow:hidden; white-space:nowrap; }
  .rd-nav-item:hover { color:#fff; background:rgba(255,255,255,0.09); }
  .rd-nav-item.active { color:#fff; font-weight:700; background:linear-gradient(135deg,var(--bb),#1a6fd4); box-shadow:0 4px 16px rgba(41,128,232,0.35); }
  .rd-nav-item.active::before { content:''; position:absolute; left:-9px; top:50%; transform:translateY(-50%); width:3px; height:55%; background:var(--bl); border-radius:0 3px 3px 0; }
  .rd-nav-icon { flex-shrink:0; width:18px; height:18px; display:flex; align-items:center; justify-content:center; }
  .rd-nav-lbl  { flex:1; overflow:hidden; transition:opacity 0.2s,max-width 0.3s; max-width:160px; }
  .rd-sidebar.collapsed .rd-nav-lbl { opacity:0; max-width:0; }
  .rd-nb { background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0; transition:opacity 0.2s; }
  .rd-sidebar.collapsed .rd-nb { opacity:0; }
  .rd-sidebar.collapsed .rd-nav-item::after { content:attr(data-label); position:absolute; left:calc(var(--sw-min) + 6px); top:50%; transform:translateY(-50%); background:var(--bd); color:#fff; font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px; white-space:nowrap; pointer-events:none; box-shadow:var(--r-md); border:1px solid rgba(255,255,255,0.1); z-index:200; opacity:0; transition:opacity 0.15s; }
  .rd-sidebar.collapsed .rd-nav-item:hover::after { opacity:1; }
  .rd-sb-footer { padding:6px 9px 16px; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
  .rd-sb-logout { width:100%; display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; border:none; background:transparent; color:rgba(255,255,255,0.4); font-size:13.5px; font-weight:500; cursor:pointer; transition:var(--tr); font-family:inherit; white-space:nowrap; overflow:hidden; }
  .rd-sb-logout:hover { color:#fca5a5; background:rgba(239,68,68,0.1); }
  .rd-logout-icon { flex-shrink:0; }
  .rd-logout-lbl  { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .rd-sidebar.collapsed .rd-logout-lbl { opacity:0; max-width:0; }
  .rd-sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  .rd-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .rd-header { height:var(--hh); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--r-sm); }
  .rd-h-left  { display:flex; align-items:center; gap:12px; }
  .rd-h-right { display:flex; align-items:center; gap:10px; }
  .rd-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--tsec); padding:6px; border-radius:8px; transition:var(--tr); }
  .rd-menu-btn:hover { background:var(--bg); color:var(--ts); }
  .rd-h-title { font-size:15px; font-weight:700; color:var(--ts); }
  .rd-search-wrap { position:relative; }
  .rd-search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--tm); pointer-events:none; }
  .rd-search-input { width:230px; padding:9px 12px 9px 34px; border:1.5px solid var(--border); border-radius:22px; background:var(--bg); font-size:13px; font-family:inherit; color:var(--ts); outline:none; transition:var(--tr); }
  .rd-search-input:focus { border-color:var(--bb); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .rd-search-input::placeholder { color:var(--tm); }
  .rd-notif-btn { position:relative; background:none; border:none; cursor:pointer; color:var(--tsec); padding:8px; border-radius:10px; transition:var(--tr); }
  .rd-notif-btn:hover { background:var(--bg); color:var(--bb); }
  .rd-notif-dot { position:absolute; top:6px; right:6px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:1.5px solid #fff; }
  .rd-user-chip { display:flex; align-items:center; gap:9px; }
  .rd-user-info { text-align:right; }
  .rd-user-name { font-size:13px; font-weight:700; color:var(--ts); }
  .rd-user-role { font-size:11px; color:var(--tm); }
  .rd-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--bb),var(--bm)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }
  .rd-avatar img { width:100%; height:100%; object-fit:cover; }

  .rd-content { flex:1; overflow-y:auto; padding:26px; }
  .rd-page-title { font-size:25px; font-weight:800; color:var(--bd); letter-spacing:-0.5px; margin-bottom:4px; }
  .rd-page-title span { color:var(--bb); }
  .rd-page-sub { font-size:13px; color:var(--tm); margin-bottom:22px; }

  .rd-grid { display:grid; grid-template-columns:1fr 300px; gap:20px; max-width:1100px; margin:0 auto; }
  .rd-form-card { background:#fff; border:1px solid var(--border); border-radius:24px; overflow:hidden; box-shadow:var(--r-sm); transition:var(--tr); }
  .rd-form-card:hover { box-shadow:var(--r-md); }
  .rd-form-header { background:linear-gradient(135deg,var(--bd),var(--bm)); padding:22px 28px; color:#fff; display:flex; align-items:flex-start; justify-content:space-between; }
  .rd-fh-badge  { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.5); font-weight:700; margin-bottom:5px; }
  .rd-fh-title  { font-size:22px; font-weight:800; }
  .rd-fh-sub    { font-size:12px; color:rgba(255,255,255,0.65); margin-top:4px; }
  .rd-fh-icon   { width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .rd-form-body { padding:24px 28px; }
  .rd-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .rd-row-1 { display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px; }
  .rd-field { display:flex; flex-direction:column; gap:5px; }
  .rd-label { font-size:10.5px; font-weight:700; color:var(--tsec); letter-spacing:0.5px; text-transform:uppercase; }
  .rd-input, .rd-select, .rd-textarea { padding:11px 14px; border:1.5px solid var(--border); border-radius:12px; font-size:13px; font-family:inherit; color:var(--ts); background:#f8fafc; outline:none; transition:var(--tr); width:100%; }
  .rd-input:focus, .rd-select:focus, .rd-textarea:focus { border-color:var(--bb); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .rd-input.err, .rd-select.err, .rd-textarea.err { border-color:#fca5a5; background:#fff9f9; }
  .rd-input::placeholder, .rd-textarea::placeholder { color:var(--tm); }
  .rd-textarea { resize:vertical; min-height:90px; }
  .rd-select { cursor:pointer; }
  .rd-err-msg { font-size:11px; color:var(--red); margin-top:2px; }
  .rd-char-row { display:flex; justify-content:space-between; align-items:center; margin-top:3px; }
  .rd-char-hint { font-size:11px; color:var(--tm); }
  .rd-note { display:flex; align-items:center; gap:8px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:10px 14px; font-size:12px; color:var(--bm); font-weight:500; margin-bottom:16px; }
  .rd-form-footer { display:flex; align-items:center; justify-content:space-between; padding-top:20px; border-top:1px solid var(--border); flex-wrap:wrap; gap:12px; }
  .rd-form-footer-msg { font-size:12px; }
  .rd-form-footer-msg.success { color:var(--green); font-weight:700; }
  .rd-form-footer-msg.hint { color:var(--tm); }
  .rd-btn-row { display:flex; align-items:center; gap:10px; }
  .rd-btn-cancel { padding:10px 22px; font-size:13px; font-weight:600; font-family:inherit; color:var(--tsec); border:1.5px solid var(--border); border-radius:12px; background:#fff; cursor:pointer; transition:var(--tr); }
  .rd-btn-cancel:hover { background:var(--bg); }
  .rd-btn-submit { padding:11px 26px; font-size:13px; font-weight:700; font-family:inherit; color:#fff; border:none; border-radius:12px; background:linear-gradient(135deg,var(--bb),#1a6fd4); cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(41,128,232,0.3); display:flex; align-items:center; gap:7px; }
  .rd-btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(41,128,232,0.4); }
  .rd-btn-submit:disabled { background:#93c5fd; cursor:not-allowed; box-shadow:none; }

  .rd-preview { display:flex; flex-direction:column; gap:16px; }
  .rd-preview-card { background:#fff; border:1px solid var(--border); border-radius:24px; padding:20px; box-shadow:var(--r-sm); transition:var(--tr); }
  .rd-preview-card:hover { transform:translateY(-4px); box-shadow:var(--r-md); }
  .rd-preview-tag { font-size:9px; font-weight:700; letter-spacing:1.8px; color:var(--bb); margin-bottom:14px; text-transform:uppercase; }
  .rd-pv-block { background:#f8fafc; border-radius:10px; padding:12px 14px; margin-bottom:10px; }
  .rd-pv-block:last-child { margin-bottom:0; }
  .rd-pv-lbl { font-size:10px; font-weight:700; color:var(--tm); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px; }
  .rd-pv-val { font-size:13px; font-weight:700; color:var(--ts); }
  .rd-pv-val.muted { color:var(--tm); font-weight:400; font-style:italic; }
  .rd-pv-row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .rd-pax-card { background:linear-gradient(135deg,var(--bb),#1a6fd4); border-radius:14px; padding:16px 18px; color:#fff; position:relative; overflow:hidden; }
  .rd-pax-lbl { font-size:12px; color:rgba(255,255,255,0.75); }
  .rd-pax-num { font-size:36px; font-weight:800; letter-spacing:-1px; line-height:1.1; margin:4px 0 2px; }
  .rd-pax-sub { font-size:11px; color:rgba(255,255,255,0.65); }
  .rd-pax-ring { position:absolute; right:-16px; bottom:-16px; width:70px; height:70px; border-radius:50%; background:rgba(255,255,255,0.1); }
  .rd-tip-card { background:linear-gradient(135deg,var(--bd),var(--bm)); border-radius:24px; padding:22px; color:#fff; box-shadow:var(--r-sm); transition:var(--tr); }
  .rd-tip-card:hover { transform:translateY(-4px); box-shadow:var(--r-md); }
  .rd-tip-lbl   { font-size:10px; color:rgba(255,255,255,0.5); font-weight:700; letter-spacing:1.5px; margin-bottom:10px; }
  .rd-tip-title { font-size:17px; font-weight:800; line-height:1.35; margin-bottom:10px; }
  .rd-tip-text  { font-size:12px; color:rgba(255,255,255,0.65); line-height:1.6; margin-bottom:16px; }
  .rd-tip-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:6px 14px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.9); }

  .rd-toast { position:fixed; top:18px; right:18px; z-index:200; background:var(--bd); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--r-lg); border-left:3px solid var(--bl); animation:rdToastIn 0.3s ease; }
  @keyframes rdToastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

  @media (max-width:1100px) { .rd-grid { grid-template-columns:1fr; } .rd-preview { flex-direction:row; flex-wrap:wrap; } .rd-preview-card,.rd-tip-card { flex:1; min-width:220px; } }
  @media (max-width:900px) { .rd-row-2 { grid-template-columns:1fr; } }
  @media (max-width:768px) {
    .rd-sidebar { position:fixed; left:0; top:0; bottom:0; z-index:30; transform:translateX(-100%); width:var(--sw) !important; transition:transform 0.3s ease !important; }
    .rd-sidebar.open { transform:translateX(0); } .rd-sidebar.collapsed { transform:translateX(-100%); } .rd-sidebar.collapsed.open { transform:translateX(0); }
    .rd-sb-overlay { display:block; } .rd-menu-btn { display:flex; } .rd-sb-toggle { display:none; }
    .rd-content { padding:16px; } .rd-header { padding:0 16px; } .rd-preview { flex-direction:column; }
  }
  @media (max-width:540px) { .rd-search-wrap { display:none; } .rd-user-info { display:none; } .rd-form-body { padding:18px 16px; } .rd-form-header { padding:18px 18px; } .rd-pv-row2 { grid-template-columns:1fr; } .rd-btn-row { width:100%; justify-content:flex-end; } .rd-form-footer { flex-direction:column; align-items:flex-start; } }
`;

if (typeof document !== "undefined" && !document.getElementById("rd-css")) {
  const tag = document.createElement("style");
  tag.id = "rd-css";
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

const AIRPORTS = ["Aéroport Tunis-Carthage (TUN)","Aéroport Monastir Habib Bourguiba (MIR)","Aéroport Djerba-Zarzis (DJE)","Aéroport Sfax-Thyna (SFA)","Aéroport Tozeur-Nefta (TOE)","Aéroport Tabarka-Aïn Draham (TBJ)","Aéroport Gafsa-Ksar (GAF)"];
const HOTELS  = ["The Residence Tunis (La Marsa)","Hôtel Africa Meridien (Tunis Centre)","Hôtel El Mouradi Africa (Tunis)","Hôtel Les Berges du Lac (Tunis)","Golden Tulip El Mechtel (Tunis)","Hôtel Hasdrubal Thalassa & Spa (Hammamet)","One Resort Aqua Park & Spa (Hammamet)","Hôtel Riu Palace Hammamet","Hôtel El Ksar Sousse","Marhaba Palace (Sousse)","Hôtel Royal Jinene (Sousse)","Hôtel Iberostar Selection Kuriat Palace (Monastir)","Club Med Djerba la Douce","Hôtel Radisson Blu Palace Resort (Djerba)","Hôtel Hasdrubal Prestige (Djerba)","Hôtel Djerba Plaza Thalassa & Spa","Hôtel Dar Horchani (Tozeur)","Hôtel Yadis Dunes (Tozeur)","Hôtel Mehari Tabarka","Hôtel Les Oliviers Palace (Sfax)","Hôtel Thyna (Sfax)","Hôtel Nabeul Beach","Hôtel Aqua Palace (Nabeul)","Club Palmeraie (Mahdia)","Hôtel Iberostar Averroes (Mahdia)","Hôtel Bizerta Resort","Hôtel Les Nymphes (Zaghouan)"];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const LS_KEY = "airops_reserver_form_v1";
const INIT = { depart:"", destination:"", dateArrivee:"", heureArrivee:"", nombrePassagers:"2", telephone:"", email:"", commentaire:"" };

const navItems = [
  { label:"Tableau de bord",  to:"/dashbordP",     icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Réserver demande", to:"/reserverD",     icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> },
  { label:"Notifications",    to:"/notificationP", badge:2, icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label:"Profile",          to:"/profilP",       icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

function LocationSelect({ value, onChange, hasErr, placeholder }) {
  return (
    <select className={`rd-select${hasErr ? " err" : ""}`} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      <optgroup label="✈️ Aéroports tunisiens">{AIRPORTS.map(a => <option key={a} value={a}>{a}</option>)}</optgroup>
      <optgroup label="🏨 Hôtels tunisiens">{HOTELS.map(h => <option key={h} value={h}>{h}</option>)}</optgroup>
    </select>
  );
}

export default function ReserverD() {
  const navigate = useNavigate();

  /* ── Synchronisation nom + photo ── */
  const { nom, photo, initials } = useProfileSync();

  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast,         setToast]         = useState("");

  const [form, setForm] = useState(() => {
    try { const saved = localStorage.getItem(LS_KEY); return saved ? { ...INIT, ...JSON.parse(saved) } : INIT; }
    catch { return INIT; }
  });
  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(form)); } catch {} }, [form]);

  const [touched, setTouched] = useState({});

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 3200); return () => clearTimeout(t); }, [toast]);

  const errors = useMemo(() => ({
    depart:      !form.depart ? "Le lieu de départ est obligatoire." : "",
    destination: !form.destination ? "La destination est obligatoire." : "",
    dateArrivee: !form.dateArrivee ? "La date est obligatoire." : form.dateArrivee < todayISO() ? "La date doit être dans le futur." : "",
    heureArrivee: !form.heureArrivee ? "L'heure est obligatoire." : "",
    nombrePassagers: Number(form.nombrePassagers) < 2 ? "Minimum 2 passagers requis." : Number(form.nombrePassagers) > 20 ? "Maximum 20 passagers." : "",
    telephone: !form.telephone.trim() ? "Le téléphone est obligatoire." : !/^\+?[0-9\s]{8,20}$/.test(form.telephone) ? "Numéro invalide (ex: +216 12 345 678)." : "",
    email: !form.email.trim() ? "L'email est obligatoire." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Adresse email invalide." : "",
    commentaire: form.commentaire.length > 300 ? "Maximum 300 caractères." : "",
  }), [form]);

  const isValid = Object.values(errors).every(v => !v);

  const upd  = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const blur = field => setTouched(p => ({ ...p, [field]: true }));

  const handleSubmit = e => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(errors).map(k => [k, true])));
    if (!isValid) return;
    const ref = `#DEM-${Date.now().toString().slice(-6)}`;
    const newDemande = {
      ref,
      trajet: `${form.depart.split("(")[0].trim()} → ${form.destination.split("(")[0].trim()}`,
      vers: form.depart, date: form.dateArrivee, statut: "EN ATTENTE",
      detail: { passager: nom, depart: form.depart, arrivee: form.destination, heure: form.heureArrivee, passagers: form.nombrePassagers, telephone: form.telephone, email: form.email, commentaire: form.commentaire },
    };
    try {
      const existing = JSON.parse(localStorage.getItem("airops_demandes_v2") || "[]");
      localStorage.setItem("airops_demandes_v2", JSON.stringify([newDemande, ...existing]));
    } catch {}
    setToast(`✅ Demande ${ref} envoyée avec succès !`);
    setForm(INIT); localStorage.removeItem(LS_KEY); setTouched({});
  };

  const handleReset = () => { setForm(INIT); setTouched({}); localStorage.removeItem(LS_KEY); };
  const minDate = todayISO();

  return (
    <div className="rd-wrap">
      {sidebarMobile && <div className="rd-sb-overlay" onClick={() => setSidebarMobile(false)}/>}

      <aside className={["rd-sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="rd-sb-toggle" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="rd-sb-brand" onClick={() => navigate("/")}><div className="rd-sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div><div className="rd-sb-brand-text"><span className="rd-sb-brand-name">AirOps</span><span className="rd-sb-brand-sub">GESTION INTERNE</span></div></div>
        <div className="rd-sb-lbl">Navigation</div>
        <nav className="rd-sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({ isActive }) => `rd-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="rd-nav-icon">{item.icon}</span><span className="rd-nav-lbl">{item.label}</span>
              {item.badge ? <span className="rd-nb">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="rd-sb-footer">
          <div className="rd-sb-lbl" style={{ paddingTop:0 }}>Compte</div>
          <button type="button" className="rd-sb-logout" onClick={() => navigate("/login")}>
            <span className="rd-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="rd-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="rd-main">
        <header className="rd-header">
          <div className="rd-h-left">
            <button type="button" className="rd-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="rd-h-title">Réserver une demande</span>
          </div>
          <div className="rd-h-right">
            <div className="rd-search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className="rd-search-input" placeholder="Rechercher…"/>
            </div>
            <button type="button" className="rd-notif-btn" onClick={() => navigate("/notificationP")}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="rd-notif-dot"/>
            </button>
            {/* ── Avatar synchronisé ── */}
            <div className="rd-user-chip">
              <div className="rd-user-info">
                <div className="rd-user-name">{nom}</div>
                <div className="rd-user-role">Passager Premium</div>
              </div>
              <div className="rd-avatar">
                {photo ? <img src={photo} alt="profil"/> : initials}
              </div>
            </div>
          </div>
        </header>

        <main className="rd-content">
          <h1 className="rd-page-title">Nouvelle <span>réservation</span> ✈️</h1>
          <p className="rd-page-sub">Remplissez le formulaire pour planifier votre transport.</p>

          <div className="rd-grid">
            <div className="rd-form-card">
              <div className="rd-form-header">
                <div><p className="rd-fh-badge">NOUVELLE RÉSERVATION</p><p className="rd-fh-title">Formulaire de demande</p><p className="rd-fh-sub">Ajoutez les informations nécessaires pour votre déplacement.</p></div>
                <div className="rd-fh-icon"><svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
              </div>

              <form className="rd-form-body" onSubmit={handleSubmit} noValidate>
                <div className="rd-row-2">
                  <div className="rd-field"><label className="rd-label">Point de départ *</label><LocationSelect value={form.depart} onChange={v => upd("depart",v)} hasErr={!!(touched.depart && errors.depart)} placeholder="Choisir le lieu de départ…"/>{touched.depart && errors.depart && <span className="rd-err-msg">{errors.depart}</span>}</div>
                  <div className="rd-field"><label className="rd-label">Destination *</label><LocationSelect value={form.destination} onChange={v => upd("destination",v)} hasErr={!!(touched.destination && errors.destination)} placeholder="Choisir la destination…"/>{touched.destination && errors.destination && <span className="rd-err-msg">{errors.destination}</span>}</div>
                </div>
                <div className="rd-row-2">
                  <div className="rd-field"><label className="rd-label">Date de voyage *</label><input type="date" className={`rd-input${touched.dateArrivee && errors.dateArrivee ? " err" : ""}`} value={form.dateArrivee} min={minDate} onChange={e => upd("dateArrivee",e.target.value)} onBlur={() => blur("dateArrivee")}/>{touched.dateArrivee && errors.dateArrivee && <span className="rd-err-msg">{errors.dateArrivee}</span>}</div>
                  <div className="rd-field"><label className="rd-label">Heure d'arrivée *</label><input type="time" className={`rd-input${touched.heureArrivee && errors.heureArrivee ? " err" : ""}`} value={form.heureArrivee} onChange={e => upd("heureArrivee",e.target.value)} onBlur={() => blur("heureArrivee")}/>{touched.heureArrivee && errors.heureArrivee && <span className="rd-err-msg">{errors.heureArrivee}</span>}</div>
                </div>
                <div className="rd-row-2">
                  <div className="rd-field"><label className="rd-label">Nombre de passagers * <span style={{color:"var(--tm)",fontWeight:400,textTransform:"none"}}>(min. 2)</span></label><input type="number" min="2" max="20" className={`rd-input${touched.nombrePassagers && errors.nombrePassagers ? " err" : ""}`} value={form.nombrePassagers} onChange={e => upd("nombrePassagers",e.target.value)} onBlur={() => blur("nombrePassagers")}/>{touched.nombrePassagers && errors.nombrePassagers && <span className="rd-err-msg">{errors.nombrePassagers}</span>}</div>
                  <div className="rd-field"><label className="rd-label">Téléphone *</label><input type="tel" className={`rd-input${touched.telephone && errors.telephone ? " err" : ""}`} value={form.telephone} placeholder="+216 12 345 678" onChange={e => upd("telephone",e.target.value)} onBlur={() => blur("telephone")}/>{touched.telephone && errors.telephone && <span className="rd-err-msg">{errors.telephone}</span>}</div>
                </div>
                <div className="rd-row-1">
                  <div className="rd-field"><label className="rd-label">Adresse email *</label><input type="email" className={`rd-input${touched.email && errors.email ? " err" : ""}`} value={form.email} placeholder="passager@email.com" onChange={e => upd("email",e.target.value)} onBlur={() => blur("email")}/>{touched.email && errors.email && <span className="rd-err-msg">{errors.email}</span>}</div>
                </div>
                <div className="rd-row-1" style={{ marginBottom:0 }}>
                  <div className="rd-field">
                    <label className="rd-label">Commentaire</label>
                    <textarea className={`rd-textarea${touched.commentaire && errors.commentaire ? " err" : ""}`} value={form.commentaire} placeholder="Détails utiles : bagage, point de rencontre, besoins spéciaux…" onChange={e => upd("commentaire",e.target.value)} onBlur={() => blur("commentaire")}/>
                    <div className="rd-char-row">
                      {touched.commentaire && errors.commentaire ? <span className="rd-err-msg">{errors.commentaire}</span> : <span className="rd-char-hint">Optionnel — max 300 caractères</span>}
                      <span className="rd-char-hint">{form.commentaire.length}/300</span>
                    </div>
                  </div>
                </div>

                <div className="rd-form-footer">
                  <p className="rd-form-footer-msg hint">Les champs marqués * sont obligatoires.</p>
                  <div className="rd-btn-row">
                    <button type="button" className="rd-btn-cancel" onClick={handleReset}>Réinitialiser</button>
                    <button type="submit" className="rd-btn-submit">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      Envoyer la demande
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="rd-preview">
              <div className="rd-preview-card">
                <p className="rd-preview-tag">Aperçu rapide</p>
                <div className="rd-pv-block"><p className="rd-pv-lbl">Départ</p><p className={`rd-pv-val${!form.depart ? " muted" : ""}`}>{form.depart || "Non sélectionné"}</p></div>
                <div className="rd-pv-block"><p className="rd-pv-lbl">Destination</p><p className={`rd-pv-val${!form.destination ? " muted" : ""}`}>{form.destination || "Non sélectionnée"}</p></div>
                <div className="rd-pv-row2">
                  <div className="rd-pv-block" style={{ marginBottom:0 }}><p className="rd-pv-lbl">Date</p><p className={`rd-pv-val${!form.dateArrivee ? " muted" : ""}`}>{form.dateArrivee || "--"}</p></div>
                  <div className="rd-pv-block" style={{ marginBottom:0 }}><p className="rd-pv-lbl">Heure</p><p className={`rd-pv-val${!form.heureArrivee ? " muted" : ""}`}>{form.heureArrivee || "--"}</p></div>
                </div>
                <div className="rd-pax-card" style={{ marginTop:10 }}>
                  <p className="rd-pax-lbl">Passagers</p><p className="rd-pax-num">{form.nombrePassagers || "2"}</p>
                  <p className="rd-pax-sub">✈️ Transport AirOps</p><div className="rd-pax-ring"/>
                </div>
              </div>
              <div className="rd-tip-card">
                <p className="rd-tip-lbl">CONSEIL</p>
                <h3 className="rd-tip-title">Précisez bien votre point de rencontre</h3>
                <p className="rd-tip-text">Indiquez le terminal exact, le numéro de vol ou l'entrée de l'hôtel dans le commentaire pour un service optimal.</p>
                <span className="rd-tip-badge"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Service premium disponible</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toast && <div className="rd-toast">{toast}</div>}
    </div>
  );
}