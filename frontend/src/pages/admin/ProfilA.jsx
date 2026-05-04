import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchMyProfile, updateMyProfile } from "../../services/adminService";

/* ══════════════════════════ CSS ══════════════════════════ */
const profilAdminCSS = `
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
    --radius-card:  20px;
  }

  .pa-wrap { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

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
  .pa-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .pa-header { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .pa-hdr-left  { display: flex; align-items: center; gap: 12px; }
  .pa-hdr-right { display: flex; align-items: center; gap: 10px; }
  .pa-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .pa-menu-btn:hover { background: var(--bg-page); color: var(--text-primary); }
  .pa-hdr-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

  .pa-user-chip { display: flex; align-items: center; gap: 9px; }
  .pa-user-info { text-align: right; }
  .pa-user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .pa-user-role { font-size: 11px; color: var(--text-muted); }
  .pa-user-av { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); overflow: hidden; flex-shrink: 0; cursor: pointer; }
  .pa-user-av img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Content ── */
  .pa-content { flex: 1; overflow-y: auto; padding: 26px; }
  .pa-page-title    { font-size: clamp(22px,3vw,34px); font-weight: 800; color: var(--brand-blue); letter-spacing: -0.8px; line-height: 1; margin-bottom: 6px; }
  .pa-page-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 26px; }

  /* ── Profile grid ── */
  .pa-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }

  /* ── Cards ── */
  .pa-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); transition: var(--tr); }
  .pa-card:hover { box-shadow: var(--shadow-md); }

  /* ── Avatar card ── */
  .pa-avatar-card { padding: 28px 24px; text-align: center; }
  .pa-avatar-wrap { position: relative; width: 140px; height: 140px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, #e8f2fd, #d0e8fb); border: 3px solid rgba(41,128,232,0.15); overflow: hidden; cursor: pointer; transition: var(--tr); }
  .pa-avatar-wrap:hover { border-color: var(--brand-blue); transform: scale(1.03); }
  .pa-avatar-wrap:hover .pa-av-overlay { opacity: 1; }
  .pa-avatar-img { width: 100%; height: 100%; object-fit: cover; }
  .pa-avatar-ph { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
  .pa-av-overlay { position: absolute; inset: 0; background: rgba(41,128,232,0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; opacity: 0; transition: opacity 0.2s; font-size: 12px; font-weight: 700; gap: 6px; }
  .pa-av-initials { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 42px; font-weight: 800; color: var(--brand-blue); background: linear-gradient(135deg, #dbeafe, #bfdbfe); }

  .pa-rm-photo { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; margin-bottom: 12px; padding: 6px 14px; border-radius: 20px; border: 1.5px solid #fecaca; background: #fef2f2; color: var(--accent-red); font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); }
  .pa-rm-photo:hover { background: #fee2e2; border-color: #fca5a5; }

  .pa-av-name { font-size: 22px; font-weight: 800; color: var(--text-primary); }
  .pa-av-role { display: inline-flex; align-items: center; gap: 6px; background: #fef3c7; color: #d97706; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin: 8px 0 20px; }

  .pa-info-row { background: var(--bg-page); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; text-align: left; }
  .pa-info-lbl { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 3px; }
  .pa-info-val { font-size: 13px; font-weight: 700; color: var(--text-primary); word-break: break-all; }

  /* ── Stats mini inside card ── */
  .pa-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; }
  .pa-stat { background: var(--bg-page); border-radius: 14px; padding: 14px; text-align: center; }
  .pa-stat-val { font-size: 22px; font-weight: 800; color: var(--brand-blue); }
  .pa-stat-lbl { font-size: 10px; color: var(--text-muted); margin-top: 2px; font-weight: 600; }

  /* ── Banner card ── */
  .pa-banner { background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-mid) 100%); border-radius: var(--radius-card); padding: 24px; color: #fff; position: relative; overflow: hidden; margin-top: 16px; min-height: 170px; display: flex; flex-direction: column; justify-content: space-between; border: none; box-shadow: var(--shadow-sm); transition: var(--tr); }
  .pa-banner:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .pa-banner-deco { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.07); pointer-events: none; }
  .pa-banner-sub  { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; }
  .pa-banner-title{ font-size: 18px; font-weight: 800; line-height: 1.3; }
  .pa-banner-desc { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px; }
  .pa-banner-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; margin-top: 16px; width: fit-content; }

  /* ── Form card ── */
  .pa-form-card { padding: 28px 28px 24px; }
  .pa-form-title    { font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
  .pa-form-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }

  /* ── Security section ── */
  .pa-section-sep { border: none; border-top: 1px solid var(--border); margin: 22px 0 20px; }
  .pa-section-title { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
  .pa-section-sub   { font-size: 12px; color: var(--text-muted); margin-bottom: 18px; }

  .pa-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
  .pa-form-group { display: flex; flex-direction: column; gap: 6px; }
  .pa-form-group.full { grid-column: 1 / -1; }

  .pa-form-label { font-size: 11px; font-weight: 700; color: var(--text-sec); letter-spacing: 0.5px; text-transform: uppercase; }

  .pa-form-input { height: 46px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 13.5px; font-family: inherit; color: var(--text-primary); background: var(--bg-page); outline: none; transition: var(--tr); width: 100%; }
  .pa-form-input:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .pa-form-input.pa-error { border-color: #fca5a5; background: #fff; }
  .pa-form-input.pa-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
  .pa-form-input::placeholder { color: var(--text-muted); }

  .pa-form-err { font-size: 11.5px; color: var(--accent-red); margin-top: 2px; }

  /* Phone row with country select */
  .pa-phone-row { display: flex; gap: 8px; align-items: flex-start; }
  .pa-country-sel { height: 46px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 12px; font-family: inherit; color: var(--text-primary); background: var(--bg-page); outline: none; transition: var(--tr); cursor: pointer; padding: 0 8px; flex-shrink: 0; min-width: 130px; }
  .pa-country-sel:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .pa-phone-local { flex: 1; }

  /* password strength */
  .pa-pwd-bars { display: flex; gap: 4px; margin-top: 6px; }
  .pa-pwd-bar { flex: 1; height: 3px; border-radius: 3px; background: var(--border); transition: background 0.3s; }
  .pa-pwd-bar.weak   { background: #ef4444; }
  .pa-pwd-bar.medium { background: #f97316; }
  .pa-pwd-bar.strong { background: #16a34a; }
  .pa-pwd-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

  /* ── Role selector ── */
  .pa-role-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
  .pa-role-opt { padding: 10px 6px; border: 1.5px solid var(--border); border-radius: 12px; background: var(--bg-page); cursor: pointer; text-align: center; transition: var(--tr); }
  .pa-role-opt:hover { border-color: var(--brand-blue); background: #eff6ff; }
  .pa-role-opt.selected { border-color: var(--brand-blue); background: #eff6ff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .pa-role-emoji { font-size: 20px; margin-bottom: 4px; }
  .pa-role-name  { font-size: 11px; font-weight: 700; color: var(--text-sec); }
  .pa-role-opt.selected .pa-role-name { color: var(--brand-blue); }

  /* ── Permissions preview ── */
  .pa-perms { background: var(--bg-page); border-radius: 14px; padding: 16px; margin-bottom: 18px; }
  .pa-perms-title { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
  .pa-perm-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-sec); margin-bottom: 6px; }
  .pa-perm-item:last-child { margin-bottom: 0; }
  .pa-perm-check { width: 16px; height: 16px; border-radius: 5px; background: var(--accent-green); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .pa-perm-cross { width: 16px; height: 16px; border-radius: 5px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* ── Footer actions ── */
  .pa-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-top: 20px; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .pa-footer-msg { font-size: 13px; }
  .pa-footer-msg.success { color: var(--accent-green); font-weight: 700; }
  .pa-footer-msg.hint    { color: var(--text-muted); }
  .pa-form-actions { display: flex; align-items: center; gap: 10px; }

  .pa-btn-cancel { padding: 10px 22px; border-radius: 22px; border: 1.5px solid var(--border); background: #fff; color: var(--text-sec); font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); }
  .pa-btn-cancel:hover { background: var(--bg-page); border-color: #c7d8ed; }

  .pa-btn-save { padding: 10px 26px; border-radius: 22px; border: none; background: var(--brand-blue); color: #fff; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); }
  .pa-btn-save:hover:not(:disabled) { background: var(--brand-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }
  .pa-btn-save:disabled { background: #a5c8f4; cursor: not-allowed; box-shadow: none; }

  /* ── Activity log ── */
  .pa-activity { padding: 20px 24px; }
  .pa-activity-title { font-size: 14px; font-weight: 800; color: var(--text-primary); margin-bottom: 14px; }
  .pa-log-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .pa-log-item:last-child { border-bottom: none; }
  .pa-log-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .pa-log-text { font-size: 12.5px; color: var(--text-sec); flex: 1; }
  .pa-log-time { font-size: 11px; color: var(--text-muted); white-space: nowrap; }

  /* ── Toast ── */
  .pa-toast { position: fixed; top: 18px; right: 18px; z-index: 200; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: paToastIn 0.3s ease; pointer-events: none; }
  @keyframes paToastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }

  /* ── Responsive ── */
  @media (max-width: 1100px) { .pa-grid { grid-template-columns: 280px 1fr; } }
  @media (max-width: 900px) {
    .pa-grid { grid-template-columns: 1fr; }
    .pa-form-grid { grid-template-columns: 1fr; }
    .pa-form-group.full { grid-column: 1; }
    .pa-role-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open  { transform: translateX(0); }
    .sidebar.collapsed { transform: translateX(-100%); }
    .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; }
    .pa-menu-btn { display: flex; }
    .sb-toggle-btn { display: none; }
    .pa-content { padding: 16px; }
    .pa-header { padding: 0 16px; }
    .pa-form-card { padding: 20px 18px 18px; }
    .pa-form-footer { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 480px) {
    .pa-user-info { display: none; }
    .pa-content { padding: 12px; }
    .pa-grid { gap: 14px; }
    .pa-avatar-wrap { width: 110px; height: 110px; }
    .pa-form-actions { width: 100%; justify-content: flex-end; }
    .pa-phone-row { flex-direction: column; }
    .pa-country-sel { min-width: 100%; }
    .pa-role-grid { grid-template-columns: repeat(2, 1fr); }
    .pa-stats-row { grid-template-columns: 1fr 1fr; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("profil-admin-css")) {
  const tag = document.createElement("style");
  tag.id = "profil-admin-css";
  tag.textContent = profilAdminCSS;
  document.head.appendChild(tag);
}

/* ══════════════════════════ COUNTRY DIAL CODES ══════════════════════════ */
const COUNTRIES = [
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie",           digits: 8  },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie",           digits: 9  },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc",             digits: 9  },
  { code: "EG", dial: "+20",  flag: "🇪🇬", name: "Égypte",            digits: 10 },
  { code: "LY", dial: "+218", flag: "🇱🇾", name: "Libye",             digits: 9  },
  { code: "FR", dial: "+33",  flag: "🇫🇷", name: "France",            digits: 9  },
  { code: "DE", dial: "+49",  flag: "🇩🇪", name: "Allemagne",         digits: 11 },
  { code: "GB", dial: "+44",  flag: "🇬🇧", name: "Royaume-Uni",       digits: 10 },
  { code: "ES", dial: "+34",  flag: "🇪🇸", name: "Espagne",           digits: 9  },
  { code: "IT", dial: "+39",  flag: "🇮🇹", name: "Italie",            digits: 10 },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal",          digits: 9  },
  { code: "BE", dial: "+32",  flag: "🇧🇪", name: "Belgique",          digits: 9  },
  { code: "NL", dial: "+31",  flag: "🇳🇱", name: "Pays-Bas",          digits: 9  },
  { code: "CH", dial: "+41",  flag: "🇨🇭", name: "Suisse",            digits: 9  },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Arabie Saoudite",   digits: 9  },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats Arabes",    digits: 9  },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar",             digits: 8  },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Koweït",            digits: 8  },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahreïn",           digits: 8  },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman",              digits: 8  },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordanie",          digits: 9  },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Liban",             digits: 8  },
  { code: "TR", dial: "+90",  flag: "🇹🇷", name: "Turquie",           digits: 10 },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal",           digits: 9  },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d Ivoire",     digits: 10 },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun",          digits: 9  },
  { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée",            digits: 9  },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali",              digits: 8  },
  { code: "MR", dial: "+222", flag: "🇲🇷", name: "Mauritanie",        digits: 8  },
  { code: "US", dial: "+1",   flag: "🇺🇸", name: "États-Unis",        digits: 10 },
  { code: "CA", dial: "+1",   flag: "🇨🇦", name: "Canada",            digits: 10 },
  { code: "BR", dial: "+55",  flag: "🇧🇷", name: "Brésil",            digits: 11 },
  { code: "CN", dial: "+86",  flag: "🇨🇳", name: "Chine",             digits: 11 },
  { code: "JP", dial: "+81",  flag: "🇯🇵", name: "Japon",             digits: 10 },
  { code: "KR", dial: "+82",  flag: "🇰🇷", name: "Corée du Sud",      digits: 10 },
  { code: "AU", dial: "+61",  flag: "🇦🇺", name: "Australie",         digits: 9  },
  { code: "IN", dial: "+91",  flag: "🇮🇳", name: "Inde",              digits: 10 },
  { code: "PK", dial: "+92",  flag: "🇵🇰", name: "Pakistan",          digits: 10 },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigéria",           digits: 10 },
  { code: "ZA", dial: "+27",  flag: "🇿🇦", name: "Afrique du Sud",    digits: 9  },
  { code: "RU", dial: "+7",   flag: "🇷🇺", name: "Russie",            digits: 10 },
];

/* ══════════════════════════ STORAGE ══════════════════════════ */
const ADMIN_FORM_KEY  = "airops_admin_profil_form_v1";
const ADMIN_PHOTO_KEY = "airops_admin_profil_photo_v1";

export function getAdminName() {
  try { const s = localStorage.getItem(ADMIN_FORM_KEY); return s ? (JSON.parse(s).nom || "Ahmed Mansour") : "Ahmed Mansour"; } catch { return "Ahmed Mansour"; }
}
export function getAdminPhoto() {
  try { return localStorage.getItem(ADMIN_PHOTO_KEY) || ""; } catch { return ""; }
}
export function getAdminInitials(nom) {
  return (nom || "Ahmed Mansour").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "AM";
}

const defaultForm = {
  nom:          "Ahmed Mansour",
  email:        "ahmed.mansour@nouvelair.com",
  phoneCountry: "TN",
  phoneLocal:   "22111333",
  adresse:      "Tunis, Tunisie",
  role:         "Admin",
  password:     "",
  confirmPwd:   "",
};

/* ══════════════════════════ NAV ══════════════════════════ */
const navItems = [
  {
    label: "Tableau de Bord",
    to: "/dashbordADMIN",
    icon: <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  },
  {
    label: "Liste des Utilisateurs",
    to: "/listeU",
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  },
  {
    label: "Ajouter Utilisateur",
    to: "/ajouterU",
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>,
  },
  {
    label: "Ajouter Véhicule",
    to: "/ajouterVehicule",
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8M3 9l2-4h14l2 4M3 9h18v7a1 1 0 01-1 1H4a1 1 0 01-1-1V9z"/><circle cx="7" cy="17" r="1" fill="currentColor"/><circle cx="17" cy="17" r="1" fill="currentColor"/></svg>,
  },
  {
    label: "Mon Profil",
    to: "/profilA",
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
];

/* ══════════════════════════ ROLE PERMISSIONS ══════════════════════════ */
const rolePerms = {
  Admin:       ["Gérer tous les utilisateurs", "Accès tableau de bord", "Modifier les rôles", "Bannir / Réactiver"],
  Responsable: ["Voir les utilisateurs", "Accès tableau de bord", "Gérer les missions"],
  Chauffeur:   ["Voir ses missions", "Mettre à jour son statut"],
  Passager:    ["Réserver des transports", "Voir ses réservations"],
};

function pwdStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 6)  s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) s++;
  return s;
}
const pwdLabels = ["", "Faible", "Moyen", "Fort"];
const pwdColors = ["", "weak", "medium", "strong"];

/* ══════════════════════════ ACTIVITY LOG ══════════════════════════ */
const activityLog = [
  { text: "Connexion depuis Tunis, TN",      time: "Il y a 2 min",   color: "#2980e8" },
  { text: "Modification du profil",           time: "Il y a 1 h",    color: "#16a34a" },
  { text: "Export PDF du tableau de bord",    time: "Il y a 3 h",    color: "#f97316" },
  { text: "Suppression d'un utilisateur",     time: "Hier 14:32",    color: "#ef4444" },
  { text: "Ajout d'un nouveau chauffeur",     time: "Hier 09:11",    color: "#16a34a" },
];

/* ══════════════════════════ HELPERS ══════════════════════════ */
function isAlphaOnly(str) {
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(str);
}

/* Migrate stored telephone to country+local format */
function parseStoredPhone(stored) {
  if (!stored) return { phoneCountry: "TN", phoneLocal: "" };
  const country = COUNTRIES.find(c => stored.startsWith(c.dial + " "));
  if (country) return { phoneCountry: country.code, phoneLocal: stored.slice(country.dial.length + 1) };
  // Legacy format: plain digits
  return { phoneCountry: "TN", phoneLocal: stored.replace(/\D/g, "").slice(0, 8) };
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
export default function ProfilA() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [form, setForm] = useState(() => {
    try {
      const s = localStorage.getItem(ADMIN_FORM_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        // If old format had "telephone" key, migrate it
        const phoneData = parsed.phoneCountry
          ? { phoneCountry: parsed.phoneCountry, phoneLocal: parsed.phoneLocal || "" }
          : parseStoredPhone(parsed.telephone || "");
        return { ...defaultForm, ...parsed, ...phoneData, password: "", confirmPwd: "" };
      }
      return defaultForm;
    } catch { return defaultForm; }
  });

  const [photo, setPhoto] = useState(() => getAdminPhoto());

  /* Persist form */
  useEffect(() => {
    try {
      const { password: _p, confirmPwd: _c, ...rest } = form;
      localStorage.setItem(ADMIN_FORM_KEY, JSON.stringify(rest));
      window.dispatchEvent(new Event("airops-admin-profile-update"));
    } catch {}
  }, [form]);

  /* Persist photo */
  useEffect(() => {
    try {
      if (photo) localStorage.setItem(ADMIN_PHOTO_KEY, photo);
      else localStorage.removeItem(ADMIN_PHOTO_KEY);
      window.dispatchEvent(new Event("airops-admin-profile-update"));
    } catch {}
  }, [photo]);

  const [touched,        setTouched]        = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [toast,          setToast]          = useState("");
  const [collapsed,      setCollapsed]      = useState(false);
  const [sidebarMobile,  setSidebarMobile]  = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedCountry = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];

  const errors = {
    nom:
      !form.nom.trim()           ? "Le nom est obligatoire." :
      form.nom.trim().length < 3 ? "Au moins 3 caractères." :
      !isAlphaOnly(form.nom.trim()) ? "Le nom ne doit contenir que des lettres." : "",
    email:
      !form.email.trim()         ? "L'email est obligatoire." :
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Email invalide." : "",
    phoneLocal:
      !form.phoneLocal.trim()    ? "Le téléphone est obligatoire." :
      !/^\d+$/.test(form.phoneLocal) ? "Uniquement des chiffres." :
      form.phoneLocal.length !== selectedCountry.digits
        ? `${selectedCountry.digits} chiffres requis pour ${selectedCountry.name}.` : "",
    adresse:
      !form.adresse.trim()       ? "L'adresse est obligatoire." : "",
    password:
      form.password.length > 0 && form.password.length < 6 ? "Minimum 6 caractères." : "",
    confirmPwd:
      form.password.length > 0 && form.confirmPwd !== form.password
        ? "Les mots de passe ne correspondent pas." : "",
  };

  const isValid  = Object.values(errors).every(v => v === "");
  const strength = pwdStrength(form.password);

  const handleChange = e => {
    const { name, value } = e.target;
    // Nom: block digits and special chars
    if (name === "nom" && value !== "" && !/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']*$/.test(value)) return;
    // phoneLocal: only digits
    if (name === "phoneLocal" && value !== "" && !/^\d*$/.test(value)) return;
    // Country change resets local number
    if (name === "phoneCountry") {
      setForm(prev => ({ ...prev, phoneCountry: value, phoneLocal: "" }));
      setSuccessMessage("");
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccessMessage("");
  };

  const handleBlur  = e => setTouched(prev => ({ ...prev, [e.target.name]: true }));
  const inputCls    = field => `pa-form-input${touched[field] && errors[field] ? " pa-error" : ""}`;

  const handleReset = () => {
    try {
      const saved = localStorage.getItem(ADMIN_FORM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const phoneData = parsed.phoneCountry
          ? { phoneCountry: parsed.phoneCountry, phoneLocal: parsed.phoneLocal || "" }
          : parseStoredPhone(parsed.telephone || "");
        setForm({ ...defaultForm, ...parsed, ...phoneData, password: "", confirmPwd: "" });
      } else {
        setForm(defaultForm);
      }
    } catch { setForm(defaultForm); }
    setTouched({});
    setSuccessMessage("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ nom: true, email: true, phoneLocal: true, adresse: true, password: true, confirmPwd: true });
    if (!isValid) return;
    try {
      const updates = {
        name: `${form.nom}`.trim(),
        email: form.email.trim() || undefined,
        phone: form.phoneLocal ? `${selectedCountry.dial}${form.phoneLocal}` : undefined,
        address: form.adresse || undefined,
      };
      if (form.password && form.password === form.confirmPwd) {
        updates.password = form.password;
      }
      await updateMyProfile(updates);
      window.dispatchEvent(new Event("airops-admin-profile-update"));
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de la mise à jour.");
      return;
    }
    setSuccessMessage("Profil mis à jour avec succès !");
    setToast("✓ Profil administrateur enregistré !");
    setForm(prev => ({ ...prev, password: "", confirmPwd: "" }));
    setTouched({});
  };

  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPhoto(ev.target.result); setToast("✓ Photo de profil mise à jour !"); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const initials = getAdminInitials(form.nom);
  const perms    = rolePerms[form.role] || rolePerms.Admin;
  const allPerms = ["Gérer tous les utilisateurs", "Accès tableau de bord", "Modifier les rôles", "Bannir / Réactiver", "Voir les utilisateurs", "Gérer les missions", "Voir ses missions", "Réserver des transports"];
  const displayTel = form.phoneLocal ? `${selectedCountry.dial} ${form.phoneLocal}` : "—";

  return (
    <div className="pa-wrap">
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
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
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
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => navigate("/login")}>
            <span className="sb-logout-icon">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="pa-main">
        <header className="pa-header">
          <div className="pa-hdr-left">
            <button type="button" className="pa-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="pa-hdr-title">Mon Profil</span>
          </div>
          <div className="pa-hdr-right">
            <div className="pa-user-chip">
              <div className="pa-user-info">
                <div className="pa-user-name">{form.nom}</div>
                <div className="pa-user-role">Administrateur</div>
              </div>
              <div className="pa-user-av" onClick={() => fileRef.current?.click()} title="Changer la photo">
                {photo ? <img src={photo} alt="profil"/> : <span>{initials}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="pa-content">
          <h1 className="pa-page-title">Mon profil</h1>
          <p className="pa-page-subtitle">Gérez vos informations administrateur et vos préférences de sécurité.</p>

          <div className="pa-grid">
            {/* ── Colonne gauche ── */}
            <div>
              <div className="pa-card pa-avatar-card">
                {/* Avatar */}
                <div className="pa-avatar-wrap" onClick={() => fileRef.current?.click()} title="Cliquer pour changer la photo">
                  {photo
                    ? <img src={photo} alt="Profil" className="pa-avatar-img"/>
                    : <div className="pa-av-initials">{initials}</div>
                  }
                  <div className="pa-av-overlay">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span>Changer photo</span>
                  </div>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }}/>

                {photo && (
                  <button type="button" className="pa-rm-photo" onClick={() => { setPhoto(""); setToast("✓ Photo supprimée."); }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Supprimer la photo
                  </button>
                )}

                <p className="pa-av-name">{form.nom}</p>
                <span className="pa-av-role">
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  {form.role}
                </span>

                <div className="pa-info-row"><p className="pa-info-lbl">Email</p><p className="pa-info-val">{form.email || "—"}</p></div>
                <div className="pa-info-row"><p className="pa-info-lbl">Téléphone</p><p className="pa-info-val">{displayTel}</p></div>
                <div className="pa-info-row"><p className="pa-info-lbl">Adresse</p><p className="pa-info-val">{form.adresse || "—"}</p></div>
              </div>

              {/* Banner */}
              <div className="pa-banner">
                <div className="pa-banner-deco" style={{ width: 160, height: 160, right: -40, bottom: -40 }}/>
                <div className="pa-banner-deco" style={{ width: 80, height: 80, right: 60, top: -20 }}/>
                <div>
                  <p className="pa-banner-sub">Espace administrateur</p>
                  <p className="pa-banner-title">Gérez votre compte en toute sécurité</p>
                  <p className="pa-banner-desc">Maintenez vos informations à jour pour garantir la sécurité de la plateforme.</p>
                </div>
                <div className="pa-banner-pill">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Compte sécurisé
                </div>
              </div>
            </div>

            {/* ── Colonne droite ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Form card */}
              <div className="pa-card pa-form-card">
                <p className="pa-form-title">Informations du compte</p>
                <p className="pa-form-subtitle">Modifiez vos informations personnelles d'administrateur.</p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="pa-form-grid">
                    {/* Nom */}
                    <div className="pa-form-group">
                      <label className="pa-form-label">
                        Nom complet
                        <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-muted)", marginLeft: 4 }}>(lettres uniquement)</span>
                      </label>
                      <input type="text" name="nom" value={form.nom}
                        onChange={handleChange} onBlur={handleBlur}
                        className={inputCls("nom")} placeholder="Ahmed Mansour"
                        autoComplete="name"/>
                      {touched.nom && errors.nom && <p className="pa-form-err">{errors.nom}</p>}
                    </div>

                    {/* Email */}
                    <div className="pa-form-group">
                      <label className="pa-form-label">Adresse email</label>
                      <input type="email" name="email" value={form.email}
                        onChange={handleChange} onBlur={handleBlur}
                        className={inputCls("email")} placeholder="ahmed@nouvelair.com"/>
                      {touched.email && errors.email && <p className="pa-form-err">{errors.email}</p>}
                    </div>

                    {/* Téléphone — country selector + digits only */}
                    <div className="pa-form-group full">
                      <label className="pa-form-label">
                        Téléphone
                        <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-muted)", marginLeft: 6 }}>
                          ({selectedCountry.digits} chiffres pour {selectedCountry.name})
                        </span>
                      </label>
                      <div className="pa-phone-row">
                        <select
                          name="phoneCountry"
                          className="pa-country-sel"
                          value={form.phoneCountry}
                          onChange={handleChange}>
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="phoneLocal"
                          value={form.phoneLocal}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`pa-form-input pa-phone-local${touched.phoneLocal && errors.phoneLocal ? " pa-error" : ""}`}
                          placeholder={"0".repeat(selectedCountry.digits)}
                          inputMode="numeric"
                          maxLength={selectedCountry.digits}/>
                      </div>
                      {touched.phoneLocal && errors.phoneLocal && <p className="pa-form-err">{errors.phoneLocal}</p>}
                    </div>

                    {/* Adresse */}
                    <div className="pa-form-group">
                      <label className="pa-form-label">Adresse</label>
                      <input type="text" name="adresse" value={form.adresse}
                        onChange={handleChange} onBlur={handleBlur}
                        className={inputCls("adresse")} placeholder="Ville, Pays"/>
                      {touched.adresse && errors.adresse && <p className="pa-form-err">{errors.adresse}</p>}
                    </div>
                  </div>

                  {/* Security section */}
                  <hr className="pa-section-sep"/>
                  <p className="pa-section-title">Sécurité du compte</p>
                  <p className="pa-section-sub">Laissez vide pour conserver le mot de passe actuel.</p>

                  <div className="pa-form-grid">
                    <div className="pa-form-group">
                      <label className="pa-form-label">Nouveau mot de passe</label>
                      <input type="password" name="password" value={form.password}
                        onChange={handleChange} onBlur={handleBlur}
                        className={inputCls("password")} placeholder="Laisser vide si inchangé"/>
                      {touched.password && errors.password && <p className="pa-form-err">{errors.password}</p>}
                      {form.password.length > 0 && (
                        <>
                          <div className="pa-pwd-bars">
                            {[1,2,3].map(i => <div key={i} className={`pa-pwd-bar${i <= strength ? ` ${pwdColors[strength]}` : ""}`}/>)}
                          </div>
                          <p className="pa-pwd-hint">Force : <strong>{pwdLabels[strength]}</strong></p>
                        </>
                      )}
                    </div>
                    <div className="pa-form-group">
                      <label className="pa-form-label">Confirmer le mot de passe</label>
                      <input type="password" name="confirmPwd" value={form.confirmPwd}
                        onChange={handleChange} onBlur={handleBlur}
                        className={inputCls("confirmPwd")} placeholder="Répéter le nouveau mot de passe"/>
                      {touched.confirmPwd && errors.confirmPwd && <p className="pa-form-err">{errors.confirmPwd}</p>}
                    </div>
                  </div>

                  <div className="pa-form-footer">
                    <p className={`pa-footer-msg ${successMessage ? "success" : "hint"}`}>
                      {successMessage || "Assurez-vous que vos données sont correctes."}
                    </p>
                    <div className="pa-form-actions">
                      <button type="button" className="pa-btn-cancel" onClick={handleReset}>Annuler</button>
                      <button type="submit" className="pa-btn-save" disabled={!isValid}>Mettre à jour</button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Activity log card */}
              <div className="pa-card">
                <div className="pa-activity">
                  <p className="pa-activity-title">Activité récente</p>
                  {activityLog.map((log, i) => (
                    <div key={i} className="pa-log-item">
                      <div className="pa-log-dot" style={{ background: log.color }}/>
                      <span className="pa-log-text">{log.text}</span>
                      <span className="pa-log-time">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize:10, color:"var(--text-muted)", textAlign:"center", padding:"20px 0 8px", letterSpacing:1, textTransform:"uppercase" }}>
            © 2026 AirOps Transport Management
          </div>
        </main>
      </div>

      {toast && <div className="pa-toast">{toast}</div>}
    </div>
  );
}