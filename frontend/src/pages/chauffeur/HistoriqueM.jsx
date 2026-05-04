import { useEffect, useMemo, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchMyMissions, mapMission } from "../../services/chauffeurService";

/* ─── CSS ─────────────────────────────────────────────── */
const HIST_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --brand-dark:#0d2b5e; --brand-mid:#1252aa; --brand-blue:#2980e8; --brand-light:#7ec8ff;
    --accent-orange:#f97316; --accent-green:#16a34a; --accent-red:#ef4444;
    --bg-page:#f0f5fb; --border:#e4ecf4; --text-primary:#0d2b5e; --text-sec:#5a6e88; --text-muted:#94a3b8;
    --sidebar-full:230px; --sidebar-mini:66px; --header-h:64px;
    --shadow-sm:0 2px 12px rgba(13,43,94,0.07); --shadow-md:0 8px 32px rgba(13,43,94,0.13); --shadow-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .chw{display:flex;height:100vh;overflow:hidden;background:var(--bg-page);font-family:'DM Sans','Segoe UI',sans-serif;color:var(--text-primary);}
  .sidebar{width:var(--sidebar-full);background:var(--brand-dark);display:flex;flex-direction:column;flex-shrink:0;position:relative;z-index:30;transition:width 0.3s ease;box-shadow:4px 0 24px rgba(0,0,0,0.2);overflow:hidden;}
  .sidebar.collapsed{width:var(--sidebar-mini);}
  .sb-brand{display:flex;align-items:center;gap:10px;padding:18px 13px 16px;border-bottom:1px solid rgba(255,255,255,0.07);cursor:pointer;flex-shrink:0;min-height:68px;overflow:hidden;}
  .sb-brand-icon{width:40px;height:40px;min-width:40px;background:var(--brand-blue);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(41,128,232,0.4);}
  .sb-brand-text{overflow:hidden;white-space:nowrap;opacity:1;transition:opacity 0.2s ease;}
  .sidebar.collapsed .sb-brand-text{opacity:0;}
  .sb-brand-name{font-size:17px;font-weight:800;color:#fff;letter-spacing:-0.4px;display:block;}
  .sb-brand-sub{font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1.8px;font-weight:600;display:block;}
  .sb-toggle-btn{position:absolute;top:22px;right:10px;width:22px;height:22px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:var(--tr);flex-shrink:0;}
  .sb-toggle-btn:hover{background:var(--brand-blue);border-color:var(--brand-blue);}
  .sb-toggle-btn svg{transition:transform 0.3s ease;}
  .sidebar.collapsed .sb-toggle-btn svg{transform:rotate(180deg);}
  .sb-label{font-size:9px;font-weight:700;letter-spacing:1.8px;color:rgba(255,255,255,0.25);padding:14px 14px 5px;text-transform:uppercase;white-space:nowrap;overflow:hidden;transition:opacity 0.2s;}
  .sidebar.collapsed .sb-label{opacity:0;}
  .sb-nav{padding:0 9px;flex:1;overflow-y:auto;overflow-x:hidden;}
  .sb-nav::-webkit-scrollbar{display:none;}
  .sb-nav-item{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;text-decoration:none;font-size:13.5px;font-weight:500;color:rgba(255,255,255,0.58);transition:var(--tr);margin-bottom:3px;position:relative;overflow:hidden;white-space:nowrap;}
  .sb-nav-item:hover{color:#fff;background:rgba(255,255,255,0.09);}
  .sb-nav-item.active{color:#fff;font-weight:700;background:linear-gradient(135deg,var(--brand-blue),#1a6fd4);box-shadow:0 4px 16px rgba(41,128,232,0.35);}
  .sb-nav-item.active::before{content:'';position:absolute;left:-9px;top:50%;transform:translateY(-50%);width:3px;height:55%;background:var(--brand-light);border-radius:0 3px 3px 0;}
  .sb-nav-icon{flex-shrink:0;width:18px;height:18px;display:flex;align-items:center;justify-content:center;}
  .sb-nav-lbl{flex:1;overflow:hidden;transition:opacity 0.2s,max-width 0.3s;max-width:160px;}
  .sidebar.collapsed .sb-nav-lbl{opacity:0;max-width:0;}
  .sb-badge{background:#ef4444;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0;transition:opacity 0.2s;}
  .sidebar.collapsed .sb-badge{opacity:0;}
  .sidebar.collapsed .sb-nav-item::after{content:attr(data-label);position:absolute;left:calc(var(--sidebar-mini) + 6px);top:50%;transform:translateY(-50%);background:var(--brand-dark);color:#fff;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;box-shadow:var(--shadow-md);border:1px solid rgba(255,255,255,0.1);z-index:200;opacity:0;transition:opacity 0.15s;}
  .sidebar.collapsed .sb-nav-item:hover::after{opacity:1;}
  .sb-footer{padding:6px 9px 16px;border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0;}
  .sb-logout{width:100%;display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:none;background:transparent;color:rgba(255,255,255,0.4);font-size:13.5px;font-weight:500;cursor:pointer;transition:var(--tr);font-family:inherit;white-space:nowrap;overflow:hidden;}
  .sb-logout:hover{color:#fca5a5;background:rgba(239,68,68,0.1);}
  .sb-logout-lbl{transition:opacity 0.2s,max-width 0.3s;max-width:160px;overflow:hidden;}
  .sidebar.collapsed .sb-logout-lbl{opacity:0;max-width:0;}
  .sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:25;backdrop-filter:blur(2px);}
  .chm{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .chh{height:var(--header-h);background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .chh-left{display:flex;align-items:center;gap:12px;}
  .chh-right{display:flex;align-items:center;gap:10px;}
  .chh-menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;border-radius:8px;transition:var(--tr);}
  .chh-menu-btn:hover{background:var(--bg-page);color:var(--text-primary);}
  .chh-title{font-size:15px;font-weight:700;color:var(--text-primary);}
  .search-wrap{position:relative;}
  .search-wrap svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;}
  .search-input{width:230px;padding:9px 12px 9px 34px;border:1.5px solid var(--border);border-radius:22px;background:var(--bg-page);font-size:13px;font-family:inherit;color:var(--text-primary);outline:none;transition:var(--tr);}
  .search-input:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .search-input::placeholder{color:var(--text-muted);}
  .user-chip{display:flex;align-items:center;gap:9px;cursor:default;}
  .user-name{font-size:13px;font-weight:700;color:var(--text-primary);}
  .user-role{font-size:11px;color:var(--text-muted);}
  .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;box-shadow:0 3px 10px rgba(41,128,232,0.35);border:2.5px solid rgba(41,128,232,0.2);flex-shrink:0;overflow:hidden;}
  .user-avatar img{width:100%;height:100%;object-fit:cover;}
  .chc{flex:1;overflow-y:auto;padding:26px;}
  .ch-footer{padding:12px 26px;background:#fff;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);flex-shrink:0;}
  .ch-footer-brand{display:flex;align-items:center;gap:6px;font-weight:600;}

  /* ── Historique page ── */
  .hp-title{font-size:25px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.5px;margin-bottom:4px;}
  .hp-title span{color:var(--brand-blue);}
  .hp-sub{font-size:13px;color:var(--text-muted);margin-bottom:22px;}
  .hp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px;}
  .hp-stat{background:#fff;border:1px solid var(--border);border-radius:18px;padding:18px 20px;box-shadow:var(--shadow-sm);display:flex;align-items:center;gap:14px;transition:var(--tr);}
  .hp-stat:hover{transform:translateY(-3px);box-shadow:var(--shadow-md);}
  .hp-stat-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .hp-stat-val{font-size:28px;font-weight:800;color:var(--brand-dark);letter-spacing:-1px;line-height:1;}
  .hp-stat-lbl{font-size:11px;color:var(--text-muted);font-weight:600;margin-top:3px;}

  .hp-main-card{background:#fff;border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow-sm);overflow:hidden;}
  .hp-table-head{display:grid;grid-template-columns:110px 90px 1fr 140px 120px;padding:10px 22px;background:#f8fafc;border-bottom:1px solid var(--border);font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;}
  .hp-table-row{display:grid;grid-template-columns:110px 90px 1fr 140px 120px;align-items:center;padding:14px 22px;border-bottom:1px solid #f1f5f9;transition:background 0.18s;cursor:pointer;}
  .hp-table-row:last-child{border-bottom:none;}
  .hp-table-row:hover{background:#f8fafc;}
  .hp-ref{font-size:13px;font-weight:800;color:var(--brand-blue);}
  .hp-date{font-size:12px;color:var(--text-sec);}
  .hp-from{font-size:13px;font-weight:600;color:var(--text-primary);}
  .hp-to{font-size:11px;color:var(--text-muted);margin-top:2px;}
  .hp-stops{font-size:10px;color:var(--accent-orange);font-weight:700;margin-top:3px;}
  .hp-client{font-size:12px;color:var(--text-sec);}
  .hp-action-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;box-shadow:0 3px 10px rgba(41,128,232,0.25);}
  .hp-action-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(41,128,232,0.35);}
  .hp-empty{padding:60px 22px;text-align:center;}
  .hp-empty-icon{width:72px;height:72px;margin:0 auto 18px;border-radius:20px;background:#eff6ff;display:flex;align-items:center;justify-content:center;}

  /* ── Timeline Modal ── */
  .hm-ov{position:fixed;inset:0;z-index:100;background:rgba(13,43,94,0.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:hmFade 0.2s ease;}
  @keyframes hmFade{from{opacity:0}to{opacity:1}}
  .hm-box{background:#fff;border-radius:24px;width:100%;max-width:600px;overflow:hidden;box-shadow:var(--shadow-lg);animation:hmUp 0.25s ease;max-height:90vh;display:flex;flex-direction:column;}
  @keyframes hmUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:none}}
  .hm-head{background:linear-gradient(135deg,var(--brand-dark),var(--brand-mid));padding:22px 24px;color:#fff;flex-shrink:0;}
  .hm-head-row{display:flex;align-items:flex-start;justify-content:space-between;}
  .hm-close{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.14);border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;transition:var(--tr);}
  .hm-close:hover{background:rgba(255,255,255,0.26);transform:rotate(90deg);}
  .hm-body{overflow-y:auto;flex:1;padding:22px 24px;}
  .hm-body::-webkit-scrollbar{width:4px;}
  .hm-body::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  .hm-foot{padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;}
  .hm-btn-close{padding:9px 20px;font-size:13px;font-family:inherit;color:var(--text-sec);border:1px solid var(--border);border-radius:10px;background:#fff;cursor:pointer;transition:var(--tr);}
  .hm-btn-close:hover{background:var(--bg-page);}
  .hm-btn-nav{display:flex;align-items:center;gap:7px;padding:9px 20px;font-size:13px;font-family:inherit;font-weight:700;color:#fff;border:none;border-radius:10px;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));cursor:pointer;transition:var(--tr);}
  .hm-btn-nav:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(41,128,232,0.35);}

  /* ── Timeline ── */
  .tl-section-title{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;}
  .tl-track{position:relative;padding-left:36px;}
  .tl-track::before{content:'';position:absolute;left:14px;top:6px;bottom:6px;width:2px;background:linear-gradient(to bottom,var(--brand-blue),#bbf7d0);border-radius:2px;}
  .tl-stop{position:relative;margin-bottom:18px;}
  .tl-stop:last-child{margin-bottom:0;}
  .tl-dot{position:absolute;left:-36px;top:4px;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;z-index:1;box-shadow:0 2px 8px rgba(0,0,0,0.15);}
  .tl-dot.start{background:var(--brand-blue);box-shadow:0 0 0 4px rgba(41,128,232,0.18);}
  .tl-dot.middle{background:var(--accent-orange);box-shadow:0 0 0 4px rgba(249,115,22,0.18);}
  .tl-dot.end{background:var(--accent-green);box-shadow:0 0 0 4px rgba(22,163,74,0.18);}
  .tl-content{background:var(--bg-page);border-radius:14px;padding:12px 16px;border:1px solid var(--border);transition:all 0.2s;}
  .tl-content:hover{border-color:var(--brand-blue);background:#f0f6ff;}
  .tl-type-lbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;}
  .tl-type-lbl.start{color:var(--brand-blue);}
  .tl-type-lbl.middle{color:var(--accent-orange);}
  .tl-type-lbl.end{color:var(--accent-green);}
  .tl-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
  .tl-loc{font-size:13px;font-weight:700;color:var(--text-primary);}
  .tl-time{font-size:11px;font-weight:700;color:var(--brand-blue);background:#eff6ff;padding:3px 9px;border-radius:8px;}
  .tl-passengers{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;}
  .pass-chip{display:inline-flex;align-items:center;gap:4px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:3px 8px;font-size:10px;font-weight:600;color:var(--text-sec);}

  /* ── Map inside modal ── */
  .hm-map-section{margin:18px 0;}
  .hm-map-title{font-size:11px;font-weight:700;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
  .hm-map-iframe{width:100%;height:220px;border-radius:14px;border:1.5px solid var(--border);display:block;}
  .hm-map-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:8px;padding:10px;background:#f8fafc;border:1.5px solid var(--border);border-radius:12px;font-size:12px;font-weight:700;color:var(--brand-dark);font-family:inherit;cursor:pointer;text-decoration:none;transition:all 0.2s;}
  .hm-map-btn:hover{background:#eff6ff;border-color:var(--brand-blue);color:var(--brand-blue);}

  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.chh-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .chc{padding:16px;}.chh{padding:0 16px;}.hp-stats{grid-template-columns:1fr 1fr;}.search-wrap{display:none;}
    .hp-table-head,.hp-table-row{grid-template-columns:90px 1fr 110px!important;}
    .hp-date,.hp-client{display:none;}
  }
  @media(max-width:480px){.hp-stats{grid-template-columns:1fr;}}
`;

if (typeof document !== "undefined" && !document.getElementById("airops-hist-css")) {
  const s=document.createElement("style"); s.id="airops-hist-css"; s.textContent=HIST_CSS; document.head.appendChild(s);
}

/* ─── Data ─────────────────────────────────── */
const LS_KEY = "airops_historique_v1";
const initialMissions = [
  { ref:"#MSN-4490", date:"08/04/2026", statut:"TERMINÉE", client:"M. Karim Belhaj",    vehicule:"Mercedes Classe E — TN 456 AB", passagers:2, bagage:"2 valises",    note:"Client VIP",
    trajet:[
      { type:"start",  lieu:"Aéroport Tunis Carthage",     heure:"08:00", passagers:["#P-101 — M. Karim Belhaj","#P-102 — Mme. Leila Belhaj"] },
      { type:"middle", lieu:"Station Hôtel Le Méridien",   heure:"08:45", passagers:["#P-102 — Mme. Leila Belhaj (dépose)"] },
      { type:"end",    lieu:"Hôtel Mouradi",               heure:"09:15", passagers:["#P-101 — M. Karim Belhaj (dépose)"] },
    ]},
  { ref:"#MSN-4487", date:"07/04/2026", statut:"TERMINÉE", client:"Mme. Sonia Trabelsi",vehicule:"BMW Série 5 — TN 789 CD",       passagers:1, bagage:"1 valise",     note:"Départ international",
    trajet:[
      { type:"start",lieu:"Hôtel El Ksar Sousse",heure:"13:30",passagers:["#P-205 — Mme. Sonia Trabelsi"] },
      { type:"end",  lieu:"Aéroport Enfidha",    heure:"14:50",passagers:["#P-205 — Mme. Sonia Trabelsi (arrivée)"] },
    ]},
  { ref:"#MSN-4483", date:"06/04/2026", statut:"TERMINÉE", client:"Mme. Ines Jaziri",   vehicule:"Toyota Camry — TN 654 GH",    passagers:2, bagage:"2 valises",    note:"Bagages fragiles",
    trajet:[
      { type:"start",  lieu:"Aéroport Tunis Carthage",heure:"10:00",passagers:["#P-310 — Mme. Ines Jaziri","#P-311 — M. Sami Jaziri"] },
      { type:"middle", lieu:"Pharmacie Centrale",      heure:"10:30",passagers:["#P-311 — M. Sami Jaziri (montée)"] },
      { type:"end",    lieu:"Hôtel Laico Tunis",       heure:"11:10",passagers:["#P-310 — Mme. Ines Jaziri","#P-311 — M. Sami Jaziri"] },
    ]},
  { ref:"#MSN-4479", date:"05/04/2026", statut:"TERMINÉE", client:"M. Walid Ben Ali",   vehicule:"Peugeot 508 — TN 852 JK",     passagers:1, bagage:"1 sac cabine", note:"Arrivée en avance",
    trajet:[
      { type:"start",lieu:"Sousse Centre",      heure:"07:00",passagers:["#P-420 — M. Walid Ben Ali"] },
      { type:"end",  lieu:"Aéroport Monastir",  heure:"08:20",passagers:["#P-420 — M. Walid Ben Ali (arrivée)"] },
    ]},
  { ref:"#MSN-4474", date:"04/04/2026", statut:"TERMINÉE", client:"Mme. Rania Dridi",   vehicule:"Audi A6 — TN 321 EF",         passagers:3, bagage:"3 valises",    note:"Assistance bagages",
    trajet:[
      { type:"start",  lieu:"Aéroport Enfidha",           heure:"16:00",passagers:["#P-501 — Mme. Rania Dridi","#P-502 — M. Chafik Dridi","#P-503 — Mlle. Sara Dridi"] },
      { type:"middle", lieu:"Supermarché Carrefour",       heure:"17:00",passagers:["#P-503 — Mlle. Sara Dridi (descente)"] },
      { type:"end",    lieu:"Résidence Les Jasmins",       heure:"17:45",passagers:["#P-501 — Mme. Rania Dridi","#P-502 — M. Chafik Dridi"] },
    ]},
];
function loadData()  { try { const s=localStorage.getItem(LS_KEY); return s?JSON.parse(s):initialMissions; } catch { return initialMissions; } }
function saveData(d) { try { localStorage.setItem(LS_KEY,JSON.stringify(d)); } catch {} }

/* ─── Same navItems as DashbordCH ─────────── */
const navItems = [
  { label:"Tableau de Bord",     to:"/dashbordchauffeur", icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Historique Missions", to:"/historiqueM",       icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { label:"Réclamations",        to:"/reclamationsCH",    icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> },
  { label:"Navigation",          to:"/navigationCH",      icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg> },
  { label:"Notifications",       to:"/notificationM",     icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
];

/* ─── Timeline Modal with embedded map ──────── */
function TimelineModal({ mission, onClose, navigate }) {
  if (!mission) return null;
  const typeLabel  = { start:"Départ", middle:"Station intermédiaire", end:"Arrivée" };
  const typeLetter = { start:"D", middle:"S", end:"A" };

  // Build Google Maps directions URL for the full route
  const depart  = mission.trajet[0].lieu;
  const arrivee = mission.trajet[mission.trajet.length-1].lieu;
  const stops   = mission.trajet.slice(1,-1).map(s=>encodeURIComponent(s.lieu));
  const waypointsParam = stops.length>0 ? `&waypoints=${stops.join("|")}` : "";
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(depart)}&destination=${encodeURIComponent(arrivee)}${waypointsParam}&travelmode=driving`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(depart+" to "+arrivee)}&t=&z=10&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="hm-ov" onClick={onClose}>
      <div className="hm-box" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="hm-head">
          <div className="hm-head-row">
            <div>
              <p style={{fontSize:10,letterSpacing:"1.5px",color:"rgba(255,255,255,0.5)",fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>Détail Trajet — Historique</p>
              <p style={{fontSize:20,fontWeight:800}}>{mission.ref}</p>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:2}}>{mission.date} · {mission.client}</p>
            </div>
            <button type="button" className="hm-close" onClick={onClose}>✕</button>
          </div>
          <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
            <span style={{background:"#f0fdf4",color:"#15803d",border:"1px solid #bbf7d0",display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>{mission.statut}
            </span>
            <span style={{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)",display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20}}>
              {mission.passagers} passager{mission.passagers>1?"s":""} · {mission.bagage}
            </span>
          </div>
        </div>

        <div className="hm-body">
          {/* Map section */}
          <div className="hm-map-section">
            <div className="hm-map-title">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg>
              Itinéraire de la mission
            </div>
            <iframe
              className="hm-map-iframe"
              src={embedUrl}
              title={`Itinéraire ${mission.ref}`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="hm-map-btn">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              Ouvrir l'itinéraire complet dans Google Maps
            </a>
          </div>

          {/* Timeline */}
          <p className="tl-section-title">Parcours détaillé</p>
          <div className="tl-track">
            {mission.trajet.map((stop,i)=>(
              <div key={i} className="tl-stop">
                <div className={`tl-dot ${stop.type}`}>{typeLetter[stop.type]||"S"}</div>
                <div className="tl-content">
                  <div className={`tl-type-lbl ${stop.type}`}>{typeLabel[stop.type]||"Station"}</div>
                  <div className="tl-header">
                    <span className="tl-loc">{stop.lieu}</span>
                    <span className="tl-time">{stop.heure}</span>
                  </div>
                  {stop.passagers&&stop.passagers.length>0&&(
                    <div className="tl-passengers">
                      {stop.passagers.map((p,j)=>(
                        <span key={j} className="pass-chip">
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          {mission.note&&(
            <div style={{marginTop:16,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:12,padding:"12px 16px",display:"flex",gap:10}}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2} style={{flexShrink:0,marginTop:1}}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <p style={{fontSize:12,color:"#9a3412",fontWeight:500}}>{mission.note}</p>
            </div>
          )}

          {/* Vehicle */}
          <div style={{marginTop:12,background:"#f8fafc",border:"1px solid var(--border)",borderRadius:12,padding:"12px 16px",fontSize:12,color:"var(--text-sec)",display:"flex",alignItems:"center",gap:8}}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-1h10m-6-3l2-6h3l3 6"/></svg>
            <span><strong style={{color:"var(--text-primary)"}}>Véhicule :</strong> {mission.vehicule}</span>
          </div>
        </div>

        <div className="hm-foot">
          <button type="button" className="hm-btn-close" onClick={onClose}>Fermer</button>
          <button type="button" className="hm-btn-nav" onClick={()=>{onClose();navigate("/navigationCH");}}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg>
            Naviguer sur ce trajet
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────── */
export default function HistoriqueM() {
  const navigate = useNavigate();
  const [missions,      setMissions]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search,        setSearch]        = useState("");
  const [detail,        setDetail]        = useState(null);

  // Load only terminated/completed missions from API
  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyMissions({ status: "TERMINEE", limit: 100 });
      setMissions((data.data || []).map(m => {
        const mapped = mapMission(m);
        // Build trajet from depart/arrivee
        return {
          ...mapped,
          trajet: [
            { type: "start", lieu: mapped.depart, heure: mapped.heure, passagers: [] },
            { type: "end",   lieu: mapped.arrivee, heure: "—", passagers: [] },
          ],
          bagage: m.requestId?.comment ?? "",
          note: m.requestId?.comment ?? "",
        };
      }));
    } catch {
      /* silently fall back to empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMissions(); }, [loadMissions]);

  const filtered = useMemo(()=>{
    if(!search.trim()) return missions;
    const q=search.trim().toLowerCase();
    return missions.filter(m=>[m.ref,m.date,m.client,m.vehicule,m.depart,m.arrivee].join(" ").toLowerCase().includes(q));
  },[missions,search]);

  // Profile from localStorage (set at login)
  const profile = (()=>{try{const u=localStorage.getItem("user");return u?JSON.parse(u):{name:"",photo:""};}catch{return{name:"",photo:""};} })();
  const nomCH   = profile.name || "Chauffeur";
  const photo   = "";
  const initials = nomCH.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"CH";
  const navWithBadge = navItems.map(i=>i.to==="/notificationM"?{...i,badge:undefined}:i);

  const totalPassagers = missions.reduce((s,m)=>s+(m.passagers||0),0);
  const totalStops     = missions.reduce((s,m)=>s+(m.trajet?.filter(t=>t.type==="middle").length||0),0);

  return (
    <div className="chw">
      {sidebarMobile&&<div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

      {/* Sidebar */}
      <aside className={["sidebar",collapsed?"collapsed":"",sidebarMobile?"open":""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={()=>setCollapsed(v=>!v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={()=>navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE CHAUFFEUR</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navWithBadge.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`sb-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.badge?<span className="sb-badge">{item.badge}</span>:null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{paddingTop:0}}>Compte</div>
          <button type="button" className="sb-logout" onClick={()=>navigate("/login")}>
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
            <span className="chh-title">Historique des missions</span>
          </div>
          <div className="chh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className="search-input" placeholder="Rechercher une mission…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="user-chip">
              <div style={{textAlign:"right"}}><div className="user-name">{nomCH}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{photo?<img src={photo} alt="profil"/>:initials}</div>
            </div>
          </div>
        </header>

        <main className="chc">
          <h1 className="hp-title">Historique des <span>Missions</span></h1>
          <p className="hp-sub">Consultez toutes vos missions terminées avec trajet détaillé et itinéraire cartographique.</p>

          {/* Stats */}
          <div className="hp-stats">
            {[
              {label:"Missions terminées",   value:missions.length,    bg:"#f0fdf4", color:"#16a34a", icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>},
              {label:"Stations intermédiaires",value:totalStops,       bg:"#eff6ff", color:"#2980e8", icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>},
              {label:"Passagers transportés", value:totalPassagers,    bg:"#fff7ed", color:"#f97316", icon:<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>},
            ].map(s=>(
              <div key={s.label} className="hp-stat">
                <div className="hp-stat-icon" style={{background:s.bg}}>{s.icon}</div>
                <div><div className="hp-stat-val" style={{color:s.color}}>{s.value}</div><div className="hp-stat-lbl">{s.label}</div></div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="hp-main-card">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:14,fontWeight:700,color:"var(--text-primary)"}}>Liste des missions terminées</span>
              <span style={{background:"#f0fdf4",color:"#15803d",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:20,border:"1px solid #bbf7d0"}}>TERMINÉES · {filtered.length}</span>
            </div>
            <div className="hp-table-head">
              <span>Référence</span><span>Date</span><span>Trajet</span><span>Client</span><span>Action</span>
            </div>
            {filtered.length===0?(
              <div className="hp-empty">
                <div className="hp-empty-icon"><svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#93c5fd" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                <p style={{fontSize:15,fontWeight:700,color:"var(--text-primary)",marginBottom:6}}>Aucune mission trouvée</p>
                <p style={{fontSize:13,color:"var(--text-muted)"}}>Essayez une autre recherche.</p>
              </div>
            ):filtered.map(m=>(
              <div key={m.ref} className="hp-table-row" onClick={()=>setDetail(m)}>
                <span className="hp-ref">{m.ref}</span>
                <span className="hp-date">{m.date}</span>
                <div>
                  <div className="hp-from">{m.trajet[0].lieu}</div>
                  <div className="hp-to">→ {m.trajet[m.trajet.length-1].lieu}</div>
                  {m.trajet.filter(t=>t.type==="middle").length>0&&(
                    <div className="hp-stops">📍 {m.trajet.filter(t=>t.type==="middle").length} arrêt{m.trajet.filter(t=>t.type==="middle").length>1?"s":""} intermédiaire{m.trajet.filter(t=>t.type==="middle").length>1?"s":""}</div>
                  )}
                </div>
                <span className="hp-client">{m.client}</span>
                <button type="button" className="hp-action-btn" onClick={e=>{e.stopPropagation();setDetail(m);}}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg>
                  Voir trajet
                </button>
              </div>
            ))}
          </div>

          <div style={{fontSize:10,color:"var(--text-muted)",textAlign:"center",padding:"14px 0 4px",letterSpacing:1,textTransform:"uppercase"}}>© 2026 AirOps Transport Management</div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand"><svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>Système de gestion sécurisé — AirOps Transport 2026</div>
          <span style={{fontSize:12,color:"var(--text-muted)"}}>{filtered.length} mission{filtered.length!==1?"s":""} dans l'historique</span>
        </footer>
      </div>

      {detail&&<TimelineModal mission={detail} onClose={()=>setDetail(null)} navigate={navigate}/>}
    </div>
  );
}