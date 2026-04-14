import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

/* CSS injected in DashbordCH — reuse same id; only inject if missing */
const HIST_CSS = `
  .timeline { padding:0 24px 20px; }
  .tl-track { position:relative; padding-left:32px; }
  .tl-track::before { content:''; position:absolute; left:11px; top:6px; bottom:6px; width:2px; background:linear-gradient(to bottom,var(--brand-blue),#bfdbfe); border-radius:2px; }
  .tl-stop { position:relative; margin-bottom:20px; }
  .tl-stop:last-child { margin-bottom:0; }
  .tl-dot { position:absolute; left:-32px; top:4px; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:800; color:#fff; z-index:1; }
  .tl-dot.start  { background:var(--brand-blue); box-shadow:0 0 0 4px rgba(41,128,232,0.15); }
  .tl-dot.middle { background:var(--accent-orange); box-shadow:0 0 0 4px rgba(249,115,22,0.15); }
  .tl-dot.end    { background:var(--accent-green); box-shadow:0 0 0 4px rgba(22,163,74,0.15); }
  .tl-content { background:var(--bg-page); border-radius:12px; padding:10px 14px; border:1px solid var(--border); }
  .tl-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
  .tl-loc  { font-size:13px; font-weight:700; color:var(--text-primary); }
  .tl-time { font-size:11px; font-weight:700; color:var(--brand-blue); background:#eff6ff; padding:2px 8px; border-radius:6px; }
  .tl-pass { font-size:11px; color:var(--text-sec); display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:4px; }
  .pass-chip { display:inline-flex; align-items:center; gap:4px; background:#fff; border:1px solid var(--border); border-radius:6px; padding:2px 7px; font-size:10px; font-weight:600; color:var(--text-sec); }
  .tl-type-label { font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--text-muted); margin-bottom:2px; }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-hist-css")) {
  const tag = document.createElement("style");
  tag.id = "airops-hist-css";
  tag.textContent = HIST_CSS;
  document.head.appendChild(tag);
}

/* ensure shared CSS also loaded */
const CH_CSS_ID = "airops-ch-css";

/* ══════════════════════════ STORAGE ══════════════════════════ */
const LS_KEY = "airops_historique_v1";

const initialMissions = [
  {
    ref:"#MSN-4490", date:"08/04/2026", statut:"TERMINÉE", client:"M. Karim Belhaj",
    vehicule:"Mercedes Classe E — TN 456 AB", passagers:2, bagage:"2 valises", note:"Client VIP",
    trajet:[
      { type:"start",  lieu:"Aéroport Tunis Carthage",      heure:"08:00", passagers:["#P-101 — M. Karim Belhaj","#P-102 — Mme. Leila Belhaj"] },
      { type:"middle", lieu:"Station Hôtel Le Méridien",    heure:"08:45", passagers:["#P-102 — Mme. Leila Belhaj (dépose)"] },
      { type:"end",    lieu:"Hôtel Mouradi",                heure:"09:15", passagers:["#P-101 — M. Karim Belhaj (dépose)"] },
    ],
  },
  {
    ref:"#MSN-4487", date:"07/04/2026", statut:"TERMINÉE", client:"Mme. Sonia Trabelsi",
    vehicule:"BMW Série 5 — TN 789 CD", passagers:1, bagage:"1 valise", note:"Départ international",
    trajet:[
      { type:"start",  lieu:"Hôtel El Ksar Sousse",         heure:"13:30", passagers:["#P-205 — Mme. Sonia Trabelsi"] },
      { type:"end",    lieu:"Aéroport Enfidha",             heure:"14:50", passagers:["#P-205 — Mme. Sonia Trabelsi (arrivée)"] },
    ],
  },
  {
    ref:"#MSN-4483", date:"06/04/2026", statut:"TERMINÉE", client:"Mme. Ines Jaziri",
    vehicule:"Toyota Camry — TN 654 GH", passagers:2, bagage:"2 valises", note:"Bagages fragiles",
    trajet:[
      { type:"start",  lieu:"Aéroport Tunis Carthage",      heure:"10:00", passagers:["#P-310 — Mme. Ines Jaziri","#P-311 — M. Sami Jaziri"] },
      { type:"middle", lieu:"Pharmacie Centrale (escale)",  heure:"10:30", passagers:["#P-311 — M. Sami Jaziri (montée)"] },
      { type:"end",    lieu:"Hôtel Laico Tunis",            heure:"11:10", passagers:["#P-310 — Mme. Ines Jaziri","#P-311 — M. Sami Jaziri"] },
    ],
  },
  {
    ref:"#MSN-4479", date:"05/04/2026", statut:"TERMINÉE", client:"M. Walid Ben Ali",
    vehicule:"Peugeot 508 — TN 852 JK", passagers:1, bagage:"1 sac cabine", note:"Arrivée en avance",
    trajet:[
      { type:"start",  lieu:"Sousse Centre",                heure:"07:00", passagers:["#P-420 — M. Walid Ben Ali"] },
      { type:"end",    lieu:"Aéroport Monastir",           heure:"08:20", passagers:["#P-420 — M. Walid Ben Ali (arrivée)"] },
    ],
  },
  {
    ref:"#MSN-4474", date:"04/04/2026", statut:"TERMINÉE", client:"Mme. Rania Dridi",
    vehicule:"Audi A6 — TN 321 EF", passagers:3, bagage:"3 valises", note:"Assistance bagages",
    trajet:[
      { type:"start",  lieu:"Aéroport Enfidha",            heure:"16:00", passagers:["#P-501 — Mme. Rania Dridi","#P-502 — M. Chafik Dridi","#P-503 — Mlle. Sara Dridi"] },
      { type:"middle", lieu:"Supermarché Carrefour (arrêt)",heure:"17:00", passagers:["#P-503 — Mlle. Sara Dridi (descente)"] },
      { type:"end",    lieu:"Résidence Les Jasmins",        heure:"17:45", passagers:["#P-501 — Mme. Rania Dridi","#P-502 — M. Chafik Dridi"] },
    ],
  },
];

function loadData()    { try { const s=localStorage.getItem(LS_KEY); return s?JSON.parse(s):initialMissions; } catch { return initialMissions; } }
function saveData(d)   { try { localStorage.setItem(LS_KEY,JSON.stringify(d)); } catch {} }

/* ══════════════════════════ NAV ══════════════════════════ */
const navItems = [
  { label:"Tableau de Bord",   to:"/dashbordchauffeur",    icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Historique Missions",to:"/historiqueM",  icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { label:"Notifications",     to:"/notificationM", badge:2, icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label:"Mon Profil",        to:"/profilCH",      icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

/* ══════════════════════════ TIMELINE MODAL ══════════════════════════ */
function TimelineModal({ mission, onClose }) {
  if (!mission) return null;
  const typeLabel = { start:"Départ", middle:"Station", end:"Arrivée" };
  const typeClass = { start:"start", middle:"middle", end:"end" };
  const typeLetter = { start:"D", middle:"S", end:"A" };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(13,43,94,0.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn 0.2s ease" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:520,overflow:"hidden",boxShadow:"0 20px 50px rgba(13,43,94,0.18)",animation:"slideUp 0.25s ease",maxHeight:"90vh",display:"flex",flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#0d2b5e,#1252aa)",padding:"22px 24px",color:"#fff",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:10,letterSpacing:"1.5px",color:"rgba(255,255,255,0.5)",fontWeight:700,marginBottom:4,textTransform:"uppercase" }}>Détail Trajet — Historique</p>
              <p style={{ fontSize:20,fontWeight:800 }}>{mission.ref}</p>
              <p style={{ fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:2 }}>{mission.date} · {mission.client}</p>
            </div>
            <button type="button" onClick={onClose} style={{ width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.14)",border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,transition:"all 0.25s" }}>✕</button>
          </div>
          <div style={{ marginTop:10,display:"flex",gap:8 }}>
            <span style={{ background:"#f0fdf4",color:"#15803d",border:"1px solid #bbf7d0",display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20 }}>
              <span style={{ width:5,height:5,borderRadius:"50%",background:"#22c55e" }}/>{mission.statut}
            </span>
            <span style={{ background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)",display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20 }}>
              {mission.passagers} passager{mission.passagers>1?"s":""} · {mission.bagage}
            </span>
          </div>
        </div>

        {/* Timeline body */}
        <div style={{ overflowY:"auto",flex:1 }}>
          <div style={{ padding:"20px 24px" }}>
            <p style={{ fontSize:11,fontWeight:700,color:"var(--text-muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:16 }}>Parcours détaillé</p>
            <div className="tl-track">
              {mission.trajet.map((stop, i) => (
                <div key={i} className="tl-stop">
                  <div className={`tl-dot ${typeClass[stop.type] || "middle"}`}>{typeLetter[stop.type]}</div>
                  <div className="tl-content">
                    <div style={{ fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:stop.type==="start"?"var(--brand-blue)":stop.type==="end"?"var(--accent-green)":"var(--accent-orange)",marginBottom:2 }}>
                      {typeLabel[stop.type] || "Station"}
                    </div>
                    <div className="tl-header">
                      <span className="tl-loc">{stop.lieu}</span>
                      <span className="tl-time">{stop.heure}</span>
                    </div>
                    {stop.passagers && stop.passagers.length > 0 && (
                      <div className="tl-pass">
                        {stop.passagers.map((p,j) => (
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
            {mission.note && (
              <div style={{ marginTop:16,background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,padding:"10px 14px",display:"flex",gap:8 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2} style={{ flexShrink:0,marginTop:1 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p style={{ fontSize:12,color:"#9a3412",fontWeight:500 }}>{mission.note}</p>
              </div>
            )}

            {/* Véhicule */}
            <div style={{ marginTop:12,background:"#f8fafc",border:"1px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"var(--text-sec)" }}>
              <span style={{ fontWeight:700,color:"var(--text-primary)" }}>Véhicule :</span> {mission.vehicule}
            </div>
          </div>
        </div>

        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding:"9px 20px",fontSize:13,fontFamily:"inherit",color:"var(--text-sec)",border:"1px solid var(--border)",borderRadius:10,background:"#fff",cursor:"pointer" }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ MAIN ══════════════════════════ */
export default function HistoriqueM() {
  const navigate = useNavigate();

  const [missions,      setMissions]      = useState(loadData);
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search,        setSearch]        = useState("");
  const [detail,        setDetail]        = useState(null);

  useEffect(() => { saveData(missions); }, [missions]);

  /* ensure ch css */
  useEffect(() => {
    if (typeof document !== "undefined" && !document.getElementById(CH_CSS_ID)) {
      import("./DashbordCH.jsx").catch(()=>{});
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return missions;
    const q = search.trim().toLowerCase();
    return missions.filter(m=>[m.ref,m.date,m.client,m.vehicule,...m.trajet.map(s=>s.lieu)].join(" ").toLowerCase().includes(q));
  }, [missions, search]);

  const photo    = (() => { try { const p = localStorage.getItem("airops_ch_profile_v1"); return p ? JSON.parse(p).photo : null; } catch { return null; } })();
  const nomCH   = (() => { try { const p = localStorage.getItem("airops_ch_profile_v1"); return p ? JSON.parse(p).nom || "Ahmed" : "Ahmed"; } catch { return "Ahmed"; } })();
  const initials = nomCH.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase() || "AB";

  return (
    <div className="chw">
      {sidebarMobile && <div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

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
          {navItems.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`sb-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.badge?<span className="sb-badge">{item.badge}</span>:null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop:0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={()=>navigate("/login")}>
            <span style={{ flexShrink:0 }}><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

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
              <div style={{ textAlign:"right" }}><div className="user-name">{nomCH}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{photo?<img src={photo} alt="profil"/>:initials}</div>
            </div>
          </div>
        </header>

        <main className="chc">
          <h1 className="page-title">Historique des Missions</h1>
          <p className="page-sub">Consultez toutes vos missions terminées avec le détail de chaque trajet.</p>

          {/* Summary card */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            <div className="sc green"><div className="sc-top"><div className="sc-icon green">✅</div><span className="sc-tag green">Archivées</span></div><div className="sc-value">{missions.length}</div><div className="sc-label">Missions terminées</div></div>
            <div className="sc blue"><div className="sc-top"><div className="sc-icon blue">📍</div><span className="sc-tag blue">Arrêts</span></div><div className="sc-value">{missions.reduce((s,m)=>s+m.trajet.filter(t=>t.type==="middle").length,0)}</div><div className="sc-label">Stations intermédiaires</div></div>
            <div className="sc orange"><div className="sc-top"><div className="sc-icon orange">👥</div><span className="sc-tag orange">Total</span></div><div className="sc-value">{missions.reduce((s,m)=>s+m.passagers,0)}</div><div className="sc-label">Passagers transportés</div></div>
          </div>

          {/* Table */}
          <div className="tbl-card">
            <div className="tbl-hd">
              <span className="tbl-hd-title">Liste des missions terminées</span>
              <span style={{ background:"#f0fdf4",color:"#15803d",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:20 }}>TERMINÉES · {filtered.length}</span>
            </div>

            <div style={{ display:"grid",gridTemplateColumns:"110px 90px 1fr 130px 110px",padding:"9px 22px",background:"#f8fafc",borderBottom:"1px solid var(--border)",fontSize:10,fontWeight:700,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.8px" }}>
              <span>Référence</span><span>Date</span><span>Trajet</span><span>Client</span><span>Action</span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
                <p style={{ fontSize:14,fontWeight:700,color:"var(--text-primary)",marginBottom:4 }}>Aucune mission trouvée</p>
                <p style={{ fontSize:12,color:"var(--text-muted)" }}>Essayez une autre recherche.</p>
              </div>
            ) : filtered.map(m=>(
              <div key={m.ref} style={{ display:"grid",gridTemplateColumns:"110px 90px 1fr 130px 110px",alignItems:"center",padding:"13px 22px",borderBottom:"1px solid #f1f5f9",transition:"background 0.18s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <span style={{ fontSize:13,fontWeight:700,color:"var(--brand-blue)" }}>{m.ref}</span>
                <span style={{ fontSize:12,color:"var(--text-sec)" }}>{m.date}</span>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:"var(--text-primary)" }}>{m.trajet[0].lieu}</div>
                  <div style={{ fontSize:11,color:"var(--text-muted)" }}>→ {m.trajet[m.trajet.length-1].lieu}</div>
                  {m.trajet.filter(t=>t.type==="middle").length>0 && (
                    <div style={{ fontSize:10,color:"var(--accent-orange)",fontWeight:600,marginTop:2 }}>
                      {m.trajet.filter(t=>t.type==="middle").length} arrêt{m.trajet.filter(t=>t.type==="middle").length>1?"s":""} intermédiaire{m.trajet.filter(t=>t.type==="middle").length>1?"s":""}
                    </div>
                  )}
                </div>
                <span style={{ fontSize:12,color:"var(--text-sec)" }}>{m.client}</span>
                <button type="button" className="act-btn" onClick={()=>setDetail(m)}>Voir trajet</button>
              </div>
            ))}
          </div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand">
            <svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span style={{ fontSize:12,color:"var(--text-muted)" }}>{filtered.length} mission{filtered.length!==1?"s":""} dans l'historique</span>
        </footer>
      </div>

      {detail && <TimelineModal mission={detail} onClose={()=>setDetail(null)}/>}
    </div>
  );
}