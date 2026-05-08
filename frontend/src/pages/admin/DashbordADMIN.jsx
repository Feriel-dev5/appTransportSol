import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchAdminDashboard, fetchUsers, formatTimeAgo, fetchPendingAvisCount } from "../../services/adminService";

/* ══════════════════════════ CSS ══════════════════════════ */
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
    --text-sec:     #334155;
    --text-muted:   #fdededff;
    --sidebar-full: 230px;
    --sidebar-mini: 66px;
    --header-h:     64px;
    --shadow-sm:    0 2px 12px rgba(13,43,94,0.07);
    --shadow-md:    0 8px 32px rgba(13,43,94,0.13);
    --shadow-lg:    0 20px 50px rgba(13,43,94,0.18);
    --tr:           all 0.25s ease;
  }

  .adm-wrap { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

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

  /* ── Main layout ── */
  .adm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .adm-header { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .adm-hdr-left  { display: flex; align-items: center; gap: 12px; }
  .adm-hdr-right { display: flex; align-items: center; gap: 14px; }
  .adm-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .adm-menu-btn:hover { background: var(--bg-page); color: var(--text-primary); }
  .adm-hdr-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

  .search-wrap { position: relative; }
  .search-wrap svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
  .search-input { width: 230px; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 22px; background: var(--bg-page); font-size: 13px; font-family: inherit; color: var(--text-primary); outline: none; transition: var(--tr); }
  .search-input:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input.error { border-color: #fca5a5; }
  .search-error { font-size: 11px; color: var(--accent-red); position: absolute; top: calc(100% + 3px); left: 0; white-space: nowrap; }

  .user-chip { display: flex; align-items: center; gap: 9px; }
  .user-info-adm { text-align: right; }
  .user-name-adm  { font-size: 13px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }
  .user-role-adm  { font-size: 10px; color: var(--text-muted); letter-spacing: 0.8px; text-transform: uppercase; }
  .user-avatar-adm { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); flex-shrink: 0; overflow: hidden; cursor: pointer; }
  .user-avatar-adm img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Content ── */
  .adm-content { flex: 1; overflow-y: auto; padding: 26px; }

  /* ── Stats grid ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
  .sc { display: flex; align-items: center; gap: 16px; border-radius: 16px; padding: 22px 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: var(--tr); cursor: pointer; color: #fff !important; border: none; }
  .sc::before, .sc::after { display: none !important; content: none !important; }
  .sc:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(0,0,0,0.12); }
  
  .sc.blue  { background: linear-gradient(135deg, #60a5fa, #2563eb); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3); }
  .sc.green { background: linear-gradient(135deg, #38bdf8, #0284c7); box-shadow: 0 8px 24px rgba(2, 132, 199, 0.3); }
  .sc.sky   { background: linear-gradient(135deg, #0ea5e9, #0284c7); box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3); }
  .sc.gray  { background: linear-gradient(135deg, var(--brand-mid), var(--brand-dark)); box-shadow: 0 8px 24px rgba(13, 43, 94, 0.3); }

  .sc-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; background: #fff; }
  .sc.blue .sc-icon { color: #2563eb; }
  .sc.green .sc-icon { color: #0284c7; }
  .sc.sky .sc-icon { color: #0ea5e9; }
  .sc.gray .sc-icon { color: var(--brand-dark); }
  .sc-icon svg { stroke: currentColor !important; fill: none; width: 26px; height: 26px; }
  
  .sc-content { display: flex; flex-direction: column; justify-content: center; overflow: hidden; }
  .sc-value { font-size: 26px; font-weight: 800; color: #fff !important; letter-spacing: -0.5px; line-height: 1.2; }
  .sc-label { font-size: 12px; color: rgba(255, 255, 255, 0.85) !important; font-weight: 500; margin-top: 4px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
  .sc * { color: inherit; }
  .sc .sc-value, .sc .sc-label { color: #fff !important; }

  /* ── Charts row ── */
  .charts-row { display: grid; grid-template-columns: 1fr 300px; gap: 14px; margin-bottom: 20px; }
  .cc { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: var(--shadow-sm); transition: var(--tr); }
  .cc:hover { box-shadow: var(--shadow-md); }
  .cc-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
  .cc-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  .cc-sub { font-size: 11px; color: var(--text-muted); }

  .filter-bar { display: flex; align-items: center; gap: 1px; background: #f1f5f9; border-radius: 10px; padding: 2px; }
  .filter-btn { font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 8px; border: none; background: transparent; color: var(--text-sec); cursor: pointer; font-family: inherit; transition: var(--tr); }
  .filter-btn.active { background: #fff; color: var(--brand-dark); box-shadow: var(--shadow-sm); }
  .filter-btn:hover:not(.active) { color: var(--text-primary); }

  /* ── Toast ── */
  .toast { position: fixed; top: 18px; right: 18px; z-index: 200000; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; pointer-events: none; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }

  /* ── Footer ── */
  .adm-footer { background: #fff; border-top: 1px solid var(--border); padding: 14px 26px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .adm-footer-brand { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); letter-spacing: 0.5px; }
  .adm-footer-brand svg { color: #22c55e; }
  .pdf-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); color: #fff; border: none; border-radius: 12px; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.35); }
  .pdf-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(41,128,232,0.45); }
  .pdf-btn:active { transform: scale(0.97); }

  /* ── Responsive ── */
  @media (max-width: 960px) {
    .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .charts-row { grid-template-columns: 1fr; }
    .search-input { width: 170px; }
  }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open { transform: translateX(0); }
    .sidebar.collapsed { transform: translateX(-100%); }
    .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; }
    .adm-menu-btn { display: flex; }
    .sb-toggle-btn { display: none; }
    .adm-content { padding: 16px; }
    .adm-header { padding: 0 16px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .adm-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
  }
  /* ── Skeleton loader ── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .sk {
    background: linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 8px;
  }
  .sc-skeleton { display: flex; align-items: center; gap: 16px; border-radius: 16px; padding: 22px 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
  .sc-skeleton.blue  { background: linear-gradient(135deg, #60a5fa, #2563eb); }
  .sc-skeleton.green { background: linear-gradient(135deg, #38bdf8, #0284c7); }
  .sc-skeleton.sky   { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
  .sc-skeleton.gray  { background: linear-gradient(135deg, var(--brand-mid), var(--brand-dark)); }
  .sk-icon { width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0; }
  .sk-val  { height: 28px; width: 70px; margin-bottom: 8px; }
  .sk-lbl  { height: 13px; width: 110px; }

  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .sc-value { font-size: 24px; }
    .search-wrap { display: none; }
    .adm-content { padding: 12px; }
  }
`;

if (typeof document !== "undefined") {
  let tag = document.getElementById("adm-dash-css");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "adm-dash-css";
    document.head.appendChild(tag);
  }
  tag.textContent = dashCSS;
}

/* ══════════════════════════ STORAGE ══════════════════════════ */
const LS_KEY = "nouvelair_admin_dashboard_v1";
const ADMIN_FORM_KEY = "airops_admin_profil_form_v1";
const ADMIN_PHOTO_KEY = "airops_admin_profil_photo_v1";
const STATS_CACHE_KEY = "airops_admin_stats_cache_v1";

function loadStatsCache() {
  try { const s = localStorage.getItem(STATS_CACHE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveStatsCache(data) {
  try { localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(data)); } catch { }
}

function loadState() {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { }
}
function getAdminName() {
  try {
    const s = localStorage.getItem("user");
    return s ? (JSON.parse(s).name || "Admin") : "Admin";
  } catch {
    return "Admin";
  }
}
function getAdminInitials(nom) {
  return (nom || "")
    .trim()
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "";
}
function getAdminPhoto() {
  try { return localStorage.getItem("airops_admin_profil_photo_v1") || ""; } catch { return ""; }
}

/* ══════════════════════════ CHART DATA ══════════════════════════ */
const chartPointsHebdo = [
  { jour: "LUN", val: 15 },
  { jour: "MAR", val: 35 },
  { jour: "MER", val: 60 },
  { jour: "JEU", val: 92, active: true, label: "JEUDI 14 MARS", missions: 142 },
  { jour: "VEN", val: 55 },
  { jour: "SAM", val: 20 },
  { jour: "DIM", val: 38 },
];
const chartPointsMensuel = [
  { jour: "S1", val: 42 },
  { jour: "S2", val: 68 },
  { jour: "S3", val: 55, active: true, label: "SEMAINE 3", missions: 312 },
  { jour: "S4", val: 80 },
];

/* ══════════════════════════ LINE CHART ══════════════════════════ */
function LineChart({ points }) {
  const W = 680; const H = 220; const PAD = 20;
  const computedMax = Math.max(...points.map(p => p.val), 10);
  const maxVal = computedMax * 1.2;
  const xs = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys = points.map(p => H - PAD - (p.val / maxVal) * (H - PAD * 2));
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cpx1 = xs[i - 1] + (xs[i] - xs[i - 1]) * 0.5;
    const cpx2 = xs[i] - (xs[i] - xs[i - 1]) * 0.5;
    d += ` C ${cpx1} ${ys[i - 1]}, ${cpx2} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const fillD = d + ` L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;
  const activeIdx = points.findIndex(p => p.active);
  const ax = xs[activeIdx]; const ay = ys[activeIdx];

  return (
    <div style={{ position: "relative", width: "100%", height: "260px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradAdm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2980e8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2980e8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#areaGradAdm)" />
        <path d={d} fill="none" stroke="#2980e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {activeIdx >= 0 && (
          <>
            <line x1={ax} y1={ay} x2={ax} y2={H - PAD} stroke="#2980e8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
            <circle cx={ax} cy={ay} r="5" fill="#2980e8" />
            <circle cx={ax} cy={ay} r="9" fill="#2980e8" fillOpacity="0.15" />
          </>
        )}
      </svg>
      {activeIdx >= 0 && (
        <div style={{ position: "absolute", left: `${(ax / W) * 100}%`, top: `${(ay / H) * 100 - 22}%`, transform: "translate(-50%,-100%)", minWidth: "155px", background: "#fff", borderRadius: "12px", boxShadow: "0 8px 32px rgba(13,43,94,0.13)", border: "1px solid #e4ecf4", padding: "10px 14px", pointerEvents: "none" }}>
          <p style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>{points[activeIdx].label}</p>
          <p style={{ fontSize: "13px", fontWeight: 800, color: "#0d2b5e", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2980e8", display: "inline-block" }} />
            {points[activeIdx].missions} activités
          </p>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 18px", fontSize: "10px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
        {points.map(p => <span key={p.jour} style={p.active ? { color: "#2980e8", fontWeight: 800 } : {}}>{p.jour}</span>)}
      </div>
    </div>
  );
}

/* ══════════════════════════ DONUT CHART ══════════════════════════ */
function DonutChart({ stats }) {
  const total = stats.reduce((s, x) => s + x.value, 0);
  const r = 50; const cx = 68; const cy = 68; const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        {stats.map((s, i) => {
          const pct = total ? s.value / total : 0;
          const dash = pct * circ; const gap = circ - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13"
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ}
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
          );
          offset += pct; return el;
        })}
        <circle cx={cx} cy={cy} r={37} fill="white" />
        <text x={cx} y={cx - 3} textAnchor="middle" fontSize="21" fontWeight="800" fill="#0d2b5e">{total.toLocaleString()}</text>
        <text x={cx} y={cx + 12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600" letterSpacing="1">TOTAL</text>
      </svg>
      <div style={{ width: "100%", marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ color: "var(--text-sec)", flex: 1 }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════ PDF BUILDER (MODERN THEME) ══════════════════════════ */
function buildPdf(stats, chartMode, generatedDate, adminName) {
  const clean = value => String(value || "").replace(/[<>]/g, "");
  const now = generatedDate || new Date().toLocaleDateString("fr-FR");

  // Extract main stats for the header cards
  const sUsers = stats.find(s => s.label.includes("Utilisateurs"))?.value || "0";
  const sDrivers = stats.find(s => s.label.includes("Chauffeurs") || s.label.includes("Disponibles"))?.value || "0";
  const sMissions = stats.find(s => s.label.includes("Missions"))?.value || "0";
  const sAvis = stats.find(s => s.label.includes("Avis"))?.value || "0";

  const rows = stats.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8fafc"}">
      <td style="padding:14px 16px; border-bottom:1px solid #edf2f7;">
        <div style="font-size:13px; font-weight:700; color:#1a365d;">${clean(s.label)}</div>
      </td>
      <td style="padding:14px 16px; border-bottom:1px solid #edf2f7; text-align:right;">
        <div style="font-size:14px; font-weight:800; color:#2563eb;">${clean(s.value)}</div>
      </td>
      <td style="padding:14px 16px; border-bottom:1px solid #edf2f7; text-align:right;">
        <span style="font-size:10px; font-weight:700; color:#64748b; background:#f1f5f9; padding:4px 10px; border-radius:20px; text-transform:uppercase;">${clean(s.badge || "Actif")}</span>
      </td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"/>
    <title>Rapport d'Activité AirOps</title>
    <style>
      @page { size: A4; margin: 0; }
      body { font-family: 'Inter', -apple-system, sans-serif; margin: 0; padding: 0; background: #f4f7fa; color: #1e293b; line-height: 1.5; }
      .container { padding: 40px; max-width: 800px; margin: auto; background: white; min-height: 297mm; }
      
      /* Header Section */
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .logo { width: 44px; height: 44px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
      .brand-name { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px; }
      .brand-sub { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
      
      .report-meta { text-align: right; }
      .report-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
      .report-date { font-size: 12px; color: #64748b; font-weight: 500; }

      /* Summary Widgets */
      .widgets { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
      .widget { border-radius: 16px; padding: 20px; color: white; display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden; }
      .widget-blue { background: linear-gradient(135deg, #60a5fa, #2563eb); }
      .widget-dark { background: linear-gradient(135deg, #1e3a8a, #172554); }
      .widget-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .widget-data { flex: 1; }
      .widget-val { font-size: 24px; font-weight: 800; line-height: 1; }
      .widget-lbl { font-size: 11px; font-weight: 600; opacity: 0.9; margin-top: 4px; }

      /* Content Section */
      .section-label { font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
      .data-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
      .data-table th { background: #f8fafc; padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
      
      /* Footer */
      .footer { margin-top: auto; border-top: 1px solid #f1f5f9; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 10px; font-weight: 600; }
      .footer-badge { background: #f1f5f9; color: #64748b; padding: 4px 12px; border-radius: 20px; }

      @media print {
        body { background: white; }
        .container { box-shadow: none; padding: 20mm; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">
          <div class="logo">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />
            </svg>
          </div>
          <div>
            <div class="brand-name">AirOps</div>
            <div class="brand-sub">Management System</div>
          </div>
        </div>
        <div class="report-meta">
          <div class="report-title">Rapport d'Activité</div>
          <div class="report-date">Généré le ${clean(now)}</div>
        </div>
      </div>

      <div class="section-label">Résumé des indicateurs</div>
      <div class="widgets">
        <div class="widget widget-blue">
          <div class="widget-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div class="widget-data">
            <div class="widget-val">${clean(sUsers)}</div>
            <div class="widget-lbl">Utilisateurs inscrits</div>
          </div>
        </div>
        <div class="widget widget-dark">
          <div class="widget-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div class="widget-data">
            <div class="widget-val">${clean(sDrivers)}</div>
            <div class="widget-lbl">Chauffeurs disponibles</div>
          </div>
        </div>
        <div class="widget widget-dark">
          <div class="widget-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <div class="widget-data">
            <div class="widget-val">${clean(sMissions)}</div>
            <div class="widget-lbl">Missions effectuées</div>
          </div>
        </div>
        <div class="widget widget-blue">
          <div class="widget-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <div class="widget-data">
            <div class="widget-val">${clean(sAvis)}</div>
            <div class="widget-lbl">Avis acceptés</div>
          </div>
        </div>
      </div>

      <div class="section-label">Détail des statistiques — Mode ${clean(chartMode)}</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Indicateur</th>
            <th style="text-align:right;">Valeur</th>
            <th style="text-align:right;">État</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="footer">
        <div>Document certifié par <strong>${clean(adminName)}</strong></div>
        <div class="footer-badge">AirOps Transport Operations · Confidentiel</div>
      </div>
    </div>
  </body>
  </html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
  }
}

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

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
export default function DashbordADMIN() {
  const navigate = useNavigate();
  const stored = loadState();

  const [collapsed, setCollapsed] = useState(stored?.collapsed ?? false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [chartMode, setChartMode] = useState(stored?.chartMode ?? "Hebdomadaire");
  const [search, setSearch] = useState(stored?.search ?? "");
  const [searchTouched, setSearchTouched] = useState(false);
  const [toast, setToast] = useState("");

  // ── API state
  const [adminInfo, setAdminInfo] = useState({ name: getAdminName(), photo: getAdminPhoto() });
  const cachedStats = loadStatsCache();
  const [apiStats, setApiStats] = useState(cachedStats?.stats || null);
  const [apiWeekChart, setApiWeekChart] = useState(cachedStats?.weekChart || null);
  const [apiMonthChart, setApiMonthChart] = useState(cachedStats?.monthChart || null);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(!cachedStats);

  const [pendingAvis, setPendingAvis] = useState(0);
  useEffect(() => {
    fetchPendingAvisCount().then(setPendingAvis);
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashData, usersData] = await Promise.all([
        fetchAdminDashboard(),
        fetchUsers({ limit: 1 }),
      ]);
      setAdminInfo(prev => ({
        ...(dashData.user || { name: getAdminName() }),
        photo: getAdminPhoto()
      }));
      const freshStats = dashData.stats || null;
      const freshWeek = dashData.weekChart || null;
      const freshMonth = dashData.monthChart || null;
      saveStatsCache({ stats: freshStats, weekChart: freshWeek, monthChart: freshMonth });
      setApiStats(freshStats);
      setApiWeekChart(freshWeek);
      setApiMonthChart(freshMonth);
      setUserCount(usersData.page !== undefined ? usersData : null);
    } catch {/* show statics on error */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    const sync = () => setAdminInfo({ name: getAdminName(), photo: getAdminPhoto() });
    window.addEventListener("airops-admin-profile-update", sync);
    return () => window.removeEventListener("airops-admin-profile-update", sync);
  }, []);

  const stats = useMemo(() => {
    if (!apiStats) return [
      { label: "Nombre d'Utilisateurs", value: "—", badge: "Chargement…", color: "blue", emoji: "👥", donutColor: "#2980e8", donutLabel: "Utilisateurs" },
      { label: "Utilisateurs Actifs", value: "—", badge: "Chargement…", color: "green", emoji: "✅", donutColor: "#16a34a", donutLabel: "Actifs" },
      { label: "Missions Aujourd'hui", value: "—", badge: "Chargement…", color: "sky", emoji: "🚗", donutColor: "#0ea5e9", donutLabel: "Missions" },
      { label: "Gestion des Avis", value: "—", badge: "Chargement…", color: "gray", emoji: "⚠️", donutColor: "#94a3b8", donutLabel: "Avis" },
    ];
    return [
      {
        label: "Nombre d'Utilisateurs",
        value: String(apiStats.usersCount ?? 0),
        badge: "Total",
        color: "blue",
        icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        donutColor: "#2980e8",
        donutLabel: "Utilisateurs",
        to: "/listeU"
      },
      {
        label: "Chauffeurs Disponibles",
        value: String(apiStats.availableDrivers ?? 0),
        badge: "Disponibles",
        color: "green",
        icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        donutColor: "#16a34a",
        donutLabel: "Chauffeurs",
        to: "/listeU?role=Chauffeur"
      },
      {
        label: "Missions Aujourd'hui",
        value: String(apiStats.missionsToday ?? 0),
        badge: "Aujourd'hui",
        color: "sky",
        icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#0ea5e9" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
        donutColor: "#0ea5e9",
        donutLabel: "Missions"
      },
      {
        label: "Gestion des Avis",
        value: String(apiStats.avisAcceptes ?? 0),
        badge: "Acceptés",
        color: "gray",
        icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        donutColor: "#94a3b8",
        donutLabel: "Avis",
        to: "/avisAdmin"
      },
    ];
  }, [apiStats]);

  const donutStats = stats.map(s => ({ label: s.donutLabel, value: parseInt(s.value.replace(/,/g, "")), color: s.donutColor }));

  const dynamicWeekChart = useMemo(() => {
    if (!apiWeekChart) return chartPointsHebdo;
    return apiWeekChart.map((p, idx) => {
      const isToday = idx === apiWeekChart.length - 1;
      return {
        jour: p.jour,
        val: p.val,
        active: isToday,
        label: p.date,
        missions: p.val
      };
    });
  }, [apiWeekChart]);

  const dynamicMonthChart = useMemo(() => {
    if (!apiMonthChart) return chartPointsMensuel;
    return apiMonthChart.map((p, idx) => {
      const isCurrentWeek = idx === apiMonthChart.length - 1;
      return {
        jour: p.jour,
        val: p.val,
        active: isCurrentWeek,
        label: p.label,
        missions: p.val
      };
    });
  }, [apiMonthChart]);

  const chartPoints = chartMode === "Hebdomadaire" ? dynamicWeekChart : dynamicMonthChart;

  useEffect(() => { saveState({ collapsed, chartMode, search }); }, [collapsed, chartMode, search]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);

  const searchError = searchTouched && search.trim().length > 50 ? "La recherche ne doit pas dépasser 50 caractères." : "";

  const filteredStats = useMemo(() => {
    if (!search.trim() || searchError) return stats;
    const q = search.trim().toLowerCase();
    return stats.filter(s => s.label.toLowerCase().includes(q));
  }, [search, searchError, stats]);

  const handleDownloadPdf = () => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      buildPdf(stats, chartMode, dateStr, adminInfo.name);
      setToast("✓ Rapport PDF généré avec succès.");
    } catch { setToast("Impossible de générer le PDF."); }
  };

  return (
    <div className="adm-wrap">
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
      <div className="adm-main">
        <header className="adm-header">
          <div className="adm-hdr-left">
            <button type="button" className="adm-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="adm-hdr-title">Tableau de bord</span>
          </div>
          <div className="adm-hdr-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" className={`search-input${searchError ? " error" : ""}`}
                placeholder="Rechercher une statistique…" value={search}
                onChange={e => setSearch(e.target.value)} onBlur={() => setSearchTouched(true)} />
              {searchError && <p className="search-error">{searchError}</p>}
            </div>
            <div className="user-chip">
              <div className="user-info-adm">
                <div className="user-name-adm">{adminInfo.name}</div>
                <div className="user-role-adm">Administrateur</div>
              </div>
              <div className="user-avatar-adm" onClick={() => navigate("/profilA")} title="Mon profil">
                {adminInfo.photo ? <img src={adminInfo.photo} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <span>{getAdminInitials(adminInfo.name)}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="adm-content">
          {/* Stats */}
          <div className="stats-grid">
            {loading ? (
              [{ color: "blue" }, { color: "green" }, { color: "sky" }, { color: "gray" }].map((s, i) => (
                <div key={i} className={`sc-skeleton ${s.color}`}>
                  <div className="sk sk-icon" />
                  <div style={{ flex: 1 }}>
                    <div className="sk sk-val" />
                    <div className="sk sk-lbl" />
                  </div>
                </div>
              ))
            ) : filteredStats.length === 0 ? (
              <div style={{ gridColumn: "1/-1", background: "#fff", borderRadius: "20px", border: "1px solid var(--border)", padding: "48px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>Aucune statistique trouvée</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Essayez un autre texte de recherche.</p>
              </div>
            ) : filteredStats.map(s => (
              <div key={s.label} className={`sc ${s.color}`} onClick={() => s.to ? navigate(s.to) : setToast(`${s.label} : ${s.value}`)}>
                <div className={`sc-icon ${s.color}`}>{s.icon || <span style={{ fontSize: 24 }}>{s.emoji}</span>}</div>
                <div className="sc-content">
                  <div className="sc-value">{s.value}</div>
                  <div className="sc-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="charts-row">
            <div className="cc">
              <div className="cc-hd">
                <div>
                  <div className="cc-title">Statistiques Générales</div>
                  <div className="cc-sub">Volume des activités</div>
                </div>
                <div className="filter-bar">
                  {["Hebdomadaire", "Mensuel"].map(m => (
                    <button key={m} type="button"
                      className={`filter-btn${chartMode === m ? " active" : ""}`}
                      onClick={() => { setChartMode(m); setToast(`Vue ${m.toLowerCase()} activée.`); }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <LineChart points={chartPoints} />
            </div>
            <div className="cc">
              <div className="cc-hd"><div className="cc-title">Répartition des comptes</div></div>
              <DonutChart stats={donutStats} />
            </div>
          </div>
        </main>

        <footer className="adm-footer">
          <div className="adm-footer-brand">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <button type="button" className="pdf-btn" onClick={handleDownloadPdf}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger le rapport PDF
          </button>
        </footer>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}