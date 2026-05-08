import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUser, fetchPendingAvisCount } from "../../services/adminService";

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
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie", digits: 8, passportDigits: 8 },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie", digits: 9, passportDigits: 9 },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc", digits: 9, passportDigits: 8 },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Égypte", digits: 10, passportDigits: 9 },
  { code: "LY", dial: "+218", flag: "🇱🇾", name: "Libye", digits: 9, passportDigits: 8 },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France", digits: 9, passportDigits: 9 },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne", digits: 11, passportDigits: 9 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni", digits: 10, passportDigits: 9 },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne", digits: 9, passportDigits: 9 },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italie", digits: 10, passportDigits: 9 },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal", digits: 9, passportDigits: 9 },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique", digits: 9, passportDigits: 9 },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Pays-Bas", digits: 9, passportDigits: 9 },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse", digits: 9, passportDigits: 9 },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Arabie Saoudite", digits: 9, passportDigits: 9 },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats Arabes", digits: 9, passportDigits: 9 },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar", digits: 8, passportDigits: 8 },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Koweït", digits: 8, passportDigits: 8 },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahreïn", digits: 8, passportDigits: 8 },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman", digits: 8, passportDigits: 8 },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordanie", digits: 9, passportDigits: 9 },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Liban", digits: 8, passportDigits: 8 },
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turquie", digits: 10, passportDigits: 9 },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal", digits: 9, passportDigits: 9 },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d Ivoire", digits: 10, passportDigits: 9 },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun", digits: 9, passportDigits: 9 },
  { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée", digits: 9, passportDigits: 9 },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali", digits: 8, passportDigits: 8 },
  { code: "MR", dial: "+222", flag: "🇲🇷", name: "Mauritanie", digits: 8, passportDigits: 8 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis", digits: 10, passportDigits: 9 },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada", digits: 10, passportDigits: 8 },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brésil", digits: 11, passportDigits: 8 },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "Chine", digits: 11, passportDigits: 9 },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japon", digits: 10, passportDigits: 7 },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "Corée du Sud", digits: 10, passportDigits: 9 },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australie", digits: 9, passportDigits: 8 },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "Inde", digits: 10, passportDigits: 8 },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan", digits: 10, passportDigits: 9 },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigéria", digits: 10, passportDigits: 9 },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "Afrique du Sud", digits: 9, passportDigits: 9 },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Russie", digits: 10, passportDigits: 9 },
];

/* ══════════════════════════ NAV ITEMS ══════════════════════════ */
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

const USER_CATEGORIES = [
  { key: "Passager", desc: "Formulaire passager" },
  { key: "Chauffeur", desc: "Formulaire chauffeur" },
];

