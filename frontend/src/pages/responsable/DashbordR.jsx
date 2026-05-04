import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  fetchRequests,
  approveRequest,
  rejectRequest,
  assignRequest,
  fetchAvailableDrivers,
  fetchAvailableVehicles,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchResponsableDashboard,
  mapRequest,
  formatTimeAgo,
} from "../../services/responsableService";

const dashCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --brand-dark:#0d2b5e; --brand-mid:#1252aa; --brand-blue:#2980e8; --brand-light:#7ec8ff;
    --accent-orange:#f97316; --accent-green:#16a34a; --accent-red:#ef4444;
    --bg-page:#f0f5fb; --border:#e4ecf4; --text-primary:#0d2b5e; --text-sec:#5a6e88; --text-muted:#94a3b8;
    --sidebar-full:230px; --sidebar-mini:66px; --header-h:64px;
    --shadow-sm:0 2px 12px rgba(13,43,94,0.07); --shadow-md:0 8px 32px rgba(13,43,94,0.13); --shadow-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .drw { display:flex; height:100vh; overflow:hidden; background:var(--bg-page); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--text-primary); }

  /* Sidebar */
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
  .sb-logout-icon { flex-shrink:0; }
  .sb-logout-lbl  { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .sidebar.collapsed .sb-logout-lbl { opacity:0; max-width:0; }
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  /* Main layout */
  .drm { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .drh { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--shadow-sm); overflow:visible; }
  .drh-left  { display:flex; align-items:center; gap:12px; }
  .drh-right { display:flex; align-items:center; gap:10px; position:relative; }
  .drh-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .drh-menu-btn:hover { background:var(--bg-page); color:var(--text-primary); }
  .drh-title { font-size:15px; font-weight:700; color:var(--text-primary); }

  .search-wrap { position:relative; }
  .search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-muted); pointer-events:none; }
  .search-input { width:230px; padding:9px 12px 9px 34px; border:1.5px solid var(--border); border-radius:22px; background:var(--bg-page); font-size:13px; font-family:inherit; color:var(--text-primary); outline:none; transition:var(--tr); }
  .search-input:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color:var(--text-muted); }
  .search-input.error { border-color:#fca5a5; }
  .search-error { font-size:11px; color:var(--accent-red); position:absolute; top:calc(100% + 3px); left:0; white-space:nowrap; }

  /* Notification dropdown */
  .notif-wrap { position:relative; z-index:100; }
  .notif-btn { position:relative; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:8px; border-radius:10px; transition:var(--tr); }
  .notif-btn:hover { background:var(--bg-page); color:var(--brand-blue); }
  .notif-badge { position:absolute; top:4px; right:4px; min-width:16px; height:16px; background:#ef4444; border-radius:8px; border:2px solid #fff; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:#fff; padding:0 3px; line-height:1; }
  .notif-dropdown { position:absolute; top:calc(100% + 10px); right:0; width:340px; background:#fff; border:1px solid var(--border); border-radius:18px; box-shadow:0 20px 60px rgba(13,43,94,0.22),0 4px 16px rgba(13,43,94,0.1); z-index:9999; overflow:hidden; animation:dropIn 0.2s ease; }
  @keyframes dropIn { from{opacity:0;transform:translateY(-8px) scale(0.97);}to{opacity:1;transform:none;} }
  .notif-drop-hd { display:flex; align-items:center; justify-content:space-between; padding:14px 18px 10px; border-bottom:1px solid var(--border); }
  .notif-drop-title { font-size:13px; font-weight:800; color:var(--text-primary); }
  .notif-drop-mark { font-size:11px; font-weight:700; color:var(--brand-blue); background:none; border:none; cursor:pointer; font-family:inherit; }
  .notif-list { max-height:320px; overflow-y:auto; }
  .notif-item { display:flex; align-items:flex-start; gap:11px; padding:13px 18px; border-bottom:1px solid #f1f5f9; cursor:pointer; transition:background 0.15s; }
  .notif-item:last-child { border-bottom:none; }
  .notif-item:hover { background:var(--bg-page); }
  .notif-item.unread { background:#f8fbff; }
  .notif-item.unread:hover { background:#eef5ff; }
  .notif-icon-wrap { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:15px; }
  .notif-icon-wrap.orange { background:#fff7ed; } .notif-icon-wrap.blue { background:#eff6ff; } .notif-icon-wrap.green { background:#f0fdf4; } .notif-icon-wrap.red { background:#fef2f2; }
  .notif-content { flex:1; min-width:0; }
  .notif-title-text { font-size:12.5px; font-weight:700; color:var(--text-primary); margin-bottom:2px; }
  .notif-sub-text { font-size:11.5px; color:var(--text-sec); line-height:1.4; }
  .notif-time { font-size:10px; color:var(--text-muted); white-space:nowrap; flex-shrink:0; margin-top:2px; }
  .notif-unread-dot { width:7px; height:7px; background:var(--brand-blue); border-radius:50%; margin-top:6px; flex-shrink:0; }
  .notif-drop-ft { padding:10px 18px; text-align:center; border-top:1px solid var(--border); }
  .notif-drop-all { font-size:12px; font-weight:700; color:var(--brand-blue); background:none; border:none; cursor:pointer; font-family:inherit; }
  .notif-drop-all:hover { color:var(--brand-mid); }

  .user-chip { display:flex; align-items:center; gap:9px; }
  .user-name  { font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; }
  .user-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; }

  /* Content */
  .drc { flex:1; overflow-y:auto; padding:26px; }
  .welcome-title { font-size:25px; font-weight:800; color:var(--brand-dark); letter-spacing:-0.5px; margin-bottom:4px; }
  .welcome-title span { color:var(--brand-blue); }
  .welcome-sub { font-size:13px; color:var(--text-muted); margin-bottom:22px; }

  /* ── Professional Widgets ── */
  .stats-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px; }
  .sc { background:#fff; border:1px solid var(--border); border-radius:20px; padding:20px 18px 16px; box-shadow:var(--shadow-sm); transition:var(--tr); position:relative; overflow:hidden; }
  .sc::after { content:''; position:absolute; top:-28px; right:-18px; width:80px; height:80px; border-radius:50%; opacity:0.07; pointer-events:none; }
  .sc.orange::after { background:var(--accent-orange); } .sc.green::after { background:var(--accent-green); } .sc.blue::after { background:var(--brand-blue); } .sc.sky::after { background:#0ea5e9; } .sc.red::after { background:var(--accent-red); }
  .sc:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
  .sc-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
  .sc-icon { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; }
  .sc-icon.orange { background:linear-gradient(135deg,#ffedd5,#fed7aa); } .sc-icon.green { background:linear-gradient(135deg,#dcfce7,#bbf7d0); } .sc-icon.blue { background:linear-gradient(135deg,#dbeafe,#bfdbfe); } .sc-icon.sky { background:linear-gradient(135deg,#e0f2fe,#bae6fd); } .sc-icon.red { background:linear-gradient(135deg,#fee2e2,#fecaca); }
  .sc-trend { display:inline-flex; align-items:center; gap:3px; font-size:9px; font-weight:700; padding:2px 8px; border-radius:20px; }
  .sc-trend.orange { color:var(--accent-orange); background:#fff7ed; } .sc-trend.green { color:var(--accent-green); background:#f0fdf4; } .sc-trend.blue { color:var(--brand-blue); background:#eff6ff; } .sc-trend.sky { color:#0ea5e9; background:#f0f9ff; } .sc-trend.red { color:var(--accent-red); background:#fef2f2; }
  .sc-value { font-size:32px; font-weight:800; color:var(--brand-dark); letter-spacing:-1.5px; line-height:1; margin-bottom:5px; }
  .sc-value.red { color:var(--accent-red); }
  .sc-label { font-size:11.5px; font-weight:600; color:var(--text-sec); }
  .sc-progress { height:3px; background:var(--border); border-radius:3px; margin-top:10px; overflow:hidden; }
  .sc-progress-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }

  /* Charts */
  .charts-row { display:grid; grid-template-columns:1fr 300px; gap:14px; margin-bottom:20px; }
  .cc { background:#fff; border:1px solid var(--border); border-radius:20px; padding:20px; box-shadow:var(--shadow-sm); transition:var(--tr); }
  .cc:hover { box-shadow:var(--shadow-md); }
  .cc-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; flex-wrap:wrap; gap:8px; }
  .cc-title { font-size:14px; font-weight:700; color:var(--text-primary); }
  .cc-sub { font-size:11px; color:var(--text-muted); }
  .bar-chart { display:flex; align-items:flex-end; gap:10px; height:160px; padding:0 4px; }
  .bar-group { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; height:100%; }
  .bar-cols { flex:1; display:flex; align-items:flex-end; justify-content:center; gap:3px; width:100%; }
  .bar-total { border-radius:6px 6px 0 0; background:#e8f1fb; width:45%; transition:var(--tr); }
  .bar-appr  { border-radius:6px 6px 0 0; background:var(--brand-blue); width:45%; transition:var(--tr); }
  .bar-total:hover { background:#c7daf4; } .bar-appr:hover { opacity:0.85; }
  .bar-label { font-size:10px; font-weight:600; color:var(--text-muted); }
  .bar-legend { display:flex; align-items:center; gap:14px; font-size:11px; color:var(--text-sec); }
  .bar-legend-dot { width:9px; height:9px; border-radius:50%; display:inline-block; margin-right:4px; }

  /* Filter bar */
  .filter-bar { display:flex; align-items:center; gap:6px; }
  .filter-btn { font-size:12px; font-weight:600; padding:6px 14px; border-radius:10px; border:1.5px solid var(--border); background:#fff; color:var(--text-sec); cursor:pointer; font-family:inherit; transition:var(--tr); }
  .filter-btn.active { background:var(--brand-dark); color:#fff; border-color:var(--brand-dark); }
  .filter-btn:hover:not(.active) { border-color:var(--brand-blue); color:var(--brand-blue); }

  /* Period popup */
  .period-popup { position:absolute; top:46px; right:0; z-index:9999; width:300px; background:#fff; border-radius:16px; box-shadow:var(--shadow-lg); border:1px solid var(--border); padding:18px; animation:dropIn 0.18s ease; }
  .period-label { font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:5px; letter-spacing:0.5px; text-transform:uppercase; }
  .period-input { width:100%; padding:9px 12px; border:1.5px solid var(--border); border-radius:10px; font-size:13px; font-family:inherit; color:var(--text-primary); background:var(--bg-page); outline:none; transition:var(--tr); }
  .period-input:focus { border-color:var(--brand-blue); box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .period-input.err { border-color:#fca5a5; }
  .period-error { font-size:11px; color:var(--accent-red); margin-top:4px; }
  .period-footer { display:flex; align-items:center; justify-content:space-between; margin-top:14px; }
  .btn-reset { font-size:12px; font-weight:600; color:var(--text-sec); background:none; border:none; cursor:pointer; font-family:inherit; }
  .btn-reset:hover { color:var(--text-primary); }
  .btn-apply { font-size:12px; font-weight:700; padding:8px 18px; border-radius:10px; border:none; background:var(--brand-blue); color:#fff; cursor:pointer; font-family:inherit; transition:var(--tr); }
  .btn-apply:disabled { background:#a5c8f4; cursor:not-allowed; }
  .btn-apply:not(:disabled):hover { background:var(--brand-mid); }

  /* Table */
  .tbl-card { background:#fff; border:1px solid var(--border); border-radius:20px; box-shadow:var(--shadow-sm); overflow:visible; transition:var(--tr); margin-bottom:20px; }
  .tbl-card:hover { box-shadow:var(--shadow-md); }
  .tbl-hd { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:12px; }
  .tbl-hd-title { font-size:14px; font-weight:700; color:var(--text-primary); }
  .tbl-count { font-size:12px; color:var(--text-muted); }
  .tbl-cols { display:grid; grid-template-columns:120px 1fr 110px 145px 44px; padding:9px 22px; background:#f8fafc; border-bottom:1px solid var(--border); font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.8px; }
  .tbl-row { display:grid; grid-template-columns:120px 1fr 110px 145px 44px; align-items:center; padding:13px 22px; border-bottom:1px solid #f1f5f9; transition:background 0.18s; position:relative; }
  .tbl-row:last-child { border-bottom:none; }
  .tbl-row:hover { background:#f8fafc; }
  .row-ref  { font-size:13px; font-weight:700; color:var(--brand-blue); }
  .row-pass { display:flex; align-items:center; gap:8px; min-width:0; overflow:hidden; }
  .row-avatar { width:30px; height:30px; min-width:30px; border-radius:50%; background:#e0eaf8; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:var(--brand-blue); }
  .row-name { font-size:13px; font-weight:600; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .row-sub  { font-size:11px; color:var(--text-muted); margin-top:2px; }
  .row-date { font-size:12px; color:var(--text-sec); }
  .badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; padding:4px 10px; border-radius:20px; border:1px solid transparent; white-space:nowrap; }
  .bdot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

  /* ── Action menu dropdown ── */
  .am-wrap { position:relative; display:flex; align-items:center; justify-content:center; }
  .am-btn { width:32px; height:32px; border-radius:8px; background:none; border:1px solid transparent; color:var(--text-muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:var(--tr); }
  .am-btn:hover { background:#f0f5fb; border-color:var(--border); color:var(--brand-blue); }
  .am-drop { position:fixed; z-index:9999; width:195px; background:#fff; border-radius:14px; box-shadow:0 8px 40px rgba(13,43,94,0.18),0 2px 8px rgba(13,43,94,0.08); border:1px solid var(--border); overflow:hidden; animation:dropIn 0.18s ease; }
  .am-item { width:100%; display:flex; align-items:center; gap:9px; padding:11px 15px; background:none; border:none; font-size:13px; font-weight:500; font-family:inherit; text-align:left; cursor:pointer; color:var(--text-primary); transition:background 0.15s; white-space:nowrap; }
  .am-item:hover { background:#f0f5fb; }
  .am-item.am-blue:hover { background:#eff6ff; color:var(--brand-blue); }
  .am-item.am-green:hover { background:#f0fdf4; color:var(--accent-green); }
  .am-item.am-red { color:var(--accent-red); }
  .am-item.am-red:hover { background:#fef2f2; }
  .am-sep { height:1px; background:var(--border); margin:3px 0; }
  .am-disabled { padding:10px 15px; font-size:12px; color:var(--text-muted); font-style:italic; }

  /* Pagination */
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

  /* Detail Modal */
  .modal-ov { position:fixed; inset:0; z-index:100000; background:rgba(13,43,94,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  .modal-box { background:#fff; border-radius:24px; width:100%; max-width:520px; overflow:hidden; box-shadow:var(--shadow-lg); animation:slideUp 0.25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.97);}to{opacity:1;transform:none;} }
  .mh { background:linear-gradient(135deg,var(--brand-dark),var(--brand-mid)); padding:22px 24px; color:#fff; }
  .mh-row { display:flex; align-items:flex-start; justify-content:space-between; }
  .mh-label { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.5); font-weight:700; margin-bottom:4px; }
  .mh-title { font-size:20px; font-weight:800; }
  .mh-sub { font-size:13px; color:rgba(255,255,255,0.65); margin-top:2px; }
  .mh-close { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.14); border:none; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; flex-shrink:0; transition:var(--tr); }
  .mh-close:hover { background:rgba(255,255,255,0.26); transform:rotate(90deg); }
  .ms-bar { display:flex; align-items:center; gap:10px; padding:9px 24px; background:#f8fafc; border-bottom:1px solid var(--border); }
  .mb { padding:18px 24px; }
  .mb-row { display:flex; align-items:center; justify-content:space-between; padding:11px 0; border-bottom:1px solid #f1f5f9; }
  .mb-row:last-child { border-bottom:none; }
  .mb-lbl { font-size:11px; font-weight:600; color:var(--text-muted); }
  .mb-val  { font-size:13px; font-weight:700; color:var(--text-primary); text-align:right; max-width:62%; }
  .mb-note { display:flex; align-items:flex-start; gap:8px; background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; padding:10px 14px; margin-top:10px; font-size:12px; color:#c2410c; font-weight:500; }
  .mf-det { padding:14px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; }
  .btn-close-m { padding:9px 20px; font-size:13px; font-family:inherit; color:var(--text-sec); border:1px solid var(--border); border-radius:10px; background:#fff; cursor:pointer; transition:var(--tr); }
  .btn-close-m:hover { background:var(--bg-page); }

  .empty-state { padding:48px 22px; text-align:center; }
  .empty-icon { width:56px; height:56px; border-radius:16px; background:var(--bg-page); display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
  .empty-title { font-size:14px; font-weight:700; color:var(--text-primary); margin-bottom:4px; }
  .empty-sub { font-size:12px; color:var(--text-muted); }

  .toast { position:fixed; top:18px; right:18px; z-index:200000; background:var(--brand-dark); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); border-left:3px solid var(--brand-light); animation:toastIn 0.3s ease; pointer-events:none; }
  @keyframes toastIn { from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:none;} }
  .dash-footer { font-size:10px; color:var(--text-muted); text-align:center; padding:4px 0 10px; letter-spacing:1px; text-transform:uppercase; }

  /* Responsive */
  @media(max-width:1200px) { .stats-grid{grid-template-columns:repeat(3,1fr);} .charts-row{grid-template-columns:1fr;} }
  @media(max-width:960px) {
    .tbl-cols,.tbl-row { grid-template-columns:110px 1fr 140px 44px!important; }
    .col-date-h,.col-date-v { display:none; }
    .search-input { width:170px; }
  }
  @media(max-width:768px) {
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.drh-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .stats-grid{grid-template-columns:repeat(2,1fr);gap:12px;}.drc{padding:16px;}.drh{padding:0 16px;}
    .tbl-cols,.tbl-row{grid-template-columns:100px 1fr 44px!important;}
    .col-date-h,.col-date-v,.col-stat-h,.col-stat-v{display:none;}
  }
  @media(max-width:480px) {
    .stats-grid{grid-template-columns:1fr 1fr;gap:10px;}.sc-value{font-size:24px;}
    .search-wrap{display:none;}.drc{padding:12px;}
    .tbl-cols,.tbl-row{grid-template-columns:80px 1fr 44px!important;}
    .am-wrap{gap:2px;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-dashr-css")) {
  const tag = document.createElement("style"); tag.id="airops-dashr-css"; tag.textContent=dashCSS; document.head.appendChild(tag);
}

const STORAGE_KEY_R = "airops_responsable_form_v1";

const COUNTRIES = [
  { code:"TN", dial:"+216", flag:"🇹🇳", name:"Tunisie",         digits:8  },
  { code:"DZ", dial:"+213", flag:"🇩🇿", name:"Algérie",         digits:9  },
  { code:"MA", dial:"+212", flag:"🇲🇦", name:"Maroc",           digits:9  },
  { code:"FR", dial:"+33",  flag:"🇫🇷", name:"France",          digits:9  },
  { code:"DE", dial:"+49",  flag:"🇩🇪", name:"Allemagne",       digits:11 },
  { code:"GB", dial:"+44",  flag:"🇬🇧", name:"Royaume-Uni",     digits:10 },
  { code:"SA", dial:"+966", flag:"🇸🇦", name:"Arabie Saoudite", digits:9  },
  { code:"AE", dial:"+971", flag:"🇦🇪", name:"Émirats Arabes",  digits:9  },
  { code:"US", dial:"+1",   flag:"🇺🇸", name:"États-Unis",      digits:10 },
];

function isAlphaOnly(s) { return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(s); }

const barData = [
  { jour:"Lun", approuve:30, total:45 },{ jour:"Mar", approuve:50, total:65 },{ jour:"Mer", approuve:40, total:55 },
  { jour:"Jeu", approuve:70, total:85 },{ jour:"Ven", approuve:55, total:70 },{ jour:"Sam", approuve:35, total:50 },{ jour:"Dim", approuve:20, total:38 },
];

const statutCfg = {
  "EN ATTENTE": { bg:"#fff7ed", text:"#ea580c", dot:"#f97316", border:"#fed7aa" },
  "CONFIRMÉE":  { bg:"#f0fdf4", text:"#15803d", dot:"#22c55e", border:"#bbf7d0" },
  "EN COURS":   { bg:"#eff6ff", text:"#1d4ed8", dot:"#3b82f6", border:"#bfdbfe" },
  "ANNULÉE":    { bg:"#f1f5f9", text:"#64748b", dot:"#94a3b8", border:"#e2e8f0" },
  "REFUSÉE":    { bg:"#fef2f2", text:"#dc2626", dot:"#ef4444", border:"#fecaca" },
};

/* Unified navItems — same across ALL responsable pages */
const navItems = [
  { label:"Dashboard",         to:"/dashbordRES",      icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Notifications",     to:"/notificationR",    badge:3, icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label:"Ajouter Chauffeur", to:"/ajouterChauffeur", icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-1h10"/></svg> },
  { label:"Ajouter Passager",  to:"/ajouterPassager",  icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg> },
];

function getStoredRNom()   { try { const s=localStorage.getItem(STORAGE_KEY_R); return s?(JSON.parse(s).nom||""):""  ; } catch { return ""; } }
function getStoredRPhoto() { try { return localStorage.getItem("airops_responsable_photo_v1")||""; } catch { return ""; } }
function getInitials(nom)  { return (nom||"AM").trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"AM"; }

/* ── ActionMenu dropdown (click ⋮ → small menu) ── */
function ActionMenu({ demande, isOpen, onToggle, onAccept, onRefuse, onDetail, onAssign }) {
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top:0, left:0 });

  useEffect(() => {
    if (!isOpen) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: Math.max(0, rect.right - 195) });
    }
    const fn = e => {
      if (btnRef.current && !btnRef.current.contains(e.target) && dropRef.current && !dropRef.current.contains(e.target)) onToggle(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, onToggle]);

  const canAct = demande.statut==="EN ATTENTE";
  return (
    <div className="am-wrap">
      <button type="button" className="am-btn" ref={btnRef} onClick={e=>{ e.stopPropagation(); onToggle(isOpen?null:demande.ref); }}>
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
      </button>
      {isOpen && (
        <div className="am-drop" ref={dropRef} style={{ top:dropPos.top, left:dropPos.left }}>
          <button type="button" className="am-item am-blue" onClick={()=>{ onDetail(demande); onToggle(null); }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Voir le détail
          </button>
          {canAct ? (
            <>
              <div className="am-sep"/>
              <button type="button" className="am-item am-green" onClick={()=>{ onAccept(demande.ref); onToggle(null); }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Accepter (auto)
              </button>
              <div className="am-sep"/>
              <button type="button" className="am-item" style={{color:"#7c3aed"}} onClick={()=>{ onAssign(demande); onToggle(null); }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Affecter manuellement
              </button>
              <div className="am-sep"/>
              <button type="button" className="am-item am-red" onClick={()=>{ onRefuse(demande.ref); onToggle(null); }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                Refuser
              </button>
            </>
          ) : (
            <div className="am-disabled">Aucune action disponible</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── DetailModal ── */
function DetailModal({ demande, onClose }) {
  if (!demande) return null;
  const sc = statutCfg[demande.statut]||statutCfg["ANNULÉE"];
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div className="mh">
          <div className="mh-row">
            <div><p className="mh-label">DÉTAIL DE LA DEMANDE</p><p className="mh-title">{demande.ref}</p><p className="mh-sub">{demande.date} · {demande.heure}</p></div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="ms-bar"><span className="badge" style={{background:sc.bg,color:sc.text,borderColor:sc.border}}><span className="bdot" style={{background:sc.dot}}/>{demande.statut}</span></div>
        <div className="mb">
          {[{label:"Passager",value:demande.passager},{label:"Départ",value:demande.depart},{label:"Arrivée",value:demande.arrivee},{label:"Chauffeur",value:demande.chauffeur},{label:"Véhicule",value:demande.vehicule},{label:"Bagages",value:demande.bagage}].map(r=>(
            <div key={r.label} className="mb-row"><span className="mb-lbl">{r.label}</span><span className="mb-val">{r.value}</span></div>
          ))}
          {demande.note&&<div className="mb-note"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{flexShrink:0,marginTop:1}}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>{demande.note}</div>}
        </div>
        <div className="mf-det"><button type="button" className="btn-close-m" onClick={onClose}>Fermer</button></div>
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ total, page, perPage, onPage, onPerPage }) {
  const totalPages=Math.max(1,Math.ceil(total/perPage));
  const start=total===0?0:(page-1)*perPage+1; const end=Math.min(page*perPage,total);
  const getPages=()=>{
    if(totalPages<=7)return Array.from({length:totalPages},(_,i)=>i+1);
    const pages=[];
    for(let i=1;i<=totalPages;i++){
      if(i===1||i===totalPages||(i>=page-1&&i<=page+1))pages.push(i);
      else if(pages[pages.length-1]!=="…")pages.push("…");
    }
    return pages;
  };
  return (
    <div className="pagination">
      <div className="pag-left">
        <span className="pag-info">{total===0?"Aucun résultat":`${start}–${end} sur ${total}`}</span>
        <select className="pag-size" value={perPage} onChange={e=>{onPerPage(Number(e.target.value));onPage(1);}}>
          {[3,5,8,10].map(n=><option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
      <div className="pag-controls">
        <button type="button" className="pag-btn" disabled={page===1} onClick={()=>onPage(1)}>«</button>
        <button type="button" className="pag-btn" disabled={page===1} onClick={()=>onPage(page-1)}>‹</button>
        {getPages().map((p,i)=>p==="…"?<span key={`e${i}`} className="pag-ellipsis">…</span>:<button key={p} type="button" className={`pag-btn${page===p?" active":""}`} onClick={()=>onPage(p)}>{p}</button>)}
        <button type="button" className="pag-btn" disabled={page===totalPages} onClick={()=>onPage(page+1)}>›</button>
        <button type="button" className="pag-btn" disabled={page===totalPages} onClick={()=>onPage(totalPages)}>»</button>
      </div>
    </div>
  );
}

/* ── DonutChart ── */
function DonutChart({ demandes }) {
  const s={attente:demandes.filter(d=>d.statut==="EN ATTENTE").length,confirmees:demandes.filter(d=>d.statut==="CONFIRMÉE").length,encours:demandes.filter(d=>d.statut==="EN COURS").length,annulees:demandes.filter(d=>d.statut==="ANNULÉE"||d.statut==="REFUSÉE").length};
  const total=demandes.length; const r=50,cx=68,cy=68,circ=2*Math.PI*r;
  const segs=[{pct:total?s.attente/total:0,color:"#f97316",label:"En attente",count:s.attente},{pct:total?s.confirmees/total:0,color:"#16a34a",label:"Confirmées",count:s.confirmees},{pct:total?s.encours/total:0,color:"#2980e8",label:"En cours",count:s.encours},{pct:total?s.annulees/total:0,color:"#94a3b8",label:"Annulées",count:s.annulees}];
  let offset=0;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        {segs.map((s,i)=>{const dash=s.pct*circ;const gap=circ-dash;const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset*circ} style={{transform:"rotate(-90deg)",transformOrigin:`${cx}px ${cy}px`}}/>;offset+=s.pct;return el;})}
        <circle cx={cx} cy={cy} r={37} fill="white"/>
        <text x={cx} y={cx-3} textAnchor="middle" fontSize="21" fontWeight="800" fill="#0d2b5e">{total}</text>
        <text x={cx} y={cx+12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600" letterSpacing="1">TOTAL</text>
      </svg>
      <div style={{width:"100%",marginTop:14,display:"flex",flexDirection:"column",gap:7}}>
        {segs.map(s=>(
          <div key={s.label} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
            <span style={{color:"var(--text-sec)",flex:1}}>{s.label}</span>
            <span style={{fontWeight:700,color:"var(--text-primary)"}}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════ MAIN ══════════════════════════ */
export default function DashbordR() {
  const navigate = useNavigate();
  const [nom,   setNom]   = useState(getStoredRNom);
  const [photo, setPhoto] = useState(getStoredRPhoto);
  useEffect(()=>{ const fn=()=>{setNom(getStoredRNom());setPhoto(getStoredRPhoto());}; window.addEventListener("airops-responsable-update",fn); return()=>window.removeEventListener("airops-responsable-update",fn); },[]);

  // ── API state
  const [demandes,         setDemandes]         = useState([]);
  const [dashStats,        setDashStats]        = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [assignModal,      setAssignModal]       = useState(null); // demande to assign
  const [assignDrivers,    setAssignDrivers]     = useState([]);
  const [assignVehicles,   setAssignVehicles]    = useState([]);
  const [assignDriverId,   setAssignDriverId]    = useState("");
  const [assignVehicleId,  setAssignVehicleId]   = useState("");
  const [assignSubmitting, setAssignSubmitting]  = useState(false);
  const [collapsed,        setCollapsed]        = useState(false);
  const [sidebarMobile,    setSidebarMobile]    = useState(false);
  const [detailModal,      setDetailModal]      = useState(null);
  const [openMenu,         setOpenMenu]         = useState(null);
  const [search,           setSearch]           = useState("");
  const [searchTouched,    setSearchTouched]    = useState(false);
  const [activeFilter,     setActiveFilter]     = useState("Tout");
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [dateStart,        setDateStart]        = useState("");
  const [dateEnd,          setDateEnd]          = useState("");
  const [page,             setPage]             = useState(1);
  const [perPage,          setPerPage]          = useState(5);
  const [toast,            setToast]            = useState("");
  const [notifs,           setNotifs]           = useState([]);
  const [notifOpen,        setNotifOpen]        = useState(false);

  // ── Load data from API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [reqData, notifData, statsData] = await Promise.all([
        fetchRequests({ limit: 50 }),
        fetchNotifications({ limit: 20 }),
        fetchResponsableDashboard(),
      ]);
      setDemandes((reqData.data || []).map(mapRequest));
      setNotifs((notifData.data || []).map(n => ({
        id: n._id || n.id,
        type: n.type === "VALIDATION" ? "green" : n.type === "REJET" ? "red" : n.type === "MISSION" ? "blue" : "orange",
        emoji: n.type === "VALIDATION" ? "✅" : n.type === "REJET" ? "❌" : n.type === "MISSION" ? "🚗" : "⏳",
        title: n.message?.split(":")[0] || "Notification",
        sub: n.message || "",
        time: formatTimeAgo(n.createdAt),
        unread: !n.isRead,
        _id: n._id || n.id,
      })));
      setDashStats(statsData.stats || null);
    } catch {
      setToast("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const periodRef=useRef(null); const notifRef=useRef(null);
  const unreadCount=notifs.filter(n=>n.unread).length;

  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),2800);return()=>clearTimeout(t);},[toast]);
  useEffect(()=>{if(!showPeriodPicker)return;const fn=e=>{if(periodRef.current&&!periodRef.current.contains(e.target))setShowPeriodPicker(false);};document.addEventListener("mousedown",fn);return()=>document.removeEventListener("mousedown",fn);},[showPeriodPicker]);
  useEffect(()=>{if(!notifOpen)return;const fn=e=>{if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);};document.addEventListener("mousedown",fn);return()=>document.removeEventListener("mousedown",fn);},[notifOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifs(p => p.map(n => ({ ...n, unread: false })));
    } catch { /* silently fail */ }
  };

  // Open assign modal and fetch available drivers + vehicles
  const openAssignModal = async (demande) => {
    setAssignModal(demande);
    setAssignDriverId("");
    setAssignVehicleId("");
    try {
      const [drivers, vehicles] = await Promise.all([
        fetchAvailableDrivers(),
        fetchAvailableVehicles(),
      ]);
      setAssignDrivers(drivers);
      setAssignVehicles(vehicles);
    } catch { /* silently */ }
  };

  const handleAssignSubmit = async () => {
    if (!assignDriverId || !assignVehicleId) {
      setToast("Veuillez sélectionner un chauffeur et un véhicule.");
      return;
    }
    setAssignSubmitting(true);
    try {
      await assignRequest(assignModal._id, { driverId: assignDriverId, vehicleId: assignVehicleId });
      setDemandes(p => p.map(d => d.ref === assignModal.ref
        ? { ...d, statut: "CONFIRMÉE", chauffeur: assignDrivers.find(dr=>dr.id===assignDriverId)?.name || "Affecté", vehicule: assignVehicles.find(v=>v._id===assignVehicleId)?.name || "Véhicule" }
        : d
      ));
      setToast(`✓ Demande ${assignModal.ref} acceptée et affectée.`);
      setAssignModal(null);
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de l'affectation.");
    } finally { setAssignSubmitting(false); }
  };
  const searchError=searchTouched&&search.trim().length>50?"La recherche ne doit pas dépasser 50 caractères.":"";
  const periodError=activeFilter==="Période"&&dateStart&&dateEnd&&dateStart>dateEnd?"La date de début doit être avant la date de fin.":"";
  const handleAccept = async (ref) => {
    const d = demandes.find(x => x.ref === ref);
    if (!d) return;
    try {
      await approveRequest(d._id);
      setDemandes(p => p.map(x => x.ref === ref ? { ...x, statut: "CONFIRMÉE" } : x));
      setToast(`✓ Demande ${ref} confirmée.`);
    } catch { setToast(`Erreur lors de la confirmation de ${ref}.`); }
  };
  const handleRefuse = async (ref) => {
    const d = demandes.find(x => x.ref === ref);
    if (!d) return;
    try {
      await rejectRequest(d._id);
      setDemandes(p => p.map(x => x.ref === ref ? { ...x, statut: "REFUSÉE" } : x));
      setToast(`Demande ${ref} refusée.`);
    } catch { setToast(`Erreur lors du refus de ${ref}.`); }
  };

  const filtered=useMemo(()=>demandes.filter(d=>{
    if(search.trim()&&!searchError){const q=search.trim().toLowerCase();if(![d.ref,d.passager,d.depart,d.arrivee,d.trajet,d.statut].join(" ").toLowerCase().includes(q))return false;}
    if(activeFilter==="24H")return d.date==="2024-10-12";
    if(activeFilter==="48H")return["2024-10-12","2024-10-13"].includes(d.date);
    if(activeFilter==="Période"){if(!dateStart&&!dateEnd)return true;if(periodError)return true;return(dateStart?d.date>=dateStart:true)&&(dateEnd?d.date<=dateEnd:true);}
    return true;
  }),[demandes,search,searchError,activeFilter,dateStart,dateEnd,periodError]);

  useEffect(()=>{setPage(1);},[search,activeFilter,dateStart,dateEnd]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/perPage));
  const safePage=Math.min(page,totalPages);
  const paginated=filtered.slice((safePage-1)*perPage,safePage*perPage);

  const widgets=useMemo(()=>{
    if (dashStats) return {
      attente: dashStats.pendingRequests ?? 0,
      confirmees: demandes.filter(d=>d.statut==="CONFIRMÉE").length,
      missionsJour: dashStats.missionsToday ?? 0,
      vehicules: dashStats.availableVehicles ?? 0,
      alerts: dashStats.alerts ?? 0,
    };
    return {
      attente:demandes.filter(d=>d.statut==="EN ATTENTE").length,
      confirmees:demandes.filter(d=>d.statut==="CONFIRMÉE").length,
      missionsJour:0,
      vehicules:0,
      alerts:demandes.filter(d=>d.statut==="ANNULÉE"||d.statut==="REFUSÉE").length,
    };
  },[demandes,dashStats]);

  const prenom=nom.split(" ")[0]||"Ahmed";
  const initials=getInitials(nom);

  const progressColors={orange:"var(--accent-orange)",green:"var(--accent-green)",blue:"var(--brand-blue)",sky:"#0ea5e9",red:"var(--accent-red)"};
  const statCards=[
    { label:"Demandes en attente", value:widgets.attente,      tag:"En attente",  color:"orange", trend:"⏳", progress:Math.min(100,(widgets.attente/8)*100),
      icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { label:"Confirmées",          value:widgets.confirmees,   tag:"Confirmées",  color:"green",  trend:"✓",  progress:Math.min(100,(widgets.confirmees/8)*100),
      icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { label:"Missions du jour",    value:widgets.missionsJour, tag:"Aujourd'hui", color:"blue",   trend:"↑",  progress:Math.min(100,(widgets.missionsJour/8)*100),
      icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    { label:"Véhicules dispo.",    value:widgets.vehicules,    tag:"Véhicules",   color:"sky",    trend:"🚗",  progress:Math.min(100,(widgets.vehicules/15)*100),
      icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-1h10m-6-3l2-6h3l3 6"/></svg> },
    { label:"Alertes",             value:widgets.alerts,       tag:"Alertes",     color:"red",    trend:"⚠",  progress:Math.min(100,(widgets.alerts/5)*100), red:true,
      icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> },
  ];

  return (
    <div className="drw">
      {sidebarMobile&&<div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

      {/* Sidebar */}
      <aside className={["sidebar",collapsed?"collapsed":"",sidebarMobile?"open":""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={()=>setCollapsed(v=>!v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={()=>navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE RESPONSABLE</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`sb-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.badge&&<span className="sb-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{paddingTop:0}}>Compte</div>
          <button type="button" className="sb-logout" onClick={()=>navigate("/login")}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="drm">
        <header className="drh">
          <div className="drh-left">
            <button type="button" className="drh-menu-btn" onClick={()=>setSidebarMobile(v=>!v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="drh-title">Tableau de bord</span>
          </div>
          <div className="drh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className={`search-input${searchError?" error":""}`} placeholder="Rechercher une demande…" value={search} onChange={e=>setSearch(e.target.value)} onBlur={()=>setSearchTouched(true)}/>
              {searchError&&<p className="search-error">{searchError}</p>}
            </div>
            {/* Notification bell */}
            <div className="notif-wrap" ref={notifRef}>
              <button type="button" className="notif-btn" onClick={()=>setNotifOpen(v=>!v)}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                {unreadCount>0&&<span className="notif-badge">{unreadCount}</span>}
              </button>
              {notifOpen&&(
                <div className="notif-dropdown">
                  <div className="notif-drop-hd">
                    <span className="notif-drop-title">Notifications {unreadCount>0&&`(${unreadCount})`}</span>
                    {unreadCount>0&&<button type="button" className="notif-drop-mark" onClick={handleMarkAllRead}>Tout marquer lu</button>}
                  </div>
                  <div className="notif-list">
                    {notifs.map(n=>(
                      <div key={n.id} className={`notif-item${n.unread?" unread":""}`}
                        onClick={()=>{setNotifs(p=>p.map(x=>x.id===n.id?{...x,unread:false}:x));navigate("/notificationR");setNotifOpen(false);}}>
                        <div className={`notif-icon-wrap ${n.type}`}>{n.emoji}</div>
                        <div className="notif-content">
                          <div className="notif-title-text">{n.title}</div>
                          <div className="notif-sub-text">{n.sub}</div>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                          <span className="notif-time">{n.time}</span>
                          {n.unread&&<span className="notif-unread-dot"/>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notif-drop-ft">
                    <button type="button" className="notif-drop-all" onClick={()=>{navigate("/notificationR");setNotifOpen(false);}}>Voir toutes les notifications →</button>
                  </div>
                </div>
              )}
            </div>
            <div className="user-chip">
              <span className="user-name">{nom}</span>
              <div className="user-avatar">{photo?<img src={photo} alt="profil"/>:initials}</div>
            </div>
          </div>
        </header>

        <main className="drc">
          <h1 className="welcome-title">Bienvenue, <span>{prenom}</span> 👋</h1>
          <p className="welcome-sub">Voici l'état actuel des demandes de transport et des ressources disponibles.</p>

          {/* Professional Widgets */}
          <div className="stats-grid">
            {statCards.map(s=>(
              <div key={s.label} className={`sc ${s.color}`}>
                <div className="sc-top">
                  <div className={`sc-icon ${s.color}`}>{s.icon}</div>
                  <span className={`sc-trend ${s.color}`}>{s.trend}</span>
                </div>
                <div className={`sc-value${s.red?" red":""}`}>{s.value}</div>
                <div className="sc-label">{s.label}</div>
                <div className="sc-progress">
                  <div className="sc-progress-fill" style={{width:`${s.progress}%`,background:progressColors[s.color]}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="charts-row">
            <div className="cc">
              <div className="cc-hd">
                <div><div className="cc-title">Statistiques des demandes</div><div className="cc-sub">Volume hebdomadaire</div></div>
                <div className="bar-legend">
                  <span><span className="bar-legend-dot" style={{background:"var(--brand-blue)"}}/>Approuvées</span>
                  <span><span className="bar-legend-dot" style={{background:"#e8f1fb"}}/>Total</span>
                </div>
              </div>
              <div className="bar-chart">
                {barData.map(b=>(
                  <div key={b.jour} className="bar-group">
                    <div className="bar-cols">
                      <div className="bar-total" style={{height:`${b.total}%`}}/>
                      <div className="bar-appr"  style={{height:`${b.approuve}%`}}/>
                    </div>
                    <span className="bar-label">{b.jour}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="cc">
              <div className="cc-hd"><div className="cc-title">Répartition statuts</div></div>
              <DonutChart demandes={demandes}/>
            </div>
          </div>

          <div className="tbl-card">
            <div className="tbl-hd">
              <span className="tbl-hd-title">Liste des demandes <span className="tbl-count">({filtered.length})</span></span>
              <div style={{position:"relative"}} ref={periodRef}>
                <div className="filter-bar">
                  {["Tout","24H","48H","Période"].map(f=>(
                    <button key={f} type="button" className={`filter-btn${activeFilter===f?" active":""}`}
                      onClick={()=>{setActiveFilter(f);setShowPeriodPicker(f==="Période");setPage(1);}}>
                      {f}
                    </button>
                  ))}
                </div>
                {showPeriodPicker&&activeFilter==="Période"&&(
                  <div className="period-popup">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                      <span style={{fontSize:13,fontWeight:700,color:"var(--text-primary)"}}>Choisir une période</span>
                      <button type="button" style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",fontSize:16}} onClick={()=>setShowPeriodPicker(false)}>✕</button>
                    </div>
                    <div style={{marginBottom:12}}><p className="period-label">Date début</p><input type="date" className={`period-input${periodError?" err":""}`} value={dateStart} onChange={e=>setDateStart(e.target.value)}/></div>
                    <div style={{marginBottom:4}}><p className="period-label">Date fin</p><input type="date" className={`period-input${periodError?" err":""}`} value={dateEnd} onChange={e=>setDateEnd(e.target.value)}/></div>
                    {periodError&&<p className="period-error">{periodError}</p>}
                    <div className="period-footer">
                      <button type="button" className="btn-reset" onClick={()=>{setDateStart("");setDateEnd("");}}>Réinitialiser</button>
                      <button type="button" className="btn-apply" disabled={!!periodError} onClick={()=>{if(!periodError){setShowPeriodPicker(false);setToast("Filtre période appliqué.");}}}>Appliquer</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="tbl-cols">
              <span>Référence</span><span>Passager</span>
              <span className="col-date-h">Date</span>
              <span className="col-stat-h">Statut</span>
              <span style={{textAlign:"center"}}>Actions</span>
            </div>

            {paginated.length===0?(
              <div className="empty-state">
                <div className="empty-icon"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div>
                <p className="empty-title">Aucune demande trouvée</p>
                <p className="empty-sub">Essayez un autre filtre ou une autre recherche.</p>
              </div>
            ):paginated.map(d=>{
              const sc=statutCfg[d.statut]||statutCfg["ANNULÉE"];
              return (
                <div key={d.ref} className="tbl-row">
                  <span className="row-ref">{d.ref}</span>
                  <div className="row-pass">
                    <div className="row-avatar">{d.avatar}</div>
                    <div style={{minWidth:0}}>
                      <div className="row-name">{d.passager}</div>
                      <div className="row-sub">{d.trajet}</div>
                    </div>
                  </div>
                  <span className="row-date col-date-v">{d.date}</span>
                  <div className="col-stat-v">
                    <span className="badge" style={{background:sc.bg,color:sc.text,borderColor:sc.border}}>
                      <span className="bdot" style={{background:sc.dot}}/>{d.statut}
                    </span>
                  </div>
                  <ActionMenu demande={d} isOpen={openMenu===d.ref} onToggle={setOpenMenu} onAccept={handleAccept} onRefuse={handleRefuse} onDetail={setDetailModal} onAssign={openAssignModal}/>
                </div>
              );
            })}
            <Pagination total={filtered.length} page={safePage} perPage={perPage} onPage={setPage} onPerPage={setPerPage}/>
          </div>

          <div className="dash-footer">© 2026 AirOps – Gestion Transport Responsable</div>
        </main>
      </div>

      {detailModal&&<DetailModal demande={detailModal} onClose={()=>setDetailModal(null)}/>}

      {/* ── Modal Affectation Manuelle ── */}
      {assignModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(4px)"}}
          onClick={()=>setAssignModal(null)}>
          <div style={{background:"#fff",borderRadius:20,padding:28,width:460,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(13,43,94,0.25)"}}
            onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h3 style={{fontSize:16,fontWeight:800,color:"#0d2b5e",margin:0}}>Affectation manuelle</h3>
                <p style={{fontSize:12,color:"#94a3b8",marginTop:4}}>{assignModal.ref} — {assignModal.trajet}</p>
              </div>
              <button type="button" onClick={()=>setAssignModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",padding:4}}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Chauffeur */}
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#5a6e88",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.8px"}}>
                Chauffeur disponible
              </label>
              {assignDrivers.length === 0
                ? <p style={{fontSize:13,color:"#ef4444",padding:"10px 14px",background:"#fef2f2",borderRadius:8}}>Aucun chauffeur disponible</p>
                : <select value={assignDriverId} onChange={e=>setAssignDriverId(e.target.value)}
                    style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #e4ecf4",fontFamily:"inherit",fontSize:13,color:"#0d2b5e",outline:"none",appearance:"auto"}}>
                    <option value="">— Sélectionner un chauffeur —</option>
                    {assignDrivers.map(d=>(
                      <option key={d.id||d._id} value={d.id||d._id}>{d.name}</option>
                    ))}
                  </select>
              }
            </div>

            {/* Véhicule */}
            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:"#5a6e88",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.8px"}}>
                Véhicule disponible
              </label>
              {assignVehicles.length === 0
                ? <p style={{fontSize:13,color:"#ef4444",padding:"10px 14px",background:"#fef2f2",borderRadius:8}}>Aucun véhicule disponible</p>
                : <select value={assignVehicleId} onChange={e=>setAssignVehicleId(e.target.value)}
                    style={{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #e4ecf4",fontFamily:"inherit",fontSize:13,color:"#0d2b5e",outline:"none",appearance:"auto"}}>
                    <option value="">— Sélectionner un véhicule —</option>
                    {assignVehicles.map(v=>(
                      <option key={v._id||v.id} value={v._id||v.id}>{v.name} (capacité: {v.capacity})</option>
                    ))}
                  </select>
              }
            </div>

            <div style={{display:"flex",gap:10}}>
              <button type="button" onClick={()=>setAssignModal(null)}
                style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid #e4ecf4",background:"#f8fafc",color:"#5a6e88",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
                Annuler
              </button>
              <button type="button" onClick={handleAssignSubmit}
                disabled={assignSubmitting || !assignDriverId || !assignVehicleId}
                style={{flex:2,padding:"11px",borderRadius:10,border:"none",
                  background: !assignDriverId||!assignVehicleId ? "#e4ecf4" : "linear-gradient(135deg,#2980e8,#1252aa)",
                  color: !assignDriverId||!assignVehicleId ? "#94a3b8" : "#fff",
                  fontWeight:700,fontSize:13,cursor: !assignDriverId||!assignVehicleId ? "not-allowed" : "pointer",fontFamily:"inherit"}}>
                {assignSubmitting ? "Affectation…" : "✓ Confirmer l'affectation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  );
}