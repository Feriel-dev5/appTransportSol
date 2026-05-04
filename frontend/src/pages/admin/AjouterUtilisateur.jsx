import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUser } from "../../services/adminService";

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

  .au-wrap { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

  /* ── Sidebar ── */
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
  .au-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .au-header { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .au-hdr-left { display: flex; align-items: center; gap: 12px; }
  .au-hdr-right { display: flex; align-items: center; gap: 14px; }
  .au-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .au-menu-btn:hover { background: var(--bg-page); }
  .au-hdr-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
  .user-chip { display: flex; align-items: center; gap: 9px; }
  .user-info { text-align: right; }
  .user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .user-role { font-size: 10px; color: var(--text-muted); letter-spacing: 0.8px; text-transform: uppercase; }
  .user-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); flex-shrink: 0; }

  /* ── Content ── */
  .au-content { flex: 1; overflow-y: auto; padding: 30px 26px; }

  /* ── Page header ── */
  .au-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
  .au-page-header-left { display: flex; align-items: center; gap: 14px; }
  .au-back-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-weight: 600; color: var(--text-sec); cursor: pointer; font-family: inherit; transition: var(--tr); }
  .au-back-btn:hover { border-color: var(--brand-blue); color: var(--brand-blue); background: #eff6ff; }
  .au-page-title { font-size: 24px; font-weight: 800; color: var(--brand-dark); letter-spacing: -0.5px; }
  .au-page-sub { font-size: 13px; color: var(--text-muted); margin-top: 3px; }

  /* ── Main form card ── */
  .au-form-layout { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }

  .au-card { background: #fff; border: 1px solid var(--border); border-radius: 24px; box-shadow: var(--shadow-sm); overflow: hidden; transition: var(--tr); }
  .au-card:hover { box-shadow: var(--shadow-md); }

  .au-card-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .au-card-header-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .au-card-header-icon.blue { background: #eff6ff; }
  .au-card-header-icon.green { background: #f0fdf4; }
  .au-card-header-icon.purple { background: #f5f3ff; }
  .au-card-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .au-card-sub { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  .au-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px 24px; }
  .au-field { display: flex; flex-direction: column; gap: 5px; }
  .au-field.full { grid-column: 1 / -1; }
  .au-label { font-size: 10.5px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .au-input { padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; transition: var(--tr); }
  .au-input:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .au-input.err { border-color: var(--accent-red); }
  .au-select { padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; cursor: pointer; transition: var(--tr); }
  .au-select:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .au-error { font-size: 11px; color: var(--accent-red); margin-top: 1px; }

  /* Phone row */
  .au-phone-row { display: flex; gap: 8px; }
  .au-country-sel { height: 42px; border: 1.5px solid var(--border); border-radius: 11px; font-size: 12px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; cursor: pointer; padding: 0 8px; flex-shrink: 0; min-width: 128px; transition: var(--tr); }
  .au-country-sel:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .au-phone-local { flex: 1; }

  /* Role selector cards */
  .au-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px 24px 20px; }
  .au-role-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 14px; border: 2px solid var(--border); cursor: pointer; transition: var(--tr); background: #fff; }
  .au-role-card:hover { border-color: var(--brand-blue); background: #f8fbff; }
  .au-role-card.selected { border-color: var(--brand-blue); background: #eff6ff; }
  .au-role-icon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .au-role-name { font-size: 12px; font-weight: 700; color: var(--text-primary); }
  .au-role-desc { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
  .au-role-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border); margin-left: auto; flex-shrink: 0; transition: var(--tr); display: flex; align-items: center; justify-content: center; }
  .au-role-card.selected .au-role-radio { border-color: var(--brand-blue); background: var(--brand-blue); }
  .au-role-card.selected .au-role-radio::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff; display: block; }

  .au-category-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 16px 24px 20px; }
  .au-category-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); color: #fff; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.35); opacity: 0.78; }
  .au-category-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(41,128,232,0.45); opacity: 0.95; }
  .au-category-btn.active { opacity: 1; box-shadow: 0 8px 22px rgba(41,128,232,0.45); }
  .au-category-btn.active:hover { transform: translateY(-2px); }

  /* Sidebar preview card */
  .au-preview-card { position: sticky; top: 0; }
  .au-preview-body { padding: 22px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .au-avatar-preview { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 26px; font-weight: 800; box-shadow: 0 8px 24px rgba(41,128,232,0.3); border: 3px solid rgba(41,128,232,0.2); }
  .au-preview-name { font-size: 16px; font-weight: 800; color: var(--brand-dark); text-align: center; }
  .au-preview-email { font-size: 12px; color: var(--text-muted); text-align: center; word-break: break-all; }
  .au-preview-divider { width: 100%; height: 1px; background: var(--border); }
  .au-preview-row { width: 100%; display: flex; align-items: center; justify-content: space-between; }
  .au-preview-lbl { font-size: 11px; color: var(--text-muted); font-weight: 600; }
  .au-preview-val { font-size: 12px; font-weight: 700; color: var(--text-primary); }
  .au-role-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; }
  .au-role-badge.Admin { background: #f5f3ff; color: #6d28d9; }
  .au-role-badge.Responsable { background: #eff6ff; color: #1d4ed8; }
  .au-role-badge.Chauffeur { background: #f0fdf4; color: #15803d; }
  .au-role-badge.Passager { background: #f1f5f9; color: #475569; }

  /* Tips card */
  .au-tips { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }
  .au-tip { display: flex; align-items: flex-start; gap: 8px; font-size: 11.5px; color: var(--text-sec); line-height: 1.5; }
  .au-tip-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--brand-blue); flex-shrink: 0; margin-top: 5px; }

  /* Footer actions */
  .au-form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
  .au-btn-cancel { padding: 10px 20px; font-size: 13px; font-family: inherit; color: var(--text-sec); border: 1.5px solid var(--border); border-radius: 11px; background: #fff; cursor: pointer; transition: var(--tr); font-weight: 600; }
  .au-btn-cancel:hover { background: var(--bg-page); }
  .au-btn-save { display: flex; align-items: center; gap: 8px; padding: 10px 24px; font-size: 13px; font-weight: 700; font-family: inherit; color: #fff; border: none; border-radius: 11px; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); }
  .au-btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }
  .au-btn-save:active { transform: scale(0.97); }
  .au-btn-save:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Progress bar */
  .au-progress-wrap { padding: 0 24px 16px; }
  .au-progress-label { font-size: 10.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
  .au-progress-bar { height: 5px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
  .au-progress-fill { height: 100%; background: linear-gradient(90deg, var(--brand-blue), #1a6fd4); border-radius: 10px; transition: width 0.4s ease; }

  /* Toast */
  .toast { position: fixed; top: 18px; right: 18px; z-index: 999999; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; pointer-events: none; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
  .toast.success { border-left-color: #22c55e; }

  /* Footer */
  .au-footer { background: #fff; border-top: 1px solid var(--border); padding: 12px 26px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; font-size: 11px; color: var(--text-muted); }

  /* Responsive */
  @media (max-width: 1100px) { .au-form-layout { grid-template-columns: 1fr; } .au-preview-card { position: static; } }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open { transform: translateX(0); }
    .sidebar.collapsed { transform: translateX(-100%); }
    .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; }
    .au-menu-btn { display: flex; }
    .sb-toggle-btn { display: none; }
    .au-content { padding: 16px; }
    .au-header { padding: 0 16px; }
  }
  @media (max-width: 600px) {
    .au-form-grid { grid-template-columns: 1fr; }
    .au-field.full { grid-column: 1; }
    .au-role-grid { grid-template-columns: 1fr; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("au-css")) {
  const tag = document.createElement("style");
  tag.id = "au-css";
  tag.textContent = css;
  document.head.appendChild(tag);
}

/* ══════════════════════════ COUNTRIES ══════════════════════════ */
const COUNTRIES = [
  { code:"TN", dial:"+216", flag:"🇹🇳", name:"Tunisie",        digits:8  },
  { code:"DZ", dial:"+213", flag:"🇩🇿", name:"Algérie",        digits:9  },
  { code:"MA", dial:"+212", flag:"🇲🇦", name:"Maroc",          digits:9  },
  { code:"EG", dial:"+20",  flag:"🇪🇬", name:"Égypte",         digits:10 },
  { code:"FR", dial:"+33",  flag:"🇫🇷", name:"France",         digits:9  },
  { code:"DE", dial:"+49",  flag:"🇩🇪", name:"Allemagne",      digits:11 },
  { code:"GB", dial:"+44",  flag:"🇬🇧", name:"Royaume-Uni",    digits:10 },
  { code:"SA", dial:"+966", flag:"🇸🇦", name:"Arabie Saoudite",digits:9  },
  { code:"AE", dial:"+971", flag:"🇦🇪", name:"Émirats",        digits:9  },
  { code:"US", dial:"+1",   flag:"🇺🇸", name:"États-Unis",     digits:10 },
];

/* ══════════════════════════ NAV ITEMS ══════════════════════════ */
const navItems = [
  { label:"Tableau de Bord",       to:"/dashbordADMIN",     icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Liste des Utilisateurs",to:"/listeU",            icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
  { label:"Ajouter Utilisateur",   to:"/ajouterU",          icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg> },
  { label:"Ajouter Véhicule",      to:"/ajouterVehicule",   icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M3 9l2-4h14l2 4M3 9h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none"/><circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none"/></svg> },
  { label:"Mon Profil",            to:"/profilA",           icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

const USER_CATEGORIES = [
  { key:"Passager", desc:"Formulaire passager" },
  { key:"Chauffeur", desc:"Formulaire chauffeur" },
];

function initials(nom) {
  return (nom || "?").trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase() || "?";
}


function formatDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function yearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return formatDateInput(d);
}

function calcAge(dateValue) {
  if (!dateValue) return 0;
  const birth = new Date(dateValue);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function validate(form, country, activeCategory) {
  const e = {};
  if (!form.nom.trim()) e.nom = "Le nom est obligatoire.";
  else if (form.nom.trim().length < 2) e.nom = "Minimum 2 caractères.";
  else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(form.nom.trim())) e.nom = "Lettres uniquement.";
  if (!form.prenom.trim()) e.prenom = "Le prénom est obligatoire.";
  else if (form.prenom.trim().length < 2) e.prenom = "Minimum 2 caractères.";
  else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(form.prenom.trim())) e.prenom = "Lettres uniquement.";
  if (!form.cin.trim()) e.cin = "Le CIN est obligatoire.";
  else if (!/^\d{8}$/.test(form.cin.trim())) e.cin = "8 chiffres requis.";
  if (!form.nationalite) e.nationalite = "La nationalité est obligatoire.";
  if (!form.email.trim()) e.email = "L'email est obligatoire.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide.";
  if (!form.phoneLocal.trim()) e.phoneLocal = "Le téléphone est obligatoire.";
  else if (!/^\d+$/.test(form.phoneLocal)) e.phoneLocal = "Chiffres uniquement.";
  else if (form.phoneLocal.length !== country.digits) e.phoneLocal = `${country.digits} chiffres requis.`;
  if (!form.password.trim()) e.password = "Le mot de passe est obligatoire.";
  else if (form.password.length < 6) e.password = "Minimum 6 caractères.";
  if (activeCategory === "Passager") {
    if (!form.passeport.trim()) e.passeport = "Le numéro de passeport est obligatoire.";
    if (!form.dateNaissance) e.dateNaissance = "La date de naissance est obligatoire.";
    else {
      const age = calcAge(form.dateNaissance);
      if (Number.isNaN(new Date(form.dateNaissance).getTime())) e.dateNaissance = "Date invalide.";
      else if (new Date(form.dateNaissance) > new Date()) e.dateNaissance = "La date doit être réelle.";
      else if (age < 18) e.dateNaissance = "L'âge minimum accepté est 18 ans.";
      else if (age > 100) e.dateNaissance = "Date de naissance non logique.";
    }
  }
  if (activeCategory === "Chauffeur") {
    if (!form.numeroPermis.trim()) e.numeroPermis = "Le numéro de permis est obligatoire.";
    if (!form.dateExpiration) e.dateExpiration = "La date d'expiration est obligatoire.";
  }
  return e;
}

function calcProgress(form, activeCategory) {
  const common = [form.nom, form.prenom, form.cin, form.nationalite, form.email, form.phoneLocal, form.password];
  const specific = activeCategory === "Passager" ? [form.passeport, form.dateNaissance] : [form.numeroPermis, form.dateExpiration];
  const all = [...common, ...specific];
  const filled = all.filter(v => String(v || "").trim()).length;
  return Math.round((filled / all.length) * 100);
}

export default function AjouterUtilisateur() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast, setToast] = useState({ msg:"", type:"" });
  const [submitted, setSubmitted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Passager");
  const [form, setForm] = useState({
    nom:"", prenom:"", cin:"", nationalite:"Tunisienne", email:"",
    phoneCountry:"TN", phoneLocal:"", password:"",
    passeportPays:"TN", passeport:"", dateNaissance:"",
    numeroPermis:"", dateExpiration:""
  });
  const [errors, setErrors] = useState({});

  const country = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];
  const progress = calcProgress(form, activeCategory);

  function showToast(msg, type="") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3000);
  }

  function handleChange(field, val) {
    setForm(f => ({ ...f, [field]: val }));
    if (submitted) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  const maxDateNaissance = yearsAgo(18);
  const minDateNaissance = yearsAgo(100);

  async function handleSubmit() {
    setSubmitted(true);
    const errs = validate(form, country, activeCategory);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { showToast("Veuillez corriger les erreurs.", ""); return; }

    const role = activeCategory === "Passager" ? "PASSAGER" : "CHAUFFEUR";
    const phone = `+${country.dialCode}${form.phoneLocal.replace(/^0/, "")}`;
    const payload = {
      name: `${form.nom.trim()} ${form.prenom.trim()}`,
      email: form.email.trim(),
      password: form.password,
      role,
      phone,
      cin: form.cin.trim() || undefined,
      passportNumber: form.passeport.trim() || undefined,
      address: form.nationalite || undefined,
    };

    try {
      await createUser(payload);
      showToast(`✓ ${activeCategory} ajouté avec succès !`, "success");
      setTimeout(() => navigate("/listeU"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors de la création.";
      showToast(msg, "");
    }
  }

  const previewName  = `${form.nom} ${form.prenom}`.trim() || "Nom Prénom";
  const previewEmail = form.email.trim() || "email@exemple.com";

  return (
    <div className="au-wrap">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)}/>}

      {/* ── Sidebar ── */}
      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
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
      <div className="au-main">
        <header className="au-header">
          <div className="au-hdr-left">
            <button type="button" className="au-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="au-hdr-title">Ajouter un utilisateur</span>
          </div>
          <div className="au-hdr-right">
            <div className="user-chip">
              <div className="user-info">
                <div className="user-name">Ahmed Mansour</div>
                <div className="user-role">Administrateur</div>
              </div>
              <div className="user-avatar" onClick={() => navigate("/profilA")}>AM</div>
            </div>
          </div>
        </header>

        <main className="au-content">
          {/* Page header */}
          <div className="au-page-header">
            <div className="au-page-header-left">
              <button type="button" className="au-back-btn" onClick={() => navigate("/listeU")}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                Retour
              </button>
              <div>
                <div className="au-page-title">Nouvel Utilisateur</div>
                <div className="au-page-sub">Remplissez les informations pour créer un compte.</div>
              </div>
            </div>
          </div>

          <div className="au-form-layout">
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div className="au-card">
                <div className="au-card-header">
                  <div className="au-card-header-icon purple">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div>
                    <div className="au-card-title">Catégorie utilisateur</div>
                    <div className="au-card-sub">Choisissez le formulaire à remplir</div>
                  </div>
                </div>
                <div className="au-category-tabs">
                  {USER_CATEGORIES.map(r => (
                    <button key={r.key} type="button" className={`au-category-btn${activeCategory === r.key ? " active" : ""}`}
                      onClick={() => { setActiveCategory(r.key); setSubmitted(false); setErrors({}); }}>
                      {r.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="au-card">
                <div className="au-card-header">
                  <div className="au-card-header-icon blue">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <div>
                    <div className="au-card-title">Nouveau {activeCategory}</div>
                    <div className="au-card-sub">Champs marqués * obligatoires</div>
                  </div>
                </div>
                <div className="au-progress-wrap" style={{ paddingTop:16 }}>
                  <div className="au-progress-label">
                    <span>Complétion du formulaire</span>
                    <span style={{ color: progress === 100 ? "var(--accent-green)" : "var(--brand-blue)" }}>{progress}%</span>
                  </div>
                  <div className="au-progress-bar"><div className="au-progress-fill" style={{ width:`${progress}%` }}/></div>
                </div>
                <div className="au-form-grid">
                  <div className="au-field"><label className="au-label">Nom *</label><input type="text" className={`au-input${errors.nom ? " err" : ""}`} placeholder="Ex: Ben Salah" value={form.nom} onChange={e => handleChange("nom", e.target.value)}/>{errors.nom && <span className="au-error">{errors.nom}</span>}</div>
                  <div className="au-field"><label className="au-label">Prénom *</label><input type="text" className={`au-input${errors.prenom ? " err" : ""}`} placeholder={activeCategory === "Passager" ? "Ex: Ines" : "Ex: Ahmed"} value={form.prenom} onChange={e => handleChange("prenom", e.target.value)}/>{errors.prenom && <span className="au-error">{errors.prenom}</span>}</div>
                  <div className="au-field"><label className="au-label">CIN *</label><input type="text" className={`au-input${errors.cin ? " err" : ""}`} placeholder="12345678" value={form.cin} maxLength={8} onChange={e => handleChange("cin", e.target.value.replace(/\D/g,""))}/>{errors.cin && <span className="au-error">{errors.cin}</span>}</div>
                  {activeCategory === "Passager" ? <div className="au-field"><label className="au-label">Numéro de passeport *</label><div className="au-phone-row"><select className="au-country-sel" value={form.passeportPays} onChange={e => handleChange("passeportPays", e.target.value)}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}</select><input type="text" className={`au-input au-phone-local${errors.passeport ? " err" : ""}`} placeholder="0000000" value={form.passeport} onChange={e => handleChange("passeport", e.target.value.toUpperCase())}/></div>{errors.passeport && <span className="au-error">{errors.passeport}</span>}</div> : <div className="au-field"><label className="au-label">Nationalité *</label><select className={`au-select${errors.nationalite ? " err" : ""}`} value={form.nationalite} onChange={e => handleChange("nationalite", e.target.value)}><option value="Tunisienne">Tunisienne</option><option value="Française">Française</option><option value="Algérienne">Algérienne</option><option value="Marocaine">Marocaine</option></select>{errors.nationalite && <span className="au-error">{errors.nationalite}</span>}</div>}
                  {activeCategory === "Passager" && <><div className="au-field"><label className="au-label">Nationalité *</label><select className={`au-select${errors.nationalite ? " err" : ""}`} value={form.nationalite} onChange={e => handleChange("nationalite", e.target.value)}><option value="Tunisienne">Tunisienne</option><option value="Française">Française</option><option value="Algérienne">Algérienne</option><option value="Marocaine">Marocaine</option></select>{errors.nationalite && <span className="au-error">{errors.nationalite}</span>}</div><div className="au-field"><label className="au-label">Date de naissance *</label><input type="date" min={minDateNaissance} max={maxDateNaissance} className={`au-input${errors.dateNaissance ? " err" : ""}`} value={form.dateNaissance} onChange={e => handleChange("dateNaissance", e.target.value)}/>{errors.dateNaissance && <span className="au-error">{errors.dateNaissance}</span>}</div></>}
                  <div className="au-field full"><label className="au-label">Email *</label><input type="email" className={`au-input${errors.email ? " err" : ""}`} placeholder={activeCategory === "Passager" ? "passager@mail.tn" : "chauffeur@airops.tn"} value={form.email} onChange={e => handleChange("email", e.target.value)}/>{errors.email && <span className="au-error">{errors.email}</span>}</div>
                  <div className="au-field full"><label className="au-label">Téléphone *</label><div className="au-phone-row"><select className="au-country-sel" value={form.phoneCountry} onChange={e => handleChange("phoneCountry", e.target.value)}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dial} {c.name}</option>)}</select><div className="au-phone-local"><input type="text" className={`au-input${errors.phoneLocal ? " err" : ""}`} placeholder="00000000" value={form.phoneLocal} onChange={e => handleChange("phoneLocal", e.target.value.replace(/\D/g,""))} maxLength={country.digits}/>{errors.phoneLocal && <span className="au-error">{errors.phoneLocal}</span>}</div></div></div>

                  {activeCategory === "Chauffeur" && <><div className="au-field"><label className="au-label">Numéro de permis *</label><input type="text" className={`au-input${errors.numeroPermis ? " err" : ""}`} placeholder="Ex: A123456" value={form.numeroPermis} onChange={e => handleChange("numeroPermis", e.target.value)}/>{errors.numeroPermis && <span className="au-error">{errors.numeroPermis}</span>}</div><div className="au-field"><label className="au-label">Date d'expiration *</label><input type="date" className={`au-input${errors.dateExpiration ? " err" : ""}`} value={form.dateExpiration} onChange={e => handleChange("dateExpiration", e.target.value)}/>{errors.dateExpiration && <span className="au-error">{errors.dateExpiration}</span>}</div></>}
                  <div className="au-field full"><label className="au-label">Mot de passe *</label><input type="password" className={`au-input${errors.password ? " err" : ""}`} placeholder="••••••••" value={form.password} onChange={e => handleChange("password", e.target.value)}/>{errors.password && <span className="au-error">{errors.password}</span>}</div>
                </div>
                <div className="au-form-actions"><button type="button" className="au-btn-cancel" onClick={() => navigate("/listeU")}>Annuler</button><button type="button" className="au-btn-save" onClick={handleSubmit} disabled={progress < 25}><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Enregistrer le {activeCategory.toLowerCase()}</button></div>
              </div>
            </div>
            <div><div className="au-card au-preview-card"><div className="au-card-header"><div className="au-card-header-icon green"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></div><div><div className="au-card-title">Aperçu</div><div className="au-card-sub">Prévisualisation en temps réel</div></div></div><div className="au-preview-body"><div className="au-avatar-preview">{activeCategory === "Chauffeur" ? "CH" : initials(previewName)}</div><div><div className="au-preview-name">{previewName}</div><div className="au-preview-email">{previewEmail}</div></div><div className="au-preview-divider"/><div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}><div className="au-preview-row"><span className="au-preview-lbl">CIN</span><span className="au-preview-val">{form.cin || "Non renseigné"}</span></div><div className="au-preview-row"><span className="au-preview-lbl">Téléphone</span><span className="au-preview-val">{form.phoneLocal ? `${country.dial} ${form.phoneLocal}` : "Non renseigné"}</span></div><div className="au-preview-row"><span className="au-preview-lbl">{activeCategory === "Passager" ? "Passeport" : "N° permis"}</span><span className="au-preview-val">{activeCategory === "Passager" ? (form.passeport || "Non renseigné") : (form.numeroPermis || "Non renseigné")}</span></div><div className="au-preview-row"><span className="au-preview-lbl">Catégorie</span><span className={`au-role-badge ${activeCategory}`}>{activeCategory}</span></div></div></div></div></div>
          </div>
        </main>

        <footer className="au-footer">
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width="12" height="12" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span>Nouvel utilisateur</span>
        </footer>
      </div>

      {toast.msg && <div className={`toast${toast.type === "success" ? " success" : ""}`}>{toast.msg}</div>}
    </div>
  );
}