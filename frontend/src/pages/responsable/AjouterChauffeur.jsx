import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUser } from "../../services/responsableService";

const CSS = `
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
  .acw{display:flex;height:100vh;overflow:hidden;background:var(--bg-page);font-family:'DM Sans','Segoe UI',sans-serif;color:var(--text-primary);}
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
  .acm{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .ach{height:var(--header-h);background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .ach-left{display:flex;align-items:center;gap:12px;}
  .ach-right{display:flex;align-items:center;gap:10px;}
  .ach-menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;border-radius:8px;transition:var(--tr);}
  .ach-menu-btn:hover{background:var(--bg-page);}
  .ach-title{font-size:15px;font-weight:700;color:var(--text-primary);}
  .user-chip{display:flex;align-items:center;gap:9px;}
  .user-name{font-size:13px;font-weight:700;color:var(--text-primary);}
  .user-role{font-size:11px;color:var(--text-muted);}
  .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;box-shadow:0 3px 10px rgba(41,128,232,0.35);border:2.5px solid rgba(41,128,232,0.2);flex-shrink:0;overflow:hidden;}
  .user-avatar img{width:100%;height:100%;object-fit:cover;}
  .acc{flex:1;overflow-y:auto;padding:26px;}
  .ac-page-title{font-size:25px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.5px;margin-bottom:4px;}
  .ac-page-title span{color:var(--brand-blue);}
  .ac-page-sub{font-size:13px;color:var(--text-muted);margin-bottom:24px;}
  .ac-layout{display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start;max-width:1000px;}
  .ac-preview-card{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow-sm);overflow:hidden;position:sticky;top:0;}
  .ac-preview-top{background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));padding:28px 20px;text-align:center;}
  .ac-avatar{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);border:3px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;margin:0 auto 12px;letter-spacing:-1px;}
  .ac-preview-name{font-size:17px;font-weight:800;color:#fff;margin-bottom:3px;}
  .ac-preview-email{font-size:11px;color:rgba(255,255,255,0.7);}
  .ac-preview-body{padding:16px;display:flex;flex-direction:column;gap:8px;}
  .ac-preview-row{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-page);border-radius:10px;}
  .ac-preview-icon{width:28px;height:28px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .ac-preview-lbl{font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;}
  .ac-preview-val{font-size:12px;font-weight:600;color:var(--text-primary);}
  .ac-preview-empty{font-size:11px;color:var(--text-muted);font-style:italic;}
  .ac-form-card{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow-sm);overflow:hidden;}
  .ac-form-header{background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));padding:22px 26px;display:flex;align-items:center;gap:14px;}
  .ac-form-header-icon{width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ac-form-header-text h2{font-size:17px;font-weight:800;color:#fff;margin-bottom:2px;}
  .ac-form-header-text p{font-size:12px;color:rgba(255,255,255,0.65);}
  .ac-form-body{padding:24px;}
  .ac-section-label{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
  .ac-section-label::after{content:'';flex:1;height:1px;background:var(--border);}
  .ac-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
  .ac-field{display:flex;flex-direction:column;gap:5px;}
  .ac-field.full{grid-column:1/-1;}
  .ac-label{font-size:11px;font-weight:700;color:var(--text-sec);letter-spacing:0.5px;text-transform:uppercase;}
  .ac-label span{color:var(--accent-red);margin-left:2px;font-weight:400;text-transform:none;}
  .ac-input{height:44px;padding:0 14px;border:1.5px solid var(--border);border-radius:11px;font-size:13.5px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);width:100%;}
  .ac-input:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .ac-input.err{border-color:#fca5a5;background:#fff;}
  .ac-input::placeholder{color:var(--text-muted);}
  .ac-select{height:44px;padding:0 14px;border:1.5px solid var(--border);border-radius:11px;font-size:13.5px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);width:100%;cursor:pointer;appearance:none;}
  .ac-select:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .ac-select-wrap{position:relative;}
  .ac-select-wrap svg{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted);}
  .ac-error{font-size:11px;color:var(--accent-red);margin-top:2px;}
  .phone-row-c{display:flex;gap:8px;}
  .phone-code-c{height:44px;border:1.5px solid var(--border);border-radius:11px;font-size:12px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);cursor:pointer;padding:0 10px;flex-shrink:0;min-width:140px;}
  .phone-code-c:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .validity-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-top:6px;}
  .validity-badge.valid{background:#eff6ff;color:var(--brand-blue);border:1px solid #bfdbfe;}
  .validity-badge.warning{background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;}
  .validity-badge.expired{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
  .ac-form-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;gap:12px;background:#f8fafc;}
  .btn-ac-reset{padding:10px 22px;border-radius:12px;border:1.5px solid var(--border);background:#fff;color:var(--text-sec);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:var(--tr);}
  .btn-ac-reset:hover{background:var(--bg-page);}
  .btn-ac-save{display:flex;align-items:center;gap:8px;padding:10px 26px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));color:#fff;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:var(--tr);box-shadow:0 4px 14px rgba(41,128,232,0.3);}
  .btn-ac-save:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(41,128,232,0.4);}
  .btn-ac-save:disabled{background:#a5c8f4;cursor:not-allowed;box-shadow:none;}
  .ac-driver-list{margin-top:24px;max-width:1000px;}
  .ac-driver-list-title{font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:14px;}
  .driver-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:14px 18px;margin-bottom:10px;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:14px;transition:all 0.2s;}
  .driver-card:hover{border-color:var(--brand-blue);box-shadow:var(--shadow-sm);}
  .driver-avatar{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;flex-shrink:0;}
  .driver-name{font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:3px;}
  .driver-info{font-size:11px;color:var(--text-muted);display:flex;gap:10px;flex-wrap:wrap;}
  .driver-chip{display:inline-flex;align-items:center;gap:4px;background:var(--bg-page);border:1px solid var(--border);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--text-sec);}
  .btn-del-driver{width:30px;height:30px;border-radius:8px;border:1.5px solid #fecaca;background:#fef2f2;color:var(--accent-red);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;}
  .btn-del-driver:hover{background:var(--accent-red);border-color:var(--accent-red);color:#fff;}
  .ac-toast{position:fixed;top:18px;right:18px;z-index:600;background:var(--brand-dark);color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);border-left:3px solid var(--brand-light);animation:acToast 0.3s ease;}
  @keyframes acToast{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
  .ac-dash-footer{font-size:10px;color:var(--text-muted);text-align:center;padding:16px 0 4px;letter-spacing:1px;text-transform:uppercase;}
  @media(max-width:900px){.ac-layout{grid-template-columns:1fr;}.ac-preview-card{display:none;}}
  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.ach-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .acc{padding:16px;}.ach{padding:0 16px;}.user-role{display:none;}
  }
  @media(max-width:480px){
    .ac-grid{grid-template-columns:1fr;}
    .ac-form-body{padding:16px;}.ac-form-footer{padding:14px 16px;}
    .phone-row-c{flex-direction:column;}.phone-code-c{min-width:100%;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-ac-css")) {
  const s=document.createElement("style"); s.id="airops-ac-css"; s.textContent=CSS; document.head.appendChild(s);
}

const COUNTRIES = [
  {code:"TN",dial:"+216",flag:"🇹🇳",name:"Tunisie",digits:8},
  {code:"DZ",dial:"+213",flag:"🇩🇿",name:"Algérie",digits:9},
  {code:"MA",dial:"+212",flag:"🇲🇦",name:"Maroc",digits:9},
  {code:"FR",dial:"+33", flag:"🇫🇷",name:"France",digits:9},
  {code:"GB",dial:"+44", flag:"🇬🇧",name:"Royaume-Uni",digits:10},
  {code:"SA",dial:"+966",flag:"🇸🇦",name:"Arabie Saoudite",digits:9},
  {code:"AE",dial:"+971",flag:"🇦🇪",name:"Émirats Arabes",digits:9},
  {code:"US",dial:"+1",  flag:"🇺🇸",name:"États-Unis",digits:10},
];

const navItems = [
  { label:"Dashboard",         to:"/dashbordRES",      icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Notifications",     to:"/notificationR",    badge:3, icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label:"Ajouter Chauffeur", to:"/ajouterChauffeur", icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-1h10"/></svg> },
  { label:"Ajouter Passager",  to:"/ajouterPassager",  icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg> },
];

const defaultForm = {
  nom:"", prenom:"", cin:"", dateNaissance:"", phoneCountry:"TN", phone:"",
  email:"", nationalite:"Tunisienne",
  permisNum:"", permisExpiry:"",
  password:""
  // ← Notes internes supprimé
};

function initAbbr(n,p){return((n[0]||"")+(p[0]||"")).toUpperCase()||"CH";}
function getExpiredStatus(d){
  if(!d) return null;
  const diff=Math.ceil((new Date(d)-new Date())/(1000*60*60*24));
  if(diff<0) return "expired"; if(diff<90) return "warning"; return "valid";
}
const LS_KEY="airops_chauffeurs_v1";
function loadDrivers(){try{const s=localStorage.getItem(LS_KEY);return s?JSON.parse(s):[];}catch{return[];}}
function saveDrivers(d){try{localStorage.setItem(LS_KEY,JSON.stringify(d));}catch{}}

export default function AjouterChauffeur(){
  const navigate=useNavigate();
  const [collapsed,setCollapsed]=useState(false);
  const [sidebarMobile,setSidebarMobile]=useState(false);
  const [form,setForm]=useState(defaultForm);
  const [touched,setTouched]=useState({});
  const [drivers,setDrivers]=useState(loadDrivers);
  const [toast,setToast]=useState("");

  const profile=(()=>{try{const p=localStorage.getItem("airops_responsable_form_v1");return p?JSON.parse(p):{nom:"Ahmed Mansour"};}catch{return{nom:"Ahmed Mansour"};}})();
  const nomR=profile.nom||"Ahmed Mansour";
  const initR=nomR.trim().split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"AM";
  const sel=COUNTRIES.find(c=>c.code===form.phoneCountry)||COUNTRIES[0];

  const errors={
    nom:      !form.nom.trim()       ?"Obligatoire":form.nom.trim().length<2      ?"Min. 2 car.":"",
    prenom:   !form.prenom.trim()    ?"Obligatoire":form.prenom.trim().length<2   ?"Min. 2 car.":"",
    cin:      !form.cin.trim()       ?"Obligatoire":!/^\d{8}$/.test(form.cin.trim())?"8 chiffres":"",
    phone:    !form.phone.trim()     ?"Obligatoire":form.phone.replace(/\D/g,"").length!==sel.digits?`${sel.digits} chiffres`:"",
    email:    !form.email.trim()     ?"Obligatoire":!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)?"Email invalide":"",
    permisNum:!form.permisNum.trim() ?"Obligatoire":"",
    password: !form.password         ?"Obligatoire":form.password.length<6?"Min. 6 car.":"",
  };
  const isValid=Object.values(errors).every(v=>v==="");
  const hc=e=>{const{name,value}=e.target;setForm(p=>({...p,[name]:value}));};
  const hb=e=>setTouched(p=>({...p,[e.target.name]:true}));
  const cls=f=>`ac-input${touched[f]&&errors[f]?" err":""}`;
  const expiryStatus=getExpiredStatus(form.permisExpiry);

  const handleSave = async () => {
    setTouched(Object.fromEntries(Object.keys(errors).map(k=>[k,true])));
    if(!isValid) return;
    const payload = {
      name: `${form.prenom.trim()} ${form.nom.trim()}`.trim(),
      email: form.email.trim(),
      password: form.password || "Nouvelair2024!",
      role: "CHAUFFEUR",
      phone: `${sel.dial}${form.phone.replace(/^0/, "")}`,
      cin: form.cin.trim() || undefined,
      address: form.nationalite || undefined,
    };
    try {
      await createUser(payload);
      setForm(defaultForm); setTouched({});
      setToast(`✓ Chauffeur ${form.prenom} ${form.nom} ajouté !`);
      setTimeout(()=>setToast(""),3000);
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de la création.");
      setTimeout(()=>setToast(""),3000);
    }
  };
  const handleDelete = id => { setToast("Action non disponible depuis ce formulaire."); setTimeout(()=>setToast(""),2500); };

  const previewName=[form.prenom,form.nom].filter(Boolean).join(" ")||"Nouveau Chauffeur";
  const previewInitials=initAbbr(form.nom,form.prenom);

  return(
    <div className="acw">
      {sidebarMobile&&<div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}
      <aside className={["sidebar",collapsed?"collapsed":"",sidebarMobile?"open":""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={()=>setCollapsed(v=>!v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={()=>navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE RESPONSABLE</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item=>(
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({isActive})=>`sb-nav-item${isActive?" active":""}`} onClick={()=>setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span><span className="sb-nav-lbl">{item.label}</span>
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

      <div className="acm">
        <header className="ach">
          <div className="ach-left">
            <button type="button" className="ach-menu-btn" onClick={()=>setSidebarMobile(v=>!v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="ach-title">Ajouter un chauffeur</span>
          </div>
          <div className="ach-right">
            <div className="user-chip">
              <div style={{textAlign:"right"}}><div className="user-name">{nomR}</div><div className="user-role">Responsable</div></div>
              <div className="user-avatar">{initR}</div>
            </div>
          </div>
        </header>

        <main className="acc">
          <h1 className="ac-page-title">Ajouter un <span>Chauffeur</span></h1>
          <p className="ac-page-sub">Renseignez les informations du nouveau chauffeur.</p>

          <div className="ac-layout">
            {/* Preview card */}
            <div className="ac-preview-card">
              <div className="ac-preview-top">
                <div className="ac-avatar">{previewInitials}</div>
                <div className="ac-preview-name">{previewName}</div>
                <div className="ac-preview-email">{form.email||"email@airops.tn"}</div>
              </div>
              <div className="ac-preview-body">
                {[
                  {icon:<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,lbl:"CIN",val:form.cin},
                  {icon:<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>,lbl:"Téléphone",val:form.phone?`${sel.dial} ${form.phone}`:""},
                  {icon:<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,lbl:"N° Permis",val:form.permisNum},
                  {icon:<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,lbl:"Expiration permis",val:form.permisExpiry},
                ].map(r=>(
                  <div key={r.lbl} className="ac-preview-row">
                    <div className="ac-preview-icon">{r.icon}</div>
                    <div><div className="ac-preview-lbl">{r.lbl}</div>{r.val?<div className="ac-preview-val">{r.val}</div>:<div className="ac-preview-empty">Non renseigné</div>}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="ac-form-card">
              <div className="ac-form-header">
                <div className="ac-form-header-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1m0-1h10"/></svg>
                </div>
                <div className="ac-form-header-text"><h2>Nouveau chauffeur</h2><p>Champs marqués * obligatoires</p></div>
              </div>

              <div className="ac-form-body">
                <div className="ac-section-label">Identité</div>
                <div className="ac-grid">
                  <div className="ac-field">
                    <label className="ac-label">Nom <span>*</span></label>
                    <input name="nom" value={form.nom} onChange={hc} onBlur={hb} className={cls("nom")} placeholder="Ben Salah"/>
                    {touched.nom&&errors.nom&&<p className="ac-error">{errors.nom}</p>}
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">Prénom <span>*</span></label>
                    <input name="prenom" value={form.prenom} onChange={hc} onBlur={hb} className={cls("prenom")} placeholder="Ahmed"/>
                    {touched.prenom&&errors.prenom&&<p className="ac-error">{errors.prenom}</p>}
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">CIN <span>*</span></label>
                    <input name="cin" value={form.cin} onChange={hc} onBlur={hb} className={cls("cin")} placeholder="12345678" maxLength={8} inputMode="numeric"/>
                    {touched.cin&&errors.cin&&<p className="ac-error">{errors.cin}</p>}
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">Nationalité</label>
                    <div className="ac-select-wrap">
                      <select name="nationalite" value={form.nationalite} onChange={hc} className="ac-select">
                        {["Tunisienne","Algérienne","Marocaine","Française","Autre"].map(n=><option key={n}>{n}</option>)}
                      </select>
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">Email <span>*</span></label>
                    <input type="email" name="email" value={form.email} onChange={hc} onBlur={hb} className={cls("email")} placeholder="chauffeur@airops.tn"/>
                    {touched.email&&errors.email&&<p className="ac-error">{errors.email}</p>}
                  </div>
                  <div className="ac-field full">
                    <label className="ac-label">Téléphone <span>*</span> <span style={{textTransform:"none",fontWeight:400}}>({sel.digits} chiffres)</span></label>
                    <div className="phone-row-c">
                      <select className="phone-code-c" name="phoneCountry" value={form.phoneCountry} onChange={e=>setForm(p=>({...p,phoneCountry:e.target.value,phone:""}))}>
                        {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>)}
                      </select>
                      <input name="phone" type="tel" value={form.phone} inputMode="numeric" maxLength={sel.digits}
                        onChange={e=>{const v=e.target.value.replace(/\D/g,"");if(v.length<=sel.digits)setForm(p=>({...p,phone:v}));}}
                        onBlur={hb} className={`ac-input${touched.phone&&errors.phone?" err":""}`} placeholder={"0".repeat(sel.digits)}/>
                    </div>
                    {touched.phone&&errors.phone&&<p className="ac-error">{errors.phone}</p>}
                  </div>
                </div>

                <div className="ac-section-label">Permis de conduire</div>
                <div className="ac-grid">
                  <div className="ac-field">
                    <label className="ac-label">Numéro de permis <span>*</span></label>
                    <input name="permisNum" value={form.permisNum} onChange={hc} onBlur={hb} className={cls("permisNum")} placeholder="TN-2021-XXXXXX"/>
                    {touched.permisNum&&errors.permisNum&&<p className="ac-error">{errors.permisNum}</p>}
                  </div>
                  <div className="ac-field">
                    <label className="ac-label">Date d'expiration</label>
                    <input type="date" name="permisExpiry" value={form.permisExpiry} onChange={hc} className="ac-input"/>
                    {expiryStatus&&<span className={`validity-badge ${expiryStatus}`}>{expiryStatus==="valid"?"✓ Permis valide":expiryStatus==="warning"?"⚠ Expiration proche":"✕ Permis expiré"}</span>}
                  </div>
                </div>

                {/* Accès — seul le mot de passe, Notes internes supprimé */}
                <div className="ac-section-label">Accès & sécurité</div>
                <div className="ac-grid">
                  <div className="ac-field">
                    <label className="ac-label">Mot de passe <span>*</span></label>
                    <input type="password" name="password" value={form.password} onChange={hc} onBlur={hb} className={cls("password")} placeholder="Min. 6 caractères"/>
                    {touched.password&&errors.password&&<p className="ac-error">{errors.password}</p>}
                  </div>
                </div>
              </div>

              <div className="ac-form-footer">
                <button type="button" className="btn-ac-reset" onClick={()=>{setForm(defaultForm);setTouched({});}}>Réinitialiser</button>
                <button type="button" className="btn-ac-save" disabled={!isValid} onClick={handleSave}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                  Enregistrer le chauffeur
                </button>
              </div>
            </div>
          </div>

          {drivers.length>0&&(
            <div className="ac-driver-list">
              <div className="ac-driver-list-title">Chauffeurs enregistrés <span style={{fontSize:12,color:"var(--text-muted)",fontWeight:600}}>({drivers.length})</span></div>
              {drivers.map(d=>(
                <div key={d.id} className="driver-card">
                  <div className="driver-avatar">{initAbbr(d.nom,d.prenom)}</div>
                  <div>
                    <div className="driver-name">{d.prenom} {d.nom}</div>
                    <div className="driver-info">
                      <span className="driver-chip">🪪 {d.cin}</span>
                      <span className="driver-chip">📱 {d.phone}</span>
                      {d.permisNum&&<span className="driver-chip">🚗 {d.permisNum}</span>}
                    </div>
                  </div>
                  <button type="button" className="btn-del-driver" onClick={()=>handleDelete(d.id)}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="ac-dash-footer">© 2026 AirOps Transport Management</div>
        </main>
      </div>
      {toast&&<div className="ac-toast">{toast}</div>}
    </div>
  );
}