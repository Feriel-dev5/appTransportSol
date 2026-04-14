import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const LS_KEY = "airops_ch_profile_v1";

const initialProfile = { nom:"Ahmed Ben Salem", email:"ahmed.bensalem@nouvelair.com", telephone:"22 111 888", photo:"" };

function loadProfile()  { try { const s=localStorage.getItem(LS_KEY); return s?JSON.parse(s):initialProfile; } catch { return initialProfile; } }
function saveProfile(d) { try { localStorage.setItem(LS_KEY,JSON.stringify(d)); } catch {} }

const navItems = [
  { label:"Tableau de Bord",    to:"/dashbordchauffeur", icon:<svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label:"Historique Missions",to:"/historiqueM",       icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { label:"Notifications",      to:"/notificationM", badge:2, icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label:"Mon Profil",         to:"/profilCH",          icon:<svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

function validate(form) {
  const e = {};
  if (!form.nom.trim() || form.nom.trim().length < 3) e.nom = "Nom invalide (min. 3 caractères).";
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide.";
  if (!form.telephone.trim() || !/^[+\d\s]{8,20}$/.test(form.telephone)) e.telephone = "Téléphone invalide.";
  if (form.password && form.password.length < 6) e.password = "Mot de passe trop court (min. 6 caractères).";
  return e;
}

export default function ProfilCH() {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);

  const [profile,       setProfile]       = useState(loadProfile);
  const [form,          setForm]          = useState({ nom:profile.nom, email:profile.email, telephone:profile.telephone, password:"" });
  const [touched,       setTouched]       = useState({});
  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast,         setToast]         = useState("");

  useEffect(() => { if (!toast) return; const t=setTimeout(()=>setToast(""),2800); return ()=>clearTimeout(t); }, [toast]);

  const errors   = validate(form);
  const blur     = k => setTouched(p=>({...p,[k]:true}));
  const upd      = (k,v) => setForm(p=>({...p,[k]:v}));

  const handlePhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const updated = { ...profile, photo:ev.target.result };
      setProfile(updated);
      saveProfile(updated);
      if (fileRef.current) fileRef.current.value = "";
      setToast("✓ Photo de profil mise à jour.");
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = () => {
    const updated = { ...profile, photo:"" };
    setProfile(updated);
    saveProfile(updated);
    if (fileRef.current) fileRef.current.value = "";
    setToast("✓ Photo de profil supprimée.");
  };

  const handleSubmit = e => {
    e.preventDefault();
    setTouched({ nom:true, email:true, telephone:true, password:!!form.password });
    const errs = validate(form);
    const realErrs = form.password ? errs : Object.fromEntries(Object.entries(errs).filter(([k])=>k!=="password"));
    if (Object.keys(realErrs).length > 0) return;
    const updated = { ...profile, nom:form.nom.trim(), email:form.email.trim(), telephone:form.telephone.trim() };
    setProfile(updated);
    saveProfile(updated);
    setForm(p=>({...p,password:""}));
    setTouched({});
    setToast("✓ Profil mis à jour avec succès.");
  };

  const handleReset = () => { setForm({ nom:profile.nom, email:profile.email, telephone:profile.telephone, password:"" }); setTouched({}); };

  const initials = profile.nom.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()||"AB";

  const Field = ({ label, name, type="text", placeholder }) => (
    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
      <label style={{ fontSize:10.5,fontWeight:700,color:"var(--text-muted)",letterSpacing:"0.5px",textTransform:"uppercase" }}>{label}</label>
      <input
        type={type} value={form[name]} placeholder={placeholder}
        onChange={e=>upd(name,e.target.value)} onBlur={()=>blur(name)}
        style={{ padding:"10px 12px",border:`1.5px solid ${touched[name]&&errors[name]?"#fca5a5":"var(--border)"}`,borderRadius:10,fontSize:13,fontFamily:"inherit",color:"var(--text-primary)",background:"#fff",outline:"none",transition:"all 0.25s" }}
        onFocus={e=>{ e.target.style.borderColor="var(--brand-blue)"; e.target.style.boxShadow="0 0 0 3px rgba(41,128,232,0.1)"; }}
        onBlurCapture={e=>{ e.target.style.boxShadow="none"; }}
      />
      {touched[name] && errors[name] && <p style={{ fontSize:11,color:"var(--accent-red)",marginTop:2 }}>{errors[name]}</p>}
    </div>
  );

  return (
    <div className="chw">
      {sidebarMobile && <div className="sb-overlay" onClick={()=>setSidebarMobile(false)}/>}

      {/* ── Sidebar ── */}
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

      {/* ── Main ── */}
      <div className="chm">
        {/* Header */}
        <header className="chh">
          <div className="chh-left">
            <button type="button" className="chh-menu-btn" onClick={()=>setSidebarMobile(v=>!v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="chh-title">Mon Profil</span>
          </div>
          <div className="chh-right">
            <div className="user-chip">
              <div style={{ textAlign:"right" }}><div className="user-name">{profile.nom}</div><div className="user-role">Chauffeur</div></div>
              <div className="user-avatar">{profile.photo?<img src={profile.photo} alt="profil"/>:initials}</div>
            </div>
          </div>
        </header>

        <main className="chc">
          <h1 className="welcome-title">Mon <span>Profil</span></h1>
          <p className="welcome-sub">Gérez vos informations personnelles et paramètres de sécurité.</p>

          <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, alignItems:"start" }} className="profil-grid">

            {/* ── Colonne gauche ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Avatar card */}
              <div style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:20, padding:24, boxShadow:"var(--shadow-sm)", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
                {/* Zone avatar cliquable avec overlay hover */}
                <div style={{ position:"relative", width:110, height:110, borderRadius:"50%", cursor:"pointer" }} onClick={() => fileRef.current?.click()} title="Cliquer pour changer la photo">
                  <div style={{ width:110, height:110, borderRadius:"50%", background:"linear-gradient(135deg,var(--brand-blue),var(--brand-mid))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:800, color:"#fff", overflow:"hidden", border:"3px solid rgba(41,128,232,0.2)", boxShadow:"0 4px 16px rgba(41,128,232,0.3)" }}>
                    {profile.photo ? <img src={profile.photo} alt="profil" style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : initials}
                  </div>
                  {/* Overlay au survol */}
                  <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"rgba(41,128,232,0.75)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", opacity:0, transition:"opacity 0.2s", fontSize:11, fontWeight:700, gap:4 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Changer
                  </div>
                  {/* Bouton crayon en bas à droite */}
                  <label htmlFor="ch-photo" style={{ position:"absolute", bottom:0, right:0, width:32, height:32, borderRadius:"50%", background:"var(--brand-blue)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 8px rgba(41,128,232,0.4)", border:"2px solid #fff" }} onClick={e => e.stopPropagation()}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z"/></svg>
                  </label>
                  <input id="ch-photo" type="file" accept="image/*" onChange={handlePhoto} ref={fileRef} style={{ display:"none" }}/>
                </div>

                {/* Bouton supprimer la photo — visible uniquement si photo présente, identique à ProfilP */}
                {profile.photo && (
                  <button type="button" onClick={handleDeletePhoto}
                    style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, border:"1.5px solid #fecaca", background:"#fef2f2", color:"#ef4444", fontSize:12, fontWeight:700, fontFamily:"inherit", cursor:"pointer", transition:"all 0.25s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.borderColor="#fca5a5"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.borderColor="#fecaca"; }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Supprimer la photo
                  </button>
                )}

                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:16, fontWeight:800, color:"var(--brand-dark)" }}>{profile.nom}</p>
                  <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>Chauffeur AirOps</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)" }}>ID: #NV-8821</p>
                </div>
                <div style={{ width:"100%", height:1, background:"var(--border)" }}/>
                {[
                  { icon:<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>, val:profile.email },
                  { icon:<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2l2 5-2 2a11 11 0 005 5l2-2 5 2v2a2 2 0 01-2 2h-1C9 21 3 15 3 8V5z"/></svg>, val:profile.telephone },
                ].map((row,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", fontSize:12, color:"var(--text-sec)", wordBreak:"break-all" }}>
                    <span style={{ color:"var(--brand-blue)", flexShrink:0 }}>{row.icon}</span>
                    {row.val}
                  </div>
                ))}
              </div>

              {/* Performance card */}
              <div style={{ background:"linear-gradient(135deg,var(--brand-blue),var(--brand-mid))", borderRadius:20, padding:22, color:"#fff", boxShadow:"0 4px 14px rgba(41,128,232,0.3)", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", right:-20, bottom:-20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:6 }}>Performance</p>
                <p style={{ fontSize:36, fontWeight:800, letterSpacing:"-1px" }}>75%</p>
                <div style={{ width:"100%", height:6, background:"rgba(255,255,255,0.2)", borderRadius:3, marginTop:10, overflow:"hidden" }}>
                  <div style={{ width:"75%", height:"100%", background:"rgba(255,255,255,0.9)", borderRadius:3 }}/>
                </div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.7)", marginTop:8 }}>Missions complétées ce mois</p>
              </div>
            </div>

            {/* ── Colonne droite — formulaire uniquement ── */}
            <div>
              <form onSubmit={handleSubmit} style={{ background:"#fff", border:"1px solid var(--border)", borderRadius:20, padding:28, boxShadow:"var(--shadow-sm)" }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"var(--brand-dark)", marginBottom:4 }}>Paramètres du compte</h2>
                <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>Modifiez vos informations personnelles ci-dessous.</p>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }} className="profil-form-grid">
                  <Field label="Nom complet"          name="nom"       placeholder="Votre nom complet"/>
                  <Field label="Email"                name="email"     type="email"    placeholder="votre@email.com"/>
                  <Field label="Téléphone"            name="telephone" placeholder="Ex : 22 111 888"/>
                  <Field label="Nouveau mot de passe" name="password"  type="password" placeholder="Laisser vide si inchangé"/>
                </div>

                <div style={{ borderTop:"1px solid var(--border)", paddingTop:20, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--text-sec)" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    Authentification à deux facteurs activée
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button type="button" onClick={handleReset} style={{ padding:"10px 18px", fontSize:13, fontFamily:"inherit", color:"var(--text-sec)", border:"1px solid var(--border)", borderRadius:10, background:"#fff", cursor:"pointer", transition:"all 0.25s" }}>Annuler</button>
                    <button type="submit" style={{ padding:"10px 24px", fontSize:13, fontWeight:700, fontFamily:"inherit", color:"#fff", border:"none", borderRadius:10, background:"linear-gradient(135deg,var(--brand-blue),#1a6fd4)", cursor:"pointer", transition:"all 0.25s", boxShadow:"0 4px 14px rgba(41,128,232,0.3)" }}>
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </main>

        <footer className="ch-footer">
          <div className="ch-footer-brand">
            <svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
        </footer>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <style>{`
        @media(max-width:900px){ .profil-grid{grid-template-columns:1fr!important} }
        @media(max-width:600px){ .profil-form-grid{grid-template-columns:1fr!important} }
      `}</style>
    </div>
  );
}