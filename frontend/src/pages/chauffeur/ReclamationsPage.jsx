import { useEffect, useMemo, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchMyIncidents, createIncident, mapIncident } from "../../services/chauffeurService";

/* ─── Inject CSS ─────────────────────────────────────────── */
const RECLAM_CSS = `
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

  /* ── Réclamations page ── */
  .rp-page-title{font-size:25px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.5px;margin-bottom:4px;}
  .rp-page-title span{color:var(--brand-blue);}
  .rp-page-sub{font-size:13px;color:var(--text-muted);margin-bottom:22px;}

  .rp-main-card{background:#fff;border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow-sm);overflow:hidden;}
  .rp-toolbar{display:flex;align-items:center;justify-content:flex-end;padding:14px 20px;border-bottom:1px solid var(--border);gap:12px;flex-wrap:wrap;}
  .rp-actions{display:flex;align-items:center;gap:6px;}
  .rp-act-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1.5px solid var(--border);background:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.2s;color:var(--text-sec);}
  .rp-act-btn:hover{border-color:var(--brand-blue);color:var(--brand-blue);background:#eff6ff;}
  .rp-act-btn.danger:hover{border-color:#ef4444;color:#ef4444;background:#fef2f2;}

  .rp-list{padding:12px 16px;display:flex;flex-direction:column;gap:10px;}
  .rp-card{border:1.5px solid var(--border);border-radius:16px;padding:16px 18px;transition:all 0.2s;}
  .rp-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);}
  .rp-card-inner{display:flex;align-items:flex-start;gap:14px;}
  .rp-card-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .rp-card-body{flex:1;min-width:0;}
  .rp-card-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;}
  .rp-card-ref{font-size:14px;font-weight:800;color:var(--brand-blue);}
  .rp-badge{font-size:9px;font-weight:700;padding:2px 9px;border-radius:20px;white-space:nowrap;}
  .rp-badge.ouvert{background:#eff6ff;color:#1252aa;border:1px solid #bfdbfe;}
  .rp-badge.en-cours{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;}
  .rp-badge.resolu{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;}
  .rp-card-titre{font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:4px;}
  .rp-card-desc{font-size:12px;color:var(--text-sec);margin-bottom:8px;line-height:1.5;}
  .rp-card-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .rp-meta-item{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--text-sec);font-weight:500;}
  .rp-time{font-size:10px;font-weight:700;color:var(--text-muted);background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:3px 9px;white-space:nowrap;}
  .rp-card-footer{display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;flex-wrap:wrap;}
  .rp-btn-del{display:flex;align-items:center;gap:5px;padding:8px 14px;border:1.5px solid #fecaca;color:#ef4444;background:none;border-radius:10px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;}
  .rp-btn-del:hover{background:#fef2f2;border-color:#ef4444;}

  .rp-empty{padding:60px 22px;text-align:center;}
  .rp-empty-icon{width:72px;height:72px;margin:0 auto 18px;border-radius:20px;background:#fff7ed;display:flex;align-items:center;justify-content:center;}

  /* Modals */
  .rm-ov{position:fixed;inset:0;z-index:100;background:rgba(13,43,94,0.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:rmFade 0.2s ease;}
  @keyframes rmFade{from{opacity:0}to{opacity:1}}
  @keyframes rmUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:none}}
  .rm-confirm-box{background:#fff;border-radius:24px;width:100%;max-width:400px;padding:28px;box-shadow:var(--shadow-lg);animation:rmUp 0.25s ease;text-align:center;}
  .rm-confirm-icon{width:64px;height:64px;border-radius:20px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
  .rm-confirm-btns{display:flex;gap:10px;margin-top:22px;}
  .rm-confirm-cancel{flex:1;padding:11px;font-size:13px;font-family:inherit;font-weight:600;color:var(--text-sec);border:1.5px solid var(--border);border-radius:12px;background:#fff;cursor:pointer;transition:all 0.2s;}
  .rm-confirm-cancel:hover{background:var(--bg-page);}
  .rm-confirm-ok{flex:1;padding:11px;font-size:13px;font-family:inherit;font-weight:700;color:#fff;border:none;border-radius:12px;background:linear-gradient(135deg,#ef4444,#b91c1c);cursor:pointer;box-shadow:0 4px 14px rgba(239,68,68,0.3);transition:all 0.2s;}
  .rm-confirm-ok:hover{transform:translateY(-1px);}
  .rm-toast{position:fixed;top:18px;right:18px;z-index:600;background:var(--brand-dark);color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);border-left:3px solid var(--brand-light);animation:rmToast 0.3s ease;}
  .rm-toast.green{border-left-color:#4ade80;}
  .rm-toast.red{border-left-color:#f87171;}
  @keyframes rmToast{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}

  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.chh-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .chc{padding:16px;}.chh{padding:0 16px;}.search-wrap{display:none;}
  }
  @media(max-width:480px){.rp-card-footer{flex-wrap:wrap;}}
`;

