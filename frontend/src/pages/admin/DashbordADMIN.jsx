import { useMemo, useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
  .welcome-title { font-size: 25px; font-weight: 800; color: var(--brand-dark); letter-spacing: -0.5px; margin-bottom: 4px; }
  .welcome-title span { color: var(--brand-blue); }
  .welcome-sub { font-size: 13px; color: var(--text-muted); margin-bottom: 22px; }

  /* ── Stats grid ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .sc { background: #fff; border: 1px solid var(--border); border-radius: 20px; padding: 20px; box-shadow: var(--shadow-sm); transition: var(--tr); position: relative; overflow: hidden; cursor: pointer; }
  .sc::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 20px 20px 0 0; }
  .sc.blue::before   { background: var(--brand-blue); }
  .sc.green::before  { background: var(--accent-green); }
  .sc.sky::before    { background: #0ea5e9; }
  .sc.gray::before   { background: #94a3b8; }
  .sc:hover { transform: translateY(-5px); box-shadow: var(--shadow-md); }
  .sc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sc-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
  .sc-icon.blue  { background: #eff6ff; }
  .sc-icon.green { background: #f0fdf4; }
  .sc-icon.sky   { background: #f0f9ff; }
  .sc-icon.gray  { background: #f1f5f9; }
  .sc-tag { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
  .sc-tag.blue  { color: var(--brand-blue); background: #eff6ff; }
  .sc-tag.green { color: var(--accent-green); background: #f0fdf4; }
  .sc-tag.sky   { color: #0ea5e9; background: #f0f9ff; }
  .sc-tag.gray  { color: #64748b; background: #f1f5f9; }
  .sc-value { font-size: 30px; font-weight: 800; color: var(--brand-dark); letter-spacing: -1px; }
  .sc-label { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

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
  @media (max-width: 480px) {
    .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .sc-value { font-size: 24px; }
    .search-wrap { display: none; }
    .adm-content { padding: 12px; }
    .welcome-title { font-size: 20px; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("adm-dash-css")) {
  const tag = document.createElement("style");
  tag.id = "adm-dash-css";
  tag.textContent = dashCSS;
  document.head.appendChild(tag);
}

/* ══════════════════════════ STORAGE ══════════════════════════ */
const LS_KEY            = "nouvelair_admin_dashboard_v1";
const ADMIN_FORM_KEY    = "airops_admin_profil_form_v1";
const ADMIN_PHOTO_KEY   = "airops_admin_profil_photo_v1";

function loadState() {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function saveState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
}
function getAdminName() {
  try { const s = localStorage.getItem(ADMIN_FORM_KEY); return s ? (JSON.parse(s).nom || "Ahmed Mansour") : "Ahmed Mansour"; } catch { return "Ahmed Mansour"; }
}
function getAdminFirstName(nom) {
  return (nom || "Ahmed Mansour").trim().split(" ")[0] || "Ahmed";
}
function getAdminPhoto() {
  try { return localStorage.getItem(ADMIN_PHOTO_KEY) || ""; } catch { return ""; }
}
function getAdminInitials(nom) {
  return (nom || "Ahmed Mansour").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "AM";
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
  const W = 680; const H = 220; const PAD = 20; const maxVal = 100;
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
            <stop offset="0%" stopColor="#2980e8" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#2980e8" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#areaGradAdm)"/>
        <path d={d} fill="none" stroke="#2980e8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {activeIdx >= 0 && (
          <>
            <line x1={ax} y1={ay} x2={ax} y2={H - PAD} stroke="#2980e8" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
            <circle cx={ax} cy={ay} r="5" fill="#2980e8"/>
            <circle cx={ax} cy={ay} r="9" fill="#2980e8" fillOpacity="0.15"/>
          </>
        )}
      </svg>
      {activeIdx >= 0 && (
        <div style={{ position:"absolute", left:`${(ax/W)*100}%`, top:`${(ay/H)*100-22}%`, transform:"translate(-50%,-100%)", minWidth:"155px", background:"#fff", borderRadius:"12px", boxShadow:"0 8px 32px rgba(13,43,94,0.13)", border:"1px solid #e4ecf4", padding:"10px 14px", pointerEvents:"none" }}>
          <p style={{ fontSize:"10px", color:"#94a3b8", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", marginBottom:"4px" }}>{points[activeIdx].label}</p>
          <p style={{ fontSize:"13px", fontWeight:800, color:"#0d2b5e", display:"flex", alignItems:"center", gap:"6px" }}>
            <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#2980e8", display:"inline-block" }}/>
            {points[activeIdx].missions} activités
          </p>
        </div>
      )}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, display:"flex", justifyContent:"space-between", padding:"0 18px", fontSize:"10px", color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>
        {points.map(p => <span key={p.jour} style={p.active ? { color:"#2980e8", fontWeight:800 } : {}}>{p.jour}</span>)}
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
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        {stats.map((s, i) => {
          const pct  = total ? s.value / total : 0;
          const dash = pct * circ; const gap = circ - dash;
          const el   = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13"
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circ}
              style={{ transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px` }}/>
          );
          offset += pct; return el;
        })}
        <circle cx={cx} cy={cy} r={37} fill="white"/>
        <text x={cx} y={cx - 3} textAnchor="middle" fontSize="21" fontWeight="800" fill="#0d2b5e">{total.toLocaleString()}</text>
        <text x={cx} y={cx + 12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600" letterSpacing="1">TOTAL</text>
      </svg>
      <div style={{ width:"100%", marginTop:14, display:"flex", flexDirection:"column", gap:7 }}>
        {stats.map(s => (
          <div key={s.label} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
            <span style={{ color:"var(--text-sec)", flex:1 }}>{s.label}</span>
            <span style={{ fontWeight:700, color:"var(--text-primary)" }}>{s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════ PDF BUILDER ══════════════════════════ */
function buildPdf(stats, chartMode, generatedDate) {
  const lines = [
    { text: "NOUVELAIR TRANSPORT", size: 18, bold: true, y: 800 },
    { text: "Rapport du Tableau de Bord Administrateur", size: 14, bold: false, y: 775 },
    { text: `Généré le : ${generatedDate}`, size: 11, bold: false, y: 758 },
    { text: "─────────────────────────────────────────────────────", size: 9, bold: false, y: 745 },
    { text: "RÉSUMÉ STATISTIQUE", size: 13, bold: true, y: 725 },
    { text: `  Nombre d'utilisateurs totaux   : ${stats[0].value}`, size: 11, bold: false, y: 706 },
    { text: `  Utilisateurs actifs             : ${stats[1].value}`, size: 11, bold: false, y: 688 },
    { text: `  Nouveaux comptes (semaine)       : ${stats[2].value}`, size: 11, bold: false, y: 670 },
    { text: `  Comptes inactifs                 : ${stats[3].value}`, size: 11, bold: false, y: 652 },
    { text: "─────────────────────────────────────────────────────", size: 9, bold: false, y: 638 },
    { text: "ANALYSE DES ACTIVITÉS", size: 13, bold: true, y: 618 },
    { text: `  Mode d'affichage sélectionné    : ${chartMode}`, size: 11, bold: false, y: 600 },
    { text: "  Point culminant de la semaine   : Jeudi 14 Mars — 142 activités", size: 11, bold: false, y: 582 },
    { text: "─────────────────────────────────────────────────────", size: 9, bold: false, y: 566 },
    { text: "© 2026 AirOps Transport. Tous droits réservés.", size: 10, bold: false, y: 296 },
  ];
  const escape = s => s.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
  const textObjs = lines.map(l => `BT ${l.bold ? "/F2" : "/F1"} ${l.size} Tf 50 ${l.y} Td (${escape(l.text)}) Tj ET`).join("\n");
  const pageContent = `1 0.17 0.09 rg\n0 820 595 842 re f\n1 1 1 rg\nBT /F2 20 Tf 50 827 Td (NOUVELAIR TRANSPORT) Tj ET\n0 0 0 rg\n${textObjs}`;
  const pdf = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]\n   /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>\n   /Contents 6 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n6 0 obj\n<< /Length ${pageContent.length} >>\nstream\n${pageContent}\nendstream\nendobj\nxref\n0 7\n0000000000 65535 f \ntrailer\n<< /Root 1 0 R /Size 7 >>\nstartxref\n9\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

/* ══════════════════════════ NAV ITEMS ══════════════════════════ */
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

/* ══════════════════════════ MAIN COMPONENT ══════════════════════════ */
export default function DashbordADMIN() {
  const navigate = useNavigate();
  const stored   = loadState();

  const [collapsed,     setCollapsed]     = useState(stored?.collapsed ?? false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [chartMode,     setChartMode]     = useState(stored?.chartMode ?? "Hebdomadaire");
  const [search,        setSearch]        = useState(stored?.search ?? "");
  const [searchTouched, setSearchTouched] = useState(false);
  const [toast,         setToast]         = useState("");

  /* Admin profile sync */
  const [adminName,  setAdminName]  = useState(getAdminName);
  const [adminPhoto, setAdminPhoto] = useState(getAdminPhoto);

  useEffect(() => {
    const sync = () => { setAdminName(getAdminName()); setAdminPhoto(getAdminPhoto()); };
    window.addEventListener("airops-admin-profile-update", sync);
    return () => window.removeEventListener("airops-admin-profile-update", sync);
  }, []);

  const stats = [
    { label: "Nombre d'Utilisateurs", value: "1,284", badge: "+12%",         color: "blue",  emoji: "👥", donutColor: "#2980e8", donutLabel: "Utilisateurs" },
    { label: "Utilisateurs Actifs",   value: "942",   badge: "En ligne",     color: "green", emoji: "✅", donutColor: "#16a34a", donutLabel: "Actifs" },
    { label: "Nouveaux Comptes",      value: "18",    badge: "Cette semaine", color: "sky",   emoji: "➕", donutColor: "#0ea5e9", donutLabel: "Nouveaux" },
    { label: "Comptes Inactifs",      value: "76",    badge: "À revoir",     color: "gray",  emoji: "🔕", donutColor: "#94a3b8", donutLabel: "Inactifs" },
  ];

  const donutStats    = stats.map(s => ({ label: s.donutLabel, value: parseInt(s.value.replace(/,/g, "")), color: s.donutColor }));
  const chartPoints   = chartMode === "Hebdomadaire" ? chartPointsHebdo : chartPointsMensuel;

  useEffect(() => { saveState({ collapsed, chartMode, search }); }, [collapsed, chartMode, search]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2800); return () => clearTimeout(t); }, [toast]);

  const searchError = searchTouched && search.trim().length > 50 ? "La recherche ne doit pas dépasser 50 caractères." : "";

  const filteredStats = useMemo(() => {
    if (!search.trim() || searchError) return stats;
    const q = search.trim().toLowerCase();
    return stats.filter(s => s.label.toLowerCase().includes(q));
  }, [search, searchError]);

  const handleDownloadPdf = () => {
    try {
      const now     = new Date();
      const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const blob    = buildPdf(stats, chartMode, dateStr);
      const url     = URL.createObjectURL(blob);
      const link    = document.createElement("a");
      link.href = url; link.download = `rapport-admin-${now.toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
      setToast("✓ Rapport PDF téléchargé !");
    } catch { setToast("Impossible de générer le PDF."); }
  };

  return (
    <div className="adm-wrap">
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
      <div className="adm-main">
        <header className="adm-header">
          <div className="adm-hdr-left">
            <button type="button" className="adm-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="adm-hdr-title">Tableau de bord</span>
          </div>
          <div className="adm-hdr-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" className={`search-input${searchError ? " error" : ""}`}
                placeholder="Rechercher une statistique…" value={search}
                onChange={e => setSearch(e.target.value)} onBlur={() => setSearchTouched(true)}/>
              {searchError && <p className="search-error">{searchError}</p>}
            </div>
            <div className="user-chip">
              <div className="user-info-adm">
                <div className="user-name-adm">{adminName}</div>
                <div className="user-role-adm">Administrateur</div>
              </div>
              <div className="user-avatar-adm" onClick={() => navigate("/profilA")} title="Mon profil">
                {adminPhoto ? <img src={adminPhoto} alt="profil"/> : <span>{getAdminInitials(adminName)}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="adm-content">
          <h1 className="welcome-title">Bienvenue, <span>{getAdminFirstName(adminName)}</span> !</h1>
          <p className="welcome-sub">Voici un aperçu global de votre espace administrateur.</p>

          {/* Stats */}
          <div className="stats-grid">
            {filteredStats.length === 0 ? (
              <div style={{ gridColumn:"1/-1", background:"#fff", borderRadius:"20px", border:"1px solid var(--border)", padding:"48px", textAlign:"center", boxShadow:"var(--shadow-sm)" }}>
                <p style={{ fontSize:"14px", fontWeight:700, color:"var(--text-primary)", marginBottom:"4px" }}>Aucune statistique trouvée</p>
                <p style={{ fontSize:"12px", color:"var(--text-muted)" }}>Essayez un autre texte de recherche.</p>
              </div>
            ) : filteredStats.map(s => (
              <div key={s.label} className={`sc ${s.color}`} onClick={() => setToast(`${s.label} : ${s.value}`)}>
                <div className="sc-top">
                  <div className={`sc-icon ${s.color}`} style={{ fontSize: 20 }}>{s.emoji}</div>
                  <span className={`sc-tag ${s.color}`}>{s.badge}</span>
                </div>
                <div className="sc-value">{s.value}</div>
                <div className="sc-label">{s.label}</div>
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
              <LineChart points={chartPoints}/>
            </div>
            <div className="cc">
              <div className="cc-hd"><div className="cc-title">Répartition des comptes</div></div>
              <DonutChart stats={donutStats}/>
            </div>
          </div>
        </main>

        <footer className="adm-footer">
          <div className="adm-footer-brand">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <button type="button" className="pdf-btn" onClick={handleDownloadPdf}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Télécharger le rapport PDF
          </button>
        </footer>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}