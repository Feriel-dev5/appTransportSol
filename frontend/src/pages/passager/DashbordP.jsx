import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProfileSync } from "./useProfileSync";

const dashCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand-dark:   #0d2b5e;
    --brand-mid:    #1252aa;
    --brand-blue:   #2980e8;
    --brand-light:  #7ec8ff;
    --accent-orange:#f97316;
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

  .dw { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

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
  .sb-badge { background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; flex-shrink: 0; transition: opacity 0.2s; }
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

  .dm { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .dh { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .dh-left  { display: flex; align-items: center; gap: 12px; }
  .dh-right { display: flex; align-items: center; gap: 10px; }
  .dh-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .dh-menu-btn:hover { background: var(--bg-page); color: var(--text-primary); }
  .dh-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  .search-input { width: 230px; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 22px; background: var(--bg-page); font-size: 13px; font-family: inherit; color: var(--text-primary); outline: none; transition: var(--tr); }
  .search-input:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color: var(--text-muted); }

  .notif-btn { position: relative; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 8px; border-radius: 10px; transition: var(--tr); }
  .notif-btn:hover { background: var(--bg-page); color: var(--brand-blue); }
  .notif-dot { position: absolute; top: 6px; right: 6px; width: 7px; height: 7px; background: #ef4444; border-radius: 50%; border: 1.5px solid #fff; }

  /* ── Avatar header synchronisé ── */
  .user-chip { display: flex; align-items: center; gap: 9px; cursor: default; }
  .user-info-r { text-align: right; }
  .user-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .user-role { font-size: 11px; color: var(--text-muted); }
  .user-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid));
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px; font-weight: 700;
    box-shadow: 0 3px 10px rgba(41,128,232,0.35);
    border: 2.5px solid rgba(41,128,232,0.2); flex-shrink: 0;
    overflow: hidden;
  }
  .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .dc { flex: 1; overflow-y: auto; padding: 26px; }
  .welcome-title { font-size: 25px; font-weight: 800; color: var(--brand-dark); letter-spacing: -0.5px; margin-bottom: 4px; }
  .welcome-title span { color: var(--brand-blue); }
  .welcome-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }

  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
  .sc { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: var(--shadow-sm); transition: var(--tr); position: relative; overflow: hidden; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 20px 20px 0 0; }
  .sc.orange::before { background: var(--accent-orange); } .sc.green::before { background: var(--accent-green); } .sc.blue::before { background: var(--brand-blue); } .sc.red::before { background: var(--accent-red); }
  .sc:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
  .sc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sc-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
  .sc-icon.orange { background: #fff7ed; } .sc-icon.green { background: #f0fdf4; } .sc-icon.blue { background: #eff6ff; } .sc-icon.red { background: #fef2f2; }
  .sc-tag { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
  .sc-tag.orange { color: var(--accent-orange); background: #fff7ed; } .sc-tag.green { color: var(--accent-green); background: #f0fdf4; } .sc-tag.blue { color: var(--brand-blue); background: #eff6ff; } .sc-tag.red { color: var(--accent-red); background: #fef2f2; }
  .sc-value { font-size: 30px; font-weight: 800; color: var(--brand-dark); letter-spacing: -1px; }
  .sc-label { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

  .charts-row { display: grid; grid-template-columns: 1fr 300px; gap: 14px; margin-bottom: 20px; }
  .cc { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: var(--shadow-sm); transition: var(--tr); }
  .cc:hover { box-shadow: var(--shadow-md); }
  .cc-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .cc-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .cc-period { font-size: 11px; color: var(--text-sec); border: 1px solid var(--border); border-radius: 8px; padding: 5px 11px; background: #fff; cursor: pointer; font-family: inherit; transition: var(--tr); }
  .cc-period:hover { border-color: var(--brand-blue); color: var(--brand-blue); }
  .donut-wrap { display: flex; flex-direction: column; align-items: center; }
  .donut-legend { width: 100%; margin-top: 14px; display: flex; flex-direction: column; gap: 7px; }
  .dl-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .dl-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .dl-lbl  { color: var(--text-sec); flex: 1; }
  .dl-val  { font-weight: 700; color: var(--text-primary); }

  .tbl-card { background: #fff; border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-sm); overflow: visible; transition: var(--tr); margin-bottom: 20px; }
  .tbl-card:hover { box-shadow: var(--shadow-md); }
  .tbl-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1px solid var(--border); }
  .tbl-hd-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .tbl-count { font-size: 12px; color: var(--text-muted); }
  .tbl-cols { display: grid; grid-template-columns: 120px 1fr 110px 145px 52px; padding: 9px 22px; background: #f8fafc; border-bottom: 1px solid var(--border); font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; }
  .tbl-row { display: grid; grid-template-columns: 120px 1fr 110px 145px 52px; align-items: center; padding: 13px 22px; border-bottom: 1px solid #f1f5f9; transition: background 0.18s; position: relative; }
  .tbl-row:last-child { border-bottom: none; }
  .tbl-row:hover { background: #f8fafc; }
  .row-ref  { font-size: 13px; font-weight: 700; color: var(--brand-blue); }
  .row-traj { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
  .row-vers { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .row-date { font-size: 12px; color: var(--text-sec); }
  .badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid transparent; white-space: nowrap; }
  .bdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px; border-radius: 0 0 20px 20px; }
  .pag-info { font-size: 12px; color: var(--text-muted); }
  .pag-left { display: flex; align-items: center; gap: 10px; }
  .pag-controls { display: flex; align-items: center; gap: 3px; }
  .pag-btn { min-width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #fff; color: var(--text-sec); font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: inherit; transition: var(--tr); padding: 0 7px; }
  .pag-btn:hover:not(:disabled) { border-color: var(--brand-blue); color: var(--brand-blue); background: #eff6ff; }
  .pag-btn:disabled { opacity: 0.35; cursor: default; }
  .pag-btn.active { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); box-shadow: 0 2px 8px rgba(41,128,232,0.3); }
  .pag-ellipsis { color: var(--text-muted); font-size: 13px; padding: 0 3px; user-select: none; }
  .pag-size { height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #fff; color: var(--text-sec); font-size: 12px; font-family: inherit; padding: 0 8px; cursor: pointer; outline: none; transition: var(--tr); }
  .pag-size:focus { border-color: var(--brand-blue); }

  .am-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
  .am-btn { width: 32px; height: 32px; border-radius: 8px; background: none; border: 1px solid transparent; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--tr); }
  .am-btn:hover { background: #f0f5fb; border-color: var(--border); color: var(--brand-blue); }
  .am-drop { position: absolute; right: 0; top: 38px; z-index: 9999; width: 195px; background: #fff; border-radius: 14px; box-shadow: 0 8px 40px rgba(13,43,94,0.18), 0 2px 8px rgba(13,43,94,0.08); border: 1px solid var(--border); overflow: hidden; animation: dropIn 0.18s ease; }
  @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: none; } }
  .am-item { width: 100%; display: flex; align-items: center; gap: 9px; padding: 11px 15px; background: none; border: none; font-size: 13px; font-weight: 500; font-family: inherit; text-align: left; cursor: pointer; color: var(--text-primary); transition: background 0.15s; white-space: nowrap; }
  .am-item:hover { background: #f0f5fb; }
  .am-item.am-blue:hover { background: #eff6ff; color: var(--brand-blue); }
  .am-item.am-red { color: var(--accent-red); }
  .am-item.am-red:hover { background: #fef2f2; }
  .am-sep { height: 1px; background: var(--border); margin: 3px 0; }

  .modal-ov { position: fixed; inset: 0; z-index: 100; background: rgba(13,43,94,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-box { background: #fff; border-radius: 24px; width: 100%; max-width: 480px; overflow: hidden; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }
  .modal-box.wide { max-width: 560px; }
  .mh { background: linear-gradient(135deg, var(--brand-dark), var(--brand-mid)); padding: 22px 24px; color: #fff; }
  .mh-row { display: flex; align-items: flex-start; justify-content: space-between; }
  .mh-label { font-size: 10px; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); font-weight: 700; margin-bottom: 4px; }
  .mh-ref   { font-size: 22px; font-weight: 800; }
  .mh-traj  { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .mh-close { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.14); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; flex-shrink: 0; transition: var(--tr); }
  .mh-close:hover { background: rgba(255,255,255,0.26); transform: rotate(90deg); }
  .ms-bar { display: flex; align-items: center; gap: 10px; padding: 9px 24px; background: #f8fafc; border-bottom: 1px solid var(--border); }
  .ms-date { margin-left: auto; font-size: 12px; color: var(--text-muted); }
  .mb { padding: 18px 24px; }
  .mb-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f1f5f9; }
  .mb-row:last-child { border-bottom: none; }
  .mb-lbl { font-size: 11px; font-weight: 600; color: var(--text-muted); }
  .mb-val  { font-size: 13px; font-weight: 700; color: var(--text-primary); text-align: right; max-width: 62%; }
  .mf { padding: 14px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
  .btn-close-m { padding: 9px 20px; font-size: 13px; font-family: inherit; color: var(--text-sec); border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer; transition: var(--tr); }
  .btn-close-m:hover { background: var(--bg-page); }
  .edit-grid { padding: 18px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-height: 65vh; overflow-y: auto; }
  .ef { display: flex; flex-direction: column; gap: 5px; }
  .ef.full { grid-column: 1 / -1; }
  .ef-lbl { font-size: 10.5px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .ef-input { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; transition: var(--tr); }
  .ef-input:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .ef-sel { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; cursor: pointer; transition: var(--tr); -webkit-appearance: auto; }
  .ef-sel:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .ef-note { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 10px 14px; font-size: 12px; color: var(--brand-mid); font-weight: 500; }
  .edit-actions { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid var(--border); }
  .btn-cancel-e { padding: 10px 20px; font-size: 13px; font-family: inherit; color: var(--text-sec); border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer; transition: var(--tr); }
  .btn-cancel-e:hover { background: var(--bg-page); }
  .btn-save-e { padding: 10px 24px; font-size: 13px; font-weight: 700; font-family: inherit; color: #fff; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--brand-blue), #1a6fd4); cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); }
  .btn-save-e:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }

  .fab { position: fixed; bottom: 22px; right: 22px; width: 50px; height: 50px; background: linear-gradient(135deg, var(--brand-blue), #1a6fd4); color: #fff; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 40; box-shadow: 0 6px 20px rgba(41,128,232,0.45); transition: var(--tr); }
  .fab:hover  { transform: scale(1.1) translateY(-2px); box-shadow: 0 10px 28px rgba(41,128,232,0.55); }
  .fab:active { transform: scale(0.96); }

  .toast { position: fixed; top: 18px; right: 18px; z-index: 200; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }

  .dash-footer { font-size: 10px; color: var(--text-muted); text-align: center; padding: 4px 0 10px; letter-spacing: 1px; text-transform: uppercase; }

  @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(2,1fr); } .charts-row { grid-template-columns: 1fr; } }
  @media (max-width: 960px) { .tbl-cols, .tbl-row { grid-template-columns: 110px 1fr 140px 52px; } .col-date-h, .col-date-v { display: none; } .search-input { width: 170px; } }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open { transform: translateX(0); } .sidebar.collapsed { transform: translateX(-100%); } .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; } .dh-menu-btn { display: flex; } .sb-toggle-btn { display: none; }
    .stats-grid { grid-template-columns: repeat(2,1fr); gap: 12px; } .dc { padding: 16px; } .dh { padding: 0 16px; }
    .tbl-cols, .tbl-row { grid-template-columns: 100px 1fr 52px; } .col-date-h, .col-date-v, .col-stat-h, .col-stat-v { display: none; }
  }
  @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; } .sc-value { font-size: 24px; } .search-wrap { display: none; } .user-info-r { display: none; } .dc { padding: 12px; } .tbl-cols, .tbl-row { grid-template-columns: 85px 1fr 44px; } .edit-grid { grid-template-columns: 1fr; } .ef.full { grid-column: 1; } .ef-note { grid-column: 1; } .pagination { flex-direction: column; align-items: flex-start; } }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-dash-css")) {
  const tag = document.createElement("style");
  tag.id = "airops-dash-css";
  tag.textContent = dashCSS;
  document.head.appendChild(tag);
}

const STORAGE_KEY = "airops_demandes_v2";

const initialDemandes = [
  { ref: "#DEM-1021", trajet: "Tunis → Sfax",       vers: "Aéroport Tunis-Carthage (TUN)",           date: "2026-10-01", statut: "EN ATTENTE", detail: { passager: "Ahmed Ben Ali", depart: "Aéroport Tunis-Carthage (TUN)",           arrivee: "Hôtel Les Oliviers Palace (Sfax)",    heure: "09:00" } },
  { ref: "#DEM-1022", trajet: "Sousse → Tunis",      vers: "Hôtel El Ksar Sousse",                    date: "2026-10-08", statut: "VALIDÉE",    detail: { passager: "Ahmed Ben Ali", depart: "Hôtel El Ksar Sousse",                    arrivee: "Aéroport Tunis-Carthage (TUN)",       heure: "14:00" } },
  { ref: "#DEM-1023", trajet: "Monastir → Hammamet", vers: "Aéroport Monastir Habib Bourguiba (MIR)", date: "2026-10-15", statut: "EN COURS",   detail: { passager: "Ahmed Ben Ali", depart: "Aéroport Monastir Habib Bourguiba (MIR)", arrivee: "Hôtel Hasdrubal Thalassa (Hammamet)", heure: "17:30" } },
  { ref: "#DEM-1024", trajet: "Tunis → Bizerte",     vers: "Hôtel Africa Meridien (Tunis Centre)",    date: "2026-10-22", statut: "REFUSÉE",    detail: { passager: "Ahmed Ben Ali", depart: "Hôtel Africa Meridien (Tunis Centre)",    arrivee: "Hôtel Bizerta Resort",                heure: "08:00" } },
  { ref: "#DEM-1025", trajet: "Djerba → Tunis",      vers: "Aéroport Djerba-Zarzis (DJE)",            date: "2026-10-29", statut: "VALIDÉE",    detail: { passager: "Ahmed Ben Ali", depart: "Aéroport Djerba-Zarzis (DJE)",            arrivee: "Hôtel Africa Meridien (Tunis Centre)", heure: "11:45" } },
  { ref: "#DEM-1026", trajet: "Nabeul → Tunis",      vers: "Hôtel Nabeul Beach",                      date: "2026-11-03", statut: "EN ATTENTE", detail: { passager: "Ahmed Ben Ali", depart: "Hôtel Nabeul Beach",                      arrivee: "Hôtel Africa Meridien (Tunis Centre)", heure: "13:20" } },
  { ref: "#DEM-1027", trajet: "Tunis → Tozeur",      vers: "Aéroport Tunis-Carthage (TUN)",           date: "2026-11-10", statut: "VALIDÉE",    detail: { passager: "Ahmed Ben Ali", depart: "Aéroport Tunis-Carthage (TUN)",           arrivee: "Hôtel Yadis Dunes (Tozeur)",           heure: "06:30" } },
  { ref: "#DEM-1028", trajet: "Sfax → Mahdia",       vers: "Hôtel Les Oliviers Palace (Sfax)",         date: "2026-11-17", statut: "EN ATTENTE", detail: { passager: "Ahmed Ben Ali", depart: "Hôtel Les Oliviers Palace (Sfax)",         arrivee: "Club Palmeraie (Mahdia)",               heure: "10:15" } },
];

const statutCfg = {
  "EN ATTENTE": { bg: "#fff7ed", text: "#ea580c", dot: "#f97316", border: "#fed7aa" },
  "VALIDÉE":    { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  "EN COURS":   { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe" },
  "REFUSÉE":    { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444", border: "#fecaca" },
  "ANNULÉE":    { bg: "#f1f5f9", text: "#64748b", dot: "#94a3b8", border: "#e2e8f0" },
};

const AIRPORTS_TN = ["Aéroport Tunis-Carthage (TUN)","Aéroport Monastir Habib Bourguiba (MIR)","Aéroport Djerba-Zarzis (DJE)","Aéroport Sfax-Thyna (SFA)","Aéroport Tozeur-Nefta (TOE)","Aéroport Tabarka-Aïn Draham (TBJ)","Aéroport Gafsa-Ksar (GAF)"];
const HOTELS_TN = ["The Residence Tunis (La Marsa)","Hôtel Africa Meridien (Tunis Centre)","Hôtel El Mouradi Africa (Tunis)","Hôtel Les Berges du Lac (Tunis)","Golden Tulip El Mechtel (Tunis)","Hôtel Hasdrubal Thalassa (Hammamet)","One Resort Aqua Park & Spa (Hammamet)","Hôtel Riu Palace Hammamet","Hôtel El Ksar Sousse","Marhaba Palace (Sousse)","Hôtel Royal Jinene (Sousse)","Hôtel Iberostar Selection Kuriat Palace (Monastir)","Club Med Djerba la Douce","Hôtel Radisson Blu Palace Resort (Djerba)","Hôtel Hasdrubal Prestige (Djerba)","Hôtel Djerba Plaza Thalassa & Spa","Hôtel Dar Horchani (Tozeur)","Hôtel Yadis Dunes (Tozeur)","Hôtel Mehari Tabarka","Hôtel Les Oliviers Palace (Sfax)","Hôtel Thyna (Sfax)","Hôtel Nabeul Beach","Hôtel Aqua Palace (Nabeul)","Club Palmeraie (Mahdia)","Hôtel Iberostar Averroes (Mahdia)","Hôtel Bizerta Resort"];
const LOCATION_OPTIONS = [{ group: "✈️ Aéroports", items: AIRPORTS_TN },{ group: "🏨 Hôtels", items: HOTELS_TN }];

const navItems = [
  { label: "Tableau de bord",  to: "/dashbordP",     icon: <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label: "Réserver demande", to: "/reserverD",     icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> },
  { label: "Notifications",    to: "/notificationP", badge: 2, icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label: "Profile",          to: "/profilP",       icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

const linePath = "M0,90 C30,85 60,80 90,70 C120,60 140,40 170,38 C200,36 220,55 250,52 C280,49 300,60 330,55 C360,50 390,20 420,10";

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function LocationSelect({ value, onChange, placeholder }) {
  return (
    <select className="ef-sel" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder || "Choisir un lieu…"}</option>
      {LOCATION_OPTIONS.map(group => (
        <optgroup key={group.group} label={group.group}>
          {group.items.map(item => <option key={item} value={item}>{item}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

function DonutChart({ total, stats }) {
  const r = 50; const cx = 68; const cy = 68;
  const circ = 2 * Math.PI * r;
  const segs = [
    { pct: total ? stats.encours  / total : 0, color: "#2980e8", label: "En cours",   count: stats.encours  },
    { pct: total ? stats.validees / total : 0, color: "#16a34a", label: "Validées",   count: stats.validees },
    { pct: total ? stats.attente  / total : 0, color: "#f97316", label: "En attente", count: stats.attente  },
    { pct: total ? stats.refusees / total : 0, color: "#ef4444", label: "Refusées",   count: stats.refusees },
  ];
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width="136" height="136" viewBox="0 0 136 136">
        {segs.map((s, i) => {
          const dash = s.pct * circ; const gap = circ - dash;
          const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ} style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}/>;
          offset += s.pct; return el;
        })}
        <circle cx={cx} cy={cy} r={37} fill="white"/>
        <text x={cx} y={cx - 3} textAnchor="middle" fontSize="21" fontWeight="800" fill="#0d2b5e">{total}</text>
        <text x={cx} y={cx + 12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600" letterSpacing="1">TOTAL</text>
      </svg>
      <div className="donut-legend">
        {segs.map(s => (
          <div key={s.label} className="dl-item">
            <span className="dl-dot" style={{ background: s.color }}/><span className="dl-lbl">{s.label}</span><span className="dl-val">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionMenu({ demande, isOpen, onToggle, onDetail, onEdit, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onToggle(null); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [isOpen, onToggle]);
  return (
    <div className="am-wrap" ref={ref}>
      <button type="button" className="am-btn" onClick={e => { e.stopPropagation(); onToggle(isOpen ? null : demande.ref); }}>
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
      </button>
      {isOpen && (
        <div className="am-drop">
          <button type="button" className="am-item am-blue" onClick={() => { onDetail(demande); onToggle(null); }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Voir le détail
          </button>
          <div className="am-sep"/>
          {demande.statut !== "ANNULÉE" && demande.statut !== "REFUSÉE" && (
            <>
              <button type="button" className="am-item" onClick={() => { onEdit(demande); onToggle(null); }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Modifier
              </button>
              <div className="am-sep"/>
              <button type="button" className="am-item am-red" onClick={() => { onCancel(demande.ref); onToggle(null); }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                Annuler la demande
              </button>
            </>
          )}
          {(demande.statut === "ANNULÉE" || demande.statut === "REFUSÉE") && (
            <div style={{ padding: "10px 15px", fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Aucune action disponible</div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailModal({ demande, onClose }) {
  if (!demande) return null;
  const sc = statutCfg[demande.statut];
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="mh"><div className="mh-row"><div><p className="mh-label">DÉTAIL DE LA DEMANDE</p><p className="mh-ref">{demande.ref}</p><p className="mh-traj">{demande.trajet}</p></div><button type="button" className="mh-close" onClick={onClose}>✕</button></div></div>
        <div className="ms-bar"><span className="badge" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}><span className="bdot" style={{ background: sc.dot }}/>{demande.statut}</span><span className="ms-date">{demande.date}</span></div>
        <div className="mb">
          {[{ label: "Passager", value: demande.detail.passager },{ label: "Point de départ", value: demande.detail.depart },{ label: "Point d'arrivée", value: demande.detail.arrivee },{ label: "Heure", value: demande.detail.heure }].map(r => (
            <div key={r.label} className="mb-row"><span className="mb-lbl">{r.label}</span><span className="mb-val">{r.value}</span></div>
          ))}
        </div>
        <div className="mf"><button type="button" className="btn-close-m" onClick={onClose}>Fermer</button></div>
      </div>
    </div>
  );
}

function EditModal({ demande, onClose, onSave }) {
  const minDate = todayISO();
  const [form, setForm] = useState({ date: demande.date < minDate ? minDate : demande.date, heure: demande.detail.heure, depart: demande.detail.depart, arrivee: demande.detail.arrivee });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    const shortDepart  = form.depart.split("(")[0].trim().replace(/^(Aéroport|Hôtel|Club)\s/i,"").split(",")[0];
    const shortArrivee = form.arrivee.split("(")[0].trim().replace(/^(Aéroport|Hôtel|Club)\s/i,"").split(",")[0];
    onSave(demande.ref, { trajet: `${shortDepart} → ${shortArrivee}`, vers: form.depart, date: form.date, statut: demande.statut, detail: { ...demande.detail, heure: form.heure, depart: form.depart, arrivee: form.arrivee } });
    onClose();
  };
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box wide" onClick={e => e.stopPropagation()}>
        <div className="mh"><div className="mh-row"><div><p className="mh-label">MODIFIER LA DEMANDE</p><p className="mh-ref">{demande.ref}</p><p className="mh-traj">{demande.trajet}</p></div><button type="button" className="mh-close" onClick={onClose}>✕</button></div></div>
        <div className="edit-grid">
          <div className="ef-note"><svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Le statut est géré uniquement par l'opérateur AirOps.</div>
          <div className="ef full"><label className="ef-lbl">Point de départ</label><LocationSelect value={form.depart}  onChange={v => upd("depart",  v)} placeholder="Choisir l'aéroport ou hôtel de départ…"/></div>
          <div className="ef full"><label className="ef-lbl">Point d'arrivée</label><LocationSelect value={form.arrivee} onChange={v => upd("arrivee", v)} placeholder="Choisir l'aéroport ou hôtel d'arrivée…"/></div>
          <div className="ef"><label className="ef-lbl">Date de voyage</label><input className="ef-input" type="date" value={form.date} min={minDate} onChange={e => upd("date", e.target.value)}/></div>
          <div className="ef"><label className="ef-lbl">Heure</label><input className="ef-input" type="time" value={form.heure} onChange={e => upd("heure", e.target.value)}/></div>
        </div>
        <div className="edit-actions">
          <button type="button" className="btn-cancel-e" onClick={onClose}>Annuler</button>
          <button type="button" className="btn-save-e" onClick={handleSave} disabled={!form.depart || !form.arrivee || !form.date}>Enregistrer les modifications</button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ total, page, perPage, onPage, onPerPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);
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

export default function DashbordP() {
  const navigate = useNavigate();

  /* ── Synchronisation nom + photo depuis ProfilP ── */
  const { nom, photo, initials } = useProfileSync();

  const [demandes, setDemandes] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : initialDemandes; } catch { return initialDemandes; }
  });
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(demandes)); } catch {} }, [demandes]);

  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [openMenu,      setOpenMenu]      = useState(null);
  const [detailModal,   setDetailModal]   = useState(null);
  const [editModal,     setEditModal]     = useState(null);
  const [search,        setSearch]        = useState("");
  const [toast,         setToast]         = useState("");
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(5);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);

  const stats = useMemo(() => ({
    attente:  demandes.filter(d => d.statut === "EN ATTENTE").length,
    validees: demandes.filter(d => d.statut === "VALIDÉE").length,
    encours:  demandes.filter(d => d.statut === "EN COURS").length,
    refusees: demandes.filter(d => d.statut === "REFUSÉE" || d.statut === "ANNULÉE").length,
    total:    demandes.length,
  }), [demandes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return demandes;
    return demandes.filter(d => [d.ref, d.trajet, d.vers, d.statut, d.detail.passager, d.detail.depart, d.detail.arrivee].join(" ").toLowerCase().includes(q));
  }, [demandes, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const handleCancel  = ref => { setDemandes(prev => prev.map(d => d.ref === ref ? { ...d, statut: "ANNULÉE" } : d)); setToast(`Demande ${ref} annulée.`); };
  const handleSaveEdit = (ref, updated) => { setDemandes(prev => prev.map(d => d.ref === ref ? { ...d, ...updated } : d)); setToast(`Demande ${ref} modifiée.`); };

  const statCards = [
    { label: "En attente", value: stats.attente,  tag: "En attente", color: "orange", emoji: "⏳" },
    { label: "Validées",   value: stats.validees, tag: "Validées",   color: "green",  emoji: "✅" },
    { label: "En cours",   value: stats.encours,  tag: "En cours",   color: "blue",   emoji: "🚀" },
    { label: "Refusées",   value: stats.refusees, tag: "Refusées",   color: "red",    emoji: "❌" },
  ];

  /* Prénom seulement pour le message de bienvenue */
  const prenom = nom.split(" ")[0] || "Ahmed";

  return (
    <div className="dw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)}/>}

      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}><div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div><div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">GESTION INTERNE</span></div></div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span><span className="sb-nav-lbl">{item.label}</span>
              {item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => navigate("/login")}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="dm">
        <header className="dh">
          <div className="dh-left">
            <button type="button" className="dh-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="dh-title">Tableau de bord</span>
          </div>
          <div className="dh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className="search-input" placeholder="Rechercher une demande…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <button type="button" className="notif-btn" onClick={() => navigate("/notificationP")}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="notif-dot"/>
            </button>
            {/* ── Avatar synchronisé ── */}
            <div className="user-chip">
              <div className="user-info-r">
                <div className="user-name">{nom}</div>
                <div className="user-role">Passager Premium</div>
              </div>
              <div className="user-avatar">
                {photo ? <img src={photo} alt="profil"/> : initials}
              </div>
            </div>
          </div>
        </header>

        <main className="dc">
          <h1 className="welcome-title">Bienvenue, <span>{prenom}</span> 👋</h1>
          <p className="welcome-sub">Voici un aperçu de vos demandes de transport.</p>

          <div className="stats-grid">
            {statCards.map(s => (
              <div key={s.label} className={`sc ${s.color}`}>
                <div className="sc-top"><div className={`sc-icon ${s.color}`}>{s.emoji}</div><span className={`sc-tag ${s.color}`}>{s.tag}</span></div>
                <div className="sc-value">{s.value}</div><div className="sc-label">Demandes {s.label.toLowerCase()}</div>
              </div>
            ))}
          </div>

          <div className="charts-row">
            <div className="cc">
              <div className="cc-hd"><span className="cc-title">Statistiques des demandes</span><button type="button" className="cc-period">Derniers 30 jours</button></div>
              <svg viewBox="0 0 420 120" width="100%" style={{ height: 150 }}>
                <defs><linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2980e8" stopOpacity="0.16"/><stop offset="100%" stopColor="#2980e8" stopOpacity="0"/></linearGradient></defs>
                {[20,50,80,110].map(y => <line key={y} x1="0" y1={y} x2="420" y2={y} stroke="#f1f5f9" strokeWidth="1"/>)}
                <path d={`${linePath} L420,120 L0,120 Z`} fill="url(#lg1)"/>
                <path d={linePath} fill="none" stroke="#2980e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="170" cy="38" r="4" fill="#2980e8"/><circle cx="170" cy="38" r="8" fill="#2980e8" fillOpacity="0.16"/>
                <circle cx="390" cy="11" r="4" fill="#16a34a"/><circle cx="390" cy="11" r="8" fill="#16a34a" fillOpacity="0.16"/>
              </svg>
            </div>
            <div className="cc"><div className="cc-hd"><span className="cc-title">Statut des demandes</span></div><DonutChart total={stats.total} stats={stats}/></div>
          </div>

          <div className="tbl-card">
            <div className="tbl-hd"><span className="tbl-hd-title">Mes demandes</span><span className="tbl-count">{filtered.length} demande{filtered.length !== 1 ? "s" : ""}</span></div>
            <div className="tbl-cols"><span>Référence</span><span>Trajet</span><span className="col-date-h">Date</span><span className="col-stat-h">Statut</span><span style={{ textAlign: "center" }}>Action</span></div>
            {paginated.length === 0 ? (
              <div style={{ padding: "36px 22px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Aucune demande trouvée.</div>
            ) : (
              paginated.map(d => {
                const sc = statutCfg[d.statut];
                return (
                  <div key={d.ref} className="tbl-row">
                    <span className="row-ref">{d.ref}</span>
                    <div><div className="row-traj">{d.trajet}</div><div className="row-vers">{d.vers}</div></div>
                    <span className="row-date col-date-v">{d.date}</span>
                    <div className="col-stat-v"><span className="badge" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}><span className="bdot" style={{ background: sc.dot }}/>{d.statut}</span></div>
                    <ActionMenu demande={d} isOpen={openMenu === d.ref} onToggle={setOpenMenu} onDetail={setDetailModal} onEdit={setEditModal} onCancel={handleCancel}/>
                  </div>
                );
              })
            )}
            <Pagination total={filtered.length} page={safePage} perPage={perPage} onPage={setPage} onPerPage={setPerPage}/>
          </div>
          <div className="dash-footer">© 2026 AirOps Transport Management</div>
        </main>
      </div>

      <button type="button" className="fab" onClick={() => navigate("/reserverD")}>
        <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
      </button>

      {detailModal && <DetailModal demande={detailModal} onClose={() => setDetailModal(null)}/>}
      {editModal   && <EditModal   demande={editModal}   onClose={() => setEditModal(null)} onSave={handleSaveEdit}/>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}