function getAdminName() {
  try {
    const s = localStorage.getItem("user");
    return s ? (JSON.parse(s).name || "Admin") : "Admin";
  } catch { return "Admin"; }
}
function getAdminPhoto() {
  try { return localStorage.getItem("airops_admin_profil_photo_v1") || ""; } catch { return ""; }
}
function getAdminInitials(nom) {
  return (nom || "").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function initials(nom) {
  return (nom || "?").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
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

function pwdStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return Math.min(s, 3);
}
const pwdLabels = ["", "Faible", "Moyen", "Fort"];
const pwdBarColors = ["", "#ef4444", "#f97316", "#16a34a"];

const todayStr = formatDateInput(new Date());

function validate(form, country, activeCategory) {
  const e = {};
  // ── Nom
  if (!form.nom.trim()) e.nom = "Le nom est obligatoire.";
  else if (form.nom.trim().length < 2) e.nom = "Minimum 2 caractères.";
  else if (form.nom.trim().length > 50) e.nom = "Maximum 50 caractères.";
  else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(form.nom.trim())) e.nom = "Lettres uniquement (pas de chiffres ni symboles).";
  // ── Prénom
  if (!form.prenom.trim()) e.prenom = "Le prénom est obligatoire.";
  else if (form.prenom.trim().length < 2) e.prenom = "Minimum 2 caractères.";
  else if (form.prenom.trim().length > 50) e.prenom = "Maximum 50 caractères.";
  else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(form.prenom.trim())) e.prenom = "Lettres uniquement (pas de chiffres ni symboles).";
  // ── CIN
  if (!form.cin.trim()) e.cin = "Le CIN est obligatoire.";
  else {
    if (activeCategory === "Chauffeur" || form.cinPays === "TN") {
      if (!/^\d{8}$/.test(form.cin.trim())) e.cin = "Le CIN tunisien doit contenir exactement 8 chiffres.";
    } else {
      // Pour les passagers étrangers, validation plus souple (alphanumérique 4-20)
      if (!/^[A-Z0-9]{4,20}$/.test(form.cin.trim().toUpperCase())) e.cin = "Le CIN doit contenir entre 4 et 20 caractères alphanumériques.";
    }
  }
  // ── Nationalité
  if (!form.nationalite) e.nationalite = "La nationalité est obligatoire.";
  // ── Email
  if (!form.email.trim()) e.email = "L'email est obligatoire.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) e.email = "Format email invalide (ex: nom@domaine.tn).";
  // ── Téléphone
  if (!form.phoneLocal.trim()) e.phoneLocal = "Le numéro de téléphone est obligatoire.";
  else if (!/^\d+$/.test(form.phoneLocal)) e.phoneLocal = "Chiffres uniquement, sans espaces.";
  else if (form.phoneLocal.length !== country.digits) e.phoneLocal = `${country.digits} chiffres requis pour ${country.name}.`;
  else if (/^0+$/.test(form.phoneLocal)) e.phoneLocal = "Numéro invalide.";
  // ── Mot de passe
  if (!form.password.trim()) e.password = "Le mot de passe est obligatoire.";
  else if (form.password.length < 8) e.password = "Minimum 8 caractères.";
  else if (!/[A-Z]/.test(form.password)) e.password = "Au moins une lettre majuscule requise.";
  else if (!/[0-9]/.test(form.password)) e.password = "Au moins un chiffre requis.";
  // ── Confirmation mot de passe
  if (!form.confirmPwd || !form.confirmPwd.trim()) e.confirmPwd = "Veuillez confirmer le mot de passe.";
  else if (form.confirmPwd !== form.password) e.confirmPwd = "Les mots de passe ne correspondent pas.";
  // ── Passager
  if (activeCategory === "Passager") {
    const pCountry = COUNTRIES.find(c => c.code === form.passeportPays) || COUNTRIES[0];
    if (!form.passeport.trim()) e.passeport = "Le numéro de passeport est obligatoire.";
    else if (form.passeport.trim().length !== pCountry.passportDigits) {
      e.passeport = `${pCountry.passportDigits} caractères requis pour le passeport (${pCountry.name}).`;
    }
    else if (!/^[A-Z0-9]+$/.test(form.passeport.trim().toUpperCase())) {
      e.passeport = "Caractères alphanumériques uniquement.";
    }

    if (!form.dateNaissance) e.dateNaissance = "La date de naissance est obligatoire.";
    else {
      const age = calcAge(form.dateNaissance);
      if (Number.isNaN(new Date(form.dateNaissance).getTime())) e.dateNaissance = "Date invalide.";
      else if (new Date(form.dateNaissance) > new Date()) e.dateNaissance = "La date doit être dans le passé.";
      else if (age < 18) e.dateNaissance = `Âge minimum requis : 18 ans (âge actuel : ${age} ans).`;
      else if (age > 100) e.dateNaissance = "Date de naissance non logique (plus de 100 ans).";
    }
  }
  // ── Chauffeur
  if (activeCategory === "Chauffeur") {
    if (!form.numeroPermis.trim()) e.numeroPermis = "Le numéro de permis est obligatoire.";
    else if (!/^\d{8}$/.test(form.numeroPermis.trim())) e.numeroPermis = "Le numéro de permis tunisien doit contenir exactement 8 chiffres.";
    if (!form.dateExpiration) e.dateExpiration = "La date d'expiration est obligatoire.";
    else if (new Date(form.dateExpiration) <= new Date()) e.dateExpiration = "La date d'expiration doit être dans le futur.";
  }
  return e;
}

