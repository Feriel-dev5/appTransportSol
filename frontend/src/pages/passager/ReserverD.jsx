import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProfileSync } from "../../services/useProfileSync";
import { createRequest } from "../../services/passengerService";
import { logout } from "../../services/authService";

/* ═══════════════════════════ CSS ═══════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bd:#0d2b5e; --bm:#1252aa; --bb:#2980e8; --bl:#7ec8ff;
    --bg:#f0f5fb; --white:#ffffff; --border:#e4ecf4;
    --ts:#0d2b5e; --tsec:#5a6e88; --tm:#94a3b8; --red:#ef4444; --green:#16a34a; --gold:#f59e0b;
    --sw:230px; --sw-min:66px; --hh:64px;
    --r-sm:0 2px 12px rgba(13,43,94,0.07); --r-md:0 8px 32px rgba(13,43,94,0.13); --r-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .rd-wrap { display:flex; height:100vh; overflow:hidden; background:var(--bg); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--ts); }

  /* ── Sidebar ── */
  .rd-sidebar { width:var(--sw); background:var(--bd); display:flex; flex-direction:column; flex-shrink:0; position:relative; z-index:30; transition:width 0.3s ease; box-shadow:4px 0 24px rgba(0,0,0,0.2); overflow:hidden; }
  .rd-sidebar.collapsed { width:var(--sw-min); }
  .rd-sb-brand { display:flex; align-items:center; gap:10px; padding:18px 13px 16px; border-bottom:1px solid rgba(255,255,255,0.07); cursor:pointer; flex-shrink:0; min-height:68px; overflow:hidden; }
  .rd-sb-brand-icon { width:40px; height:40px; min-width:40px; background:var(--bb); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(41,128,232,0.4); }
  .rd-sb-brand-text { overflow:hidden; white-space:nowrap; opacity:1; transition:opacity 0.2s; }
  .rd-sidebar.collapsed .rd-sb-brand-text { opacity:0; }
  .rd-sb-brand-name { font-size:17px; font-weight:800; color:#fff; letter-spacing:-0.4px; display:block; }
  .rd-sb-brand-sub  { font-size:9px; color:rgba(255,255,255,0.4); letter-spacing:1.8px; font-weight:600; display:block; }
  .rd-sb-toggle { position:absolute; top:22px; right:10px; width:22px; height:22px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; transition:var(--tr); }
  .rd-sb-toggle:hover { background:var(--bb); border-color:var(--bb); }
  .rd-sb-toggle svg { transition:transform 0.3s; }
  .rd-sidebar.collapsed .rd-sb-toggle svg { transform:rotate(180deg); }
  .rd-sb-lbl { font-size:9px; font-weight:700; letter-spacing:1.8px; color:rgba(255,255,255,0.25); padding:14px 14px 5px; text-transform:uppercase; white-space:nowrap; overflow:hidden; transition:opacity 0.2s; }
  .rd-sidebar.collapsed .rd-sb-lbl { opacity:0; }
  .rd-sb-nav { padding:0 9px; flex:1; overflow-y:auto; overflow-x:hidden; }
  .rd-sb-nav::-webkit-scrollbar { display:none; }
  .rd-nav-item { display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; text-decoration:none; font-size:13.5px; font-weight:500; color:rgba(255,255,255,0.58); transition:var(--tr); margin-bottom:3px; position:relative; overflow:hidden; white-space:nowrap; }
  .rd-nav-item:hover { color:#fff; background:rgba(255,255,255,0.09); }
  .rd-nav-item.active { color:#fff; font-weight:700; background:linear-gradient(135deg,var(--bb),#1a6fd4); box-shadow:0 4px 16px rgba(41,128,232,0.35); }
  .rd-nav-item.active::before { content:''; position:absolute; left:-9px; top:50%; transform:translateY(-50%); width:3px; height:55%; background:var(--bl); border-radius:0 3px 3px 0; }
  .rd-nav-icon { flex-shrink:0; width:18px; height:18px; display:flex; align-items:center; justify-content:center; }
  .rd-nav-lbl  { flex:1; overflow:hidden; transition:opacity 0.2s,max-width 0.3s; max-width:160px; }
  .rd-sidebar.collapsed .rd-nav-lbl { opacity:0; max-width:0; }
  .rd-sb-badge { background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0; transition:opacity 0.2s; margin-left:auto; }
  .rd-sidebar.collapsed .rd-sb-badge { opacity:0; }
  .rd-sidebar.collapsed .rd-nav-item::after { content:attr(data-label); position:absolute; left:calc(var(--sw-min) + 6px); top:50%; transform:translateY(-50%); background:var(--bd); color:#fff; font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px; white-space:nowrap; pointer-events:none; box-shadow:var(--r-md); border:1px solid rgba(255,255,255,0.1); z-index:200; opacity:0; transition:opacity 0.15s; }
  .rd-sidebar.collapsed .rd-nav-item:hover::after { opacity:1; }
  .rd-sb-footer { padding:6px 9px 16px; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
  .rd-sb-logout { width:100%; display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; border:none; background:transparent; color:rgba(255,255,255,0.4); font-size:13.5px; font-weight:500; cursor:pointer; transition:var(--tr); font-family:inherit; white-space:nowrap; overflow:hidden; }
  .rd-sb-logout:hover { color:#fca5a5; background:rgba(239,68,68,0.1); }
  .rd-logout-icon { flex-shrink:0; }
  .rd-logout-lbl  { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .rd-sidebar.collapsed .rd-logout-lbl { opacity:0; max-width:0; }
  .rd-sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  /* ── Main ── */
  .rd-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .rd-header { height:var(--hh); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--r-sm); }
  .rd-h-left  { display:flex; align-items:center; gap:12px; }
  .rd-h-right { display:flex; align-items:center; gap:10px; }
  .rd-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--tsec); padding:6px; border-radius:8px; transition:var(--tr); }
  .rd-menu-btn:hover { background:var(--bg); color:var(--ts); }
  .rd-h-title { font-size:15px; font-weight:700; color:var(--ts); }
  .rd-search-wrap { position:relative; }
  .rd-search-wrap svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--tm); pointer-events:none; }
  .rd-search-input { width:230px; padding:9px 12px 9px 34px; border:1.5px solid var(--border); border-radius:22px; background:var(--bg); font-size:13px; font-family:inherit; color:var(--ts); outline:none; transition:var(--tr); }
  .rd-search-input:focus { border-color:var(--bb); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .rd-search-input::placeholder { color:var(--tm); }
  .rd-notif-btn { position:relative; background:none; border:none; cursor:pointer; color:var(--tsec); padding:8px; border-radius:10px; transition:var(--tr); }
  .rd-notif-btn:hover { background:var(--bg); color:var(--bb); }
  .rd-user-chip { display:flex; align-items:center; gap:9px; }
  .rd-user-info { text-align:right; }
  .rd-user-name { font-size:13px; font-weight:700; color:var(--ts); }
  .rd-user-role { font-size:11px; color:var(--tm); }
  .rd-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--bb),var(--bm)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; cursor:pointer; }
  .rd-avatar img { width:100%; height:100%; object-fit:cover; }

  /* ── Content ── */
  .rd-content { flex:1; overflow-y:auto; padding:26px; }
  .rd-page-title { font-size:25px; font-weight:800; color:var(--bd); letter-spacing:-0.5px; margin-bottom:4px; }
  .rd-page-title span { color:var(--bb); }
  .rd-page-sub { font-size:13px; color:var(--tm); margin-bottom:22px; }

  /* ── TYPE TABS ── */
  .rd-type-tabs { display:flex; gap:12px; margin-bottom:24px; }
  .rd-type-tab { flex:1; display:flex; align-items:center; gap:12px; padding:16px 20px; border-radius:18px; border:2px solid var(--border); background:#fff; cursor:pointer; transition:var(--tr); box-shadow:var(--r-sm); }
  .rd-type-tab:hover { border-color:var(--bb); background:#f8fbff; }
  .rd-type-tab.active-std { border-color:var(--bb); background:linear-gradient(135deg,#eff6ff,#dbeafe); box-shadow:0 4px 20px rgba(41,128,232,0.15); }
  .rd-type-tab.active-vip { border-color:var(--gold); background:linear-gradient(135deg,#fffbeb,#fef3c7); box-shadow:0 4px 20px rgba(245,158,11,0.2); }
  .rd-type-tab-icon { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .rd-type-tab.active-std .rd-type-tab-icon { background:var(--bb); }
  .rd-type-tab.active-vip .rd-type-tab-icon { background:var(--gold); }
  .rd-type-tab:not(.active-std):not(.active-vip) .rd-type-tab-icon { background:var(--bg); }
  .rd-type-tab-title { font-size:15px; font-weight:800; color:var(--bd); }
  .rd-type-tab-sub   { font-size:11px; color:var(--tm); margin-top:2px; }
  .rd-type-tab.active-std .rd-type-tab-title { color:var(--bb); }
  .rd-type-tab.active-vip .rd-type-tab-title { color:#92400e; }
  .rd-type-badge { margin-left:auto; font-size:9px; font-weight:800; letter-spacing:1.5px; padding:4px 10px; border-radius:20px; flex-shrink:0; }
  .active-std .rd-type-badge { background:#dbeafe; color:var(--bb); }
  .active-vip .rd-type-badge { background:#fde68a; color:#92400e; }

  /* ── FORM GRID ── */
  .rd-grid { display:grid; grid-template-columns:1fr 300px; gap:20px; }
  .rd-form-card { background:#fff; border:1px solid var(--border); border-radius:24px; overflow:hidden; box-shadow:var(--r-sm); transition:var(--tr); }
  .rd-form-card:hover { box-shadow:var(--r-md); }
  .rd-form-header { padding:22px 28px; color:#fff; display:flex; align-items:flex-start; justify-content:space-between; }
  .rd-form-header.std { background:linear-gradient(135deg,var(--bd),var(--bm)); }
  .rd-form-header.vip { background:linear-gradient(135deg,#78350f,#92400e,#b45309); }
  .rd-fh-badge  { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.55); font-weight:700; margin-bottom:5px; }
  .rd-fh-title  { font-size:22px; font-weight:800; }
  .rd-fh-sub    { font-size:12px; color:rgba(255,255,255,0.65); margin-top:4px; }
  .rd-fh-icon   { width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .rd-form-body { padding:24px 28px; }
  .rd-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .rd-row-1 { display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:16px; }
  .rd-field { display:flex; flex-direction:column; gap:5px; }
  .rd-label { font-size:10.5px; font-weight:700; color:var(--tsec); letter-spacing:0.5px; text-transform:uppercase; }
  .rd-input,.rd-select,.rd-textarea { padding:11px 14px; border:1.5px solid var(--border); border-radius:12px; font-size:13px; font-family:inherit; color:var(--ts); background:#f8fafc; outline:none; transition:var(--tr); width:100%; }
  .rd-input:focus,.rd-select:focus,.rd-textarea:focus { border-color:var(--bb); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .rd-input.err,.rd-select.err,.rd-textarea.err { border-color:#fca5a5; background:#fff9f9; }
  .rd-input::placeholder,.rd-textarea::placeholder { color:var(--tm); }
  .rd-textarea { resize:vertical; min-height:80px; }
  .rd-select { cursor:pointer; }
  .rd-err-msg { font-size:11px; color:var(--red); margin-top:2px; }
  .rd-phone-row { display:flex; gap:8px; align-items:flex-start; }
  .rd-country-select { height:46px; border:1.5px solid var(--border); border-radius:12px; font-size:12px; font-family:inherit; color:var(--ts); background:#f8fafc; outline:none; transition:var(--tr); cursor:pointer; padding:0 8px; flex-shrink:0; min-width:130px; }
  .rd-country-select:focus { border-color:var(--bb); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .rd-country-select.err { border-color:#fca5a5; background:#fff9f9; }
  .rd-phone-local { flex:1; }
  .rd-char-row { display:flex; justify-content:space-between; margin-top:3px; }
  .rd-char-hint { font-size:11px; color:var(--tm); }

  /* VIP passenger list */
  .vip-pax-list { display:flex; flex-direction:column; gap:12px; margin-bottom:16px; }
  .vip-pax-item { background:#fffbeb; border:1.5px solid #fde68a; border-radius:14px; padding:14px 16px; position:relative; }
  .vip-pax-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .vip-pax-title { font-size:12px; font-weight:700; color:#92400e; display:flex; align-items:center; gap:6px; }
  .vip-pax-remove { background:none; border:none; cursor:pointer; color:#fca5a5; font-size:16px; padding:2px 6px; border-radius:6px; transition:var(--tr); }
  .vip-pax-remove:hover { background:#fef2f2; color:var(--red); }
  .vip-pax-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .btn-add-pax { display:flex; align-items:center; gap:8px; padding:10px 18px; background:#fffbeb; border:2px dashed #fde68a; border-radius:12px; color:#92400e; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); width:100%; justify-content:center; margin-bottom:16px; }
  .btn-add-pax:hover { background:#fef3c7; border-color:var(--gold); }

  .rd-note { display:flex; align-items:flex-start; gap:8px; border-radius:10px; padding:10px 14px; font-size:12px; font-weight:500; margin-bottom:16px; }
  .rd-note.std { background:#eff6ff; border:1px solid #bfdbfe; color:var(--bm); }
  .rd-note.vip { background:#fffbeb; border:1px solid #fde68a; color:#92400e; }

  .rd-form-footer { display:flex; align-items:center; justify-content:space-between; padding-top:20px; border-top:1px solid var(--border); flex-wrap:wrap; gap:12px; }
  .rd-form-footer-msg { font-size:12px; color:var(--tm); }
  .rd-btn-row { display:flex; align-items:center; gap:10px; }
  .rd-btn-cancel { padding:10px 22px; font-size:13px; font-weight:600; font-family:inherit; color:var(--tsec); border:1.5px solid var(--border); border-radius:12px; background:#fff; cursor:pointer; transition:var(--tr); }
  .rd-btn-cancel:hover { background:var(--bg); }
  .rd-btn-submit { padding:11px 26px; font-size:13px; font-weight:700; font-family:inherit; color:#fff; border:none; border-radius:12px; cursor:pointer; transition:var(--tr); display:flex; align-items:center; gap:7px; }
  .rd-btn-submit.std { background:linear-gradient(135deg,var(--bb),#1a6fd4); box-shadow:0 4px 14px rgba(41,128,232,0.3); }
  .rd-btn-submit.vip { background:linear-gradient(135deg,#b45309,#92400e); box-shadow:0 4px 14px rgba(180,83,9,0.3); }
  .rd-btn-submit:hover:not(:disabled) { transform:translateY(-1px); }
  .rd-btn-submit:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }

  /* ── Preview ── */
  .rd-preview { display:flex; flex-direction:column; gap:16px; }
  .rd-preview-card { background:#fff; border:1px solid var(--border); border-radius:24px; padding:20px; box-shadow:var(--r-sm); transition:var(--tr); }
  .rd-preview-card:hover { transform:translateY(-4px); box-shadow:var(--r-md); }
  .rd-preview-tag { font-size:9px; font-weight:700; letter-spacing:1.8px; color:var(--bb); margin-bottom:14px; text-transform:uppercase; }
  .rd-pv-block { background:#f8fafc; border-radius:10px; padding:12px 14px; margin-bottom:10px; }
  .rd-pv-block:last-child { margin-bottom:0; }
  .rd-pv-lbl { font-size:10px; font-weight:700; color:var(--tm); text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px; }
  .rd-pv-val { font-size:13px; font-weight:700; color:var(--ts); }
  .rd-pv-val.muted { color:var(--tm); font-weight:400; font-style:italic; }
  .rd-pv-row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .rd-pax-card { border-radius:14px; padding:16px 18px; color:#fff; position:relative; overflow:hidden; }
  .rd-pax-card.std { background:linear-gradient(135deg,var(--bb),#1a6fd4); }
  .rd-pax-card.vip { background:linear-gradient(135deg,#b45309,#78350f); }
  .rd-pax-lbl { font-size:12px; color:rgba(255,255,255,0.75); }
  .rd-pax-num { font-size:36px; font-weight:800; letter-spacing:-1px; line-height:1.1; margin:4px 0 2px; }
  .rd-pax-sub { font-size:11px; color:rgba(255,255,255,0.65); }
  .rd-pax-ring { position:absolute; right:-16px; bottom:-16px; width:70px; height:70px; border-radius:50%; background:rgba(255,255,255,0.1); }
  .rd-tip-card { background:linear-gradient(135deg,var(--bd),var(--bm)); border-radius:24px; padding:22px; color:#fff; box-shadow:var(--r-sm); transition:var(--tr); }
  .rd-tip-card:hover { transform:translateY(-4px); box-shadow:var(--r-md); }
  .rd-tip-lbl   { font-size:10px; color:rgba(255,255,255,0.5); font-weight:700; letter-spacing:1.5px; margin-bottom:10px; }
  .rd-tip-title { font-size:17px; font-weight:800; line-height:1.35; margin-bottom:10px; }
  .rd-tip-text  { font-size:12px; color:rgba(255,255,255,0.65); line-height:1.6; margin-bottom:16px; }
  .rd-tip-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:6px 14px; font-size:11px; font-weight:600; color:rgba(255,255,255,0.9); }

  .rd-vip-badge { display:inline-flex; align-items:center; gap:5px; background:linear-gradient(135deg,#fde68a,#fbbf24); color:#78350f; font-size:10px; font-weight:800; padding:4px 10px; border-radius:20px; letter-spacing:0.5px; margin-top:6px; }

  .rd-toast { position:fixed; top:18px; right:18px; z-index:20000; background:var(--bd); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--r-lg); border-left:3px solid var(--bl); animation:rdToastIn 0.3s ease; }
  @keyframes rdToastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

  @media (max-width:1100px) { .rd-grid { grid-template-columns:1fr; } .rd-preview { flex-direction:row; flex-wrap:wrap; } .rd-preview-card,.rd-tip-card { flex:1; min-width:220px; } }
  @media (max-width:900px)  { .rd-row-2 { grid-template-columns:1fr; } .vip-pax-grid { grid-template-columns:1fr; } .rd-type-tabs { flex-direction:column; } }
  @media (max-width:768px)  {
    .rd-sidebar { position:fixed; left:0; top:0; bottom:0; z-index:30; transform:translateX(-100%); width:var(--sw) !important; transition:transform 0.3s ease !important; }
    .rd-sidebar.open { transform:translateX(0); } .rd-sidebar.collapsed { transform:translateX(-100%); } .rd-sidebar.collapsed.open { transform:translateX(0); }
    .rd-sb-overlay { display:block; } .rd-menu-btn { display:flex; } .rd-sb-toggle { display:none; }
    .rd-content { padding:16px; } .rd-header { padding:0 16px; } .rd-preview { flex-direction:column; }
  }
  @media (max-width:540px) { .rd-search-wrap { display:none; } .rd-user-info { display:none; } .rd-form-body { padding:18px 16px; } .rd-form-header { padding:18px; } }
`;

if (typeof document !== "undefined" && !document.getElementById("rd-css")) {
  const tag = document.createElement("style"); tag.id = "rd-css"; tag.textContent = CSS; document.head.appendChild(tag);
}

/* ════ DATA ════ */
const AIRPORTS = ["Aéroport Tunis-Carthage (TUN)","Aéroport Monastir Habib Bourguiba (MIR)","Aéroport Djerba-Zarzis (DJE)","Aéroport Sfax-Thyna (SFA)","Aéroport Tozeur-Nefta (TOE)","Aéroport Tabarka-Aïn Draham (TBJ)","Aéroport Gafsa-Ksar (GAF)"];
const HOTELS   = ["The Residence Tunis (La Marsa)","Hôtel Africa Meridien (Tunis Centre)","Hôtel El Mouradi Africa (Tunis)","Hôtel Les Berges du Lac (Tunis)","Golden Tulip El Mechtel (Tunis)","Hôtel Hasdrubal Thalassa & Spa (Hammamet)","One Resort Aqua Park & Spa (Hammamet)","Hôtel Riu Palace Hammamet","Hôtel El Ksar Sousse","Marhaba Palace (Sousse)","Hôtel Royal Jinene (Sousse)","Hôtel Iberostar Selection Kuriat Palace (Monastir)","Club Med Djerba la Douce","Hôtel Radisson Blu Palace Resort (Djerba)","Hôtel Hasdrubal Prestige (Djerba)","Hôtel Djerba Plaza Thalassa & Spa","Hôtel Dar Horchani (Tozeur)","Hôtel Yadis Dunes (Tozeur)","Hôtel Mehari Tabarka","Hôtel Les Oliviers Palace (Sfax)","Hôtel Thyna (Sfax)","Hôtel Nabeul Beach","Hôtel Aqua Palace (Nabeul)","Club Palmeraie (Mahdia)","Hôtel Iberostar Averroes (Mahdia)","Hôtel Bizerta Resort","Hôtel Les Nymphes (Zaghouan)"];

const LOCAL_REQUESTS_KEY = "airops_passenger_requests_v1";

function getLocalRequestsKey() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = u._id || u.id || u.email || "default";
    return `${LOCAL_REQUESTS_KEY}_${uid}`;
  } catch {
    return `${LOCAL_REQUESTS_KEY}_default`;
  }
}

function readLocalRequests() {
  try {
    const raw = localStorage.getItem(getLocalRequestsKey());
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveLocalRequest(item) {
  const current = readLocalRequests();
  const key = String(item._id || item.id || item.ref);
  const exists = current.some(d => String(d._id || d.id || d.ref) === key);
  const updated = exists ? current.map(d => String(d._id || d.id || d.ref) === key ? item : d) : [item, ...current];
  try { localStorage.setItem(getLocalRequestsKey(), JSON.stringify(updated)); } catch {}
}

function makeLocalRequest(payload, created, fallbackRef) {
  const id = created?._id || created?.id || fallbackRef;
  const refPrefix = payload.type === "vip" ? "#VIP" : "#DEM";
  const ref = created ? `${refPrefix}-${String(id).slice(-4).toUpperCase()}` : fallbackRef;
  return {
    _id: id,
    id,
    ref,
    type: payload.type || "standard",
    trajet: `${payload.from} → ${payload.to}`,
    vers: payload.to,
    date: payload.date,
    statut: "EN ATTENTE",
    detail: {
      passager: payload.passengerList?.[0] ? `${payload.passengerList[0].prenom || ""} ${payload.passengerList[0].nom || ""}`.trim() : "Passager",
      depart: payload.from,
      arrivee: payload.to,
      heure: payload.time,
      passagers: payload.passengers,
      telephone: payload.phone,
      email: payload.email,
      commentaire: payload.comment || "",
    },
  };
}


const COUNTRIES_PHONE = [
  {code:"TN",dial:"+216",flag:"🇹🇳",name:"Tunisie",digits:8},{code:"DZ",dial:"+213",flag:"🇩🇿",name:"Algérie",digits:9},
  {code:"MA",dial:"+212",flag:"🇲🇦",name:"Maroc",digits:9},{code:"EG",dial:"+20",flag:"🇪🇬",name:"Égypte",digits:10},
  {code:"LY",dial:"+218",flag:"🇱🇾",name:"Libye",digits:9},{code:"FR",dial:"+33",flag:"🇫🇷",name:"France",digits:9},
  {code:"DE",dial:"+49",flag:"🇩🇪",name:"Allemagne",digits:11},{code:"GB",dial:"+44",flag:"🇬🇧",name:"Royaume-Uni",digits:10},
  {code:"SA",dial:"+966",flag:"🇸🇦",name:"Arabie Saoudite",digits:9},{code:"AE",dial:"+971",flag:"🇦🇪",name:"Émirats",digits:9},
  {code:"US",dial:"+1",flag:"🇺🇸",name:"États-Unis",digits:10},{code:"CA",dial:"+1",flag:"🇨🇦",name:"Canada",digits:10},
];

/* NAV — no badge on Notifications */
const navItems = [
  {
    label: "Tableau de bord",
    to: "/dashbordP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  },
  {
    label: "Réserver demande",
    to: "/reserverD",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>,
  },
  {
    label: "Notifications",
    to: "/notificationP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  },
  {
    label: "Ajouter avis",
    to: "/avisP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  },
  {
    label: "Profile",
    to: "/profilP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  },
];

function todayISO() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function LocationSelect({ value, onChange, hasErr, placeholder }) {
  return (
    <select className={`rd-select${hasErr?" err":""}`} value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      <optgroup label="✈️ Aéroports tunisiens">{AIRPORTS.map(a=><option key={a} value={a}>{a}</option>)}</optgroup>
      <optgroup label="🏨 Hôtels tunisiens">{HOTELS.map(h=><option key={h} value={h}>{h}</option>)}</optgroup>
    </select>
  );
}

/* ════════════════════ INIT FORMS ════════════════════ */
const INIT_STD = { depart:"", destination:"", dateArrivee:"", heureArrivee:"", nombrePassagers:"2", telephoneCountry:"TN", telephoneLocal:"", email:"", commentaire:"" };
const INIT_VIP_PAX = () => ({ nom:"", prenom:"", email:"", telephoneCountry:"TN", telephoneLocal:"" });
const INIT_VIP = { depart:"", destination:"", dateArrivee:"", heureArrivee:"", telephoneCountry:"TN", telephoneLocal:"", email:"", commentaire:"", passagers:[INIT_VIP_PAX()] };

/* ════════════════════ MAIN ════════════════════ */
export default function ReserverD() {
  const navigate = useNavigate();
  const { nom, photo, initials, unreadCount } = useProfileSync();
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast,         setToast]         = useState("");
  const [reservType,    setReservType]    = useState("standard"); // "standard" | "vip"
  const [submitting,    setSubmitting]    = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  /* ── Standard form ── */
  const [std,    setStd]    = useState(INIT_STD);
  const [stdT,   setStdT]   = useState({});

  /* ── VIP form ── */
  const [vip,    setVip]    = useState(INIT_VIP);
  const [vipT,   setVipT]   = useState({});

  useEffect(()=>{ if(!toast)return; const t=setTimeout(()=>setToast(""),3500); return()=>clearTimeout(t); },[toast]);

  const nowTime=()=>{ const d=new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
  const minDate=todayISO();

  const getCountry=(code)=>COUNTRIES_PHONE.find(c=>c.code===code)||COUNTRIES_PHONE[0];

  /* ── STD Errors ── */
  const stdErr = useMemo(()=>{
    const c=getCountry(std.telephoneCountry);
    return {
      depart:!std.depart?"Le lieu de départ est obligatoire.":"",
      destination:!std.destination?"La destination est obligatoire.":"",
      dateArrivee:!std.dateArrivee?"La date est obligatoire.":std.dateArrivee<minDate?"La date ne peut pas être dans le passé.":"",
      heureArrivee:!std.heureArrivee?"L'heure est obligatoire.":(std.dateArrivee===minDate&&std.heureArrivee<=nowTime())?"L'heure doit être dans le futur.":"",
      nombrePassagers:Number(std.nombrePassagers)<2?"Minimum 2 passagers.":Number(std.nombrePassagers)>50?"Maximum 50.":"",
      telephoneLocal:!std.telephoneLocal.trim()?"Le téléphone est obligatoire.":!/^\d+$/.test(std.telephoneLocal)?"Chiffres uniquement.":std.telephoneLocal.length!==c.digits?`${c.digits} chiffres requis.`:"",
      email:!std.email.trim()?"L'email est obligatoire.":/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(std.email)?"":"Email invalide.",
      commentaire:std.commentaire.length>300?"Maximum 300 caractères.":"",
    };
  },[std]);

  /* ── VIP Errors ── */
  const vipErr = useMemo(()=>{
    const c=getCountry(vip.telephoneCountry);
    const errs={
      depart:!vip.depart?"Le lieu de départ est obligatoire.":"",
      destination:!vip.destination?"La destination est obligatoire.":"",
      dateArrivee:!vip.dateArrivee?"La date est obligatoire.":vip.dateArrivee<minDate?"La date ne peut pas être dans le passé.":"",
      heureArrivee:!vip.heureArrivee?"L'heure est obligatoire.":(vip.dateArrivee===minDate&&vip.heureArrivee<=nowTime())?"L'heure doit être dans le futur.":"",
      telephoneLocal:!vip.telephoneLocal.trim()?"Le téléphone est obligatoire.":!/^\d+$/.test(vip.telephoneLocal)?"Chiffres uniquement.":vip.telephoneLocal.length!==c.digits?`${c.digits} chiffres requis.`:"",
      email:!vip.email.trim()?"L'email est obligatoire.":/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vip.email)?"":"Email invalide.",
      commentaire:vip.commentaire.length>400?"Maximum 400 caractères.":"",
      passagers:vip.passagers.length<1?"Au moins 1 passager requis.":"",
    };
    return errs;
  },[vip]);

  const stdValid=Object.values(stdErr).every(v=>!v);
  const vipValid=Object.values(vipErr).every(v=>!v) && vip.passagers.length>=1;

  /* ── STD update ── */
  const updStd=(f,v)=>setStd(p=>({...p,[f]:v}));
  const blurStd=(f)=>setStdT(p=>({...p,[f]:true}));

  /* ── VIP update ── */
  const updVip=(f,v)=>setVip(p=>({...p,[f]:v}));
  const blurVip=(f)=>setVipT(p=>({...p,[f]:true}));
  const updPax=(i,f,v)=>setVip(p=>({...p,passagers:p.passagers.map((px,idx)=>idx===i?{...px,[f]:v}:px)}));
  const addPax=()=>{ if(vip.passagers.length<10) setVip(p=>({...p,passagers:[...p.passagers,INIT_VIP_PAX()]})); };
  const removePax=(i)=>{ if(vip.passagers.length>1) setVip(p=>({...p,passagers:p.passagers.filter((_,idx)=>idx!==i)})); };

  /* ── Submit Standard ── */
  const handleSubmitStd=async(e)=>{
    e.preventDefault();
    setStdT(Object.fromEntries(Object.keys(stdErr).map(k=>[k,true])));
    if(!stdValid)return;
    setSubmitting(true);
    try {
      const c=getCountry(std.telephoneCountry);
      const payload={ from:std.depart,to:std.destination,date:std.dateArrivee,time:std.heureArrivee,passengers:Number(std.nombrePassagers),phone:`${c.dial} ${std.telephoneLocal}`,email:std.email,comment:std.commentaire,type:"standard" };
      const created=await createRequest(payload);
      const fallbackRef = `#DEM-${Date.now().toString().slice(-6)}`;
      const localRequest = makeLocalRequest(payload, created, fallbackRef);
      saveLocalRequest(localRequest);
      window.dispatchEvent(new Event("airops-requests-update"));
      const ref = created?.ref || localRequest.ref;
      setToast(`✅ Demande standard ${ref} envoyée avec succès !`);
      setStd(INIT_STD); setStdT({});
      setTimeout(() => navigate("/dashbordP"), 1500);
    } catch(err){ setToast("❌ "+(err?.response?.data?.message||"Erreur lors de l'envoi.")); }
    finally{ setSubmitting(false); }
  };

  /* ── Submit VIP ── */
  const handleSubmitVip=async(e)=>{
    e.preventDefault();
    setVipT(Object.fromEntries(Object.keys(vipErr).map(k=>[k,true])));
    if(!vipValid)return;
    setSubmitting(true);
    try {
      const c=getCountry(vip.telephoneCountry);
      const payload={ from:vip.depart,to:vip.destination,date:vip.dateArrivee,time:vip.heureArrivee,passengers:vip.passagers.length,phone:`${c.dial} ${vip.telephoneLocal}`,email:vip.email,comment:vip.commentaire,type:"vip",passengerList:vip.passagers };
      const created=await createRequest(payload);
      const fallbackRef = `#VIP-${Date.now().toString().slice(-6)}`;
      const localRequest = makeLocalRequest(payload, created, fallbackRef);
      saveLocalRequest(localRequest);
      window.dispatchEvent(new Event("airops-requests-update"));
      const ref = created?.ref || localRequest.ref;
      setToast(`⭐ Demande VIP ${ref} envoyée avec succès !`);
      setVip(INIT_VIP); setVipT({});
      setTimeout(() => navigate("/dashbordP"), 1500);
    } catch(err){ setToast("❌ "+(err?.response?.data?.message||"Erreur lors de l'envoi.")); }
    finally{ setSubmitting(false); }
  };

  const isStd=reservType==="standard";
  const curPax=isStd?std.nombrePassagers:vip.passagers.length;

  return (
    <div className="rd-wrap">
      {sidebarMobile&&<div className="rd-sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

      {/* ── Sidebar ── */}
      <aside className={["rd-sidebar",collapsed?"collapsed":"",sidebarMobile?"open":""].filter(Boolean).join(" ")}>
        <button type="button" className="rd-sb-toggle" onClick={()=>setCollapsed(v=>!v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="rd-sb-brand" onClick={()=>navigate("/dashbordP")}>
          <div className="rd-sb-brand-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12"/></svg>
          </div>
          <div className="rd-sb-brand-text"><span className="rd-sb-brand-name">AirOps</span><span className="rd-sb-brand-sub">ESPACE PASSAGER</span></div>
        </div>
        <div className="rd-sb-lbl">Navigation</div>
        <nav className="rd-sb-nav">
          {navItems.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`rd-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="rd-nav-icon">{item.icon}</span><span className="rd-nav-lbl">{item.label}</span>
              {item.label === "Notifications" && unreadCount > 0 ? <span className="rd-sb-badge">{unreadCount}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="rd-sb-footer">
          <div className="rd-sb-lbl" style={{paddingTop:0}}>Compte</div>
          <button type="button" className="rd-sb-logout" onClick={handleLogout}>
            <span className="rd-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="rd-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="rd-main">
        <header className="rd-header">
          <div className="rd-h-left">
            <button type="button" className="rd-menu-btn" onClick={()=>setSidebarMobile(v=>!v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="rd-h-title">Réserver une demande</span>
          </div>
          <div className="rd-h-right">
            <div className="rd-search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className="rd-search-input" placeholder="Rechercher…"/>
            </div>
            <button type="button" className="rd-notif-btn" onClick={()=>navigate("/notificationP")}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            </button>
            <div className="rd-user-chip">
              <div className="rd-user-info"><div className="rd-user-name">{nom}</div><div className="rd-user-role">Passager</div></div>
              <div className="rd-avatar" onClick={()=>navigate("/profilP")}>
                {photo?<img src={photo} alt="profil"/>:initials}
              </div>
            </div>
          </div>
        </header>

        <main className="rd-content">
          <h1 className="rd-page-title">Nouvelle <span>réservation</span> ✈️</h1>
          <p className="rd-page-sub">Choisissez votre type de réservation puis remplissez le formulaire.</p>

          {/* ── TYPE SELECTOR ── */}
          <div className="rd-type-tabs">
            {/* Standard */}
            <div className={`rd-type-tab${reservType==="standard"?" active-std":""}`} onClick={()=>setReservType("standard")}>
              <div className="rd-type-tab-icon">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={reservType==="standard"?"white":"#94a3b8"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div className="rd-type-tab-title">Réservation Standard</div>
                <div className="rd-type-tab-sub">Groupe de 2 à 50 passagers • Regroupement possible</div>
              </div>
              {reservType==="standard"&&<span className="rd-type-badge">SÉLECTIONNÉ</span>}
            </div>
            {/* VIP */}
            <div className={`rd-type-tab${reservType==="vip"?" active-vip":""}`} onClick={()=>setReservType("vip")}>
              <div className="rd-type-tab-icon">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={reservType==="vip"?"white":"#94a3b8"} strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <div>
                <div className="rd-type-tab-title">Réservation VIP</div>
                <div className="rd-type-tab-sub">1 ou plusieurs passagers • Service exclusif • Pas de regroupement</div>
              </div>
              {reservType==="vip"&&<span className="rd-type-badge">VIP</span>}
            </div>
          </div>

          <div className="rd-grid">
            {/* ════════════ FORM CARD ════════════ */}
            <div className="rd-form-card">
              <div className={`rd-form-header ${isStd?"std":"vip"}`}>
                <div>
                  <p className="rd-fh-badge">{isStd?"RÉSERVATION STANDARD":"RÉSERVATION VIP ⭐"}</p>
                  <p className="rd-fh-title">{isStd?"Formulaire de demande":"Formulaire VIP exclusif"}</p>
                  <p className="rd-fh-sub">{isStd?"Regroupement possible avec d'autres passagers de même destination.":"Service privatisé — aucun regroupement avec d'autres passagers."}</p>
                </div>
                <div className="rd-fh-icon">
                  {isStd?(
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  ):(
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                  )}
                </div>
              </div>

              {/* ══ STANDARD FORM ══ */}
              {isStd&&(
                <form className="rd-form-body" onSubmit={handleSubmitStd} noValidate>
                  <div className={`rd-note std`}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{flexShrink:0,marginTop:1}}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Les passagers standard peuvent être regroupés avec d'autres passagers ayant la même destination pour optimiser le transport.
                  </div>
                  <div className="rd-row-2">
                    <div className="rd-field"><label className="rd-label">Point de départ *</label><LocationSelect value={std.depart} onChange={v=>updStd("depart",v)} hasErr={!!(stdT.depart&&stdErr.depart)} placeholder="Choisir le lieu de départ…"/>{stdT.depart&&stdErr.depart&&<span className="rd-err-msg">{stdErr.depart}</span>}</div>
                    <div className="rd-field"><label className="rd-label">Destination *</label><LocationSelect value={std.destination} onChange={v=>updStd("destination",v)} hasErr={!!(stdT.destination&&stdErr.destination)} placeholder="Choisir la destination…"/>{stdT.destination&&stdErr.destination&&<span className="rd-err-msg">{stdErr.destination}</span>}</div>
                  </div>
                  <div className="rd-row-2">
                    <div className="rd-field"><label className="rd-label">Date de voyage *</label><input type="date" className={`rd-input${stdT.dateArrivee&&stdErr.dateArrivee?" err":""}`} value={std.dateArrivee} min={minDate} onChange={e=>updStd("dateArrivee",e.target.value)} onBlur={()=>blurStd("dateArrivee")}/>{stdT.dateArrivee&&stdErr.dateArrivee&&<span className="rd-err-msg">{stdErr.dateArrivee}</span>}</div>
                    <div className="rd-field"><label className="rd-label">Heure d'arrivée *</label><input type="time" className={`rd-input${stdT.heureArrivee&&stdErr.heureArrivee?" err":""}`} value={std.heureArrivee} onChange={e=>updStd("heureArrivee",e.target.value)} onBlur={()=>blurStd("heureArrivee")}/>{stdT.heureArrivee&&stdErr.heureArrivee&&<span className="rd-err-msg">{stdErr.heureArrivee}</span>}</div>
                  </div>
                  <div className="rd-row-2">
                    <div className="rd-field">
                      <label className="rd-label">Nombre de passagers * <span style={{color:"var(--tm)",fontWeight:400,textTransform:"none"}}>(min. 2)</span></label>
                      <input type="number" min="2" max="50" className={`rd-input${stdT.nombrePassagers&&stdErr.nombrePassagers?" err":""}`} value={std.nombrePassagers} onChange={e=>updStd("nombrePassagers",e.target.value)} onBlur={()=>blurStd("nombrePassagers")}/>
                      {stdT.nombrePassagers&&stdErr.nombrePassagers&&<span className="rd-err-msg">{stdErr.nombrePassagers}</span>}
                    </div>
                    <div className="rd-field">
                      <label className="rd-label">Téléphone * <span style={{color:"var(--tm)",fontWeight:400,textTransform:"none"}}>({getCountry(std.telephoneCountry).digits} chiffres)</span></label>
                      <div className="rd-phone-row">
                        <select className={`rd-country-select${stdT.telephoneLocal&&stdErr.telephoneLocal?" err":""}`} value={std.telephoneCountry} onChange={e=>{updStd("telephoneCountry",e.target.value);updStd("telephoneLocal","");}}>
                          {COUNTRIES_PHONE.map(c=><option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>)}
                        </select>
                        <input type="tel" inputMode="numeric" maxLength={getCountry(std.telephoneCountry).digits} className={`rd-input rd-phone-local${stdT.telephoneLocal&&stdErr.telephoneLocal?" err":""}`} value={std.telephoneLocal} placeholder={"0".repeat(getCountry(std.telephoneCountry).digits)} onChange={e=>{if(/^\d*$/.test(e.target.value))updStd("telephoneLocal",e.target.value);}} onBlur={()=>blurStd("telephoneLocal")}/>
                      </div>
                      {stdT.telephoneLocal&&stdErr.telephoneLocal&&<span className="rd-err-msg">{stdErr.telephoneLocal}</span>}
                    </div>
                  </div>
                  <div className="rd-row-1">
                    <div className="rd-field"><label className="rd-label">Adresse email *</label><input type="email" className={`rd-input${stdT.email&&stdErr.email?" err":""}`} value={std.email} placeholder="passager@email.com" onChange={e=>updStd("email",e.target.value)} onBlur={()=>blurStd("email")}/>{stdT.email&&stdErr.email&&<span className="rd-err-msg">{stdErr.email}</span>}</div>
                  </div>
                  <div className="rd-row-1" style={{marginBottom:0}}>
                    <div className="rd-field">
                      <label className="rd-label">Commentaire</label>
                      <textarea className={`rd-textarea${stdT.commentaire&&stdErr.commentaire?" err":""}`} value={std.commentaire} placeholder="Détails utiles : bagage, terminal, besoins spéciaux…" onChange={e=>updStd("commentaire",e.target.value)} onBlur={()=>blurStd("commentaire")}/>
                      <div className="rd-char-row">{stdT.commentaire&&stdErr.commentaire?<span className="rd-err-msg">{stdErr.commentaire}</span>:<span className="rd-char-hint">Optionnel — max 300 caractères</span>}<span className="rd-char-hint">{std.commentaire.length}/300</span></div>
                    </div>
                  </div>
                  <div className="rd-form-footer">
                    <p className="rd-form-footer-msg">Les champs * sont obligatoires.</p>
                    <div className="rd-btn-row">
                      <button type="button" className="rd-btn-cancel" onClick={()=>{setStd(INIT_STD);setStdT({});}}>Réinitialiser</button>
                      <button type="submit" className="rd-btn-submit std" disabled={submitting}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Envoyer la demande
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* ══ VIP FORM ══ */}
              {!isStd&&(
                <form className="rd-form-body" onSubmit={handleSubmitVip} noValidate>
                  <div className="rd-note vip">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#92400e" strokeWidth={2} style={{flexShrink:0,marginTop:1}}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                    Service VIP exclusif — votre véhicule est réservé uniquement pour vous. Aucun autre passager ne sera ajouté à votre trajet.
                  </div>
                  <div className="rd-row-2">
                    <div className="rd-field"><label className="rd-label">Point de départ *</label><LocationSelect value={vip.depart} onChange={v=>updVip("depart",v)} hasErr={!!(vipT.depart&&vipErr.depart)} placeholder="Choisir le lieu de départ…"/>{vipT.depart&&vipErr.depart&&<span className="rd-err-msg">{vipErr.depart}</span>}</div>
                    <div className="rd-field"><label className="rd-label">Destination *</label><LocationSelect value={vip.destination} onChange={v=>updVip("destination",v)} hasErr={!!(vipT.destination&&vipErr.destination)} placeholder="Choisir la destination…"/>{vipT.destination&&vipErr.destination&&<span className="rd-err-msg">{vipErr.destination}</span>}</div>
                  </div>
                  <div className="rd-row-2">
                    <div className="rd-field"><label className="rd-label">Date de voyage *</label><input type="date" className={`rd-input${vipT.dateArrivee&&vipErr.dateArrivee?" err":""}`} value={vip.dateArrivee} min={minDate} onChange={e=>updVip("dateArrivee",e.target.value)} onBlur={()=>blurVip("dateArrivee")}/>{vipT.dateArrivee&&vipErr.dateArrivee&&<span className="rd-err-msg">{vipErr.dateArrivee}</span>}</div>
                    <div className="rd-field"><label className="rd-label">Heure d'arrivée *</label><input type="time" className={`rd-input${vipT.heureArrivee&&vipErr.heureArrivee?" err":""}`} value={vip.heureArrivee} onChange={e=>updVip("heureArrivee",e.target.value)} onBlur={()=>blurVip("heureArrivee")}/>{vipT.heureArrivee&&vipErr.heureArrivee&&<span className="rd-err-msg">{vipErr.heureArrivee}</span>}</div>
                  </div>
                  <div className="rd-row-2">
                    <div className="rd-field">
                      <label className="rd-label">Téléphone * <span style={{color:"var(--tm)",fontWeight:400,textTransform:"none"}}>({getCountry(vip.telephoneCountry).digits} chiffres)</span></label>
                      <div className="rd-phone-row">
                        <select className={`rd-country-select${vipT.telephoneLocal&&vipErr.telephoneLocal?" err":""}`} value={vip.telephoneCountry} onChange={e=>{updVip("telephoneCountry",e.target.value);updVip("telephoneLocal","");}}>
                          {COUNTRIES_PHONE.map(c=><option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>)}
                        </select>
                        <input type="tel" inputMode="numeric" maxLength={getCountry(vip.telephoneCountry).digits} className={`rd-input rd-phone-local${vipT.telephoneLocal&&vipErr.telephoneLocal?" err":""}`} value={vip.telephoneLocal} placeholder={"0".repeat(getCountry(vip.telephoneCountry).digits)} onChange={e=>{if(/^\d*$/.test(e.target.value))updVip("telephoneLocal",e.target.value);}} onBlur={()=>blurVip("telephoneLocal")}/>
                      </div>
                      {vipT.telephoneLocal&&vipErr.telephoneLocal&&<span className="rd-err-msg">{vipErr.telephoneLocal}</span>}
                    </div>
                    <div className="rd-field"><label className="rd-label">Email de contact *</label><input type="email" className={`rd-input${vipT.email&&vipErr.email?" err":""}`} value={vip.email} placeholder="contact@email.com" onChange={e=>updVip("email",e.target.value)} onBlur={()=>blurVip("email")}/>{vipT.email&&vipErr.email&&<span className="rd-err-msg">{vipErr.email}</span>}</div>
                  </div>

                  {/* ── Passager list ── */}
                  <div style={{marginBottom:8}}>
                    <label className="rd-label" style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      Passagers VIP ({vip.passagers.length}/10)
                    </label>
                    <div className="vip-pax-list">
                      {vip.passagers.map((px,i)=>(
                        <div key={i} className="vip-pax-item">
                          <div className="vip-pax-header">
                            <span className="vip-pax-title">
                              <svg width="13" height="13" fill="#92400e" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                              Passager {i+1}
                            </span>
                            {vip.passagers.length>1&&<button type="button" className="vip-pax-remove" onClick={()=>removePax(i)}>✕</button>}
                          </div>
                          <div className="vip-pax-grid">
                            <div className="rd-field"><label className="rd-label" style={{fontSize:9}}>Nom</label><input type="text" className="rd-input" style={{fontSize:12}} placeholder="Nom" value={px.nom} onChange={e=>updPax(i,"nom",e.target.value)}/></div>
                            <div className="rd-field"><label className="rd-label" style={{fontSize:9}}>Prénom</label><input type="text" className="rd-input" style={{fontSize:12}} placeholder="Prénom" value={px.prenom} onChange={e=>updPax(i,"prenom",e.target.value)}/></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {vip.passagers.length<10&&(
                      <button type="button" className="btn-add-pax" onClick={addPax}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                        Ajouter un passager VIP
                      </button>
                    )}
                  </div>

                  <div className="rd-row-1" style={{marginBottom:0}}>
                    <div className="rd-field">
                      <label className="rd-label">Commentaire</label>
                      <textarea className={`rd-textarea${vipT.commentaire&&vipErr.commentaire?" err":""}`} value={vip.commentaire} placeholder="Exigences particulières, préférences véhicule, point de rendez-vous…" onChange={e=>updVip("commentaire",e.target.value)} onBlur={()=>blurVip("commentaire")}/>
                      <div className="rd-char-row"><span className="rd-char-hint">Optionnel — max 400 caractères</span><span className="rd-char-hint">{vip.commentaire.length}/400</span></div>
                    </div>
                  </div>
                  <div className="rd-form-footer">
                    <p className="rd-form-footer-msg">Les champs * sont obligatoires.</p>
                    <div className="rd-btn-row">
                      <button type="button" className="rd-btn-cancel" onClick={()=>{setVip(INIT_VIP);setVipT({});}}>Réinitialiser</button>
                      <button type="submit" className="rd-btn-submit vip" disabled={submitting}>
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Confirmer la réservation VIP
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* ── Preview panel ── */}
            <div className="rd-preview">
              <div className="rd-preview-card">
                <p className="rd-preview-tag">Aperçu rapide</p>
                {!isStd&&<div className="rd-vip-badge">⭐ Service VIP</div>}
                <div style={{marginTop:10}}>
                  <div className="rd-pv-block"><p className="rd-pv-lbl">Départ</p><p className={`rd-pv-val${!(isStd?std.depart:vip.depart)?" muted":""}`}>{(isStd?std.depart:vip.depart)||"Non sélectionné"}</p></div>
                  <div className="rd-pv-block"><p className="rd-pv-lbl">Destination</p><p className={`rd-pv-val${!(isStd?std.destination:vip.destination)?" muted":""}`}>{(isStd?std.destination:vip.destination)||"Non sélectionnée"}</p></div>
                  <div className="rd-pv-row2">
                    <div className="rd-pv-block" style={{marginBottom:0}}><p className="rd-pv-lbl">Date</p><p className={`rd-pv-val${!(isStd?std.dateArrivee:vip.dateArrivee)?" muted":""}`}>{(isStd?std.dateArrivee:vip.dateArrivee)||"--"}</p></div>
                    <div className="rd-pv-block" style={{marginBottom:0}}><p className="rd-pv-lbl">Heure</p><p className={`rd-pv-val${!(isStd?std.heureArrivee:vip.heureArrivee)?" muted":""}`}>{(isStd?std.heureArrivee:vip.heureArrivee)||"--"}</p></div>
                  </div>
                  <div className={`rd-pax-card ${isStd?"std":"vip"}`} style={{marginTop:10}}>
                    <p className="rd-pax-lbl">{isStd?"Passagers":"Passagers VIP"}</p>
                    <p className="rd-pax-num">{curPax}</p>
                    <p className="rd-pax-sub">{isStd?"✈️ Transport AirOps Standard":"⭐ Transport AirOps VIP Exclusif"}</p>
                    <div className="rd-pax-ring"/>
                  </div>
                </div>
              </div>
              <div className="rd-tip-card">
                <p className="rd-tip-lbl">CONSEIL</p>
                <h3 className="rd-tip-title">{isStd?"Précisez votre point de rencontre":"Profitez du service exclusif"}</h3>
                <p className="rd-tip-text">{isStd?"Indiquez le terminal exact, le numéro de vol ou l'entrée de l'hôtel dans le commentaire pour un service optimal.":"En mode VIP, votre véhicule est 100% privatisé. Ajoutez tous vos passagers et précisez vos exigences particulières."}</p>
                <span className="rd-tip-badge">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {isStd?"Regroupement optimisé":"Service 100% privatisé"}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
      {toast&&<div className="rd-toast">{toast}</div>}
    </div>
  );
}