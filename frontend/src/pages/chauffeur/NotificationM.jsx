import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const LS_KEY = "airops_notif_ch_v1";
const CH_CSS_ID = "airops-ch-css";

const initialNotifications = [
  { id:1, ref:"#MSN-4501", titre:"Nouvelle mission assignée", client:"Mme. Salma Ben Youssef", depart:"Aéroport Tunis Carthage", arrivee:"Hôtel Laico Tunis", date:"08/04/2026", heure:"14:30", statut:"NOUVEAU", passagers:2, bagage:"2 valises", vehicule:"Mercedes Classe E — TN 456 AB", note:"Cliente VIP — ponctualité requise", lu:false },
  { id:2, ref:"#MSN-4502", titre:"Nouvelle mission assignée", client:"M. Hatem Gharbi", depart:"Hôtel El Mouradi Gammarth", arrivee:"Aéroport Tunis Carthage", date:"08/04/2026", heure:"16:00", statut:"NOUVEAU", passagers:1, bagage:"1 valise cabine", vehicule:"BMW Série 5 — TN 789 CD", note:"Départ vers vol international", lu:false },
  { id:3, ref:"#MSN-4503", titre:"Nouvelle mission assignée", client:"Mme. Ines Jaziri", depart:"Aéroport Enfidha", arrivee:"Résidence Les Jasmins", date:"09/04/2026", heure:"09:15", statut:"NOUVEAU", passagers:3, bagage:"3 valises", vehicule:"Audi A6 — TN 321 EF", note:"Prévoir assistance bagages", lu:true },
  { id:4, ref:"#MSN-4504", titre:"Nouvelle mission assignée", client:"M. Karim Belhaj", depart:"Centre-ville Sousse", arrivee:"Aéroport Monastir", date:"09/04/2026", heure:"11:45", statut:"NOUVEAU", passagers:2, bagage:"2 sacs", vehicule:"Toyota Camry — TN 654 GH", note:"Client demande arrivée 20 min avant", lu:true },
];

function loadData()  { try { const s=localStorage.getItem(LS_KEY); return s?JSON.parse(s):initialNotifications; } catch { return initialNotifications; } }
function saveData(d) { try { localStorage.setItem(LS_KEY,JSON.stringify(d)); } catch {} }

