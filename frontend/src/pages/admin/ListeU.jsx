import { useMemo, useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

/* ══════════════════════════ CSS ══════════════════════════ */
const listeCSS = `
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

  .lw { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

  /* ── Sidebar ── */
  .sidebar { width: var(--sidebar-full); background: var(--brand-dark); display: flex; flex-direction: column; flex-shrink: 0; position: relative; z-index: 30; transition: width 0.3s ease; box-shadow: 4px 0 24px rgba(0,0,0,0.2); overflow: hidden; }
  .sidebar.collapsed { width: var(--sidebar-mini); }
  .sb-brand { display: flex; align-items: center; gap: 10px; padding: 18px 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); cursor: pointer; flex-shrink: 0; min-height: 68px; overflow: hidden; }
  .sb-brand-icon { width: 40px; height: 40px; min-width: 40px; background: var(--brand-blue); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(41,128,232,0.4); }
  .sb-brand-text { overflow: hidden; white-space: nowrap; opacity: 1; transition: opacity 0.2s ease; }
  .sidebar.collapsed .sb-brand-text { opacity: 0; }
  .sb-brand-name { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.4px; display: block; }
  .sb-brand-sub  { font-size: 9px; color: rgba(255,255,255,0.4); letter-spacing: 1.8px; font-weight: 600; display: block; }
  .sb-toggle-btn { position: absolute; top: 22px; right: 10px; width: 22px; height: 22px; background: rgba(255,255,255,0.12); border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: var(--tr); flex-shrink: 0; border: none; }
  .sb-toggle-btn:hover { background: var(--brand-blue); }
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
  .lm { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .lh { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .lh-left  { display: flex; align-items: center; gap: 12px; }
  .lh-right { display: flex; align-items: center; gap: 14px; }
  .lh-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .lh-menu-btn:hover { background: var(--bg-page); color: var(--text-primary); }
  .lh-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  .search-input { width: 220px; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 22px; background: var(--bg-page); font-size: 13px; font-family: inherit; color: var(--text-primary); outline: none; transition: var(--tr); }
  .search-input:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input.err { border-color: #fca5a5; }
  .search-err { font-size: 11px; color: var(--accent-red); position: absolute; top: calc(100% + 3px); left: 0; white-space: nowrap; }

  .user-chip { display: flex; align-items: center; gap: 9px; }
  .user-info  { text-align: right; }
  .user-name  { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }
  .user-role  { font-size: 10px; color: var(--text-muted); letter-spacing: 0.8px; text-transform: uppercase; }
  .user-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); flex-shrink: 0; overflow: hidden; cursor: pointer; }
  .user-avatar img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Content ── */
  .lc { flex: 1; overflow-y: auto; padding: 26px; }
  .page-title { font-size: 25px; font-weight: 800; color: var(--brand-dark); letter-spacing: -0.5px; margin-bottom: 4px; }
  .page-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }

  /* ── Stats grid ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
  .sc { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: var(--shadow-sm); transition: var(--tr); position: relative; overflow: hidden; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 20px 20px 0 0; }
  .sc.blue::before   { background: var(--brand-blue); }
  .sc.purple::before { background: #7c3aed; }
  .sc.green::before  { background: var(--accent-green); }
  .sc.red::before    { background: var(--accent-red); }
  .sc:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .sc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sc-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
  .sc-icon.blue   { background: #eff6ff; }
  .sc-icon.purple { background: #f5f3ff; }
  .sc-icon.green  { background: #f0fdf4; }
  .sc-icon.red    { background: #fef2f2; }
  .sc-tag { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
  .sc-tag.blue   { color: var(--brand-blue); background: #eff6ff; }
  .sc-tag.purple { color: #7c3aed; background: #f5f3ff; }
  .sc-tag.green  { color: var(--accent-green); background: #f0fdf4; }
  .sc-tag.red    { color: var(--accent-red); background: #fef2f2; }
  .sc-value { font-size: 30px; font-weight: 800; color: var(--brand-dark); letter-spacing: -1px; }
  .sc-label { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

  /* ── Toolbar ── */
  .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
  .filter-bar { display: flex; align-items: center; gap: 1px; background: #f1f5f9; border-radius: 10px; padding: 2px; flex-wrap: wrap; }
  .filter-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; border: none; background: transparent; color: var(--text-sec); cursor: pointer; font-family: inherit; transition: var(--tr); white-space: nowrap; }
  .filter-btn.active { background: #fff; color: var(--brand-dark); box-shadow: var(--shadow-sm); }
  .filter-btn:hover:not(.active) { color: var(--text-primary); }
  .add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); color: #fff; border: none; border-radius: 12px; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); white-space: nowrap; }
  .add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }
  .add-btn:active { transform: scale(0.97); }

  /* ── Table card ── */
  .tbl-card { background: #fff; border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--shadow-sm); overflow: visible; transition: var(--tr); }
  .tbl-card:hover { box-shadow: var(--shadow-md); }
  .tbl-head { display: grid; grid-template-columns: 190px 1fr 120px 160px 52px; padding: 10px 22px; background: #f8fafc; border-bottom: 1px solid var(--border); font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; border-radius: 20px 20px 0 0; }
  .tbl-body { }
  .tbl-row { display: grid; grid-template-columns: 190px 1fr 120px 160px 52px; align-items: center; padding: 13px 22px; border-bottom: 1px solid #f1f5f9; transition: background 0.18s; position: relative; }
  .tbl-row:last-child { border-bottom: none; }
  .tbl-row:hover { background: #f8fafc; }
  .tbl-row.banned { opacity: 0.75; }
  .cell-user { display: flex; align-items: center; gap: 10px; }
  .cell-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--brand-blue); flex-shrink: 0; }
  .cell-avatar.banned-av { background: #fef2f2; color: #ef4444; }
  .cell-name { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .cell-email { font-size: 12px; color: var(--text-muted); }
  .cell-phone { font-size: 13px; color: var(--text-sec); }

  .cell-badges { display: flex; flex-direction: column; gap: 5px; }
  .role-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; width: fit-content; }
  .role-Admin       { background: #f5f3ff; color: #6d28d9; }
  .role-Responsable { background: #eff6ff; color: #1d4ed8; }
  .role-Chauffeur   { background: #f0fdf4; color: #15803d; }
  .role-Passager    { background: #f1f5f9; color: #475569; }
  .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; width: fit-content; }
  .status-active { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
  .status-banned { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .sdot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

  /* ── Action menu (3 dots) — FIXED: higher z-index, no overflow hidden on row ── */
  .am-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
  .am-btn { width: 32px; height: 32px; border-radius: 8px; background: none; border: 1px solid transparent; color: var(--text-muted); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--tr); }
  .am-btn:hover { background: #f0f5fb; border-color: var(--border); color: var(--brand-blue); }
  .am-drop { position: fixed; z-index: 99999; width: 200px; background: #fff; border-radius: 14px; box-shadow: 0 8px 40px rgba(13,43,94,0.22), 0 2px 8px rgba(13,43,94,0.1); border: 1px solid var(--border); overflow: hidden; animation: dropIn 0.18s ease; }
  @keyframes dropIn { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: none; } }
  .am-item { width: 100%; display: flex; align-items: center; gap: 9px; padding: 11px 15px; background: none; border: none; font-size: 13px; font-weight: 500; font-family: inherit; text-align: left; cursor: pointer; color: var(--text-primary); transition: background 0.15s; white-space: nowrap; }
  .am-item:hover { background: #f0f5fb; }
  .am-item.am-blue:hover { background: #eff6ff; color: var(--brand-blue); }
  .am-item.am-green { color: var(--accent-green); }
  .am-item.am-green:hover { background: #f0fdf4; }
  .am-item.am-red { color: var(--accent-red); }
  .am-item.am-red:hover { background: #fef2f2; }
  .am-sep { height: 1px; background: var(--border); margin: 3px 0; }

  /* ── Empty state ── */
  .empty-state { padding: 56px 22px; text-align: center; }
  .empty-icon { width: 56px; height: 56px; margin: 0 auto 16px; background: #f1f5f9; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
  .empty-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  .empty-sub   { font-size: 12px; color: var(--text-muted); }

  /* ── Pagination ── */
  .pag { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px; }
  .pag-info { font-size: 12px; color: var(--text-muted); }
  .pag-left { display: flex; align-items: center; gap: 10px; }
  .pag-controls { display: flex; align-items: center; gap: 3px; }
  .pag-btn { min-width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #fff; color: var(--text-sec); font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: inherit; transition: var(--tr); padding: 0 7px; }
  .pag-btn:hover:not(:disabled) { border-color: var(--brand-blue); color: var(--brand-blue); background: #eff6ff; }
  .pag-btn:disabled { opacity: 0.35; cursor: default; }
  .pag-btn.active { background: var(--brand-blue); color: #fff; border-color: var(--brand-blue); }
  .pag-size { height: 32px; border-radius: 8px; border: 1px solid var(--border); background: #fff; color: var(--text-sec); font-size: 12px; font-family: inherit; padding: 0 8px; cursor: pointer; outline: none; transition: var(--tr); }
  .pag-size:focus { border-color: var(--brand-blue); }

  /* ── Modal ── */
  .modal-ov { position: fixed; inset: 0; z-index: 100; background: rgba(13,43,94,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-box { background: #fff; border-radius: 24px; width: 100%; max-width: 500px; overflow: hidden; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }
  .mh { background: linear-gradient(135deg, var(--brand-dark), var(--brand-mid)); padding: 22px 24px; color: #fff; }
  .mh-row { display: flex; align-items: flex-start; justify-content: space-between; }
  .mh-label { font-size: 10px; letter-spacing: 1.5px; color: rgba(255,255,255,0.5); font-weight: 700; margin-bottom: 4px; }
  .mh-title { font-size: 20px; font-weight: 800; }
  .mh-sub   { font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 2px; }
  .mh-close { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.14); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; flex-shrink: 0; transition: var(--tr); }
  .mh-close:hover { background: rgba(255,255,255,0.26); transform: rotate(90deg); }
  .mf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 20px 24px; }
  .mf-grid.single { grid-template-columns: 1fr; }
  .ef { display: flex; flex-direction: column; gap: 5px; }
  .ef.full { grid-column: 1 / -1; }
  .ef-lbl { font-size: 10.5px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
  .ef-input { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; transition: var(--tr); }
  .ef-input:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .ef-input.ef-err { border-color: #fca5a5; }
  .ef-error { font-size: 11px; color: var(--accent-red); margin-top: 2px; }
  .ef-sel { padding: 10px 12px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 13px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; cursor: pointer; transition: var(--tr); }
  .ef-sel:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding: 14px 24px; border-top: 1px solid var(--border); }
  .btn-cancel { padding: 10px 20px; font-size: 13px; font-family: inherit; color: var(--text-sec); border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer; transition: var(--tr); }
  .btn-cancel:hover { background: var(--bg-page); }
  .btn-save { padding: 10px 24px; font-size: 13px; font-weight: 700; font-family: inherit; color: #fff; border: none; border-radius: 10px; background: linear-gradient(135deg, var(--brand-blue), #1a6fd4); cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); }
  .btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }
  .btn-save:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

  /* Detail modal */
  .mb { padding: 18px 24px; }
  .mb-row { display: flex; align-items: center; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid #f1f5f9; }
  .mb-row:last-child { border-bottom: none; }
  .mb-lbl { font-size: 11px; font-weight: 600; color: var(--text-muted); }
  .mb-val  { font-size: 13px; font-weight: 700; color: var(--text-primary); text-align: right; max-width: 65%; }
  .mf-footer { padding: 14px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; }
  .btn-close-m { padding: 9px 20px; font-size: 13px; font-family: inherit; color: var(--text-sec); border: 1px solid var(--border); border-radius: 10px; background: #fff; cursor: pointer; transition: var(--tr); }
  .btn-close-m:hover { background: var(--bg-page); }

  /* ── Toast ── */
  .toast { position: fixed; top: 18px; right: 18px; z-index: 999999; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; pointer-events: none; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }

  /* ── Footer ── */
  .lfoot { background: #fff; border-top: 1px solid var(--border); padding: 12px 26px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .lfoot-brand { font-size: 11px; color: var(--text-muted); letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; }

  /* ── Confirm modal ── */
  .confirm-box { max-width: 400px; }
  .confirm-body { padding: 22px 24px; }
  .confirm-msg { font-size: 14px; color: var(--text-sec); line-height: 1.6; }
  .btn-danger { padding: 10px 24px; font-size: 13px; font-weight: 700; font-family: inherit; color: #fff; border: none; border-radius: 10px; background: var(--accent-red); cursor: pointer; transition: var(--tr); }
  .btn-danger:hover { background: #dc2626; }
  .btn-success { padding: 10px 24px; font-size: 13px; font-weight: 700; font-family: inherit; color: #fff; border: none; border-radius: 10px; background: var(--accent-green); cursor: pointer; transition: var(--tr); }
  .btn-success:hover { background: #15803d; }

  /* ── Responsive ── */
  @media (max-width: 1100px) {
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .tbl-head, .tbl-row { grid-template-columns: 170px 1fr 150px 52px; }
    .col-phone { display: none; }
  }
  @media (max-width: 880px) {
    .tbl-head, .tbl-row { grid-template-columns: 150px 1fr 52px; }
    .col-badges { display: none; }
    .search-input { width: 160px; }
    .toolbar { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open { transform: translateX(0); }
    .sidebar.collapsed { transform: translateX(-100%); }
    .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; }
    .lh-menu-btn { display: flex; }
    .sb-toggle-btn { display: none; }
    .lc { padding: 16px; }
    .lh { padding: 0 16px; }
  }
  @media (max-width: 600px) {
    .tbl-head, .tbl-row { grid-template-columns: 1fr 52px; }
    .col-phone, .col-badges { display: none; }
    .stats-grid { grid-template-columns: repeat(2,1fr); gap: 10px; }
    .sc-value { font-size: 24px; }
    .search-wrap { display: none; }
    .mf-grid { grid-template-columns: 1fr; }
    .ef.full { grid-column: 1; }
    .pag { flex-direction: column; align-items: flex-start; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("liste-u-css")) {
  const tag = document.createElement("style");
  tag.id = "liste-u-css";
  tag.textContent = listeCSS;
  document.head.appendChild(tag);
}

/* ══════════════════════════ STORAGE ══════════════════════════ */
const LS_KEY = "nouvelair_users_v1";

const initialUsers = [
  { id: 1, nom: "Ahmed Mansour",  email: "ahmed.mansour@nouvelair.com",  telephone: "22 111 333", role: "Admin",       banned: false },
  { id: 2, nom: "Sami Ben Ali",   email: "sami.benali@nouvelair.com",    telephone: "55 888 999", role: "Responsable", banned: false },
  { id: 3, nom: "Karim Trabelsi", email: "karim.trabelsi@nouvelair.com", telephone: "20 000 111", role: "Passager",    banned: false },
  { id: 4, nom: "Lina Gharbi",    email: "lina.gharbi@nouvelair.com",    telephone: "99 777 222", role: "Chauffeur",   banned: false },
  { id: 5, nom: "Moez Ben Ali",   email: "moez.benali@nouvelair.com",    telephone: "51 222 444", role: "Passager",    banned: true  },
  { id: 6, nom: "Anis Gharbi",    email: "anis.gharbi@nouvelair.com",    telephone: "28 444 666", role: "Responsable", banned: false },
];

function loadUsers() {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : initialUsers; } catch { return initialUsers; }
}
function saveUsers(users) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(users)); } catch {}
}

/* ══════════════════════════ ADMIN PROFILE STORAGE ══════════════════════════ */
const ADMIN_FORM_KEY  = "airops_admin_profil_form_v1";
const ADMIN_PHOTO_KEY = "airops_admin_profil_photo_v1";

function getAdminName() {
  try { const s = localStorage.getItem(ADMIN_FORM_KEY); return s ? (JSON.parse(s).nom || "Ahmed Mansour") : "Ahmed Mansour"; } catch { return "Ahmed Mansour"; }
}
function getAdminPhoto() {
  try { return localStorage.getItem(ADMIN_PHOTO_KEY) || ""; } catch { return ""; }
}
function getAdminInitials(nom) {
  return (nom || "Ahmed Mansour").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "AM";
}

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
    label: "Mon Profil",
    to: "/profilA",
    icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  },
];

/* ══════════════════════════ VALIDATE ══════════════════════════ */
function validateForm(form, users, editingId = null) {
  const errors = {};
  if (!form.nom.trim()) errors.nom = "Le nom est obligatoire.";
  else if (form.nom.trim().length < 3) errors.nom = "Minimum 3 caractères.";

  if (!form.email.trim()) errors.email = "L'email est obligatoire.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email invalide.";
  else {
    const dup = users.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editingId);
    if (dup) errors.email = "Cet email est déjà utilisé.";
  }

  if (!form.telephone.trim()) errors.telephone = "Le téléphone est obligatoire.";
  else if (!/^[0-9+\s]{8,20}$/.test(form.telephone)) errors.telephone = "Numéro invalide.";

  if (!form.role) errors.role = "Le rôle est obligatoire.";
  return errors;
}

/* ══════════════════════════ ACTION MENU — FIXED ══════════════════════════ */
function ActionMenu({ user, isOpen, onToggle, onDetail, onEdit, onBan, onUnban, onDelete }) {
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const dropWidth = 200;
    const gap = 8;

    let left = rect.right - dropWidth;
    let top = rect.bottom + 6;

    if (left < gap) left = gap;
    if (left + dropWidth > window.innerWidth - gap) {
      left = window.innerWidth - dropWidth - gap;
    }

    const estimatedHeight = 220;
    if (top + estimatedHeight > window.innerHeight - gap) {
      top = rect.top - estimatedHeight - 6;
    }

    if (top < gap) top = gap;

    setDropPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleOutside = (e) => {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        onToggle(null);
      }
    };

    const handleReposition = () => updatePosition();

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, onToggle]);

  const menu = isOpen ? (
    <div
      ref={dropRef}
      className="am-drop"
      style={{ top: `${dropPos.top}px`, left: `${dropPos.left}px` }}
    >
      <button type="button" className="am-item am-blue" onClick={() => { onDetail(user); onToggle(null); }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
        Voir le détail
      </button>

      <div className="am-sep" />

      <button type="button" className="am-item" onClick={() => { onEdit(user); onToggle(null); }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        Modifier
      </button>

      <div className="am-sep" />

      {user.banned ? (
        <button type="button" className="am-item am-green" onClick={() => { onUnban(user); onToggle(null); }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Réactiver
        </button>
      ) : (
        <button type="button" className="am-item am-red" onClick={() => { onBan(user); onToggle(null); }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
          Bannir
        </button>
      )}

      <div className="am-sep" />

      <button type="button" className="am-item am-red" onClick={() => { onDelete(user); onToggle(null); }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        Supprimer
      </button>
    </div>
  ) : null;

  return (
    <div className="am-wrap">
      <button
        ref={btnRef}
        type="button"
        className="am-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(isOpen ? null : user.id);
        }}
      >
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}

/* ══════════════════════════ DETAIL MODAL ══════════════════════════ */
function DetailModal({ user, onClose }) {
  if (!user) return null;
  const rows = [
    { label: "Nom complet",      value: user.nom },
    { label: "Adresse email",    value: user.email },
    { label: "Téléphone",        value: user.telephone },
    { label: "Rôle",             value: user.role },
    { label: "Statut du compte", value: user.banned ? "Banni / Désactivé" : "Actif" },
  ];
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div className="mh-row">
            <div>
              <p className="mh-label">DÉTAIL UTILISATEUR</p>
              <p className="mh-title">{user.nom}</p>
              <p className="mh-sub">{user.role}</p>
            </div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="mb">
          {rows.map(r => (
            <div key={r.label} className="mb-row">
              <span className="mb-lbl">{r.label}</span>
              <span className="mb-val">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="mf-footer">
          <button type="button" className="btn-close-m" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ USER MODAL ══════════════════════════ */
function UserModal({ user, users, onClose, onSave }) {
  const isEdit = !!user;
  const [form, setForm] = useState(
    user
      ? { nom: user.nom, email: user.email, telephone: user.telephone, role: user.role }
      : { nom: "", email: "", telephone: "", role: "Passager" }
  );
  const [touched, setTouched] = useState({});
  const errors  = validateForm(form, users, user?.id);
  const isValid = Object.keys(errors).length === 0;

  const blur = (k) => setTouched(p => ({ ...p, [k]: true }));
  const upd  = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nom: true, email: true, telephone: true, role: true });
    if (!isValid) return;
    onSave(form);
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div className="mh-row">
            <div>
              <p className="mh-label">{isEdit ? "MODIFIER UTILISATEUR" : "NOUVEL UTILISATEUR"}</p>
              <p className="mh-title">{isEdit ? user.nom : "Ajouter un compte"}</p>
              {isEdit && <p className="mh-sub">{user.role}</p>}
            </div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mf-grid">
            <div className="ef full">
              <label className="ef-lbl">Nom complet</label>
              <input type="text" className={`ef-input${touched.nom && errors.nom ? " ef-err" : ""}`}
                value={form.nom} onChange={e => upd("nom", e.target.value)} onBlur={() => blur("nom")}
                placeholder="Ex : Ahmed Ben Ali"/>
              {touched.nom && errors.nom && <p className="ef-error">{errors.nom}</p>}
            </div>
            <div className="ef full">
              <label className="ef-lbl">Adresse email</label>
              <input type="email" className={`ef-input${touched.email && errors.email ? " ef-err" : ""}`}
                value={form.email} onChange={e => upd("email", e.target.value)} onBlur={() => blur("email")}
                placeholder="Ex : ahmed@nouvelair.com"/>
              {touched.email && errors.email && <p className="ef-error">{errors.email}</p>}
            </div>
            <div className="ef">
              <label className="ef-lbl">Téléphone</label>
              <input type="text" className={`ef-input${touched.telephone && errors.telephone ? " ef-err" : ""}`}
                value={form.telephone} onChange={e => upd("telephone", e.target.value)} onBlur={() => blur("telephone")}
                placeholder="Ex : 22 111 333"/>
              {touched.telephone && errors.telephone && <p className="ef-error">{errors.telephone}</p>}
            </div>
            <div className="ef">
              <label className="ef-lbl">Rôle</label>
              <select className="ef-sel" value={form.role} onChange={e => upd("role", e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="Responsable">Responsable</option>
                <option value="Chauffeur">Chauffeur</option>
                <option value="Passager">Passager</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-save" disabled={!isValid && Object.keys(touched).length > 0}>
              {isEdit ? "Enregistrer" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════ CONFIRM MODAL ══════════════════════════ */
function ConfirmModal({ title, message, confirmLabel, danger, success, onConfirm, onClose }) {
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div className="mh-row">
            <div><p className="mh-label">CONFIRMATION</p><p className="mh-title">{title}</p></div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="confirm-body"><p className="confirm-msg">{message}</p></div>
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
          {danger  && <button type="button" className="btn-danger"  onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>}
          {success && <button type="button" className="btn-success" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>}
          {!danger && !success && <button type="button" className="btn-save" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ PAGINATION ══════════════════════════ */
function Pagination({ total, page, perPage, onPage, onPerPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end   = Math.min(page * perPage, total);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="pag">
      <div className="pag-left">
        <span className="pag-info">{total === 0 ? "Aucun résultat" : `${start}–${end} sur ${total}`}</span>
        <select className="pag-size" value={perPage} onChange={e => { onPerPage(Number(e.target.value)); onPage(1); }}>
          {[5, 8, 10, 15].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
      </div>
      <div className="pag-controls">
        <button className="pag-btn" disabled={page === 1} onClick={() => onPage(1)}>«</button>
        <button className="pag-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {pages.map((p, i) => p === "…"
          ? <span key={`e${i}`} style={{ color: "var(--text-muted)", fontSize: 13, padding: "0 3px" }}>…</span>
          : <button key={p} className={`pag-btn${page === p ? " active" : ""}`} onClick={() => onPage(p)}>{p}</button>
        )}
        <button className="pag-btn" disabled={page === totalPages} onClick={() => onPage(page + 1)}>›</button>
        <button className="pag-btn" disabled={page === totalPages} onClick={() => onPage(totalPages)}>»</button>
      </div>
    </div>
  );
}

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
export default function ListeU() {
  const navigate = useNavigate();

  const [users,         setUsers]         = useState(loadUsers);
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search,        setSearch]        = useState("");
  const [searchTouched, setSearchTouched] = useState(false);
  const [roleFilter,    setRoleFilter]    = useState("Tous");
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(8);
  const [openMenu,      setOpenMenu]      = useState(null);
  const [detailUser,    setDetailUser]    = useState(null);
  const [editUser,      setEditUser]      = useState(null);
  const [showAdd,       setShowAdd]       = useState(false);
  const [confirm,       setConfirm]       = useState(null);
  const [toast,         setToast]         = useState("");

  /* Admin profile sync */
  const [adminName,  setAdminName]  = useState(getAdminName);
  const [adminPhoto, setAdminPhoto] = useState(getAdminPhoto);

  useEffect(() => {
    const sync = () => { setAdminName(getAdminName()); setAdminPhoto(getAdminPhoto()); };
    window.addEventListener("airops-admin-profile-update", sync);
    return () => window.removeEventListener("airops-admin-profile-update", sync);
  }, []);

  useEffect(() => { saveUsers(users); }, [users]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const searchError = searchTouched && search.trim().length > 50 ? "La recherche ne doit pas dépasser 50 caractères." : "";

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [u.nom, u.email, u.telephone, u.role].join(" ").toLowerCase().includes(q);
      const matchRole   = roleFilter === "Tous" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const stats = useMemo(() => ({
    total:      users.length,
    admins:     users.filter(u => u.role === "Admin").length,
    chauffeurs: users.filter(u => u.role === "Chauffeur").length,
    banned:     users.filter(u => u.banned).length,
  }), [users]);

  const nextId = () => Math.max(0, ...users.map(u => u.id)) + 1;

  const handleAdd = (form) => {
    const newUser = { id: nextId(), ...form, nom: form.nom.trim(), email: form.email.trim(), telephone: form.telephone.trim(), banned: false };
    setUsers(prev => [...prev, newUser]);
    setShowAdd(false);
    setToast(`✓ Utilisateur « ${newUser.nom} » ajouté.`);
  };

  const handleEdit = (form) => {
    setUsers(prev => prev.map(u => u.id === editUser.id
      ? { ...u, nom: form.nom.trim(), email: form.email.trim(), telephone: form.telephone.trim(), role: form.role }
      : u
    ));
    setToast(`✓ Compte de « ${form.nom.trim()} » modifié.`);
    setEditUser(null);
  };

  const handleDelete = (id) => {
    const u = users.find(x => x.id === id);
    setUsers(prev => prev.filter(x => x.id !== id));
    setToast(`Utilisateur « ${u?.nom} » supprimé.`);
  };

  const handleBan = (id) => {
    const u = users.find(x => x.id === id);
    setUsers(prev => prev.map(x => x.id === id ? { ...x, banned: true } : x));
    setToast(`⚠ Compte de « ${u?.nom} » désactivé.`);
  };

  const handleUnban = (id) => {
    const u = users.find(x => x.id === id);
    setUsers(prev => prev.map(x => x.id === id ? { ...x, banned: false } : x));
    setToast(`✓ Compte de « ${u?.nom} » réactivé.`);
  };

  const initials = (nom) => nom.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="lw">
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
            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="lm">
        <header className="lh">
          <div className="lh-left">
            <button type="button" className="lh-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="lh-title">Utilisateurs</span>
          </div>
          <div className="lh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={search}
                className={`search-input${searchError ? " err" : ""}`}
                placeholder="Rechercher un utilisateur…"
                onChange={e => setSearch(e.target.value)}
                onBlur={() => setSearchTouched(true)}/>
              {searchError && <p className="search-err">{searchError}</p>}
            </div>
            <div className="user-chip">
              <div className="user-info">
                <div className="user-name">{adminName}</div>
                <div className="user-role">Administrateur</div>
              </div>
              <div className="user-avatar" onClick={() => navigate("/profilA")} title="Mon profil">
                {adminPhoto ? <img src={adminPhoto} alt="profil"/> : <span>{getAdminInitials(adminName)}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="lc">
          <h1 className="page-title">Liste des Utilisateurs</h1>
          <p className="page-sub">Gérez les comptes, rôles et accès de tous les utilisateurs.</p>

          {/* Stats */}
          <div className="stats-grid">
            <div className="sc blue">
              <div className="sc-top"><div className="sc-icon blue">👥</div><span className="sc-tag blue">Total</span></div>
              <div className="sc-value">{stats.total}</div>
              <div className="sc-label">Comptes enregistrés</div>
            </div>
            <div className="sc purple">
              <div className="sc-top"><div className="sc-icon purple">🛡️</div><span className="sc-tag purple">Administration</span></div>
              <div className="sc-value">{stats.admins}</div>
              <div className="sc-label">Administrateurs</div>
            </div>
            <div className="sc green">
              <div className="sc-top"><div className="sc-icon green">🚗</div><span className="sc-tag green">Mobilité</span></div>
              <div className="sc-value">{stats.chauffeurs}</div>
              <div className="sc-label">Chauffeurs</div>
            </div>
            <div className="sc red">
              <div className="sc-top"><div className="sc-icon red">🚫</div><span className="sc-tag red">Désactivés</span></div>
              <div className="sc-value">{stats.banned}</div>
              <div className="sc-label">Comptes bannis</div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="filter-bar">
              {["Tous", "Admin", "Responsable", "Passager", "Chauffeur"].map(role => (
                <button key={role} type="button"
                  className={`filter-btn${roleFilter === role ? " active" : ""}`}
                  onClick={() => setRoleFilter(role)}>
                  {role}
                </button>
              ))}
            </div>
            <button type="button" className="add-btn" onClick={() => setShowAdd(true)}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un utilisateur
            </button>
          </div>

          {/* Table */}
          <div className="tbl-card">
            <div className="tbl-head">
              <span>Utilisateur</span>
              <span style={{ paddingLeft: 4 }}>Email</span>
              <span className="col-phone">Téléphone</span>
              <span className="col-badges">Rôle &amp; Statut</span>
              <span style={{ textAlign: "center" }}>Action</span>
            </div>
            <div className="tbl-body">
              {paginated.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <p className="empty-title">Aucun utilisateur trouvé</p>
                  <p className="empty-sub">Essayez un autre filtre ou une autre recherche.</p>
                </div>
              ) : paginated.map(user => (
                <div key={user.id} className={`tbl-row${user.banned ? " banned" : ""}`}>
                  <div className="cell-user">
                    <div className={`cell-avatar${user.banned ? " banned-av" : ""}`}>
                      {initials(user.nom)}
                    </div>
                    <div><div className="cell-name">{user.nom}</div></div>
                  </div>
                  <div style={{ paddingLeft: 4, fontSize: 12, color: "var(--text-muted)", wordBreak: "break-all" }}>
                    {user.email}
                  </div>
                  <div className="col-phone"><span className="cell-phone">{user.telephone}</span></div>
                  <div className="cell-badges col-badges">
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    <span className={`status-badge ${user.banned ? "status-banned" : "status-active"}`}>
                      <span className="sdot" style={{ background: user.banned ? "#ef4444" : "#22c55e" }}/>
                      {user.banned ? "Banni" : "Actif"}
                    </span>
                  </div>
                  <ActionMenu
                    user={user}
                    isOpen={openMenu === user.id}
                    onToggle={setOpenMenu}
                    onDetail={setDetailUser}
                    onEdit={setEditUser}
                    onBan={(u) => setConfirm({ type: "ban", user: u })}
                    onUnban={(u) => setConfirm({ type: "unban", user: u })}
                    onDelete={(u) => setConfirm({ type: "delete", user: u })}
                  />
                </div>
              ))}
            </div>
            {filtered.length > 0 && (
              <Pagination total={filtered.length} page={safePage} perPage={perPage} onPage={setPage} onPerPage={setPerPage}/>
            )}
          </div>
        </main>

        <footer className="lfoot">
          <div className="lfoot-brand">
            <svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
          </span>
        </footer>
      </div>

      {/* Modals */}
      {showAdd    && <UserModal users={users} onClose={() => setShowAdd(false)} onSave={handleAdd}/>}
      {editUser   && <UserModal user={editUser} users={users} onClose={() => setEditUser(null)} onSave={handleEdit}/>}
      {detailUser && <DetailModal user={detailUser} onClose={() => setDetailUser(null)}/>}

      {confirm?.type === "ban" && (
        <ConfirmModal title="Désactiver le compte"
          message={`Voulez-vous vraiment bannir le compte de « ${confirm.user.nom} » ?`}
          confirmLabel="Bannir" danger
          onConfirm={() => handleBan(confirm.user.id)} onClose={() => setConfirm(null)}/>
      )}
      {confirm?.type === "unban" && (
        <ConfirmModal title="Réactiver le compte"
          message={`Voulez-vous réactiver le compte de « ${confirm.user.nom} » ?`}
          confirmLabel="Réactiver" success
          onConfirm={() => handleUnban(confirm.user.id)} onClose={() => setConfirm(null)}/>
      )}
      {confirm?.type === "delete" && (
        <ConfirmModal title="Supprimer l'utilisateur"
          message={`Cette action est irréversible. Supprimer définitivement « ${confirm.user.nom} » ?`}
          confirmLabel="Supprimer" danger
          onConfirm={() => handleDelete(confirm.user.id)} onClose={() => setConfirm(null)}/>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}