function calcProgress(form, activeCategory) {
  const common = [form.nom, form.prenom, form.cin, form.nationalite, form.email, form.phoneLocal, form.password, form.confirmPwd];
  const specific = activeCategory === "Passager" ? [form.passeport, form.dateNaissance] : [form.numeroPermis, form.dateExpiration];
  const all = [...common, ...specific];
  const filled = all.filter(v => String(v || "").trim()).length;
  return Math.round((filled / all.length) * 100);
}

export default function AjouterUtilisateur() {
  const navigate = useNavigate();
  const [adminInfo] = useState(() => ({ name: getAdminName(), photo: getAdminPhoto() }));
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [submitted, setSubmitted] = useState(false);

  const [pendingAvis, setPendingAvis] = useState(0);
  useEffect(() => {
    fetchPendingAvisCount().then(setPendingAvis);
  }, []);

  const [activeCategory, setActiveCategory] = useState("Passager");
  const [form, setForm] = useState({
    nom: "", prenom: "", cin: "", cinPays: "TN", nationalite: "Tunisienne", email: "",
    phoneCountry: "TN", phoneLocal: "", password: "", confirmPwd: "",
    passeportPays: "TN", passeport: "", dateNaissance: "",
    numeroPermis: "", dateExpiration: ""
  });
  const [errors, setErrors] = useState({});

  function handleCategoryChange(cat) {
    setActiveCategory(cat);
    setSubmitted(false);
    setErrors({});
    if (cat === "Chauffeur") {
      setForm(f => ({ ...f, phoneCountry: "TN", cinPays: "TN", nationalite: "Tunisienne" }));
    } else {
      setForm(f => ({ ...f, nationalite: "Tunisienne" }));
    }
  }

  const country = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];
  const progress = calcProgress(form, activeCategory);

  function showToast(msg, type = "") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  }

  function handleChange(field, val) {
    // Filtrage en temps réel pour nom/prénom : lettres seulement
    if ((field === "nom" || field === "prenom") && val !== "" && !/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']*$/.test(val)) return;
    // CIN (Tunisien) / Permis : chiffres uniquement
    if ((field === "cin" && (activeCategory === "Chauffeur" || form.cinPays === "TN")) || field === "numeroPermis") {
      if (val !== "" && !/^\d*$/.test(val)) return;
    }
    // CIN (Etranger) : Alphanumérique
    if (field === "cin" && activeCategory === "Passager" && form.cinPays !== "TN") {
      if (val !== "" && !/^[a-zA-Z0-9]*$/.test(val)) return;
    }
    // Passeport : Alphanumérique uniquement
    if (field === "passeport" && val !== "" && !/^[a-zA-Z0-9]*$/.test(val)) return;

    // Réinitialiser le numéro local si changement de pays (Téléphone)
    if (field === "phoneCountry") {
      setForm(f => ({ ...f, phoneCountry: val, phoneLocal: "" }));
      if (submitted) setErrors(prev => ({ ...prev, phoneLocal: undefined }));
      return;
    }
    // Réinitialiser le CIN si changement de pays (CIN)
    if (field === "cinPays") {
      setForm(f => ({ ...f, cinPays: val, cin: "" }));
      if (submitted) setErrors(prev => ({ ...prev, cin: undefined }));
      return;
    }
    // Réinitialiser le Passeport si changement de pays (Passeport)
    if (field === "passeportPays") {
      setForm(f => ({ ...f, passeportPays: val, passeport: "" }));
      if (submitted) setErrors(prev => ({ ...prev, passeport: undefined }));
      return;
    }

    setForm(f => ({ ...f, [field]: val }));
    if (submitted) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  const maxDateNaissance = yearsAgo(18);
  const minDateNaissance = yearsAgo(100);

  async function handleSubmit() {
    setSubmitted(true);
    const errs = validate(form, country, activeCategory);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      showToast(`Veuillez corriger les ${Object.keys(errs).length} erreur(s) dans le formulaire.`, "");
      return;
    }

    const role = activeCategory === "Passager" ? "PASSAGER" : "CHAUFFEUR";
    const phone = `${country.dial}${form.phoneLocal.replace(/^0/, "")}`;
    const payload = {
      name: `${form.nom.trim()} ${form.prenom.trim()}`,
      email: form.email.trim(),
      password: form.password,
      role,
      phone,
      cin: form.cin.trim() || undefined,
      passportNumber: form.passeport.trim() || undefined,
      numeroPermis: form.numeroPermis.trim() || undefined,
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

  const previewName = `${form.nom} ${form.prenom}`.trim() || "Nom Prénom";
  const previewEmail = form.email.trim() || "email@exemple.com";

  return (
    <div className="au-wrap">
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
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" /></svg>
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
              {item.label === "Gestion des Avis" && pendingAvis > 0 && (
                <span className="sb-badge">{pendingAvis}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <button type="button" className="sb-logout" onClick={() => { localStorage.clear(); navigate("/login", { replace: true }); }}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="au-main">
        <header className="au-header">
          <div className="au-hdr-left">
            <button type="button" className="au-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="au-hdr-title">Ajouter un utilisateur</span>
          </div>
          <div className="au-hdr-right">
            <div className="user-chip">
              <div className="user-info">
                <div className="user-name">{adminInfo.name}</div>
                <div className="user-role">Administrateur</div>
              </div>
              <div className="user-avatar" onClick={() => navigate("/profilA")}>
                {adminInfo.photo ? <img src={adminInfo.photo} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getAdminInitials(adminInfo.name)}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="au-content">
          {/* Page header */}
          <div className="au-page-header">
            <div className="au-page-header-left">

              <div>
                <div className="au-page-title">Nouvel Utilisateur</div>
                <div className="au-page-sub">Remplissez les informations pour créer un compte.</div>
              </div>
            </div>
          </div>

          <div className="au-form-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="au-card">
                <div className="au-card-header">
                  <div className="au-card-header-icon purple">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <div className="au-card-title">Catégorie utilisateur</div>
                    <div className="au-card-sub">Choisissez le formulaire à remplir</div>
                  </div>
                </div>
                <div className="au-category-tabs">
                  {USER_CATEGORIES.map(r => (
                    <button key={r.key} type="button" className={`au-category-btn${activeCategory === r.key ? " active" : ""}`}
                      onClick={() => handleCategoryChange(r.key)}>
                      {r.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="au-card">
                <div className="au-card-header">
                  <div className="au-card-header-icon blue">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <div className="au-card-title">Nouveau {activeCategory}</div>
                    <div className="au-card-sub">Champs marqués * obligatoires</div>
                  </div>
                </div>
                <div className="au-progress-wrap" style={{ paddingTop: 16 }}>
                  <div className="au-progress-label">
                    <span>Complétion du formulaire</span>
                    <span style={{ color: progress === 100 ? "var(--accent-green)" : "var(--brand-blue)" }}>{progress}%</span>
                  </div>
                  <div className="au-progress-bar"><div className="au-progress-fill" style={{ width: `${progress}%` }} /></div>
                </div>
                <div className="au-form-grid">
                  <div className="au-field"><label className="au-label">Nom *</label><input type="text" className={`au-input${errors.nom ? " err" : ""}`} placeholder="Ex: Ben Salah" value={form.nom} onChange={e => handleChange("nom", e.target.value)} />{errors.nom && <span className="au-error">{errors.nom}</span>}</div>
                  <div className="au-field"><label className="au-label">Prénom *</label><input type="text" className={`au-input${errors.prenom ? " err" : ""}`} placeholder={activeCategory === "Passager" ? "Ex: Ines" : "Ex: Ahmed"} value={form.prenom} onChange={e => handleChange("prenom", e.target.value)} />{errors.prenom && <span className="au-error">{errors.prenom}</span>}</div>
                  <div className="au-field">
                    <label className="au-label">CIN *</label>
                    {activeCategory === "Passager" ? (
                      <div className="au-phone-row">
                        <select className="au-country-sel" value={form.cinPays} onChange={e => handleChange("cinPays", e.target.value)}>
                          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                        </select>
                        <input type="text" className={`au-input au-phone-local${errors.cin ? " err" : ""}`}
                          placeholder={form.cinPays === "TN" ? "8 chiffres" : "Alphanumérique"}
                          value={form.cin}
                          maxLength={form.cinPays === "TN" ? 8 : 20}
                          onChange={e => handleChange("cin", form.cinPays === "TN" ? e.target.value.replace(/\D/g, "") : e.target.value.toUpperCase())} />
                      </div>
                    ) : (
                      <input type="text" className={`au-input${errors.cin ? " err" : ""}`} placeholder="12345678" value={form.cin} maxLength={8} onChange={e => handleChange("cin", e.target.value.replace(/\D/g, ""))} />
                    )}
                    {errors.cin && <span className="au-error">{errors.cin}</span>}
                  </div>
                  {activeCategory === "Passager" ? (
                    <>
                      <div className="au-field">
                        <label className="au-label">Numéro de passeport *</label>
                        <div className="au-phone-row">
                          <select className="au-country-sel" value={form.passeportPays} onChange={e => handleChange("passeportPays", e.target.value)}>
                            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                          </select>
                          <input type="text"
                            className={`au-input au-phone-local${errors.passeport ? " err" : ""}`}
                            placeholder={`${(COUNTRIES.find(c => c.code === form.passeportPays) || {}).passportDigits || 9} car.`}
                            value={form.passeport}
                            maxLength={(COUNTRIES.find(c => c.code === form.passeportPays) || {}).passportDigits || 15}
                            onChange={e => handleChange("passeport", e.target.value.toUpperCase())} />
                        </div>
                        {errors.passeport && <span className="au-error">{errors.passeport}</span>}
                      </div>
                      <div className="au-field">
                        <label className="au-label">Nationalité *</label>
                        <select className={`au-select${errors.nationalite ? " err" : ""}`} value={form.nationalite} onChange={e => handleChange("nationalite", e.target.value)}>
                          {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                        </select>
                        {errors.nationalite && <span className="au-error">{errors.nationalite}</span>}
                      </div>
                      <div className="au-field">
                        <label className="au-label">Date de naissance *</label>
                        <input type="date" min={minDateNaissance} max={maxDateNaissance} className={`au-input${errors.dateNaissance ? " err" : ""}`} value={form.dateNaissance} onChange={e => handleChange("dateNaissance", e.target.value)} />
                        {errors.dateNaissance && <span className="au-error">{errors.dateNaissance}</span>}
                      </div>
                    </>
                  ) : (
                    <div className="au-field">
                      <label className="au-label">Nationalité *</label>
                      <input type="text" className="au-input" value="Tunisienne" readOnly style={{ background: "#f8fafc", color: "#64748b" }} />
                    </div>
                  )}
                  <div className="au-field full"><label className="au-label">Email *</label><input type="email" className={`au-input${errors.email ? " err" : ""}`} placeholder={activeCategory === "Passager" ? "passager@mail.tn" : "chauffeur@airops.tn"} value={form.email} onChange={e => handleChange("email", e.target.value)} />{errors.email && <span className="au-error">{errors.email}</span>}</div>
                  <div className="au-field full">
                    <label className="au-label">Téléphone *</label>
                    <div className="au-phone-row">
                      {activeCategory === "Passager" ? (
                        <select className="au-country-sel" value={form.phoneCountry} onChange={e => handleChange("phoneCountry", e.target.value)}>
                          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>)}
                        </select>
                      ) : (
                        <div className="au-country-sel" style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", color: "#64748b", pointerEvents: "none" }}>🇹🇳 +216</div>
                      )}
                      <div className="au-phone-local">
                        <input type="tel" inputMode="numeric" className={`au-input${errors.phoneLocal ? " err" : ""}`}
                          placeholder={activeCategory === "Chauffeur" ? "8 chiffres" : "0".repeat(country.digits)}
                          value={form.phoneLocal}
                          onChange={e => handleChange("phoneLocal", e.target.value.replace(/\D/g, ""))}
                          maxLength={activeCategory === "Chauffeur" ? 8 : country.digits} />
                        {errors.phoneLocal && <span className="au-error">{errors.phoneLocal}</span>}
                      </div>
                    </div>
                  </div>

                  {activeCategory === "Chauffeur" && (
                    <>
                      <div className="au-field">
                        <label className="au-label">Numéro de permis *</label>
                        <input type="text" className={`au-input${errors.numeroPermis ? " err" : ""}`}
                          placeholder="12345678" value={form.numeroPermis} maxLength={8}
                          onChange={e => handleChange("numeroPermis", e.target.value.replace(/\D/g, ""))} />
                        {errors.numeroPermis && <span className="au-error">{errors.numeroPermis}</span>}
                      </div>
                      <div className="au-field">
                        <label className="au-label">Date d'expiration *</label>
                        <input type="date" className={`au-input${errors.dateExpiration ? " err" : ""}`} value={form.dateExpiration} onChange={e => handleChange("dateExpiration", e.target.value)} />
                        {errors.dateExpiration && <span className="au-error">{errors.dateExpiration}</span>}
                      </div>
                    </>
                  )}
                  <div className="au-field full">
                    <label className="au-label">Mot de passe * <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-muted)", marginLeft: 4 }}>(min. 8 car., 1 majuscule, 1 chiffre)</span></label>
                    <input type="password" className={`au-input${errors.password ? " err" : ""}`} placeholder="••••••••" value={form.password} onChange={e => handleChange("password", e.target.value)} />
                    {errors.password && <span className="au-error">{errors.password}</span>}
                    {form.password.length > 0 && (() => {
                      const s = pwdStrength(form.password);
                      return (
                        <>
                          <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                            {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= s ? pwdBarColors[s] : "#e4ecf4", transition: "background 0.3s" }} />)}
                          </div>
                          <span style={{ fontSize: 10.5, color: pwdBarColors[s], marginTop: 2 }}>Force : <strong>{pwdLabels[s]}</strong></span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="au-field full">
                    <label className="au-label">Confirmer le mot de passe *</label>
                    <input type="password" className={`au-input${errors.confirmPwd ? " err" : ""}`} placeholder="Répéter le mot de passe" value={form.confirmPwd} onChange={e => handleChange("confirmPwd", e.target.value)} />
                    {errors.confirmPwd && <span className="au-error">{errors.confirmPwd}</span>}
                    {!errors.confirmPwd && form.confirmPwd && form.confirmPwd === form.password && <span style={{ fontSize: 10.5, color: "#16a34a", marginTop: 2 }}>✓ Les mots de passe correspondent</span>}
                  </div>
                </div>
                <div className="au-form-actions"><button type="button" className="au-btn-cancel" onClick={() => navigate("/listeU")}>Annuler</button><button type="button" className="au-btn-save" onClick={handleSubmit} disabled={progress < 25}><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Enregistrer le {activeCategory.toLowerCase()}</button></div>
              </div>
            </div>
            <div><div className="au-card au-preview-card"><div className="au-card-header"><div className="au-card-header-icon green"><svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></div><div><div className="au-card-title">Aperçu</div><div className="au-card-sub">Prévisualisation en temps réel</div></div></div><div className="au-preview-body"><div className="au-avatar-preview">{activeCategory === "Chauffeur" ? "CH" : initials(previewName)}</div><div><div className="au-preview-name">{previewName}</div><div className="au-preview-email">{previewEmail}</div></div><div className="au-preview-divider" /><div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}><div className="au-preview-row"><span className="au-preview-lbl">CIN</span><span className="au-preview-val">{form.cin || "Non renseigné"}</span></div><div className="au-preview-row"><span className="au-preview-lbl">Téléphone</span><span className="au-preview-val">{form.phoneLocal ? `${country.dial} ${form.phoneLocal}` : "Non renseigné"}</span></div><div className="au-preview-row"><span className="au-preview-lbl">{activeCategory === "Passager" ? "Passeport" : "N° permis"}</span><span className="au-preview-val">{activeCategory === "Passager" ? (form.passeport || "Non renseigné") : (form.numeroPermis || "Non renseigné")}</span></div><div className="au-preview-row"><span className="au-preview-lbl">Catégorie</span><span className={`au-role-badge ${activeCategory}`}>{activeCategory}</span></div></div></div></div></div>
          </div>
        </main>

        <footer className="au-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span>Nouvel utilisateur</span>
        </footer>
      </div>

      {toast.msg && <div className={`toast${toast.type === "success" ? " success" : ""}`}>{toast.msg}</div>}
    </div>
  );
}