const navItems = [
  { label:"Tableau de Bord",   to:"/dashbordchauffeur",    icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Historique Missions",to:"/historiqueM",  icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { label:"Notifications",     to:"/notificationM", icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label:"Mon Profil",        to:"/profilCH",      icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

function DetailModal({ notif, onClose }) {
  if (!notif) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(13,43,94,0.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn 0.2s ease" }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:500,overflow:"hidden",boxShadow:"0 20px 50px rgba(13,43,94,0.18)",animation:"slideUp 0.25s ease",maxHeight:"90vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        <div style={{ background:"linear-gradient(135deg,#0d2b5e,#1252aa)",padding:"22px 24px",color:"#fff" }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:10,letterSpacing:"1.5px",color:"rgba(255,255,255,0.5)",fontWeight:700,marginBottom:4,textTransform:"uppercase" }}>Notification Mission</p>
              <p style={{ fontSize:20,fontWeight:800 }}>{notif.ref}</p>
              <p style={{ fontSize:13,color:"rgba(255,255,255,0.65)",marginTop:2 }}>{notif.date} à {notif.heure}</p>
            </div>
            <button type="button" onClick={onClose} style={{ width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.14)",border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15 }}>✕</button>
          </div>
          <div style={{ marginTop:10,display:"flex",gap:8,flexWrap:"wrap" }}>
            <span style={{ background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20 }}>{notif.statut}</span>
            {!notif.lu && <span style={{ background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20 }}>NON LU</span>}
          </div>
        </div>
        <div style={{ padding:"18px 24px" }}>
          {[
            ["Référence",  notif.ref],
            ["Date",       `${notif.date} à ${notif.heure}`],
            ["Client",     notif.client],
            ["Départ",     notif.depart],
            ["Arrivée",    notif.arrivee],
            ["Véhicule",   notif.vehicule],
            ["Passagers",  `${notif.passagers} pers. · ${notif.bagage}`],
          ].filter(Boolean).map(([lbl,val])=>(
            <div key={lbl} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f1f5f9" }}>
              <span style={{ fontSize:11,fontWeight:600,color:"var(--text-muted)" }}>{lbl}</span>
              <span style={{ fontSize:13,fontWeight:700,color:"var(--text-primary)",textAlign:"right",maxWidth:"65%" }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"14px 24px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"flex-end" }}>
          <button type="button" onClick={onClose} style={{ padding:"9px 20px",fontSize:13,fontFamily:"inherit",color:"var(--text-sec)",border:"1px solid var(--border)",borderRadius:10,background:"#fff",cursor:"pointer" }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationM() {
  const navigate = useNavigate();

  const [notifs,        setNotifs]        = useState(loadData);
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search,        setSearch]        = useState("");
  const [detail,        setDetail]        = useState(null);
  const [toast,         setToast]         = useState("");

  useEffect(() => { saveData(notifs); }, [notifs]);
  useEffect(() => { if (!toast) return; const t=setTimeout(()=>setToast(""),2800); return ()=>clearTimeout(t); }, [toast]);

  const unread = notifs.filter(n=>!n.lu).length;

  const filtered = useMemo(() => {
    if (!search.trim()) return notifs;
    const q = search.trim().toLowerCase();
    return notifs.filter(n=>[n.ref,n.client,n.depart,n.arrivee,n.date,n.heure].join(" ").toLowerCase().includes(q));
  }, [notifs, search]);

  const markAllRead = () => { setNotifs(prev=>prev.map(n=>({...n,lu:true}))); setToast("Toutes les notifications marquées comme lues."); };
  const markRead    = id => { setNotifs(prev=>prev.map(n=>n.id===id?{...n,lu:true}:n)); };
  const openDetail  = n  => { markRead(n.id); setDetail(n); };

  const photo    = (() => { try { const p=localStorage.getItem("airops_ch_profile_v1"); return p?JSON.parse(p).photo:null; } catch { return null; } })();
  const nomCH   = (() => { try { const p=localStorage.getItem("airops_ch_profile_v1"); return p?JSON.parse(p).nom||"Ahmed":"Ahmed"; } catch { return "Ahmed"; } })();
  const initials = nomCH.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"AB";

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
              {item.to==="/notificationM" && unread>0 ? <span className="sb-badge">{unread}</span> : null}
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
            <span className="chh-title">Notifications</span>
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
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12 }}>
            <div>
              <h1 className="page-title">Notifications Chauffeur</h1>
              <p className="page-sub">Nouvelles missions assignées automatiquement par le système.</p>
            </div>
            <div style={{ background:"linear-gradient(135deg,var(--brand-blue),var(--brand-mid))",borderRadius:20,padding:"18px 22px",color:"#fff",boxShadow:"0 4px 14px rgba(41,128,232,0.3)",minWidth:180 }}>
              <p style={{ fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",marginBottom:4 }}>Nouvelles missions</p>
              <p style={{ fontSize:30,fontWeight:800,letterSpacing:"-1px" }}>{notifs.length}</p>
              {unread>0 && <p style={{ fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:2 }}>{unread} non lu{unread>1?"es":""}</p>}
            </div>
          </div>

          <div className="tbl-card">
            <div className="tbl-hd">
              <span className="tbl-hd-title">Liste des nouvelles missions</span>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                {unread>0 && <button type="button" onClick={markAllRead} style={{ fontSize:12,fontWeight:600,color:"var(--brand-blue)",background:"#eff6ff",border:"none",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontFamily:"inherit" }}>Tout marquer lu</button>}
                <span style={{ background:"#fef2f2",color:"#dc2626",fontSize:10,fontWeight:700,padding:"4px 12px",borderRadius:20 }}>
                  {unread} non lu{unread>1?"es":""}
                </span>
              </div>
            </div>

            {/* Notifications list */}
            <div style={{ padding:"8px 0" }}>
              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></div>
                  <p style={{ fontSize:14,fontWeight:700,color:"var(--text-primary)",marginBottom:4 }}>Aucune notification trouvée</p>
                  <p style={{ fontSize:12,color:"var(--text-muted)" }}>Essayez une autre recherche.</p>
                </div>
              ) : filtered.map(n=>(
                <div key={n.id} style={{ display:"grid",gridTemplateColumns:"18px 1fr auto",alignItems:"start",padding:"14px 22px",borderBottom:"1px solid #f1f5f9",gap:14,background:n.lu?"":"#fafbff",transition:"background 0.18s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=n.lu?"#f8fafc":"#f0f5ff"} onMouseLeave={e=>e.currentTarget.style.background=n.lu?"":"#fafbff"}>
                  {/* unread dot */}
                  <div style={{ paddingTop:4 }}>
                    {!n.lu && <span style={{ width:8,height:8,borderRadius:"50%",background:"#ef4444",display:"block" }}/>}
                  </div>
                  {/* Content */}
                  <div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                      <span style={{ fontSize:13,fontWeight:700,color:"var(--brand-blue)" }}>{n.ref}</span>
                      <span style={{ fontSize:10,fontWeight:700,background:"#fce7f3",color:"#be185d",padding:"2px 8px",borderRadius:20 }}>NOUVEAU</span>
                      {!n.lu && <span style={{ fontSize:10,fontWeight:700,background:"#fef2f2",color:"#dc2626",padding:"2px 8px",borderRadius:20 }}>Non lu</span>}
                    </div>
                    <div style={{ fontSize:13,fontWeight:600,color:"var(--text-primary)",marginBottom:2 }}>{n.depart} <span style={{ color:"var(--text-muted)" }}>→</span> {n.arrivee}</div>
                    <div style={{ fontSize:12,color:"var(--text-sec)",marginBottom:4 }}>{n.client} · {n.passagers} pers. · {n.date} à {n.heure}</div>
                    {n.note && <div style={{ fontSize:11,color:"var(--accent-orange)",fontWeight:500 }}>⚠ {n.note}</div>}
                  </div>
                  {/* Action */}
                  <button type="button" className="act-btn" onClick={()=>openDetail(n)}>Voir détail</button>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand">
            <svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span style={{ fontSize:12,color:"var(--text-muted)" }}>{filtered.length} notification{filtered.length!==1?"s":""}</span>
        </footer>
      </div>

      {detail && <DetailModal notif={detail} onClose={()=>setDetail(null)}/>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}