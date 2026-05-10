import { useEffect, useMemo, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchMyIncidents, createIncident, deleteIncident, deleteAllIncidents, mapIncident } from "../../services/chauffeurService";
import { useProfileSync } from "../../services/useProfileSync";
import { useChauffeurNotifications } from "../../services/useChauffeurNotifications";

/* ─── Inject CSS ─────────────────────────────────────────── */
const RECLAM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --brand-dark:#0d2b5e; --brand-mid:#1252aa; --brand-blue:#2980e8; --brand-light:#7ec8ff;
    --accent-orange:#f97316; --accent-green:#16a34a; --accent-red:#ef4444; --accent-purple:#7c3aed;
    --bg-page:#f0f5fb; --border:#e4ecf4; --text-primary:#0d2b5e; --text-sec:#5a6e88; --text-muted:#94a3b8;
    --sidebar-full:230px; --sidebar-mini:66px; --header-h:64px;
    --shadow-sm:0 2px 12px rgba(13,43,94,0.07); --shadow-md:0 8px 32px rgba(13,43,94,0.13); --shadow-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }

  /* ══ Layout ══ */
  .chw { display:flex; height:100vh; overflow:hidden; background:var(--bg-page); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--text-primary); }

  /* ══ Sidebar ══ */
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
  .sb-logout-lbl { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .sidebar.collapsed .sb-logout-lbl { opacity:0; max-width:0; }
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  /* ══ Header ══ */
  .chm { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .chh { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 28px; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .chh-left { display:flex; align-items:center; gap:14px; }
  .chh-right { display:flex; align-items:center; gap:12px; }
  .chh-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .chh-menu-btn:hover { background:var(--bg-page); color:var(--text-primary); }
  .chh-title { font-size:15px; font-weight:700; color:var(--text-primary); }
  .chh-divider { width:1px; height:20px; background:var(--border); }

  .search-wrap { position:relative; }
  .search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
  .search-input { width:240px; padding:9px 12px 9px 34px; border:1.5px solid var(--border); border-radius:22px; background:var(--bg-page); font-size:13px; font-family:inherit; color:var(--text-primary); outline:none; transition:var(--tr); }
  .search-input:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color:var(--text-muted); }

  .user-chip { display:flex; align-items:center; gap:9px; cursor:default; }
  .user-name  { font-size:13px; font-weight:700; color:var(--text-primary); }
  .user-role  { font-size:11px; color:var(--text-muted); }
  .user-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; }

  /* ══ Main content ══ */
  .chc { flex:1; overflow-y:auto; padding:28px 32px; }
  .chc::-webkit-scrollbar { width:5px; }
  .chc::-webkit-scrollbar-track { background:transparent; }
  .chc::-webkit-scrollbar-thumb { background:var(--border); border-radius:5px; }

  /* ══ Footer ══ */
  .ch-footer { padding:12px 28px; background:#fff; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; font-size:11px; color:var(--text-muted); flex-shrink:0; }
  .ch-footer-brand { display:flex; align-items:center; gap:6px; font-weight:600; }

  /* ══ Page header ══ */
  .rp-page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; gap:16px; flex-wrap:wrap; }
  .rp-page-title { font-size:26px; font-weight:800; color:var(--brand-dark); letter-spacing:-0.6px; margin-bottom:5px; line-height:1.2; }
  .rp-page-title span { color:var(--brand-blue); }
  .rp-page-sub { font-size:13px; color:var(--text-muted); max-width:500px; line-height:1.6; }
  .rp-page-actions { display:flex; gap:10px; align-items:center; flex-shrink:0; }

  /* ══ Stats bar ══ */
  .rp-stats-bar { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:24px; }
  .rp-stat-card { background:#fff; border:1px solid var(--border); border-radius:16px; padding:18px 20px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow-sm); transition:var(--tr); }
  .rp-stat-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
  .rp-stat-icon { width:44px; height:44px; border-radius:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .rp-stat-icon.blue  { background:linear-gradient(135deg,#eff6ff,#dbeafe); }
  .rp-stat-icon.orange{ background:linear-gradient(135deg,#fff7ed,#fed7aa); }
  .rp-stat-icon.green { background:linear-gradient(135deg,#f0fdf4,#bbf7d0); }
  .rp-stat-val  { font-size:24px; font-weight:800; color:var(--brand-dark); letter-spacing:-0.5px; line-height:1; }
  .rp-stat-lbl  { font-size:11px; color:var(--text-muted); font-weight:500; margin-top:3px; }

  /* ══ Main card ══ */
  .rp-main-card { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--shadow-sm); overflow:hidden; }

  /* ══ Toolbar ══ */
  .rp-toolbar { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid var(--border); gap:12px; flex-wrap:wrap; }
  .rp-toolbar-left { display:flex; align-items:center; gap:10px; }
  .rp-toolbar-title { font-size:14px; font-weight:800; color:var(--text-primary); }
  .rp-toolbar-count { font-size:11px; font-weight:600; color:var(--text-muted); background:var(--bg-page); border:1px solid var(--border); border-radius:20px; padding:2px 10px; }
  .rp-actions { display:flex; align-items:center; gap:8px; }

  /* ══ Buttons ══ */
  .rp-btn-primary { display:inline-flex; align-items:center; gap:7px; padding:9px 18px; border-radius:11px; border:none; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); color:#fff; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(41,128,232,0.3); }
  .rp-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(41,128,232,0.4); }
  .rp-btn-primary:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
  .rp-act-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; border:1.5px solid var(--border); background:#fff; font-size:12px; font-weight:600; font-family:inherit; cursor:pointer; transition:var(--tr); color:var(--text-sec); }
  .rp-act-btn:hover { border-color:var(--brand-blue); color:var(--brand-blue); background:#eff6ff; }
  .rp-act-btn.danger { border-color:#fecaca; color:#ef4444; background:#fff; }
  .rp-act-btn.danger:hover { border-color:#ef4444; background:#fef2f2; }

  /* ══ Form panel ══ */
  .rp-form-panel { border:1.5px solid var(--border); border-radius:18px; padding:24px; margin-bottom:24px; background:#fff; box-shadow:var(--shadow-sm); animation:rmUp 0.2s ease; }
  .rp-form-title { font-size:15px; font-weight:800; color:var(--text-primary); margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .rp-form-title::before { content:''; display:inline-block; width:4px; height:18px; background:linear-gradient(180deg,var(--brand-blue),var(--brand-mid)); border-radius:4px; }
  .rp-form-label { font-size:12px; font-weight:700; color:var(--text-sec); margin-bottom:8px; display:block; letter-spacing:0.3px; }
  .rp-form-group { margin-bottom:18px; }
  .rp-priority-group { display:flex; gap:8px; }
  .rp-priority-btn { flex:1; padding:10px 8px; border-radius:11px; border:1.5px solid; font-size:12px; font-weight:700; cursor:pointer; transition:var(--tr); font-family:inherit; text-align:center; }
  .rp-textarea { width:100%; height:108px; padding:13px 14px; border-radius:13px; border:1.5px solid var(--border); font-size:13px; font-family:inherit; outline:none; resize:none; color:var(--text-primary); transition:var(--tr); line-height:1.6; }
  .rp-textarea:focus { border-color:var(--brand-blue); box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .rp-textarea::placeholder { color:var(--text-muted); }
  .rp-form-actions { display:flex; gap:10px; }
  .rp-btn-cancel { flex:1; padding:11px; border-radius:12px; border:1.5px solid var(--border); background:#fff; font-size:13px; font-weight:600; cursor:pointer; color:var(--text-sec); font-family:inherit; transition:var(--tr); }
  .rp-btn-cancel:hover { background:var(--bg-page); }
  .rp-btn-submit { flex:2; padding:11px; border-radius:12px; border:none; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:var(--tr); box-shadow:0 4px 14px rgba(41,128,232,0.28); }
  .rp-btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(41,128,232,0.38); }
  .rp-btn-submit:disabled { opacity:0.65; cursor:not-allowed; }

  /* ══ Incident cards ══ */
  .rp-list { padding:12px 16px; display:flex; flex-direction:column; gap:8px; }
  .rp-card { border:1.5px solid var(--border); border-radius:14px; padding:14px 16px; transition:var(--tr); background:#fff; display:flex; align-items:center; gap:14px; }
  .rp-card:hover { transform:translateY(-1px); box-shadow:var(--shadow-md); border-color:#c7d8f0; }
  .rp-card-inner { display:contents; }
  .rp-card-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .rp-card-body { flex:1; min-width:0; }
  .rp-card-head { display:flex; align-items:center; gap:7px; margin-bottom:5px; flex-wrap:wrap; }
  .rp-card-ref  { font-size:12px; font-weight:800; color:var(--brand-blue); font-variant-numeric:tabular-nums; background:#eff6ff; padding:2px 8px; border-radius:7px; border:1px solid #dbeafe; }
  .rp-badge { font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; white-space:nowrap; border:1px solid; }
  .rp-badge.ouvert   { background:#eff6ff; color:#2563eb; border-color:#dbeafe; }
  .rp-badge.en-cours { background:#fff7ed; color:#c2410c; border-color:#fed7aa; }
  .rp-badge.resolu   { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
  .rp-card-titre { font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:3px; }
  .rp-card-desc  { font-size:12px; color:var(--text-sec); margin-bottom:6px; line-height:1.5; }
  .rp-card-meta  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .rp-meta-item  { display:inline-flex; align-items:center; gap:4px; font-size:10.5px; color:var(--text-sec); font-weight:500; background:var(--bg-page); border:1px solid var(--border); border-radius:7px; padding:2px 8px; }
  .rp-time { font-size:10px; font-weight:600; color:var(--text-muted); background:#f8fafc; border:1px solid var(--border); border-radius:7px; padding:2px 8px; white-space:nowrap; }
  .rp-priority-pill { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; border:1px solid; }
  .rp-priority-pill.high   { background:#eff6ff; color:#2563eb; border-color:#dbeafe; }
  .rp-priority-pill.medium { background:#e0f2fe; color:#0284c7; border-color:#bae6fd; }
  .rp-priority-pill.low    { background:#eef2ff; color:#4f46e5; border-color:#e0e7ff; }
  .rp-card-footer { display:none; }
  .rp-card-side { display:flex; align-items:center; flex-shrink:0; }
  .rp-btn-del { display:inline-flex; align-items:center; gap:5px; padding:6px 11px; border:1.5px solid #fecaca; color:#ef4444; background:transparent; border-radius:8px; font-size:11px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); }
  .rp-btn-del:hover { background:#fef2f2; border-color:#ef4444; }

  /* ══ Empty state ══ */
  .rp-empty { padding:72px 24px; text-align:center; }
  .rp-empty-icon { width:80px; height:80px; margin:0 auto 20px; border-radius:24px; background:linear-gradient(135deg,#fff7ed,#fed7aa); display:flex; align-items:center; justify-content:center; }
  .rp-empty-title { font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:6px; }
  .rp-empty-sub   { font-size:13px; color:var(--text-muted); }

  /* ══ Loading skeleton ══ */
  @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  .rp-skeleton { background:linear-gradient(90deg,#f0f5fb 25%,#e4ecf4 50%,#f0f5fb 75%); background-size:600px 100%; animation:shimmer 1.4s infinite linear; border-radius:10px; }
  .rp-skeleton-card { border:1.5px solid var(--border); border-radius:16px; padding:18px 20px; }
  .rp-sk-icon { width:50px; height:50px; border-radius:14px; }
  .rp-sk-line-a { height:14px; width:60%; margin-bottom:8px; }
  .rp-sk-line-b { height:12px; width:90%; margin-bottom:6px; }
  .rp-sk-line-c { height:11px; width:40%; }

  /* ══ Modals ══ */
  .rm-ov { position:fixed; inset:0; z-index:100; background:rgba(13,43,94,0.45); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:20px; animation:rmFade 0.2s ease; }
  @keyframes rmFade { from{opacity:0} to{opacity:1} }
  @keyframes rmUp   { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }
  .rm-confirm-box { background:#fff; border-radius:24px; width:100%; max-width:420px; padding:32px; box-shadow:var(--shadow-lg); animation:rmUp 0.25s ease; text-align:center; }
  .rm-confirm-icon { width:68px; height:68px; border-radius:22px; background:#fef2f2; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
  .rm-confirm-btns { display:flex; gap:10px; margin-top:24px; }
  .rm-confirm-cancel { flex:1; padding:12px; font-size:13px; font-family:inherit; font-weight:600; color:var(--text-sec); border:1.5px solid var(--border); border-radius:12px; background:#fff; cursor:pointer; transition:var(--tr); }
  .rm-confirm-cancel:hover { background:var(--bg-page); }
  .rm-confirm-ok { flex:1; padding:12px; font-size:13px; font-family:inherit; font-weight:700; color:#fff; border:none; border-radius:12px; background:linear-gradient(135deg,#ef4444,#b91c1c); cursor:pointer; box-shadow:0 4px 14px rgba(239,68,68,0.3); transition:var(--tr); }
  .rm-confirm-ok:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(239,68,68,0.4); }

  /* ══ Toast ══ */
  .rm-toast { position:fixed; top:18px; right:18px; z-index:600; background:var(--brand-dark); color:#fff; padding:13px 20px; border-radius:13px; font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); border-left:4px solid var(--brand-light); animation:rmToast 0.3s ease; }
  .rm-toast.green { border-left-color:#4ade80; }
  .rm-toast.red   { border-left-color:#f87171; }
  @keyframes rmToast { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

  /* ══ Responsive ══ */
  @media(max-width:900px){ .rp-stats-bar{ grid-template-columns:repeat(3,1fr); } }
  /* ══ Incident Modal (identique DashbordCH) ══ */
  .modal-ov { position:fixed; inset:0; z-index:200; background:rgba(13,43,94,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeInOv 0.2s ease; }
  @keyframes fadeInOv { from{opacity:0;}to{opacity:1;} }
  @keyframes slideUpM  { from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:none;} }
  .recl-modal-box { background:#fff; border-radius:24px; width:100%; max-width:520px; overflow:hidden; box-shadow:0 20px 50px rgba(13,43,94,0.18); animation:slideUpM 0.25s ease; }
  .mh-red { background:linear-gradient(135deg,#991b1b,#ef4444); padding:22px 24px; color:#fff; }
  .mh-row { display:flex; align-items:flex-start; justify-content:space-between; }
  .mh-label { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.5); font-weight:700; margin-bottom:4px; }
  .mh-ref   { font-size:22px; font-weight:800; }
  .mh-traj  { font-size:13px; color:rgba(255,255,255,0.65); margin-top:2px; }
  .mh-close { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.14); border:none; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; flex-shrink:0; transition:all 0.2s; }
  .mh-close:hover { background:rgba(255,255,255,0.26); transform:rotate(90deg); }
  .recl-form { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
  .recl-field { display:flex; flex-direction:column; gap:6px; }
  .recl-label { font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; }
  .recl-select { width:100%; padding:10px 14px; border:1.5px solid #e4ecf4; border-radius:12px; font-size:13px; font-family:inherit; color:#0d2b5e; background:#fff; outline:none; transition:all 0.2s; appearance:none; cursor:pointer; }
  .recl-select:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.1); }
  .recl-priority-row { display:flex; gap:8px; }
  .recl-prio-btn { flex:1; padding:9px 6px; border:1.5px solid #e4ecf4; border-radius:10px; font-size:12px; font-weight:600; font-family:inherit; cursor:pointer; transition:all 0.2s; background:#fff; color:#5a6e88; text-align:center; }
  .recl-prio-btn.active-low    { border-color:#22c55e; background:#f0fdf4; color:#15803d; }
  .recl-prio-btn.active-medium { border-color:#f97316; background:#fff7ed; color:#ea580c; }
  .recl-prio-btn.active-high   { border-color:#ef4444; background:#fef2f2; color:#dc2626; }
  .recl-textarea { width:100%; min-height:110px; padding:12px 14px; border:1.5px solid #e4ecf4; border-radius:12px; font-size:13px; font-family:inherit; color:#0d2b5e; background:#fff; outline:none; transition:all 0.2s; resize:vertical; }
  .recl-textarea:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.1); }
  .recl-textarea::placeholder { color:#94a3b8; }
  .recl-char-count { font-size:11px; color:#94a3b8; text-align:right; margin-top:2px; }
  .mf { padding:14px 24px; border-top:1px solid #e4ecf4; display:flex; justify-content:flex-end; gap:8px; }
  .btn-close-m { padding:9px 20px; font-size:13px; font-family:inherit; color:#5a6e88; border:1px solid #e4ecf4; border-radius:10px; background:#fff; cursor:pointer; transition:all 0.2s; }
  .btn-close-m:hover { background:#f0f5fb; }
  .btn-submit-recl { padding:11px 22px; font-size:13px; font-family:inherit; font-weight:700; color:#fff; border:none; border-radius:10px; background:linear-gradient(135deg,#ef4444,#b91c1c); cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(239,68,68,0.35); display:inline-flex; align-items:center; gap:6px; }
  .btn-submit-recl:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(239,68,68,0.45); }
  .btn-submit-recl:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);} .sidebar.collapsed{transform:translateX(-100%);} .sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;} .chh-menu-btn{display:flex;} .sb-toggle-btn{display:none;}
    .chc{padding:16px 18px;} .chh{padding:0 16px;} .search-wrap{display:none;}
    .rp-stats-bar{grid-template-columns:1fr 1fr;}
    .rp-page-header{flex-direction:column;align-items:flex-start;}
  }
  @media(max-width:480px){
    .rp-stats-bar{grid-template-columns:1fr;}
    .rp-card-footer{flex-wrap:wrap;}
    .recl-priority-row{flex-direction:column;}
  }
`;

if (typeof document !== "undefined") {
  let s = document.getElementById("airops-incident-css");
  if (!s) { s = document.createElement("style"); s.id="airops-incident-css"; document.head.appendChild(s); }
  s.textContent = RECLAM_CSS;
}



/* ─── Nav ────────────────────────────────── */
const navItems = [
  {
    label: "Tableau de Bord",
    to: "/dashbordchauffeur",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  },
  {
    label: "Historique Missions",
    to: "/historiqueM",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  },
  {
    label: "Incidents",
    to: "/incidentsCH",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  },
  {
    label: "Navigation",
    to: "/navigationCH",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  },
  {
    label: "Notifications",
    to: "/notificationM",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  },
];

const STATUT_LABELS = { ouvert:"Ouverte", "en-cours":"En cours", resolu:"Résolue" };
const STATUT_ICON_COLOR = { ouvert:"#2563eb", "en-cours":"#0284c7", resolu:"#4f46e5" };
const STATUT_BG = { ouvert:"#eff6ff", "en-cours":"#e0f2fe", resolu:"#eef2ff" };

const RECL_CATEGORIES = [
  "Problème avec le client","Incident de véhicule","Retard de paiement",
  "Mauvaise attribution de mission","Conditions de travail","Problème d'itinéraire","Autre",
];

/* ─── Incident Modal (identique DashbordCH) ─── */
function IncidentModal({ onClose, onSubmit }) {
  const [categorie,   setCategorie]   = useState("");
  const [description, setDescription] = useState("");
  const [priorite,    setPriorite]    = useState("medium");
  const MAX = 400;
  const canSubmit = categorie && description.trim().length >= 10;
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ categorie, description: description.trim(), priority: priorite });
    onClose();
  };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="recl-modal-box" onClick={e=>e.stopPropagation()}>
        <div className="mh-red">
          <div className="mh-row">
            <div>
              <p className="mh-label">NOUVEL INCIDENT</p>
              <p className="mh-ref">Signaler un incident</p>
              <p className="mh-traj">Signalez un problème rencontré lors d'une mission</p>
            </div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="recl-form">
          <div className="recl-field">
            <span className="recl-label">Catégorie *</span>
            <div style={{position:"relative"}}>
              <select className="recl-select" value={categorie} onChange={e=>setCategorie(e.target.value)}>
                <option value="">— Sélectionner une catégorie —</option>
                {RECL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <svg style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"#94a3b8"}} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <div className="recl-field">
            <span className="recl-label">Description * (min. 10 caractères)</span>
            <textarea className="recl-textarea" placeholder="Décrivez l'incident en détail…" value={description} onChange={e=>setDescription(e.target.value.slice(0,MAX))}/>
            <span className="recl-char-count">{description.length} / {MAX}</span>
          </div>
        </div>
        <div className="mf">
          <button type="button" className="btn-close-m" onClick={onClose}>Annuler</button>
          <button type="button" className="btn-submit-recl" disabled={!canSubmit} onClick={handleSubmit}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12"/></svg>
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm Delete Modal ─────────────────── */
function ConfirmDelete({ item, label, onConfirm, onClose }) {
  if (!item) return null;
  return (
    <div className="rm-ov" onClick={onClose}>
      <div className="rm-confirm-box" onClick={e=>e.stopPropagation()}>
        <div className="rm-confirm-icon">
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
        <h3 style={{fontSize:16,fontWeight:800,color:"var(--text-primary)",marginBottom:8}}>Supprimer l'incident</h3>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>Voulez-vous supprimer <strong style={{color:"var(--brand-blue)"}}>{label}</strong> ? Cette action est irréversible.</p>
        <div className="rm-confirm-btns">
          <button type="button" className="rm-confirm-cancel" onClick={onClose}>Annuler</button>
          <button type="button" className="rm-confirm-ok" onClick={()=>{onConfirm();onClose();}}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────── */
export default function IncidentsCH() {
  const navigate = useNavigate();
  const { nom: nomCH, photo, initials } = useProfileSync();
  const { unreadCount } = useChauffeurNotifications();
  const [reclams,       setReclams]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search,        setSearch]        = useState("");
  const [confirmDel,    setConfirmDel]    = useState(null);
  const [toast,         setToast]         = useState({msg:"",type:""});
  // Form for new incident
  const [showForm,      setShowForm]      = useState(false);
  const [formDesc,      setFormDesc]      = useState("");
  const [formPriority,  setFormPriority]  = useState("low");
  const [formSubmitting,setFormSubmitting]= useState(false);

  const loadReclams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyIncidents({ limit: 50 });
      setReclams((data.data || []).map(mapIncident));
    } catch {/* silently fail */}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReclams(); }, [loadReclams]);
  useEffect(()=>{if(!toast.msg)return;const t=setTimeout(()=>setToast({msg:"",type:""}),2800);return()=>clearTimeout(t);},[toast]);

  const filtered = useMemo(()=>{
    let list=reclams;
    if(search.trim()){const q=search.trim().toLowerCase();list=list.filter(r=>[r.ref,r.description,r.missionRef].join(" ").toLowerCase().includes(q));}
    return list;
  },[reclams,search]);

  const handleSubmitNew = async () => {
    if (!formDesc.trim() || formDesc.trim().length < 5) {
      setToast({ msg: "Description trop courte (min 5 caractères).", type: "" });
      return;
    }
    setFormSubmitting(true);
    try {
      await createIncident({ description: formDesc.trim(), priority: formPriority });
      setFormDesc("");
      setFormPriority("low");
      setShowForm(false);
      setToast({ msg: "✓ Incident soumis avec succès.", type: "green" });
      loadReclams();
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Erreur lors de la soumission.", type: "" });
    } finally { setFormSubmitting(false); }
  };

  const deleteReclam = async (id) => {
    try {
      await deleteIncident(id);
      setReclams(p => p.filter(r => r.id !== id));
      setToast({ msg: "✓ Incident supprimé.", type: "red" });
    } catch { setToast({ msg: "Erreur.", type: "" }); }
  };
  const deleteAll    = async () => {
    try {
      await deleteAllIncidents();
      setReclams([]);
      setToast({ msg: "✓ Tous les incidents supprimés.", type: "red" });
    } catch { setToast({ msg: "Erreur.", type: "" }); }
  };


  return (
    <div className="chw">
      {sidebarMobile&&<div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

      {/* Sidebar */}
      <aside className={["sidebar",collapsed?"collapsed":"",sidebarMobile?"open":""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={()=>setCollapsed(v=>!v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={()=>navigate("/dashbordchauffeur")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12"/></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE CHAUFFEUR</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item=>{
            const withBadge = item.to==="/notificationM" && unreadCount>0 ? unreadCount : null;
            return (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`sb-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {withBadge?<span className="sb-badge">{withBadge}</span>:null}
            </NavLink>
            );
          })}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{paddingTop:0}}>Compte</div>
          <button type="button" className="sb-logout" onClick={()=>{localStorage.clear(); navigate("/login",{replace:true});}}>
            <span style={{flexShrink:0}}><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="chm">
        <header className="chh">
          <div className="chh-left">
            <button type="button" className="chh-menu-btn" onClick={()=>setSidebarMobile(v=>!v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="chh-title">Incidents</span>
          </div>
          <div className="chh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className="search-input" placeholder="Rechercher un incident…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="user-chip">
              <div style={{textAlign:"right"}}><div className="user-name">{nomCH}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{photo?<img src={photo} alt="profil"/>:initials}</div>
            </div>
          </div>
        </header>

        <main className="chc">

          {/* ── Page header ── */}
          <div className="rp-page-header">
            <div>
              <h1 className="rp-page-title">Mes <span>Incidents</span></h1>
              <p className="rp-page-sub">Signalez un problème rencontré lors d'une mission. Notre équipe traitera votre demande rapidement.</p>
            </div>

          </div>





          {/* ── Incidents list card ── */}
          <div className="rp-main-card">
            <div className="rp-toolbar">
              <div className="rp-toolbar-left">
                <span className="rp-toolbar-title">Liste des incidents</span>
                <span className="rp-toolbar-count">{filtered.length} incident{filtered.length!==1?"s":""}</span>
              </div>
              <div className="rp-actions">
                {reclams.length > 0 && (
                  <button type="button" className="rp-act-btn danger" onClick={()=>setConfirmDel("all")}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Tout supprimer
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="rp-list">
                {[1,2,3].map(i=>(
                  <div key={i} className="rp-skeleton-card" style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                    <div className="rp-skeleton rp-sk-icon"/>
                    <div style={{flex:1}}>
                      <div className="rp-skeleton rp-sk-line-a"/>
                      <div className="rp-skeleton rp-sk-line-b"/>
                      <div className="rp-skeleton rp-sk-line-c"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rp-empty">
                <div className="rp-empty-icon">
                  <svg width="34" height="34" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <p className="rp-empty-title">Aucun incident trouvé</p>
                <p className="rp-empty-sub">{search ? "Aucun résultat pour votre recherche." : "Vous n'avez soumis aucun incident pour le moment."}</p>
              </div>
            ) : (
              <div className="rp-list">
                {filtered.map(r => {
                  const prioriteClass = r.priorite==="Haute"?"high":r.priorite==="Moyenne"?"medium":"low";
                  return (
                    <div key={r.id} style={{display:"flex",flexDirection:"row",alignItems:"center",gap:14,padding:"14px 18px",border:"1.5px solid #e4ecf4",borderRadius:14,background:"#fff",transition:"box-shadow 0.2s,border-color 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(13,43,94,0.1)";e.currentTarget.style.borderColor="#c7d8f0";}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor="#e4ecf4";}}>
                      <div style={{width:44,height:44,borderRadius:12,background:STATUT_BG[r.statut],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={STATUT_ICON_COLOR[r.statut]} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:800,color:"#2980e8",background:"#eff6ff",padding:"2px 9px",borderRadius:7,border:"1px solid #dbeafe"}}>{r.ref}</span>
                        </div>
                        <div style={{fontSize:13,color:"#0d2b5e",fontWeight:600,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.description}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          {r.mission&&<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#5a6e88",fontWeight:500,background:"#f0f5fb",border:"1px solid #e4ecf4",borderRadius:7,padding:"2px 8px"}}>
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            {r.mission}
                          </span>}
                          <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:"#94a3b8",fontWeight:600,background:"#f8fafc",border:"1px solid #e4ecf4",borderRadius:7,padding:"2px 8px",whiteSpace:"nowrap"}}>
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {r.date}{r.heure?` · ${r.heure}`:""}
                          </span>
                        </div>
                      </div>
                      <div style={{flexShrink:0,marginLeft:8}} onClick={e=>e.stopPropagation()}>
                        <button type="button" onClick={()=>setConfirmDel({id:r.id,ref:r.ref})}
                          style={{display:"inline-flex",alignItems:"center",gap:5,padding:"7px 13px",border:"1.5px solid #fecaca",color:"#ef4444",background:"transparent",borderRadius:9,fontSize:12,fontWeight:700,fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="#fef2f2";e.currentTarget.style.borderColor="#ef4444";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="#fecaca";}}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{fontSize:10,color:"var(--text-muted)",textAlign:"center",padding:"16px 0 4px",letterSpacing:1,textTransform:"uppercase"}}>© 2026 AirOps Transport Management</div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand"><svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>Système de gestion sécurisé — AirOps Transport 2026</div>
          <span style={{fontSize:12,color:"var(--text-muted)"}}>{filtered.length} incident{filtered.length!==1?"s":""}</span>
        </footer>
      </div>

      {/* Incident modal */}
      {showForm && (
        <IncidentModal
          onClose={()=>{setShowForm(false);setFormDesc("");setFormPriority("low");}}
          onSubmit={async ({categorie, description, priority})=>{
            setFormSubmitting(true);
            try {
              await createIncident({ description, priority, categorie });
              setShowForm(false);
              setFormDesc("");
              setFormPriority("low");
              setToast({ msg:"✓ Incident soumis avec succès.", type:"green" });
              loadReclams();
            } catch(err) {
              setToast({ msg: err?.response?.data?.message || "Erreur lors de la soumission.", type:"" });
            } finally { setFormSubmitting(false); }
          }}
        />
      )}

      {/* Confirm delete single */}
      {confirmDel&&confirmDel!=="all"&&(
        <ConfirmDelete
          item={confirmDel}
          label={confirmDel.ref}
          onConfirm={()=>deleteReclam(confirmDel.id)}
          onClose={()=>setConfirmDel(null)}
        />
      )}

      {/* Confirm delete all */}
      {confirmDel==="all"&&(
        <div className="rm-ov" onClick={()=>setConfirmDel(null)}>
          <div className="rm-confirm-box" onClick={e=>e.stopPropagation()}>
            <div className="rm-confirm-icon">
              <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 style={{fontSize:16,fontWeight:800,color:"var(--text-primary)",marginBottom:8}}>Supprimer tous les incidents</h3>
            <p style={{fontSize:13,color:"var(--text-muted)"}}>Voulez-vous supprimer <strong style={{color:"var(--brand-blue)"}}>tous les incidents</strong> ? Cette action est irréversible.</p>
            <div className="rm-confirm-btns">
              <button type="button" className="rm-confirm-cancel" onClick={()=>setConfirmDel(null)}>Annuler</button>
              <button type="button" className="rm-confirm-ok" onClick={()=>{deleteAll();setConfirmDel(null);}}>Tout supprimer</button>
            </div>
          </div>
        </div>
      )}

      {toast.msg&&<div className={`rm-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}