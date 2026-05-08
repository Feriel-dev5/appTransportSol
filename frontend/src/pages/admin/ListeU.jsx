import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { fetchUsers, updateUser, deleteUser, mapUser, fetchPendingAvisCount } from "../../services/adminService";

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
    --text-sec:     #334155;
    --text-muted:   #64748b;
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
  .tbl-head { display: grid; grid-template-columns: 280px 1fr 180px 180px 60px; padding: 10px 22px; background: #f8fafc; border-bottom: 1px solid var(--border); font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; border-radius: 20px 20px 0 0; }
  .tbl-body { }
  .tbl-row { display: grid; grid-template-columns: 280px 1fr 180px 180px 60px; align-items: center; padding: 13px 22px; border-bottom: 1px solid #f1f5f9; transition: background 0.18s; position: relative; }
  .tbl-row:last-child { border-bottom: none; }
  .tbl-row:hover { background: #f0f5fb; }
  .tbl-row.banned { background: #fffcfc; }
  .cell-user { display: flex; align-items: center; gap: 10px; }
  .cell-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--brand-blue); flex-shrink: 0; }
  .cell-avatar.banned-av { background: #fef2f2; color: #ef4444; }
  .cell-name { font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
  .cell-email { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  .cell-phone { font-size: 13px; color: var(--brand-dark); font-weight: 600; font-family: 'DM Sans', sans-serif; }

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

  /* ── Action menu (3 dots) ── */
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
  .modal-box { background: #fff; border-radius: 24px; width: 100%; max-width: 520px; overflow: hidden; box-shadow: var(--shadow-lg); animation: slideUp 0.25s ease; }
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

  /* Phone row inside modal */
  .phone-row-m { display: flex; gap: 8px; align-items: flex-start; }
  .country-sel-m { height: 42px; border: 1.5px solid var(--border); border-radius: 10px; font-size: 12px; font-family: inherit; color: var(--text-primary); background: #fff; outline: none; transition: var(--tr); cursor: pointer; padding: 0 8px; flex-shrink: 0; min-width: 130px; }
  .country-sel-m:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .phone-local-m { flex: 1; }

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
    .phone-row-m { flex-direction: column; }
    .country-sel-m { min-width: 100%; }
  }
`;

if (typeof document !== "undefined") {
  let tag = document.getElementById("liste-u-css");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "liste-u-css";
    document.head.appendChild(tag);
  }
  tag.textContent = listeCSS;
}

/* ══════════════════════════ COUNTRY DIAL CODES ══════════════════════════ */
const COUNTRIES = [
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie", digits: 8 },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie", digits: 9 },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc", digits: 9 },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Égypte", digits: 10 },
  { code: "LY", dial: "+218", flag: "🇱🇾", name: "Libye", digits: 9 },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France", digits: 9 },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne", digits: 11 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni", digits: 10 },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne", digits: 9 },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italie", digits: 10 },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal", digits: 9 },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique", digits: 9 },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Pays-Bas", digits: 9 },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse", digits: 9 },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Arabie Saoudite", digits: 9 },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats Arabes", digits: 9 },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar", digits: 8 },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Koweït", digits: 8 },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahreïn", digits: 8 },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman", digits: 8 },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordanie", digits: 9 },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Liban", digits: 8 },
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turquie", digits: 10 },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal", digits: 9 },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d Ivoire", digits: 10 },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun", digits: 9 },
  { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée", digits: 9 },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali", digits: 8 },
  { code: "MR", dial: "+222", flag: "🇲🇷", name: "Mauritanie", digits: 8 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis", digits: 10 },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada", digits: 10 },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brésil", digits: 11 },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "Chine", digits: 11 },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japon", digits: 10 },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "Corée du Sud", digits: 10 },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australie", digits: 9 },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "Inde", digits: 10 },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan", digits: 10 },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigéria", digits: 10 },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "Afrique du Sud", digits: 9 },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Russie", digits: 10 },
];

/* ══════════════════════════ HELPERS ══════════════════════════ */
function isAlphaOnly(str) {
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(str);
}

function parsePhone(telephone) {
  if (!telephone || typeof telephone !== "string") return { countryCode: "TN", local: "" };
  // Clean potential +undefined prefix
  const cleanPhone = telephone.replace("+undefined", "").trim();
  const found = COUNTRIES.find(c => cleanPhone.startsWith(c.dial));
  if (found) {
    const local = cleanPhone.slice(found.dial.length).trim();
    return { countryCode: found.code, local };
  }
  return { countryCode: "TN", local: cleanPhone.replace(/\D/g, "") };
}

function buildPhone(countryCode, local) {
  const c = COUNTRIES.find(x => x.code === countryCode) || COUNTRIES[0];
  const dial = c?.dial || "+216";
  return local ? `${dial} ${local.replace(/\s/g, "")}` : "";
}

/* ══════════════════════════ STORAGE ══════════════════════════ */
// Legacy mock storage removed to use API only.

/* ══════════════════════════ ADMIN PROFILE STORAGE ══════════════════════════ */
const ADMIN_FORM_KEY = "airops_admin_profil_form_v1";
const ADMIN_PHOTO_KEY = "airops_admin_profil_photo_v1";

function getAdminName() {
  try {
    const s = localStorage.getItem("user");
    return s ? (JSON.parse(s).name || "Admin") : "Admin";
  } catch { return "Admin"; }
}
function getAdminPhoto() {
  try { return localStorage.getItem(ADMIN_PHOTO_KEY) || ""; } catch { return ""; }
}
function getAdminInitials(nom) {
  return (nom || "").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

/* ══════════════════════════ NAV ══════════════════════════ */
const navItems = [
  {
    label: "Tableau de Bord", to: "/dashbordADMIN",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    label: "Liste des Utilisateurs", to: "/listeU",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: "Liste des Véhicules", to: "/listeV",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="22" height="13" rx="2" ry="2"/><circle cx="7" cy="21" r="2"/><circle cx="17" cy="21" r="2"/></svg>,
  },
  {
    label: "Ajouter Utilisateur", to: "/ajouterU",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>,
  },
  {
    label: "Ajouter Véhicule", to: "/ajouterVehicule",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  },
  {
    label: "Gestion des Avis", to: "/avisAdmin",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    label: "Mon Profil", to: "/profilA",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
];

/* ══════════════════════════ VALIDATE ══════════════════════════ */
function validateForm(form, users, editingId = null) {
  const errors = {};

  // Nom — lettres alphabet uniquement
  if (!form.nom.trim()) errors.nom = "Le nom est obligatoire.";
  else if (form.nom.trim().length < 3) errors.nom = "Minimum 3 caractères.";
  else if (!isAlphaOnly(form.nom.trim())) errors.nom = "Le nom ne doit contenir que des lettres.";

  if (!form.email.trim()) errors.email = "L'email est obligatoire.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email invalide.";
  else {
    const dup = users.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase() && u.id !== editingId);
    if (dup) errors.email = "Cet email est déjà utilisé.";
  }

  // Telephone via country selector
  const country = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];
  if (!form.phoneLocal.trim()) errors.phoneLocal = "Le téléphone est obligatoire.";
  else if (!/^\d+$/.test(form.phoneLocal)) errors.phoneLocal = "Uniquement des chiffres.";
  else if (form.phoneLocal.length !== country.digits) errors.phoneLocal = `${country.digits} chiffres requis pour ${country.name}.`;

  if (!form.role) errors.role = "Le rôle est obligatoire.";
  return errors;
}

/* ══════════════════════════ ACTION MENU ══════════════════════════ */
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
    if (left + dropWidth > window.innerWidth - gap) left = window.innerWidth - dropWidth - gap;
    const estimatedHeight = 220;
    if (top + estimatedHeight > window.innerHeight - gap) top = rect.top - estimatedHeight - 6;
    if (top < gap) top = gap;
    setDropPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) onToggle(null);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, onToggle]);

  const menu = isOpen ? (
    <div ref={dropRef} className="am-drop" style={{ top: `${dropPos.top}px`, left: `${dropPos.left}px` }}>
      <button type="button" className="am-item am-blue" onClick={() => { onDetail(user); onToggle(null); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        Voir le détail
      </button>
      <div className="am-sep" />
      <button type="button" className="am-item" onClick={() => { onEdit(user); onToggle(null); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        Modifier
      </button>
      <div className="am-sep" />
      {user.banned ? (
        <button type="button" className="am-item am-green" onClick={() => { onUnban(user); onToggle(null); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          Réactiver
        </button>
      ) : (
        <button type="button" className="am-item am-red" onClick={() => { onBan(user); onToggle(null); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
          Bannir
        </button>
      )}
      <div className="am-sep" />
      <button type="button" className="am-item am-red" onClick={() => { onDelete(user); onToggle(null); }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        Supprimer
      </button>
    </div>
  ) : null;

  return (
    <div className="am-wrap">
      <button ref={btnRef} type="button" className="am-btn"
        onClick={(e) => { e.stopPropagation(); onToggle(isOpen ? null : user.id); }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

/* ══════════════════════════ DETAIL MODAL ══════════════════════════ */
function DetailModal({ user, onClose }) {
  if (!user) return null;
  const rows = [
    { label: "Nom complet", value: user.nom },
    { label: "Adresse email", value: user.email },
    { label: "Téléphone", value: user.telephone },
    { label: "Rôle", value: user.role },
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

  // Parse existing telephone to country + local
  const parsed = isEdit ? parsePhone(user.telephone) : { countryCode: "TN", local: "" };

  const [form, setForm] = useState(
    user
      ? { nom: user.nom, email: user.email, phoneCountry: parsed.countryCode, phoneLocal: parsed.local, role: user.role }
      : { nom: "", email: "", phoneCountry: "TN", phoneLocal: "", role: "Responsable" }
  );
  const [touched, setTouched] = useState({});

  const selectedCountry = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];
  const errors = validateForm(form, users, user?.id);
  const isValid = Object.keys(errors).length === 0;

  const blur = (k) => setTouched(p => ({ ...p, [k]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Nom: block digits and special chars
    if (name === "nom" && value !== "" && !/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']*$/.test(value)) return;
    // phoneLocal: only digits
    if (name === "phoneLocal" && value !== "" && !/^\d*$/.test(value)) return;
    if (name === "phoneCountry") {
      setForm(p => ({ ...p, phoneCountry: value, phoneLocal: "" }));
      return;
    }
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ nom: true, email: true, phoneLocal: true, role: true });
    if (!isValid) return;
    // Build final telephone string: dial + space + local
    const telephone = buildPhone(form.phoneCountry, form.phoneLocal);
    onSave({ nom: form.nom, email: form.email, telephone, role: form.role });
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
            {/* Nom */}
            <div className="ef full">
              <label className="ef-lbl">Nom complet <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-muted)" }}>(lettres uniquement)</span></label>
              <input type="text" name="nom"
                className={`ef-input${touched.nom && errors.nom ? " ef-err" : ""}`}
                value={form.nom}
                onChange={handleChange}
                onBlur={() => blur("nom")}
                placeholder="Ex : Ahmed Ben Ali"
                autoComplete="name" />
              {touched.nom && errors.nom && <p className="ef-error">{errors.nom}</p>}
            </div>

            {/* Email */}
            <div className="ef full">
              <label className="ef-lbl">Adresse email</label>
              <input type="email" name="email"
                className={`ef-input${touched.email && errors.email ? " ef-err" : ""}`}
                value={form.email}
                onChange={handleChange}
                onBlur={() => blur("email")}
                placeholder="Ex : ahmed@nouvelair.com" />
              {touched.email && errors.email && <p className="ef-error">{errors.email}</p>}
            </div>

            {/* Téléphone — country selector + digits */}
            <div className="ef full">
              <label className="ef-lbl">
                Téléphone
                <span style={{ fontWeight: 400, textTransform: "none", color: "var(--text-muted)", marginLeft: 6 }}>
                  ({selectedCountry.digits} chiffres pour {selectedCountry.name})
                </span>
              </label>
              <div className="phone-row-m">
                <select
                  name="phoneCountry"
                  className="country-sel-m"
                  value={form.phoneCountry}
                  onChange={handleChange}>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phoneLocal"
                  className={`ef-input phone-local-m${touched.phoneLocal && errors.phoneLocal ? " ef-err" : ""}`}
                  value={form.phoneLocal}
                  onChange={handleChange}
                  onBlur={() => blur("phoneLocal")}
                  placeholder={"0".repeat(selectedCountry.digits)}
                  inputMode="numeric"
                  maxLength={selectedCountry.digits} />
              </div>
              {touched.phoneLocal && errors.phoneLocal && <p className="ef-error">{errors.phoneLocal}</p>}
            </div>

            {/* Rôle — Accessible uniquement en création */}
            {!isEdit && (
              <div className="ef full">
                <label className="ef-lbl">Rôle</label>
                <select name="role" className="ef-sel" value={form.role} onChange={handleChange}>
                  <option value="Responsable">Responsable</option>
                  <option value="Chauffeur">Chauffeur</option>
                </select>
              </div>
            )}
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
          {danger && <button type="button" className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>}
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
  const end = Math.min(page * perPage, total);
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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTouched, setSearchTouched] = useState(false);
  const [pendingAvis, setPendingAvis] = useState(0);

  useEffect(() => {
    fetchPendingAvisCount().then(setPendingAvis);
  }, []);
  const [searchParams] = useSearchParams();
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "Tous");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r) setRoleFilter(r);
  }, [searchParams]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [openMenu, setOpenMenu] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");

  /* Admin profile sync */
  const [adminName, setAdminName] = useState(getAdminName);
  const [adminPhoto, setAdminPhoto] = useState(getAdminPhoto);

  // ── Load users from API
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchUsers({ limit: 100 });
      setUsers((data.data || []).map(u => ({
        id: u.id || u._id,
        nom: u.name ?? "—",
        email: u.email ?? "—",
        telephone: u.phone ?? "—",
        role: u.role === "PASSAGER" ? "Passager"
          : u.role === "CHAUFFEUR" ? "Chauffeur"
            : u.role === "RESPONSABLE" ? "Responsable"
              : u.role === "ADMIN" ? "Admin" : u.role,
        banned: u.availability === "INDISPONIBLE",
        availability: u.availability,
        raw: u,
      })));
    } catch {
      setToast("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sync = () => { setAdminName(getAdminName()); setAdminPhoto(getAdminPhoto()); };
    window.addEventListener("airops-admin-profile-update", sync);
    return () => window.removeEventListener("airops-admin-profile-update", sync);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const searchError = searchTouched && search.trim().length > 50 ? "La recherche ne doit pas dépasser 50 caractères." : "";

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || [u.nom, u.email, u.telephone, u.role].join(" ").toLowerCase().includes(q);
      const matchRole = roleFilter === "Tous" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);


  const nextId = () => Math.max(0, ...users.map(u => u.id)) + 1;

  const handleAdd = (form) => {
    const newUser = { id: nextId(), ...form, nom: form.nom.trim(), email: form.email.trim(), telephone: form.telephone.trim(), banned: false };
    setUsers(prev => [...prev, newUser]);
    setShowAdd(false);
    setToast(`✓ Utilisateur « ${newUser.nom} » ajouté.`);
  };

  const handleEdit = async (form) => {
    try {
      const role = form.role === "Passager" ? "PASSAGER"
        : form.role === "Chauffeur" ? "CHAUFFEUR"
          : form.role === "Responsable" ? "RESPONSABLE"
            : form.role === "Admin" ? "ADMIN" : form.role;
      await updateUser(editUser.id, { name: form.nom.trim(), email: form.email.trim(), phone: form.telephone.trim(), role });
      setUsers(prev => prev.map(u => u.id === editUser.id
        ? { ...u, nom: form.nom.trim(), email: form.email.trim(), telephone: form.telephone.trim(), role: form.role }
        : u
      ));
      setToast(`✓ Compte de « ${form.nom.trim()} » modifié.`);
      setEditUser(null);
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de la modification.");
    }
  };

  const handleDelete = async (id) => {
    const u = users.find(x => x.id === id);
    try {
      await deleteUser(id); // Réelle suppression en base
      setUsers(prev => prev.filter(x => x.id !== id));
      setToast(`Utilisateur « ${u?.nom} » supprimé.`);
    } catch {
      setToast("Erreur lors de la suppression.");
    }
  };

  const handleBan = async (id) => {
    const u = users.find(x => x.id === id);
    try {
      await updateUser(id, { availability: "INDISPONIBLE" });
      setUsers(prev => prev.map(x => x.id === id ? { ...x, banned: true, availability: "INDISPONIBLE" } : x));
      setToast(`⚠ Compte de « ${u?.nom} » désactivé.`);
    } catch {
      setToast("Erreur lors de la désactivation.");
    }
  };

  const handleUnban = async (id) => {
    const u = users.find(x => x.id === id);
    try {
      await updateUser(id, { availability: "DISPONIBLE" });
      setUsers(prev => prev.map(x => x.id === id ? { ...x, banned: false, availability: "DISPONIBLE" } : x));
      setToast(`✓ Compte de « ${u?.nom} » réactivé.`);
    } catch {
      setToast("Erreur lors de la réactivation.");
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />
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
              {item.label === "Gestion des Avis" && pendingAvis > 0 && (
                <span className="sb-badge">{pendingAvis}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => { localStorage.clear(); navigate("/login", { replace: true }); }}>
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
                onBlur={() => setSearchTouched(true)} />
              {searchError && <p className="search-err">{searchError}</p>}
            </div>
            <div className="user-chip">
              <div className="user-info">
                <div className="user-name">{adminName}</div>
                <div className="user-role">Administrateur</div>
              </div>
              <div className="user-avatar" onClick={() => navigate("/profilA")} title="Mon profil">
                {adminPhoto ? <img src={adminPhoto} alt="profil" /> : <span>{getAdminInitials(adminName)}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="lc">
          <h1 className="page-title">Liste des Utilisateurs</h1>
          <p className="page-sub">Gérez les comptes, rôles et accès de tous les utilisateurs.</p>

          {/* Stats */}

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
            <button type="button" className="add-btn" onClick={() => navigate("/ajouterU")}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un utilisateur
            </button>
          </div>

          {/* Table */}
          <div className="tbl-card">
            <div className="tbl-head">
              <span>Utilisateur / Email</span>
              <span />
              <span className="col-phone">Téléphone</span>
              <span className="col-badges">Rôle & Statut</span>
              <span style={{ textAlign: "center" }}>Action</span>
            </div>
            <div className="tbl-body">
              {paginated.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
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
                    <div style={{ minWidth: 0 }}>
                      <div className="cell-name">{user.nom}</div>
                      <div className="cell-email" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                    </div>
                  </div>
                  <div style={{ paddingLeft: 4, fontSize: 12, color: "var(--text-muted)", wordBreak: "break-all" }}>
                    {/* Placeholder for empty space in second grid col if needed, but grid handles it */}
                  </div>
                  <div className="col-phone">
                    <span className="cell-phone">
                      {(user.telephone ?? "—").toLowerCase().includes("undefined") 
                        ? (user.telephone ?? "").replace(/\+?undefined/gi, "").trim()
                        : (user.telephone ?? "—")}
                    </span>
                  </div>
                  <div className="cell-badges col-badges">
                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    <span className={`status-badge ${user.banned ? "status-banned" : "status-active"}`}>
                      <span className="sdot" style={{ background: user.banned ? "#ef4444" : "#22c55e" }} />
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
              <Pagination total={filtered.length} page={safePage} perPage={perPage} onPage={setPage} onPerPage={setPerPage} />
            )}
          </div>
        </main>

        <footer className="lfoot">
          <div className="lfoot-brand">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
          </span>
        </footer>
      </div>

      {/* Modals */}
      {showAdd && <UserModal users={users} onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {editUser && <UserModal user={editUser} users={users} onClose={() => setEditUser(null)} onSave={handleEdit} />}
      {detailUser && <DetailModal user={detailUser} onClose={() => setDetailUser(null)} />}

      {confirm?.type === "ban" && (
        <ConfirmModal title="Désactiver le compte"
          message={`Voulez-vous vraiment bannir le compte de « ${confirm.user.nom} » ?`}
          confirmLabel="Bannir" danger
          onConfirm={() => handleBan(confirm.user.id)} onClose={() => setConfirm(null)} />
      )}
      {confirm?.type === "unban" && (
        <ConfirmModal title="Réactiver le compte"
          message={`Voulez-vous réactiver le compte de « ${confirm.user.nom} » ?`}
          confirmLabel="Réactiver" success
          onConfirm={() => handleUnban(confirm.user.id)} onClose={() => setConfirm(null)} />
      )}
      {confirm?.type === "delete" && (
        <ConfirmModal title="Supprimer l'utilisateur"
          message={`Cette action est irréversible. Supprimer définitivement « ${confirm.user.nom} » ?`}
          confirmLabel="Supprimer" danger
          onConfirm={() => handleDelete(confirm.user.id)} onClose={() => setConfirm(null)} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}