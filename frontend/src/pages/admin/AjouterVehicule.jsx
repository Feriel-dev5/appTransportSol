import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import vehicleBus from "../../assets/vehicle_bus.png";
import vehicleMinivan from "../../assets/vehicle_minivan.png";
import vehicleBerline from "../../assets/vehicle_berline.png";
import { createVehicle } from "../../services/adminService";

/* ══════════════════════════ CSS ══════════════════════════ */
const css = `
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
    --text-sec:     #5a6e88;
    --text-muted:   #94a3b8;
    --sidebar-full: 230px;
    --sidebar-mini: 66px;
    --header-h:     64px;
    --shadow-sm:    0 2px 12px rgba(13,43,94,0.07);
    --shadow-md:    0 8px 32px rgba(13,43,94,0.13);
    --shadow-lg:    0 20px 50px rgba(13,43,94,0.18);
    --tr:           all 0.25s ease;
  }

  .av-wrap { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

  /* ── Sidebar (same as all admin pages) ── */
  .sidebar { width: var(--sidebar-full); background: var(--brand-dark); display: flex; flex-direction: column; flex-shrink: 0; position: relative; z-index: 30; transition: width 0.3s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.2); overflow: hidden; }
  .sidebar.collapsed { width: var(--sidebar-mini); }
  .sb-brand { display: flex; align-items: center; gap: 10px; padding: 18px 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); cursor: pointer; flex-shrink: 0; min-height: 68px; overflow: hidden; }
  .sb-brand-icon { width: 40px; height: 40px; min-width: 40px; background: var(--brand-blue); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(41,128,232,0.4); }
  .sb-brand-text { overflow: hidden; white-space: nowrap; opacity: 1; transition: opacity 0.2s ease; }
  .sidebar.collapsed .sb-brand-text { opacity: 0; }
  .sb-brand-name { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.4px; display: block; }
  .sb-brand-sub  { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 1.8px; font-weight: 600; display: block; }
  .sb-toggle-btn { position: absolute; top: 22px; right: 10px; width: 22px; height: 22px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: var(--tr); flex-shrink: 0; }
  .sb-toggle-btn:hover { background: var(--brand-blue); border-color: var(--brand-blue); }
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
  .av-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .av-header { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .av-hdr-left { display: flex; align-items: center; gap: 12px; }
  .av-hdr-right { display: flex; align-items: center; gap: 14px; }
  .av-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .av-menu-btn:hover { background: var(--bg-page); }
  .av-hdr-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .user-chip { display: flex; align-items: center; gap: 9px; }
  .user-info { text-align: right; }
  .user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .user-role { font-size: 10px; color: var(--text-muted); letter-spacing: 0.8px; text-transform: uppercase; }
  .user-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); flex-shrink: 0; }

  /* ── Content ── */
  .av-content { flex: 1; overflow-y: auto; padding: 30px 26px; }

  /* ── Page header ── */
  .av-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
  .av-back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--text-sec); cursor: pointer; font-family: inherit; transition: var(--tr); }
  .av-back-btn:hover { border-color: var(--brand-blue); color: var(--brand-blue); background: #eff6ff; }
  .av-page-title { font-size: 24px; font-weight: 800; color: var(--brand-dark); letter-spacing: -0.5px; }
  .av-page-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; }

  /* ── Layout ── */
  .av-layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }

  /* ── Card ── */
  .av-card { background: #fff; border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-sm); overflow: hidden; transition: var(--tr); }
  .av-card:hover { box-shadow: var(--shadow-md); }
  .av-card-hd { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .av-card-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .av-card-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .av-card-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  /* ── Form grid ── */
  .av-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 24px; }
  .av-field { display: flex; flex-direction: column; gap: 5px; }
  .av-field.full { grid-column: 1 / -1; }
  .av-label { font-size: 10.5px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .av-input { padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; transition: var(--tr); }
  .av-input:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .av-input.err { border-color: var(--accent-red); }
  .av-select { padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; cursor: pointer; transition: var(--tr); }
  .av-select:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .av-error { font-size: 11px; color: var(--accent-red); margin-top: 1px; }
  .av-hint { font-size: 10.5px; color: var(--text-muted); margin-top: 1px; }

  /* ── Type selector ── */
  .av-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 16px 24px 20px; }
  .av-type-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 10px; border-radius: 14px; border: 2px solid var(--border); cursor: pointer; transition: var(--tr); background: #fff; text-align: center; }
  .av-type-card:hover { border-color: var(--brand-blue); background: #f8fbff; }
  .av-type-card.selected { border-color: var(--brand-blue); background: #eff6ff; }
.av-type-emoji {
  width: 100%;
  height: 120px;
  overflow: hidden;
  border-radius: 12px;
}

.av-type-emoji img {
  width: 120%;
  height: 120%;
  object-fit: cover;
  display: block;
}
  .av-type-name { font-size: 11px; font-weight: 700; color: var(--text-primary); }
  .av-type-desc { font-size: 10px; color: var(--text-muted); }

  /* ── Preview ── */
  .av-preview-body { padding: 22px 20px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
  .av-vehicle-icon { width: 88px; height: 88px; border-radius: 22px; background: linear-gradient(135deg, #eff6ff, #dbeafe); display: flex; align-items: center; justify-content: center; font-size: 40px; box-shadow: 0 8px 24px rgba(41,128,232,0.15); border: 2px solid rgba(41,128,232,0.12); }
  .av-preview-plate { font-size: 22px; font-weight: 800; color: var(--brand-dark); letter-spacing: 2px; font-family: 'DM Sans', monospace; }
  .av-preview-model { font-size: 13px; color: var(--text-muted); }
  .av-preview-divider { width: 100%; height: 1px; background: var(--border); }
  .av-preview-row { width: 100%; display: flex; align-items: center; justify-content: space-between; }
  .av-preview-lbl { font-size: 11px; color: var(--text-muted); font-weight: 600; }
  .av-preview-val { font-size: 12px; font-weight: 700; color: var(--text-primary); }
  /* ── Form actions ── */
  .av-form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
  .av-btn-cancel { padding: 10px 20px; font-size: 13px; font-family: inherit; color: var(--text-sec); border: 1.5px solid var(--border); border-radius: 11px; background: #fff; cursor: pointer; transition: var(--tr); font-weight: 600; }
  .av-btn-cancel:hover { background: var(--bg-page); }
  .av-btn-save { display: flex; align-items: center; gap: 8px; padding: 10px 24px; font-size: 13px; font-weight: 700; font-family: inherit; color: #fff; border: none; border-radius: 11px; background: linear-gradient(135deg, #16a34a, #15803d); cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(22,163,74,0.3); }
  .av-btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(22,163,74,0.4); }
  .av-btn-save:active { transform: scale(0.97); }

  /* Toast */
  .toast { position: fixed; top: 18px; right: 18px; z-index: 999999; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; pointer-events: none; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
  .toast.success { border-left-color: #22c55e; }

  /* Footer */
  .av-footer { background: #fff; border-top: 1px solid var(--border); padding: 12px 26px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; font-size: 11px; color: var(--text-muted); }

  /* Tips */
  .av-tips { padding: 16px 20px; border-top: 1px solid var(--border); }
  .av-tip { display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; color: var(--text-sec); line-height: 1.5; margin-bottom: 8px; }
  .av-tip-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; flex-shrink: 0; margin-top: 5px; }

  /* Responsive */
  @media (max-width: 1100px) { .av-layout { grid-template-columns: 1fr; } }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open { transform: translateX(0); }
    .sidebar.collapsed { transform: translateX(-100%); }
    .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; }
    .av-menu-btn { display: flex; }
    .sb-toggle-btn { display: none; }
    .av-content { padding: 16px; }
    .av-header { padding: 0 16px; }
  }
  @media (max-width: 600px) {
    .av-form-grid { grid-template-columns: 1fr; }
    .av-field.full { grid-column: 1; }
    .av-type-grid { grid-template-columns: 1fr 1fr; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("av-css")) {
  const tag = document.createElement("style");
  tag.id = "av-css";
  tag.textContent = css;
  document.head.appendChild(tag);
}

/* ══════════════════════════ NAV ITEMS ══════════════════════════ */
const navItems = [
  { label:"Tableau de Bord",       to:"/dashbordADMIN",   icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Liste des Utilisateurs",to:"/listeU",          icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { label:"Ajouter Utilisateur",   to:"/ajouterU",        icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg> },
  { label:"Ajouter Véhicule",      to:"/ajouterVehicule", icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M3 9l2-4h14l2 4M3 9h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none"/><circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none"/></svg> },
  { label:"Mon Profil",            to:"/profilA",         icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

const VEHICLE_TYPES = [
  { key:"Bus",      emoji:"🚌", desc:"Transport collectif" },
  { key:"Minibus",  emoji:"🚐", desc:"Petit groupe" },
  { key:"Berline",  emoji:"🚗", desc:"Voiture standard" },
];

const ANNEES = Array.from({ length: 20 }, (_, i) => 2026 - i);
const CARBURANTS = ["Diesel","Essence","Hybride","Électrique","GPL"];
const MARQUES = ["Renault","Peugeot","Citroën","Volkswagen","Mercedes","Toyota","Ford","Iveco","Fiat","Opel","Autre"];

const defaultForm = { marque:"", modele:"", immatriculation:"", annee:"", capacite:"", carburant:"", couleur:"", kilometrage:"", type:"" };

function validate(form) {
  const e = {};
  if (!form.immatriculation.trim()) e.immatriculation = "L'immatriculation est obligatoire.";
  else if (!/^[A-Z0-9\s\-]+$/i.test(form.immatriculation)) e.immatriculation = "Format invalide (ex: TU 123 456).";
  if (!form.marque) e.marque = "La marque est obligatoire.";
  if (!form.modele.trim()) e.modele = "Le modèle est obligatoire.";
  if (!form.annee) e.annee = "L'année est obligatoire.";
  if (!form.capacite.trim()) e.capacite = "La capacité est obligatoire.";
  else if (isNaN(+form.capacite) || +form.capacite < 1 || +form.capacite > 100) e.capacite = "Entre 1 et 100 places.";
  if (!form.type) e.type = "Choisissez un type de véhicule.";
  return e;
}


export default function AjouterVehicule() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast, setToast] = useState({ msg:"", type:"" });
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});

  function showToast(msg, type="") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3000);
  }

  function handleChange(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    if (submitted) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit() {
    setSubmitted(true);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { showToast("Veuillez corriger les erreurs."); return; }

    const payload = {
      plate: form.immatriculation.trim(),
      model: `${form.marque.trim()} ${form.modele.trim()}`.trim(),
      type: form.type || "BERLINE",
      capacity: parseInt(form.capacite) || 4,
      year: parseInt(form.annee) || undefined,
      color: form.couleur || undefined,
      fuelType: form.carburant || undefined,
      mileage: parseInt(form.kilometrage) || undefined,
    };

    try {
      await createVehicle(payload);
      showToast("✓ Véhicule ajouté avec succès !", "success");
      setTimeout(() => navigate("/dashbordADMIN"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la création.";
      showToast(msg, "");
    }
  }

  const typeInfo = VEHICLE_TYPES.find(t => t.key === form.type);

  return (
    <div className="av-wrap">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)}/>}

      {/* ── Sidebar ── */}
      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon">
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
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
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <button type="button" className="sb-logout" onClick={() => navigate("/login")}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="av-main">
        <header className="av-header">
          <div className="av-hdr-left">
            <button type="button" className="av-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="av-hdr-title">Ajouter un véhicule</span>
          </div>
          <div className="av-hdr-right">
            <div className="user-chip">
              <div className="user-info">
                <div className="user-name">Ahmed Mansour</div>
                <div className="user-role">Administrateur</div>
              </div>
              <div className="user-avatar" onClick={() => navigate("/profilA")}>AM</div>
            </div>
          </div>
        </header>

        <main className="av-content">
          {/* Page header */}
          <div className="av-page-header">
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <button type="button" className="av-back-btn" onClick={() => navigate("/dashbordADMIN")}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                Retour
              </button>
              <div>
                <div className="av-page-title">Nouveau Véhicule</div>
                <div className="av-page-sub">Enregistrez un véhicule dans la flotte AirOps.</div>
              </div>
            </div>
          </div>

          <div className="av-layout">
            {/* Left — main form */}
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {/* Identification */}
              <div className="av-card">
                <div className="av-card-hd">
                  <div className="av-card-icon" style={{ background:"#eff6ff" }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div>
                    <div className="av-card-title">Identification du véhicule</div>
                    <div className="av-card-sub">Plaque d'immatriculation et informations de base</div>
                  </div>
                </div>
                <div className="av-form-grid">
                  <div className="av-field full">
                    <label className="av-label">Immatriculation *</label>
                    <input type="text" className={`av-input${errors.immatriculation ? " err" : ""}`}
                      placeholder="Ex: TU 123 456" style={{ textTransform:"uppercase", letterSpacing:2, fontWeight:700 }}
                      value={form.immatriculation} onChange={e => handleChange("immatriculation", e.target.value.toUpperCase())}/>
                    {errors.immatriculation && <span className="av-error">{errors.immatriculation}</span>}
                    {!errors.immatriculation && <span className="av-hint">Format tunisien ou international</span>}
                  </div>
                  <div className="av-field">
                    <label className="av-label">Marque *</label>
                    <select className={`av-select${errors.marque ? " err" : ""}`} value={form.marque}
                      onChange={e => handleChange("marque", e.target.value)}>
                      <option value="">Choisir une marque…</option>
                      {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    {errors.marque && <span className="av-error">{errors.marque}</span>}
                  </div>
                  <div className="av-field">
                    <label className="av-label">Modèle *</label>
                    <input type="text" className={`av-input${errors.modele ? " err" : ""}`}
                      placeholder="Ex: Sprinter 316" value={form.modele}
                      onChange={e => handleChange("modele", e.target.value)}/>
                    {errors.modele && <span className="av-error">{errors.modele}</span>}
                  </div>
                  <div className="av-field">
                    <label className="av-label">Année *</label>
                    <select className={`av-select${errors.annee ? " err" : ""}`} value={form.annee}
                      onChange={e => handleChange("annee", e.target.value)}>
                      <option value="">Année…</option>
                      {ANNEES.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {errors.annee && <span className="av-error">{errors.annee}</span>}
                  </div>
                  <div className="av-field">
                    <label className="av-label">Capacité (places) *</label>
                    <input type="number" min="1" max="100" className={`av-input${errors.capacite ? " err" : ""}`}
                      placeholder="Ex: 20" value={form.capacite}
                      onChange={e => handleChange("capacite", e.target.value)}/>
                    {errors.capacite && <span className="av-error">{errors.capacite}</span>}
                  </div>
                  <div className="av-field">
                    <label className="av-label">Carburant</label>
                    <select className="av-select" value={form.carburant} onChange={e => handleChange("carburant", e.target.value)}>
                      <option value="">Choisir…</option>
                      {CARBURANTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="av-field">
                    <label className="av-label">Couleur</label>
                    <input type="text" className="av-input" placeholder="Ex: Blanc" value={form.couleur}
                      onChange={e => handleChange("couleur", e.target.value)}/>
                  </div>
                  <div className="av-field">
                    <label className="av-label">Kilométrage (km)</label>
                    <input type="number" min="0" className="av-input" placeholder="Ex: 45000" value={form.kilometrage}
                      onChange={e => handleChange("kilometrage", e.target.value)}/>
                  </div>
                </div>
              </div>

              {/* Type */}
              <div className="av-card">
                <div className="av-card-hd">
                  <div className="av-card-icon" style={{ background:"#fff7ed" }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 17h8M3 9l2-4h14l2 4M3 9h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/></svg>
                  </div>
                  <div>
                    <div className="av-card-title">Type de véhicule *</div>
                    <div className="av-card-sub">Sélectionnez la catégorie du véhicule</div>
                  </div>
                </div>
                <div className="av-type-grid">
                  {VEHICLE_TYPES.map(t => (
                    <div key={t.key} className={`av-type-card${form.type === t.key ? " selected" : ""}`}
                      onClick={() => handleChange("type", t.key)}>
                      <div className="av-type-emoji">
  <img
    src={
      t.key === "Bus"
        ? vehicleBus
        : t.key === "Minibus"
        ? vehicleMinivan
        : vehicleBerline
    }
    alt={t.key}
  />
</div>
                      <div className="av-type-name">{t.key}</div>
                      <div className="av-type-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
                {errors.type && <div style={{ padding:"0 24px 12px", fontSize:11, color:"var(--accent-red)" }}>{errors.type}</div>}
              </div>

              <div className="av-card">
                <div className="av-form-actions">
                  <button type="button" className="av-btn-cancel" onClick={() => navigate("/dashbordADMIN")}>Annuler</button>
                  <button type="button" className="av-btn-save" onClick={handleSubmit}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Enregistrer le véhicule
                  </button>
                </div>
              </div>
            </div>

            {/* Right — Preview */}
            <div>
              <div className="av-card">
                <div className="av-card-hd">
                  <div className="av-card-icon" style={{ background:"#f0fdf4" }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </div>
                  <div>
                    <div className="av-card-title">Aperçu</div>
                    <div className="av-card-sub">Fiche véhicule en temps réel</div>
                  </div>
                </div>
                <div className="av-preview-body">
                  <div className="av-vehicle-icon">{typeInfo?.emoji || "🚗"}</div>
                  <div style={{ textAlign:"center" }}>
                    <div className="av-preview-plate">{form.immatriculation || "— — —"}</div>
                    <div className="av-preview-model">{form.marque && form.modele ? `${form.marque} ${form.modele}` : "Marque / Modèle"}</div>
                  </div>
                  <div className="av-preview-divider"/>
                  <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
                    {[
                      { lbl:"Type",      val: form.type || "—" },
                      { lbl:"Année",     val: form.annee || "—" },
                      { lbl:"Capacité",  val: form.capacite ? `${form.capacite} places` : "—" },
                      { lbl:"Carburant", val: form.carburant || "—" },
                      { lbl:"Couleur",   val: form.couleur || "—" },
                      { lbl:"Km",        val: form.kilometrage ? `${parseInt(form.kilometrage).toLocaleString()} km` : "—" },
                    ].map(row => (
                      <div key={row.lbl} className="av-preview-row">
                        <span className="av-preview-lbl">{row.lbl}</span>
                        <span className="av-preview-val">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="av-tips">
                  <div style={{ fontSize:10.5, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:8 }}>Conseils</div>
                  {[
                    "Vérifiez la plaque avant d'enregistrer.",
                    "La capacité inclut le chauffeur.",
                    "Mettez à jour le kilométrage régulièrement.",
                  ].map((tip, i) => (
                    <div key={i} className="av-tip">
                      <span className="av-tip-dot"/>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="av-footer">
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="12" height="12" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span>Flotte de véhicules</span>
        </footer>
      </div>

      {toast.msg && <div className={`toast${toast.type === "success" ? " success" : ""}`}>{toast.msg}</div>}
    </div>
  );
}