if (typeof document !== "undefined" && !document.getElementById("airops-reclam-css")) {
  const s = document.createElement("style"); s.id="airops-reclam-css"; s.textContent=RECLAM_CSS; document.head.appendChild(s);
}

/* ─── Data ─────────────────────────────────── */
const LS_KEY = "airops_reclam_ch_v1";
const initialReclamations = [
  { id:1, ref:"#RCL-1001", titre:"Retard de prise en charge", description:"Le client a attendu plus de 30 minutes après l'heure prévue. Problème de trafic non signalé.", mission:"#MSN-4490", date:"05/04/2026", heure:"10:15", statut:"en-cours", priorite:"Haute" },
  { id:2, ref:"#RCL-1002", titre:"Problème de climatisation", description:"La climatisation du véhicule était en panne lors de la course. Client mécontent de la chaleur.", mission:"#MSN-4485", date:"04/04/2026", heure:"14:40", statut:"ouvert",   priorite:"Moyenne" },
  { id:3, ref:"#RCL-1003", titre:"Erreur de facturation", description:"Le montant facturé au client ne correspond pas au tarif convenu initialement.", mission:"#MSN-4478", date:"03/04/2026", heure:"09:00", statut:"resolu",  priorite:"Basse" },
  { id:4, ref:"#RCL-1004", titre:"Comportement signalé", description:"Un passager a signalé un échange tendu. La situation a été gérée calmement.", mission:"#MSN-4470", date:"02/04/2026", heure:"18:20", statut:"resolu",  priorite:"Haute" },
];
function loadData()  { try { const s=localStorage.getItem(LS_KEY); return s?JSON.parse(s):initialReclamations; } catch { return initialReclamations; } }
function saveData(d) { try { localStorage.setItem(LS_KEY,JSON.stringify(d)); } catch {} }

