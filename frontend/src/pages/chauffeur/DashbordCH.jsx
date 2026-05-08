import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  fetchDriverDashboard,
  fetchMyMissions,
  startMission,
  endMission,
  cancelMission,
  createIncident,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  mapMission,
  formatTimeAgo,
} from "../../services/chauffeurService";
import { useProfileSync } from "../../services/useProfileSync";
import { useChauffeurNotifications } from "../../services/useChauffeurNotifications";

const chCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --brand-dark:#0d2b5e; --brand-mid:#1252aa; --brand-blue:#2980e8; --brand-light:#7ec8ff;
    --accent-orange:#f97316; --accent-green:#16a34a; --accent-red:#ef4444; --accent-purple:#7c3aed;
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

  .chm { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .chh { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .chh-left  { display:flex; align-items:center; gap:12px; }
  .chh-right { display:flex; align-items:center; gap:10px; }
  .chh-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .chh-menu-btn:hover { background:var(--bg-page); color:var(--text-primary); }
  .chh-title { font-size:15px; font-weight:700; color:var(--text-primary); }

  .search-wrap { position:relative; }
  .search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
  .search-input { width:230px; padding:9px 12px 9px 34px; border:1.5px solid var(--border); border-radius:22px; background:var(--bg-page); font-size:13px; font-family:inherit; color:var(--text-primary); outline:none; transition:var(--tr); }
  .search-input:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color:var(--text-muted); }
  .notif-btn { position:relative; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:8px; border-radius:10px; transition:var(--tr); }
  .notif-btn:hover { background:var(--bg-page); color:var(--brand-blue); }
  .notif-dot-hdr { position:absolute; top:6px; right:6px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:1.5px solid #fff; }

  .notif-dropdown-wrap { position:relative; }
  .notif-dropdown { position:absolute; top:calc(100% + 10px); right:0; width:360px; background:#fff; border-radius:18px; box-shadow:0 16px 50px rgba(13,43,94,0.2); border:1px solid var(--border); z-index:500; animation:dropIn 0.2s ease; overflow:hidden; }
  .nd-header { padding:16px 18px 12px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
  .nd-title { font-size:14px; font-weight:800; color:var(--text-primary); }
  .nd-badge { background:#ef4444; color:#fff; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px; }
  .nd-mark-all { font-size:11px; font-weight:600; color:var(--brand-blue); background:none; border:none; cursor:pointer; font-family:inherit; }
  .nd-mark-all:hover { text-decoration:underline; }
  .nd-list { max-height:320px; overflow-y:auto; }
  .nd-list::-webkit-scrollbar { width:4px; }
  .nd-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
  .nd-item { display:flex; align-items:flex-start; gap:12px; padding:13px 18px; border-bottom:1px solid #f8fafc; cursor:pointer; transition:background 0.15s; position:relative; }
  .nd-item:last-child { border-bottom:none; }
  .nd-item:hover { background:#f8fafc; }
  .nd-item.unread { background:#f0f6ff; }
  .nd-item.unread::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:var(--brand-blue); border-radius:0 3px 3px 0; }
  .nd-icon { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .nd-body { flex:1; min-width:0; }
  .nd-notif-title { font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .nd-notif-sub { font-size:11px; color:var(--text-sec); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .nd-notif-time { font-size:10px; color:var(--text-muted); margin-top:4px; }
  .nd-footer { padding:10px 18px; border-top:1px solid var(--border); text-align:center; }
  .nd-footer a { font-size:12px; font-weight:700; color:var(--brand-blue); text-decoration:none; }
  .nd-footer a:hover { text-decoration:underline; }
  .nd-empty { padding:30px 18px; text-align:center; }
  .nd-empty-icon { font-size:28px; margin-bottom:8px; }
  .nd-empty-text { font-size:13px; color:var(--text-muted); }

  .user-chip { display:flex; align-items:center; gap:9px; cursor:default; }
  .user-name { font-size:13px; font-weight:700; color:var(--text-primary); }
  .user-role { font-size:11px; color:var(--text-muted); }
  .user-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; }

  .chc { flex:1; overflow-y:auto; padding:26px; }

  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  .sc { display:flex; align-items:center; gap:16px; border-radius:16px; padding:22px 24px; box-shadow:0 10px 25px rgba(0,0,0,0.05); transition:var(--tr); cursor:pointer; color:#fff; border:none; }
  .sc:hover { transform:translateY(-4px); box-shadow:0 14px 30px rgba(0,0,0,0.12); }
  .sc.blue  { background: linear-gradient(135deg, #2563eb, #1e40af); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3); }
  .sc.sky   { background: linear-gradient(135deg, #0ea5e9, #0284c7); box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3); }
  .sc.indigo { background: linear-gradient(135deg, #4f46e5, #3730a3); box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3); }
  .sc.gray  { background: linear-gradient(135deg, #64748b, #334155); box-shadow: 0 8px 24px rgba(100, 116, 139, 0.3); }
  .sc-icon-wrap { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; background:#fff; box-shadow:0 4px 10px rgba(0,0,0,0.08); }
  .sc.blue .sc-icon-wrap   { color:#2563eb; }
  .sc.sky .sc-icon-wrap    { color:#0284c7; }
  .sc.indigo .sc-icon-wrap { color:#4f46e5; }
  .sc.gray .sc-icon-wrap   { color:#334155; }
  .sc-icon-wrap svg { stroke:currentColor !important; fill:none; width:22px; height:22px; display:block; }
  .sc-content { display:flex; flex-direction:column; justify-content:center; overflow:hidden; }
  .sc-value { font-size:30px; font-weight:900; color:#fff; letter-spacing:-0.8px; line-height:1; }
  .sc-label { font-size:12px; color:rgba(255, 255, 255, 0.85); font-weight:500; margin-top:4px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }

  .charts-row { display:grid; grid-template-columns:1fr 300px; gap:14px; margin-bottom:20px; }
  .cc { background:#fff; border:1px solid var(--border); border-radius:20px; padding:20px; box-shadow:var(--shadow-sm); transition:var(--tr); }
  .cc:hover { box-shadow:var(--shadow-md); }
  .cc-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .cc-title { font-size:14px; font-weight:700; color:var(--text-primary); }
  .cc-period { font-size:11px; color:var(--text-sec); border:1px solid var(--border); border-radius:8px; padding:5px 11px; background:#fff; cursor:pointer; font-family:inherit; transition:var(--tr); }
  .cc-period:hover { border-color:var(--brand-blue); color:var(--brand-blue); }
  .bar-chart { display:flex; align-items:flex-end; gap:10px; height:120px; padding:0 4px; }
  .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; }
  .bar-inner { width:100%; display:flex; align-items:flex-end; justify-content:center; flex:1; }
  .bar-fill { width:100%; border-radius:6px 6px 0 0; transition:height 0.4s ease; }
  .bar-fill.active { background:linear-gradient(180deg,var(--brand-blue),#1a6fd4); }
  .bar-fill.inactive { background:#dbeafe; }
  .bar-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .bar-lbl.active { color:var(--brand-blue); }
  .bar-lbl.inactive { color:var(--text-muted); }
  .donut-wrap { display:flex; flex-direction:column; align-items:center; }
  .donut-legend { width:100%; margin-top:14px; display:flex; flex-direction:column; gap:7px; }
  .dl-item { display:flex; align-items:center; gap:8px; font-size:12px; }
  .dl-dot  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .dl-lbl  { color:var(--text-sec); flex:1; }
  .dl-val  { font-weight:700; color:var(--text-primary); }

  .tbl-card { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--shadow-sm); overflow:visible; transition:var(--tr); margin-bottom:20px; }
  .tbl-card:hover { box-shadow:var(--shadow-md); }
  .tbl-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid var(--border); gap:10px; flex-wrap:wrap; }
  .tbl-hd-title { font-size:14px; font-weight:700; color:var(--text-primary); }
  .tbl-count { font-size:12px; color:var(--text-muted); }
  .tbl-hd-right { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .filter-tabs { display:flex; align-items:center; gap:2px; background:#f0f5fb; border-radius:14px; padding:4px; }
  .filter-btn { padding:7px 14px; border-radius:10px; border:none; font-size:12px; font-weight:600; cursor:pointer; font-family:inherit; transition:var(--tr); background:transparent; color:var(--text-sec); }
  .filter-btn:hover { color:var(--text-primary); background:rgba(255,255,255,0.7); }
  .filter-btn.active { background:#fff; color:var(--brand-blue); box-shadow:var(--shadow-sm); }

  /* ═══════════ TABLE DES MISSIONS - VERSION TABLE FIXE ═══════════ */
  .requests-table-wrap { width:100%; overflow-x:auto; overflow-y:visible; }
  .requests-table { width:100%; min-width:900px; border-collapse:collapse; table-layout:fixed; }
  .requests-table th { background:#f8fafc; border-bottom:1px solid var(--border); padding:9px 22px; font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; text-align:left; white-space:nowrap; }
  .requests-table td { border-bottom:1px solid #f1f5f9; padding:13px 22px; vertical-align:middle; transition:background 0.18s; }
  .requests-table tr:last-child td { border-bottom:none; }
  .requests-table tbody tr:hover { background:#f8fafc; }

  .req-col-ref { width:120px; }
  .req-col-trajet { width:auto; }
  .req-col-date { width:130px; text-align:center; }
  .req-col-statut { width:140px; text-align:center; }
  .req-col-action { width:70px; text-align:center; }

  .requests-table th.req-col-date,
  .requests-table th.req-col-statut,
  .requests-table th.req-col-action { text-align:center; }

  .row-ref  { font-size:13px; font-weight:700; color:var(--brand-blue); white-space:nowrap; }
  .row-traj { font-size:13px; font-weight:600; color:var(--text-primary); line-height:1.35; min-width:0; overflow:hidden; }
  .row-traj-main { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row-vers      { display:block; font-size:11px; color:var(--text-muted); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row-date { font-size:12px; color:var(--text-sec); white-space:nowrap; }
  .badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; padding:4px 10px; border-radius:20px; border:1px solid transparent; white-space:nowrap; }
  .bdot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

  .req-action-cell { display:flex; align-items:center; justify-content:center; width:100%; }
  .am-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
  .am-btn { width:32px; height:32px; border-radius:8px; background:none; border:1px solid transparent; color:var(--text-muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:var(--tr); }
  .am-btn:hover { background:#f0f5fb; border-color:var(--border); color:var(--brand-blue); }
  .am-drop { position:fixed; z-index:9999; width:195px; background:#fff; border-radius:14px; box-shadow:0 8px 40px rgba(13,43,94,0.18),0 2px 8px rgba(13,43,94,0.08); border:1px solid var(--border); overflow:hidden; animation:dropIn 0.18s ease; }
  @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.97);}to{opacity:1;transform:none;} }
  .am-item { width:100%; display:flex; align-items:center; gap:9px; padding:11px 15px; background:none; border:none; font-size:13px; font-weight:500; font-family:inherit; text-align:left; cursor:pointer; color:var(--text-primary); transition:background 0.15s; white-space:nowrap; }
  .am-item:hover { background:#f0f5fb; }
  .am-item.am-blue:hover { background:#eff6ff; color:var(--brand-blue); }
  .am-item.am-green:hover { background:#f0fdf4; color:var(--accent-green); }
  .am-item.am-purple:hover { background:#eff6ff; color:var(--brand-blue); }
  .am-item.am-red { color:var(--accent-red); }
  .am-item.am-red:hover { background:#fef2f2; }
  .am-sep { height:1px; background:var(--border); margin:3px 0; }

  .pagination { display:flex; align-items:center; justify-content:space-between; padding:14px 22px; border-top:1px solid var(--border); flex-wrap:wrap; gap:10px; border-radius:0 0 20px 20px; }
  .pag-info { font-size:12px; color:var(--text-muted); }
  .pag-left { display:flex; align-items:center; gap:10px; }
  .pag-controls { display:flex; align-items:center; gap:3px; }
  .pag-btn { min-width:32px; height:32px; border-radius:8px; border:1px solid var(--border); background:#fff; color:var(--text-sec); font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; cursor:pointer; font-family:inherit; transition:var(--tr); padding:0 7px; }
  .pag-btn:hover:not(:disabled) { border-color:var(--brand-blue); color:var(--brand-blue); background:#eff6ff; }
  .pag-btn:disabled { opacity:0.35; cursor:default; }
  .pag-btn.active { background:var(--brand-blue); color:#fff; border-color:var(--brand-blue); box-shadow:0 2px 8px rgba(41,128,232,0.3); }
  .pag-ellipsis { color:var(--text-muted); font-size:13px; padding:0 3px; user-select:none; }
  .pag-size { height:32px; border-radius:8px; border:1px solid var(--border); background:#fff; color:var(--text-sec); font-size:12px; font-family:inherit; padding:0 8px; cursor:pointer; outline:none; transition:var(--tr); }
  .pag-size:focus { border-color:var(--brand-blue); }

  .modal-ov { position:fixed; inset:0; z-index:100; background:rgba(13,43,94,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  .modal-box { background:#fff; border-radius:24px; width:100%; max-width:500px; overflow:hidden; box-shadow:var(--shadow-lg); animation:slideUp 0.25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:none;} }
  .mh { background:linear-gradient(135deg,var(--brand-dark),var(--brand-mid)); padding:22px 24px; color:#fff; }
  .mh-row { display:flex; align-items:flex-start; justify-content:space-between; }
  .mh-label { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.5); font-weight:700; margin-bottom:4px; }
  .mh-ref   { font-size:22px; font-weight:800; }
  .mh-traj  { font-size:13px; color:rgba(255,255,255,0.65); margin-top:2px; }
  .mh-close { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.14); border:none; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; flex-shrink:0; transition:var(--tr); }
  .mh-close:hover { background:rgba(255,255,255,0.26); transform:rotate(90deg); }
  .ms-bar { display:flex; align-items:center; gap:10px; padding:9px 24px; background:#f8fafc; border-bottom:1px solid var(--border); }
  .mb { padding:18px 24px; }
  .mb-row { display:flex; align-items:center; justify-content:space-between; padding:11px 0; border-bottom:1px solid #f1f5f9; }
  .mb-row:last-child { border-bottom:none; }
  .mb-lbl { font-size:11px; font-weight:600; color:var(--text-muted); }
  .mb-val  { font-size:13px; font-weight:700; color:var(--text-primary); text-align:right; max-width:62%; }
  .mf { padding:14px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:8px; }
  .btn-close-m { padding:9px 20px; font-size:13px; font-family:inherit; color:var(--text-sec); border:1px solid var(--border); border-radius:10px; background:#fff; cursor:pointer; transition:var(--tr); }
  .btn-close-m:hover { background:var(--bg-page); }
  .btn-terminer { padding:9px 20px; font-size:13px; font-family:inherit; font-weight:700; color:#fff; border:none; border-radius:10px; background:linear-gradient(135deg,var(--accent-green),#15803d); cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(22,163,74,0.35); display:flex; align-items:center; gap:7px; }
  .btn-terminer:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(22,163,74,0.45); }

  .recl-modal-box { background:#fff; border-radius:24px; width:100%; max-width:520px; overflow:hidden; box-shadow:var(--shadow-lg); animation:slideUp 0.25s ease; }
  .mh-red { background:linear-gradient(135deg,#991b1b,var(--accent-red)); padding:22px 24px; color:#fff; }
  .recl-form { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
  .recl-field { display:flex; flex-direction:column; gap:6px; }
  .recl-label { font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; }
  .recl-info-row { display:flex; gap:10px; background:#f8fafc; border:1px solid var(--border); border-radius:12px; padding:12px 14px; align-items:center; }
  .recl-info-ref { font-size:13px; font-weight:700; color:var(--brand-blue); }
  .recl-info-traj { font-size:12px; color:var(--text-sec); flex:1; }
  .recl-select { width:100%; padding:10px 14px; border:1.5px solid var(--border); border-radius:12px; font-size:13px; font-family:inherit; color:var(--text-primary); background:#fff; outline:none; transition:var(--tr); appearance:none; cursor:pointer; }
  .recl-select:focus { border-color:var(--accent-red); box-shadow:0 0 0 3px rgba(239,68,68,0.1); }
  .recl-textarea { width:100%; min-height:110px; padding:12px 14px; border:1.5px solid var(--border); border-radius:12px; font-size:13px; font-family:inherit; color:var(--text-primary); background:#fff; outline:none; transition:var(--tr); resize:vertical; }
  .recl-textarea:focus { border-color:var(--accent-red); box-shadow:0 0 0 3px rgba(239,68,68,0.1); }
  .recl-textarea::placeholder { color:var(--text-muted); }
  .recl-char-count { font-size:11px; color:var(--text-muted); text-align:right; margin-top:2px; }
  .recl-priority-row { display:flex; gap:8px; }
  .recl-prio-btn { flex:1; padding:9px 6px; border:1.5px solid var(--border); border-radius:10px; font-size:12px; font-weight:600; font-family:inherit; cursor:pointer; transition:var(--tr); background:#fff; color:var(--text-sec); text-align:center; }
  .recl-prio-btn:hover { border-color:var(--text-sec); color:var(--text-primary); }
  .recl-prio-btn.active-low { border-color:#22c55e; background:#f0fdf4; color:#15803d; }
  .recl-prio-btn.active-medium { border-color:#f97316; background:#fff7ed; color:#ea580c; }
  .recl-prio-btn.active-high { border-color:#ef4444; background:#fef2f2; color:#dc2626; }
  .btn-submit-recl { padding:11px 22px; font-size:13px; font-family:inherit; font-weight:700; color:#fff; border:none; border-radius:10px; background:linear-gradient(135deg,var(--accent-red),#b91c1c); cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(239,68,68,0.35); }
  .btn-submit-recl:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(239,68,68,0.45); }
  .btn-submit-recl:active { transform:scale(0.97); }
  .btn-submit-recl:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

  .ch-footer { padding:12px 26px; background:#fff; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; font-size:11px; color:var(--text-muted); flex-shrink:0; }
  .ch-footer-brand { display:flex; align-items:center; gap:6px; font-weight:600; }
  .btn-pdf-footer { display:flex; align-items:center; gap:8px; padding:10px 20px; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); color:#fff; border:none; border-radius:12px; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(41,128,232,0.35); }
  .btn-pdf-footer:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(41,128,232,0.45); }

  .empty-state { padding:40px 22px; text-align:center; }
  .empty-icon { width:56px; height:56px; margin:0 auto 16px; border-radius:16px; background:#f1f5f9; display:flex; align-items:center; justify-content:center; }

  .toast { position:fixed; top:18px; right:18px; z-index:600; background:var(--brand-dark); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); border-left:3px solid var(--brand-light); animation:toastIn 0.3s ease; }
  .toast.toast-purple { border-left-color:#a78bfa; }
  .toast.toast-green { border-left-color:#4ade80; }
  @keyframes toastIn { from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:none;} }

  .fab { position:fixed; bottom:22px; right:22px; width:50px; height:50px; background:linear-gradient(135deg,var(--brand-blue),#1a6fd4); color:#fff; border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:40; box-shadow:0 6px 20px rgba(41,128,232,0.45); transition:var(--tr); }
  .fab:hover  { transform:scale(1.1) translateY(-2px); box-shadow:0 10px 28px rgba(41,128,232,0.55); }
  .fab:active { transform:scale(0.96); }
  .dash-footer { font-size:10px; color:var(--text-muted); text-align:center; padding:4px 0 10px; letter-spacing:1px; text-transform:uppercase; }

  @media (max-width:1200px) { .stats-grid{grid-template-columns:repeat(2,1fr);} .charts-row{grid-template-columns:1fr;} }
  @media (max-width:960px) {
    .col-date-ch { display:none!important; }
  }
  @media (max-width:768px) {
    .sidebar { position:fixed; left:0; top:0; bottom:0; z-index:30; transform:translateX(-100%); width:var(--sidebar-full)!important; transition:transform 0.3s ease!important; }
    .sidebar.open{transform:translateX(0);} .sidebar.collapsed{transform:translateX(-100%);} .sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;} .chh-menu-btn{display:flex;} .sb-toggle-btn{display:none;}
    .stats-grid{grid-template-columns:repeat(2,1fr);gap:12px;} .chc{padding:16px;} .chh{padding:0 16px;}
    .notif-dropdown { width:320px; right:-40px; }
  }
  @media (max-width:480px) { .stats-grid{grid-template-columns:1fr 1fr;gap:10px;} .sc-value{font-size:24px;} .search-wrap{display:none;} .user-role{display:none;} .notif-dropdown{width:290px;right:-70px;} }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-ch-css")) {
  const tag = document.createElement("style");
  tag.id = "airops-ch-css";
  tag.textContent = chCSS;
  document.head.appendChild(tag);
}

const LS_KEY_NOTIF = "airops_notif_ch_v1";
const STORAGE_KEY_MISSIONS = "airops_ch_missions_v1";
const STORAGE_KEY_RECLAMATIONS = "airops_ch_reclamations_v1";

const RECL_CATEGORIES = [
  "Problème avec le client", "Incident de véhicule", "Retard de paiement",
  "Mauvaise attribution de mission", "Conditions de travail", "Problème d'itinéraire", "Autre",
];

const barData = [
  { jour: "LUN", h: 45 }, { jour: "MAR", h: 62 }, { jour: "MER", h: 75 },
  { jour: "JEU", h: 100, active: true }, { jour: "SAM", h: 55 }, { jour: "DIM", h: 38 },
];

const navItems = [
  { label: "Tableau de Bord", to: "/dashbordchauffeur", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
  { label: "Historique Missions", to: "/historiqueM", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
  { label: "Incidents", to: "/incidentsCH", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
  { label: "Navigation", to: "/navigationCH", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg> },
  { label: "Notifications", to: "/notificationM", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
];

const statutCfg = {
  "TERMINÉE": { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  "EN COURS": { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe" },
  "CONFIRMÉE": { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  "ANNULÉE": { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0" },
  "REFUSÉE": { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444", border: "#fecaca" },
};

function generatePDF(missions, nomCH) {
  const today = new Date().toLocaleDateString("fr-FR");
  const accepted = missions.filter(m => m.statut === "CONFIRMÉE");
  const rows = accepted.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">Aucune mission acceptée pour aujourd'hui</td></tr>`
    : accepted.map((m, i) => `<tr style="background:${i % 2 === 0 ? "#fff" : "#f8fafc"}"><td style="padding:10px 14px;font-size:12px;font-weight:700;color:#2980e8;">${m.ref}</td><td style="padding:10px 14px;font-size:12px;">${m.depart}</td><td style="padding:10px 14px;font-size:12px;">${m.arrivee}</td><td style="padding:10px 14px;font-size:12px;">${m.client}</td><td style="padding:10px 14px;font-size:12px;">${m.date}</td></tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:30px;background:#f0f5fb;}.header{background:linear-gradient(135deg,#0d2b5e,#2980e8);color:#fff;padding:30px;border-radius:16px;margin-bottom:24px;}.header h1{font-size:22px;font-weight:800;margin:0 0 4px;}.header p{font-size:12px;opacity:0.7;margin:0;}.header-meta{display:flex;gap:20px;margin-top:16px;}.meta-item{background:rgba(255,255,255,0.15);border-radius:10px;padding:10px 16px;}.meta-label{font-size:9px;opacity:0.65;font-weight:700;letter-spacing:1px;text-transform:uppercase;}.meta-val{font-size:16px;font-weight:800;}table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(13,43,94,0.08);}th{background:#0d2b5e;color:#fff;padding:12px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;text-align:left;}.footer{margin-top:20px;text-align:center;font-size:10px;color:#94a3b8;}</style></head><body><div class="header"><h1>Rapport des Missions — ${nomCH}</h1><p>Missions acceptées · Généré le ${today}</p><div class="header-meta"><div class="meta-item"><div class="meta-label">Chauffeur</div><div class="meta-val">${nomCH}</div></div><div class="meta-item"><div class="meta-label">Date</div><div class="meta-val">${today}</div></div><div class="meta-item"><div class="meta-label">Missions acceptées</div><div class="meta-val">${accepted.length}</div></div></div></div><table><thead><tr><th>Référence</th><th>Départ</th><th>Arrivée</th><th>Client</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table><div class="footer">AirOps Transport Management — Rapport confidentiel</div></body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); win.print(); }
}

function Pagination({ total, page, perPage, onPage, onPerPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  };
  return (
    <div className="pagination">
      <div className="pag-left">
        <span className="pag-info">{total === 0 ? "Aucun résultat" : `${start}–${end} sur ${total}`}</span>
        <select className="pag-size" value={perPage} onChange={e => { onPerPage(Number(e.target.value)); onPage(1); }}>
          {[3, 5, 8, 10].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
      <div className="pag-controls">
        <button type="button" className="pag-btn" disabled={page === 1} onClick={() => onPage(1)}>«</button>
        <button type="button" className="pag-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {getPages().map((p, i) => p === "…" ? <span key={`e${i}`} className="pag-ellipsis">…</span> : <button key={p} type="button" className={`pag-btn${page === p ? " active" : ""}`} onClick={() => onPage(p)}>{p}</button>)}
        <button type="button" className="pag-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)}>›</button>
        <button type="button" className="pag-btn" disabled={page === totalPages} onClick={() => onPage(totalPages)}>»</button>
      </div>
    </div>
  );
}

function MissionDetailModal({ mission, onClose, onTerminer }) {
  if (!mission) return null;
  const sc = statutCfg[mission.statut] || { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0" };
  const canTerminer = mission.statut === "EN COURS";
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div className="mh-row">
            <div><p className="mh-label">DÉTAIL MISSION</p><p className="mh-ref">{mission.ref}</p><p className="mh-traj">{mission.depart} · {mission.arrivee}</p></div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="ms-bar">
          <span className="badge" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}><span className="bdot" style={{ background: sc.dot }} />{mission.statut}</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{mission.date}</span>
        </div>
        <div className="mb">
          {[["Client", mission.client], ["Véhicule", mission.vehicule], ["Départ", mission.depart], ["Arrivée", mission.arrivee], ["Passagers", `${mission.passagers} pers. · ${mission.bagage}`]].map(([lbl, val]) => (
            <div key={lbl} className="mb-row"><span className="mb-lbl">{lbl}</span><span className="mb-val">{val}</span></div>
          ))}
        </div>
        <div className="mf">
          <button type="button" className="btn-close-m" onClick={onClose}>Fermer</button>
          {canTerminer && <button type="button" className="btn-terminer" onClick={() => { onTerminer(mission.ref); onClose(); }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Terminer la mission</button>}
        </div>
      </div>
    </div>
  );
}

function ReclammationModal({ mission, onClose, onSubmit }) {
  const [categorie, setCategorie] = useState("");
  const [description, setDescription] = useState("");
  const [priorite, setPriorite] = useState("medium");
  const MAX = 400;
  const canSubmit = categorie && description.trim().length >= 10;
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ id: `#RCL-${Date.now().toString().slice(-5)}`, missionRef: mission.ref, missionTraj: mission.trajet, categorie, description: description.trim(), priorite, date: new Date().toLocaleDateString("fr-FR"), statut: "EN ATTENTE" });
    onClose();
  };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="recl-modal-box" onClick={e => e.stopPropagation()}>
        <div className="mh-red">
          <div className="mh-row">
            <div><p className="mh-label">NOUVEL INCIDENT</p><p className="mh-ref">Signaler un incident</p><p className="mh-traj">Mission {mission.ref} · {mission.trajet}</p></div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="recl-form">
          <div className="recl-field">
            <span className="recl-label">Mission concernée</span>
            <div className="recl-info-row">
              <span className="recl-info-ref">{mission.ref}</span>
              <span className="recl-info-traj">{mission.depart} → {mission.arrivee}</span>
              <span className="badge" style={{ background: statutCfg[mission.statut]?.bg || "#f1f5f9", color: statutCfg[mission.statut]?.text || "#64748b", borderColor: statutCfg[mission.statut]?.border || "#e2e8f0", fontSize: 10 }}><span className="bdot" style={{ background: statutCfg[mission.statut]?.dot || "#94a3b8" }} />{mission.statut}</span>
            </div>
          </div>
          <div className="recl-field">
            <span className="recl-label">Catégorie *</span>
            <div style={{ position: "relative" }}>
              <select className="recl-select" value={categorie} onChange={e => setCategorie(e.target.value)}>
                <option value="">— Sélectionner une catégorie —</option>
                {RECL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div className="recl-field">
            <span className="recl-label">Description * (min. 10 caractères)</span>
            <textarea className="recl-textarea" placeholder="Décrivez l'incident en détail…" value={description} onChange={e => setDescription(e.target.value.slice(0, MAX))} />
            <span className="recl-char-count">{description.length} / {MAX}</span>
          </div>
        </div>
        <div className="mf">
          <button type="button" className="btn-close-m" onClick={onClose}>Annuler</button>
          <button type="button" className="btn-submit-recl" disabled={!canSubmit} onClick={handleSubmit}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ marginRight: 6, display: "inline" }}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" /></svg>
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ missions }) {
  const counts = {
    "TERMINÉE": missions.filter(m => m.statut === "TERMINÉE").length,
    "EN COURS": missions.filter(m => m.statut === "EN COURS").length,
    "CONFIRMÉE": missions.filter(m => m.statut === "CONFIRMÉE").length,
    "REFUSÉE": missions.filter(m => m.statut === "REFUSÉE").length,
    "ANNULÉE": missions.filter(m => m.statut === "ANNULÉE").length
  };
  const total = missions.length;
  const colors = { "TERMINÉE": "#16a34a", "EN COURS": "#2980e8", "CONFIRMÉE": "#16a34a", "REFUSÉE": "#ef4444", "ANNULÉE": "#94a3b8" };
  const labels = { "TERMINÉE": "Terminées", "EN COURS": "En cours", "CONFIRMÉE": "Confirmées", "REFUSÉE": "Refusées", "ANNULÉE": "Annulées" };
  let offset = 0;
  const r = 48, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  return (
    <div className="donut-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {Object.entries(counts).filter(([, v]) => v > 0).map(([key, val]) => {
          const dash = (val / total) * circ, gap = circ - dash;
          const el = <circle key={key} cx={cx} cy={cy} r={r} fill="none" stroke={colors[key]} strokeWidth="16" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />;
          offset += dash; return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill="#0d2b5e">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">missions</text>
      </svg>
      <div className="donut-legend">
        {Object.entries(counts).filter(([, v]) => v > 0).map(([key, val]) => (
          <div key={key} className="dl-item"><span className="dl-dot" style={{ background: colors[key] }} /><span className="dl-lbl">{labels[key]}</span><span className="dl-val">{val}</span></div>
        ))}
      </div>
    </div>
  );
}

function ActionMenu({ mission, isOpen, onToggle, onDetail, onReclamation, onTerminer, onDemarrer }) {
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!isOpen) return;
    if (btnRef.current) { const rect = btnRef.current.getBoundingClientRect(); setDropPos({ top: rect.bottom + 6, left: rect.right - 195 }); }
    const fn = e => { if (btnRef.current && !btnRef.current.contains(e.target) && dropRef.current && !dropRef.current.contains(e.target)) onToggle(null); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, onToggle]);
  const peutTerminer = mission.statut === "EN COURS";
  const peutDemarrer = mission.statut === "CONFIRMÉE";
  return (
    <div className="am-wrap">
      <button type="button" className="am-btn" ref={btnRef} onClick={e => { e.stopPropagation(); onToggle(isOpen ? null : mission.ref); }}>
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" /></svg>
      </button>
      {isOpen && (
        <div className="am-drop" ref={dropRef} style={{ top: dropPos.top, left: dropPos.left }}>
          <button type="button" className="am-item am-blue" onClick={() => { onDetail(mission); onToggle(null); }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Voir le détail</button>
          {peutDemarrer && (<><div className="am-sep" /><button type="button" className="am-item am-blue" onClick={() => { onDemarrer(mission.ref); onToggle(null); }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Démarrer la mission</button></>)}
          {peutTerminer && (<><div className="am-sep" /><button type="button" className="am-item am-green" onClick={() => { onTerminer(mission.ref); onToggle(null); }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Terminer la mission</button></>)}
          <div className="am-sep" />
          <button type="button" className="am-item am-purple" onClick={() => { onReclamation(mission); onToggle(null); }}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Signaler un incident</button>
        </div>
      )}
    </div>
  );
}

function NotifDropdown({ notifData, onClose, onMarkAll, navigate }) {
  const unread = notifData.filter(n => !n.lu);
  return (
    <div className="notif-dropdown">
      <div className="nd-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="nd-title">Notifications</span>{unread.length > 0 && <span className="nd-badge">{unread.length}</span>}</div>
        {unread.length > 0 && <button type="button" className="nd-mark-all" onClick={onMarkAll}>Tout lire</button>}
      </div>
      <div className="nd-list">
        {notifData.length === 0 ? (<div className="nd-empty"><div className="nd-empty-icon">🔔</div><p className="nd-empty-text">Aucune notification</p></div>)
          : notifData.slice(0, 6).map(n => (
            <div key={n.id} className={`nd-item${!n.lu ? " unread" : ""}`} onClick={() => { onClose(); navigate("/notificationM"); }}>
              <div className="nd-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
              <div className="nd-body"><div className="nd-notif-title">{n.ref} — {n.titre}</div><div className="nd-notif-sub">{n.depart} → {n.arrivee}</div><div className="nd-notif-time">{n.date} à {n.heure}</div></div>
              {!n.lu && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand-blue)", flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
      </div>
      <div className="nd-footer"><a href="#" onClick={e => { e.preventDefault(); onClose(); navigate("/notificationM"); }}>Voir toutes les notifications →</a></div>
    </div>
  );
}

export default function DashbordCH() {
  const navigate = useNavigate();
  const { unreadCount, updateCount } = useChauffeurNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [openMenu, setOpenMenu] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [reclMission, setReclMission] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [showNotifDrop, setShowNotifDrop] = useState(false);
  const notifDropRef = useRef(null);
  const notifBtnRef = useRef(null);
  const [missions, setMissions] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [notifData, setNotifData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [missionData, notifRes, dashData] = await Promise.all([fetchMyMissions({ limit: 50 }), fetchNotifications({ limit: 20 }), fetchDriverDashboard()]);
      const mapped = (missionData.data || []).map(mapMission).filter(m => m !== null);
      setMissions(mapped);
      setNotifData((notifRes.data || []).map(n => ({ id: n._id || n.id, _id: n._id || n.id, depart: n.message || "Notification", arrivee: "", date: n.createdAt ? n.createdAt.slice(0, 10) : "", heure: "", lu: n.isRead, message: n.message || "", time: formatTimeAgo(n.createdAt) })));
      setDashStats(dashData.stats || null);
    } catch { setToast({ msg: "Erreur lors du chargement.", type: "" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (!toast.msg) return; const t = setTimeout(() => setToast({ msg: "", type: "" }), 2800); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { setPage(1); }, [search, activeFilter]);
  useEffect(() => {
    const fn = e => { if (notifBtnRef.current && notifBtnRef.current.contains(e.target)) return; if (notifDropRef.current && !notifDropRef.current.contains(e.target)) setShowNotifDrop(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const showToast = (msg, type = "") => setToast({ msg, type });

  const handleDemarrer = async (ref) => {
    const m = missions.find(x => x.ref === ref); if (!m) return;
    try { await startMission(m._id); setMissions(prev => prev.map(x => x.ref === ref ? { ...x, statut: "EN COURS", statusRaw: "EN_COURS" } : x)); showToast(`✓ Mission ${ref} démarrée !`, "green"); }
    catch (err) { showToast(err?.response?.data?.message || `Erreur lors du démarrage.`); }
  };
  const handleTerminer = async (ref) => {
    const m = missions.find(x => x.ref === ref); if (!m) return;
    try { await endMission(m._id); setMissions(prev => prev.map(x => x.ref === ref ? { ...x, statut: "TERMINÉE" } : x)); showToast(`✓ Mission ${ref} terminée.`, "green"); }
    catch { showToast(`Erreur lors de la mise à jour.`); }
  };
  const handleSubmitReclamation = async (recl) => {
    try { await createIncident({ title: recl.categorie || "Incident", description: recl.description || "", type: recl.type || "AUTRE" }); showToast(`✓ Incident soumis avec succès.`, "purple"); }
    catch { showToast(`Erreur lors de la soumission.`); }
    setReclMission(null);
  };
  const handleMarkAllRead = async () => {
    try { await markAllNotificationsAsRead(); setNotifData(p => p.map(n => ({ ...n, lu: true }))); updateCount(); }
    catch {/* silently fail */ }
  };

  const { nom: nomCH, photo, initials } = useProfileSync();
  const terminéesCount = useMemo(() => dashStats?.completedMissions ?? missions.filter(m => m.statut === "TERMINÉE").length, [missions, dashStats]);
  const enCoursCount = useMemo(() => missions.filter(m => m.statut === "EN COURS").length, [missions]);

  const filtered = useMemo(() => {
    let list = missions;
    if (activeFilter === "Aujourd'hui") list = list.filter(m => m.statut !== "CONFIRMÉE");
    if (activeFilter === "À venir") list = list.filter(m => ["CONFIRMÉE"].includes(m.statut));
    if (search.trim()) { const q = search.trim().toLowerCase(); list = list.filter(m => [m.ref, m.client, m.depart, m.arrivee, m.statut, m.vehicule, m.trajet].join(" ").toLowerCase().includes(q)); }
    return list;
  }, [missions, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const navItemsWithBadge = navItems.map(item => item.to === "/notificationM" ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined } : item);

  const statCards = [
    { label: "Total Missions", value: missions.length, color: "blue", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { label: "Missions En Cours", value: enCoursCount, color: "sky", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { label: "Missions Terminées", value: terminéesCount, color: "indigo", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Incidents", value: dashStats?.alerts ?? 0, color: "gray", icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
  ];

  return (
    <div className="chw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" /></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE CHAUFFEUR</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItemsWithBadge.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span><span className="sb-nav-lbl">{item.label}</span>
              {item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => { localStorage.clear(); navigate("/login", { replace: true }); }}>
            <span style={{ flexShrink: 0 }}><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="chm">
        <header className="chh">
          <div className="chh-left">
            <button type="button" className="chh-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="chh-title">Tableau de bord</span>
          </div>
          <div className="chh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" className="search-input" placeholder="Rechercher une mission…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="notif-dropdown-wrap" ref={notifDropRef}>
              <button type="button" className="notif-btn" ref={notifBtnRef} onClick={() => setShowNotifDrop(v => !v)}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="notif-dot-hdr" />}
              </button>
              {showNotifDrop && <NotifDropdown notifData={notifData} onClose={() => setShowNotifDrop(false)} onMarkAll={handleMarkAllRead} navigate={navigate} />}
            </div>
            <div className="user-chip">
              <div style={{ textAlign: "right" }}><div className="user-name">{nomCH}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{photo ? <img src={photo} alt="profil" /> : initials}</div>
            </div>
          </div>
        </header>

        <main className="chc">
          <div className="stats-grid">
            {statCards.map(s => (
              <div key={s.label} className={`sc ${s.color}`} onClick={() => setToast({ msg: `${s.label} : ${s.value}`, type: "" })}>
                <div className="sc-icon-wrap">{s.icon}</div>
                <div className="sc-content"><div className="sc-value">{s.value}</div><div className="sc-label">{s.label}</div></div>
              </div>
            ))}
          </div>

          <div className="charts-row">
            <div className="cc">
              <div className="cc-hd"><span className="cc-title">Statistiques des Missions</span><button type="button" className="cc-period">Derniers 7 jours</button></div>
              <div className="bar-chart">
                {(dashStats?.weekChart || barData).map(b => (
                  <div key={b.jour} className="bar-col">
                    <div className="bar-inner"><div className={`bar-fill ${b.active ? "active" : "inactive"}`} style={{ height: `${b.h}%` }} /></div>
                    <span className={`bar-lbl ${b.active ? "active" : "inactive"}`}>{b.jour}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="cc">
              <div className="cc-hd"><span className="cc-title">Statut des missions</span></div>
              <DonutChart missions={missions} />
            </div>
          </div>

          <div className="tbl-card">
            <div className="tbl-hd">
              <span className="tbl-hd-title">Mes missions</span>
              <span className="tbl-count">{filtered.length} mission{filtered.length !== 1 ? "s" : ""}</span>
              <div className="tbl-hd-right">
                <div className="filter-tabs">
                  {["Tout", "Aujourd'hui", "À venir"].map(f => (
                    <button key={f} type="button" className={`filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="requests-table-wrap">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th className="req-col-ref">Référence</th>
                    <th className="req-col-trajet">Trajet</th>
                    <th className="req-col-date col-date-ch">Date</th>
                    <th className="req-col-statut">Statut</th>
                    <th className="req-col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5}><div className="empty-state"><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Chargement des missions…</p></div></td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div><p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Aucune mission trouvée</p><p style={{ fontSize: 12, color: "var(--text-muted)" }}>Essayez une autre recherche.</p></div></td></tr>
                  ) : paginated.map(m => {
                    const sc = statutCfg[m.statut] || { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0" };
                    return (
                      <tr key={m.ref}>
                        <td><span className="row-ref">{m.ref}</span></td>
                        <td>
                          <div className="row-traj">
                            <span className="row-traj-main">{m.trajet}</span>
                            <span className="row-vers">{m.vers}</span>
                          </div>
                        </td>
                        <td className="col-date-ch" style={{ textAlign: "center" }}><span className="row-date">{m.date}</span></td>
                        <td style={{ textAlign: "center" }}><span className="badge" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}><span className="bdot" style={{ background: sc.dot }} />{m.statut}</span></td>
                        <td><div className="req-action-cell"><ActionMenu mission={m} isOpen={openMenu === m.ref} onToggle={setOpenMenu} onDetail={setSelectedMission} onReclamation={setReclMission} onTerminer={handleTerminer} onDemarrer={handleDemarrer} /></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination total={filtered.length} page={safePage} perPage={perPage} onPage={setPage} onPerPage={setPerPage} />
          </div>

          <div className="dash-footer">© 2026 AirOps Transport Management</div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand">
            <svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <button type="button" className="btn-pdf-footer" onClick={() => { generatePDF(missions, nomCH); showToast("✓ Rapport PDF généré avec succès."); }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Télécharger le rapport PDF
          </button>
        </footer>
      </div>

      <button type="button" className="fab" onClick={() => navigate("/reserverD")}>
        <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
      </button>

      {selectedMission && <MissionDetailModal mission={selectedMission} onClose={() => setSelectedMission(null)} onTerminer={handleTerminer} />}
      {reclMission && <ReclammationModal mission={reclMission} onClose={() => setReclMission(null)} onSubmit={handleSubmitReclamation} />}
      {toast.msg && <div className={`toast${toast.type === "purple" ? " toast-purple" : toast.type === "green" ? " toast-green" : ""}`}>{toast.msg}</div>}
    </div>
  );
}