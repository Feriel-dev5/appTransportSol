import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProfileSync } from "../../services/useProfileSync";
import { fetchMyProfile, updateMyProfile } from "../../services/adminService";

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
  .prw{display:flex;height:100vh;overflow:hidden;background:var(--bg-page);font-family:'DM Sans','Segoe UI',sans-serif;color:var(--text-primary);}
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
  .sb-badge{background:#ef4444;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0;transition:opacity 0.2s;margin-left:auto;}
  .sidebar.collapsed .sb-badge{opacity:0;}
  .sb-footer{padding:6px 9px 16px;border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0;}
  .sb-logout{width:100%;display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:none;background:transparent;color:rgba(255,255,255,0.4);font-size:13.5px;font-weight:500;cursor:pointer;transition:var(--tr);font-family:inherit;white-space:nowrap;overflow:hidden;}
  .sb-logout:hover{color:#fca5a5;background:rgba(239,68,68,0.1);}
  .sb-logout-lbl{transition:opacity 0.2s,max-width 0.3s;max-width:160px;overflow:hidden;}
  .sidebar.collapsed .sb-logout-lbl{opacity:0;max-width:0;}
  .sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:25;backdrop-filter:blur(2px);}
  .prm{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .prh{height:var(--header-h);background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .prh-left{display:flex;align-items:center;gap:12px;}
  .prh-right{display:flex;align-items:center;gap:10px;}
  .prh-menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;border-radius:8px;transition:var(--tr);}
  .prh-menu-btn:hover{background:var(--bg-page);}
  .prh-title{font-size:15px;font-weight:700;color:var(--text-primary);}
  .user-chip{display:flex;align-items:center;gap:9px;}
  .user-name{font-size:13px;font-weight:700;color:var(--text-primary);}
  .user-role{font-size:11px;color:var(--text-muted);}
  .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;box-shadow:0 3px 10px rgba(41,128,232,0.35);border:2.5px solid rgba(41,128,232,0.2);flex-shrink:0;overflow:hidden;cursor:pointer;}
  .user-avatar img{width:100%;height:100%;object-fit:cover;}
  .prc{flex:1;overflow-y:auto;padding:26px;}
  .pr-page-title{font-size:25px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.5px;margin-bottom:4px;}
  .pr-page-title span{color:var(--brand-blue);}
  .pr-page-sub{font-size:13px;color:var(--text-muted);margin-bottom:24px;}
  .pr-layout{display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start;max-width:1100px;}
  .pr-card{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow-sm);overflow:hidden;}
  .pr-avatar-card{padding:30px 24px;text-align:center;}
  .pr-avatar-wrap{position:relative;width:120px;height:120px;margin:0 auto 20px;border-radius:50%;background:linear-gradient(135deg,#e8f2fd,#d0e8fb);border:3px solid rgba(41,128,232,0.15);overflow:hidden;cursor:pointer;transition:var(--tr);display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:800;color:var(--brand-blue);}
  .pr-avatar-wrap:hover{border-color:var(--brand-blue);transform:scale(1.03);}
  .pr-avatar-wrap img{width:100%;height:100%;object-fit:cover;}
  .pr-av-overlay{position:absolute;inset:0;background:rgba(41,128,232,0.75);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;opacity:0;transition:opacity 0.2s;font-size:11px;font-weight:700;gap:4px;}
  .pr-avatar-wrap:hover .pr-av-overlay{opacity:1;}
  .pr-name{font-size:20px;font-weight:800;color:var(--text-primary);margin-bottom:4px;}
  .pr-role-badge{display:inline-flex;align-items:center;gap:6px;background:#eff6ff;color:var(--brand-blue);font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-bottom:20px;}
  .pr-info-row{background:var(--bg-page);border-radius:14px;padding:12px 16px;margin-bottom:10px;text-align:left;}
  .pr-info-lbl{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--text-muted);text-transform:uppercase;margin-bottom:2px;}
  .pr-info-val{font-size:13px;font-weight:700;color:var(--text-primary);}
  .pr-form-body{padding:28px;}
  .pr-section-label{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
  .pr-section-label::after{content:'';flex:1;height:1px;background:var(--border);}
  .pr-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px;}
  .pr-field{display:flex;flex-direction:column;gap:6px;}
  .pr-field.full{grid-column:1/-1;}
  .pr-label{font-size:11px;font-weight:700;color:var(--text-sec);letter-spacing:0.5px;text-transform:uppercase;}
  .pr-input{height:46px;padding:0 14px;border:1.5px solid var(--border);border-radius:12px;font-size:13.5px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);width:100%;}
  .pr-input:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .pr-input.err{border-color:var(--accent-red);background:#fff;}
  .pr-error{font-size:11px;color:var(--accent-red);margin-top:2px;}
  .pr-form-footer{padding:16px 28px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;gap:12px;background:#f8fafc;}
  .btn-pr-reset{padding:10px 22px;border-radius:12px;border:1.5px solid var(--border);background:#fff;color:var(--text-sec);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:var(--tr);}
  .btn-pr-save{display:flex;align-items:center;gap:8px;padding:10px 26px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));color:#fff;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:var(--tr);box-shadow:0 4px 14px rgba(41,128,232,0.3);}
  .btn-pr-save:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(41,128,232,0.4);}
  .btn-pr-save:disabled{background:#a5c8f4;cursor:not-allowed;}
  .pr-toast{position:fixed;top:18px;right:18px;z-index:600;background:var(--brand-dark);color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);border-left:3px solid var(--brand-light);animation:prToast 0.3s ease;}
  @keyframes prToast{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
  @media(max-width:900px){.pr-layout{grid-template-columns:1fr;}}
  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.prh-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .prc{padding:16px;}.prh{padding:0 16px;}.user-role{display:none;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-pr-css")) {
  const s = document.createElement("style"); s.id = "airops-pr-css"; s.textContent = CSS; document.head.appendChild(s);
}



export default function ProfilR() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "", confirmPwd: "" });
  const [touched, setTouched] = useState({});

  const { nom: nomR, initials: initR, photo: profilePhoto, sync, unreadCount } = useProfileSync();

  const navItems = [
    { label: "Tableau de bord", to: "/dashbordRES", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { label: "Notifications", to: "/notificationR", badge: unreadCount, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg> },
    { label: "Ajouter Chauffeur", to: "/ajouterChauffeur", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg> },
    { label: "Ajouter Passager", to: "/ajouterPassager", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { label: "Mon Profil", to: "/profilR", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
  ];

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const u = await fetchMyProfile();
      setForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        address: u.address || "",
        password: "",
        confirmPwd: ""
      });
    } catch {
      setToast("Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const errors = {
    name: !form.name.trim() ? "Obligatoire" : form.name.length < 3 ? "Min. 3 car." : "",
    email: !form.email.trim() ? "Obligatoire" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Invalide" : "",
    password: form.password && form.password.length < 8 ? "Min. 8 car." : "",
    confirmPwd: form.password && form.confirmPwd !== form.password ? "Ne correspond pas" : ""
  };
  const isValid = Object.values(errors).every(v => v === "");

  const hc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const hb = e => setTouched(p => ({ ...p, [e.target.name]: true }));
  const cls = f => `pr-input${touched[f] && errors[f] ? " err" : ""}`;

  const handleSave = async () => {
    setTouched({ name: true, email: true, password: true, confirmPwd: true });
    if (!isValid) return;
    try {
      const updates = { name: form.name, email: form.email, phone: form.phone, address: form.address };
      if (form.password) updates.password = form.password;
      await updateMyProfile(updates);
      setToast("✓ Profil mis à jour !");
      setForm(p => ({ ...p, password: "", confirmPwd: "" }));
      setTouched({});
      sync(); // Update global profile state
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de la sauvegarde.");
    }
  };

  const handlePhotoClick = () => fileRef.current?.click();
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      // Local storage fallback for photo as backend might not support it
      localStorage.setItem("airops_user_photo", ev.target.result);
      setToast("✓ Photo mise à jour localement !");
      sync();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="prw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}
      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/dashbordRES")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" /></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE RESPONSABLE</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <button type="button" className="sb-logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
            <span style={{ flexShrink: 0 }}><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="prm">
        <header className="prh">
          <div className="prh-left">
            <button type="button" className="prh-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="prh-title">Mon Profil</span>
          </div>
          <div className="prh-right">
            <div className="user-chip">
              <div style={{ textAlign: "right" }}><div className="user-name">{nomR}</div><div className="user-role">Responsable</div></div>
              <div className="user-avatar">{initR}</div>
            </div>
          </div>
        </header>

        <main className="prc">
          <h1 className="pr-page-title">Paramètres du <span>Profil</span></h1>
          <p className="pr-page-sub">Gérez vos informations personnelles et votre sécurité.</p>

          <div className="pr-layout">
            <div className="pr-card pr-avatar-card">
              <div className="pr-avatar-wrap" onClick={handlePhotoClick}>
                {profilePhoto ? <img src={profilePhoto} alt="Profil" /> : initR}
                <div className="pr-av-overlay">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Changer</span>
                </div>
              </div>
              <input type="file" ref={fileRef} style={{ display: "none" }} onChange={handleFileChange} accept="image/*" />
              <div className="pr-name">{form.name}</div>
              <div className="pr-role-badge">Responsable Transport</div>
              <div className="pr-info-row"><div className="pr-info-lbl">Identifiant</div><div className="pr-info-val">{form.email}</div></div>
              <div className="pr-info-row"><div className="pr-info-lbl">Dernière connexion</div><div className="pr-info-val">Aujourd'hui à 09:42</div></div>
            </div>

            <div className="pr-card">
              <div className="pr-form-body">
                <div className="pr-section-label">Informations personnelles</div>
                <div className="pr-grid">
                  <div className="pr-field full">
                    <label className="pr-label">Nom complet</label>
                    <input name="name" value={form.name} onChange={hc} onBlur={hb} className={cls("name")} placeholder="Nom Prénom" />
                    {touched.name && errors.name && <p className="pr-error">{errors.name}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Email</label>
                    <input name="email" value={form.email} onChange={hc} onBlur={hb} className={cls("email")} placeholder="email@airops.tn" />
                    {touched.email && errors.email && <p className="pr-error">{errors.email}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Téléphone</label>
                    <input name="phone" value={form.phone} onChange={hc} className="pr-input" placeholder="+216 -- --- ---" />
                  </div>
                  <div className="pr-field full">
                    <label className="pr-label">Adresse</label>
                    <input name="address" value={form.address} onChange={hc} className="pr-input" placeholder="Ville, Pays" />
                  </div>
                </div>

                <div className="pr-section-label">Sécurité</div>
                <div className="pr-grid">
                  <div className="pr-field">
                    <label className="pr-label">Nouveau mot de passe</label>
                    <input type="password" name="password" value={form.password} onChange={hc} onBlur={hb} className={cls("password")} placeholder="••••••••" />
                    {touched.password && errors.password && <p className="pr-error">{errors.password}</p>}
                  </div>
                  <div className="pr-field">
                    <label className="pr-label">Confirmer le mot de passe</label>
                    <input type="password" name="confirmPwd" value={form.confirmPwd} onChange={hc} onBlur={hb} className={cls("confirmPwd")} placeholder="••••••••" />
                    {touched.confirmPwd && errors.confirmPwd && <p className="pr-error">{errors.confirmPwd}</p>}
                  </div>
                </div>
              </div>
              <div className="pr-form-footer">
                <button type="button" className="btn-pr-reset" onClick={loadProfile}>Réinitialiser</button>
                <button type="button" className="btn-pr-save" disabled={!isValid} onClick={handleSave}>Enregistrer les modifications</button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {toast && <div className="pr-toast">{toast}</div>}
    </div>
  );
}