/* ─── Nav ────────────────────────────────── */
const navItems = [
  { label:"Tableau de Bord",     to:"/dashbordchauffeur", icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Historique Missions", to:"/historiqueM",       icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { label:"Réclamations",        to:"/reclamationsCH",    icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg> },
  { label:"Navigation",          to:"/navigationCH",      icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 16l4.553-2.276A1 1 0 0021 19.382V8.618a1 1 0 00-.553-.894L15 5m0 14V5"/></svg> },
  { label:"Notifications",       to:"/notificationM",     icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
];

const STATUT_LABELS = { ouvert:"Ouverte", "en-cours":"En cours", resolu:"Résolue" };
const STATUT_ICON_COLOR = { ouvert:"#2980e8", "en-cours":"#f97316", resolu:"#16a34a" };
const STATUT_BG = { ouvert:"#eff6ff", "en-cours":"#fff7ed", resolu:"#f0fdf4" };

/* ─── Confirm Delete Modal ─────────────────── */
function ConfirmDelete({ item, label, onConfirm, onClose }) {
  if (!item) return null;
  return (
    <div className="rm-ov" onClick={onClose}>
      <div className="rm-confirm-box" onClick={e=>e.stopPropagation()}>
        <div className="rm-confirm-icon">
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
        <h3 style={{fontSize:16,fontWeight:800,color:"var(--text-primary)",marginBottom:8}}>Supprimer la réclamation</h3>
        <p style={{fontSize:13,color:"var(--text-muted)"}}>Voulez-vous supprimer <strong style={{color:"var(--brand-blue)"}}>{label}</strong> ? Cette action est irréversible.</p>
        <div className="rm-confirm-btns">
          <button type="button" className="rm-confirm-cancel" onClick={onClose}>Annuler</button>
          <button type="button" className="rm-confirm-ok" onClick={()=>{onConfirm();onClose();}}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────── */
export default function ReclamationsCH() {
  const navigate = useNavigate();
  const [reclams,       setReclams]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [search,        setSearch]        = useState("");
  const [confirmDel,    setConfirmDel]    = useState(null);
  const [toast,         setToast]         = useState({msg:"",type:""});
  // Form for new reclamation
  const [showForm,      setShowForm]      = useState(false);
  const [formDesc,      setFormDesc]      = useState("");
  const [formSubmitting,setFormSubmitting]= useState(false);

  const loadReclams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyIncidents({ limit: 50 });
      setReclams((data.data || []).map(mapIncident));
    } catch {/* silently fail */}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReclams(); }, [loadReclams]);
  useEffect(()=>{if(!toast.msg)return;const t=setTimeout(()=>setToast({msg:"",type:""}),2800);return()=>clearTimeout(t);},[toast]);

  const filtered = useMemo(()=>{
    let list=reclams;
    if(search.trim()){const q=search.trim().toLowerCase();list=list.filter(r=>[r.ref,r.description,r.missionRef].join(" ").toLowerCase().includes(q));}
    return list;
  },[reclams,search]);

  const handleSubmitNew = async () => {
    if (!formDesc.trim() || formDesc.trim().length < 5) {
      setToast({ msg: "Description trop courte (min 5 caractères).", type: "" });
      return;
    }
    setFormSubmitting(true);
    try {
      await createIncident({ description: formDesc.trim() });
      setFormDesc("");
      setShowForm(false);
      setToast({ msg: "✓ Réclamation soumise avec succès.", type: "green" });
      loadReclams();
    } catch (err) {
      setToast({ msg: err?.response?.data?.message || "Erreur lors de la soumission.", type: "" });
    } finally { setFormSubmitting(false); }
  };

  const deleteReclam = id=>{ setReclams(p=>p.filter(r=>r.id!==id)); setToast({msg:"✓ Réclamation supprimée.",type:"red"}); };
  const deleteAll    = ()=>{ setReclams([]); setToast({msg:"✓ Toutes les réclamations supprimées.",type:"red"}); };

  const profile  = (()=>{try{const u=localStorage.getItem("user");return u?JSON.parse(u):{name:"",photo:""};}catch{return{name:"",photo:""};} })();
  const nomCH    = profile.name || "Chauffeur";
  const photo    = "";
  const initials = nomCH.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"CH";

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
          {navItems.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`sb-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
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
            <span className="chh-title">Réclamations</span>
          </div>
          <div className="chh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" className="search-input" placeholder="Rechercher une réclamation…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="user-chip">
              <div style={{textAlign:"right"}}><div className="user-name">{nomCH}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{photo?<img src={photo} alt="profil"/>:initials}</div>
            </div>
          </div>
        </header>

        <main className="chc">
          <h1 className="rp-page-title">Mes <span>Réclamations</span></h1>
          <p className="rp-page-sub">Signalez un problème rencontré lors d'une mission. Notre équipe traitera votre réclamation rapidement.</p>

          {/* List card */}
          <div className="rp-main-card">
            <div className="rp-toolbar">
              <div className="rp-actions">
                {reclams.length>0&&(
                  <button type="button" className="rp-act-btn danger" onClick={()=>setConfirmDel("all")}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Tout supprimer
                  </button>
                )}
              </div>
            </div>

            {filtered.length===0?(
              <div className="rp-empty">
                <div className="rp-empty-icon"><svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
                <p style={{fontSize:15,fontWeight:700,color:"var(--text-primary)",marginBottom:6}}>Aucune réclamation</p>
                <p style={{fontSize:13,color:"var(--text-muted)"}}>Vous n'avez soumis aucune réclamation.</p>
              </div>
            ):(
              <div className="rp-list">
                {filtered.map(r=>(
                  <div key={r.id} className="rp-card">
                    <div className="rp-card-inner">
                      <div className="rp-card-icon" style={{background:STATUT_BG[r.statut]}}>
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={STATUT_ICON_COLOR[r.statut]} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <div className="rp-card-body">
                        <div className="rp-card-head">
                          <span className="rp-card-ref">{r.ref}</span>
                          <span className={`rp-badge ${r.statut}`}>{STATUT_LABELS[r.statut]}</span>
                          <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,background:r.priorite==="Haute"?"#fef2f2":r.priorite==="Moyenne"?"#fff7ed":"#f0fdf4",color:r.priorite==="Haute"?"#dc2626":r.priorite==="Moyenne"?"#c2410c":"#15803d",border:`1px solid ${r.priorite==="Haute"?"#fecaca":r.priorite==="Moyenne"?"#fed7aa":"#bbf7d0"}`}}>{r.priorite}</span>
                        </div>
                        <div className="rp-card-titre">{r.titre}</div>
                        <div className="rp-card-desc">{r.description}</div>
                        <div className="rp-card-meta">
                          <span className="rp-meta-item">
                            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                            Mission : {r.mission}
                          </span>
                          <span className="rp-time">{r.date} · {r.heure}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rp-card-footer" onClick={e=>e.stopPropagation()}>
                      <button type="button" className="rp-btn-del" onClick={()=>setConfirmDel({id:r.id,ref:r.ref})}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{fontSize:10,color:"var(--text-muted)",textAlign:"center",padding:"14px 0 4px",letterSpacing:1,textTransform:"uppercase"}}>© 2026 AirOps Transport Management</div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand"><svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>Système de gestion sécurisé — AirOps Transport 2026</div>
          <span style={{fontSize:12,color:"var(--text-muted)"}}>{filtered.length} réclamation{filtered.length!==1?"s":""}</span>
        </footer>
      </div>

      {/* Confirm delete single */}
      {confirmDel&&confirmDel!=="all"&&(
        <ConfirmDelete
          item={confirmDel}
          label={confirmDel.ref}
          onConfirm={()=>deleteReclam(confirmDel.id)}
          onClose={()=>setConfirmDel(null)}
        />
      )}

      {/* Confirm delete all */}
      {confirmDel==="all"&&(
        <div className="rm-ov" onClick={()=>setConfirmDel(null)}>
          <div className="rm-confirm-box" onClick={e=>e.stopPropagation()}>
            <div className="rm-confirm-icon">
              <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
            <h3 style={{fontSize:16,fontWeight:800,color:"var(--text-primary)",marginBottom:8}}>Supprimer toutes les réclamations</h3>
            <p style={{fontSize:13,color:"var(--text-muted)"}}>Voulez-vous supprimer <strong style={{color:"var(--brand-blue)"}}>toutes les réclamations</strong> ? Cette action est irréversible.</p>
            <div className="rm-confirm-btns">
              <button type="button" className="rm-confirm-cancel" onClick={()=>setConfirmDel(null)}>Annuler</button>
              <button type="button" className="rm-confirm-ok" onClick={()=>{deleteAll();setConfirmDel(null);}}>Tout supprimer</button>
            </div>
          </div>
        </div>
      )}

      {toast.msg&&<div className={`rm-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}