import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const profilCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --brand-dark:   #0d2b5e;
    --brand-mid:    #1252aa;
    --brand-blue:   #2980e8;
    --brand-light:  #7ec8ff;
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
    --radius-card:  20px;
  }

  .pw { display: flex; height: 100vh; overflow: hidden; background: var(--bg-page); font-family: 'DM Sans','Segoe UI',sans-serif; color: var(--text-primary); }

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

  .sb-badge { background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; flex-shrink: 0; transition: opacity 0.2s; }
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

  .pm { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

  .ph { height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; box-shadow: var(--shadow-sm); }
  .ph-left  { display: flex; align-items: center; gap: 12px; }
  .ph-right { display: flex; align-items: center; gap: 10px; }

  .ph-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-sec); padding: 6px; border-radius: 8px; transition: var(--tr); }
  .ph-menu-btn:hover { background: var(--bg-page); color: var(--text-primary); }
  .ph-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }

  .user-chip { display: flex; align-items: center; gap: 9px; }
  .user-info-r { text-align: right; }
  .user-name-h { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .user-role-h { font-size: 11px; color: var(--text-muted); }
  .user-avatar-h { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); overflow: hidden; flex-shrink: 0; cursor: pointer; }
  .user-avatar-h img { width: 100%; height: 100%; object-fit: cover; }

  .pc { flex: 1; overflow-y: auto; padding: 26px; }

  .page-title { font-size: clamp(22px,3vw,34px); font-weight: 800; color: var(--brand-blue); letter-spacing: -0.8px; line-height: 1; margin-bottom: 6px; }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 26px; }

  .profil-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }

  .card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); transition: var(--tr); }
  .card:hover { box-shadow: var(--shadow-md); }

  .avatar-card { padding: 28px 24px; text-align: center; }

  .avatar-wrap { position: relative; width: 140px; height: 140px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, #e8f2fd, #d0e8fb); border: 3px solid rgba(41,128,232,0.15); overflow: hidden; cursor: pointer; transition: var(--tr); }
  .avatar-wrap:hover { border-color: var(--brand-blue); transform: scale(1.03); }
  .avatar-wrap:hover .avatar-overlay { opacity: 1; }
  .avatar-img { width: 100%; height: 100%; object-fit: cover; }
  .avatar-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
  .avatar-overlay { position: absolute; inset: 0; background: rgba(41,128,232,0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; opacity: 0; transition: opacity 0.2s; font-size: 12px; font-weight: 700; gap: 6px; }

  /* Bouton supprimer photo */
  .btn-remove-photo {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 8px; margin-bottom: 12px;
    padding: 6px 14px; border-radius: 20px;
    border: 1.5px solid #fecaca; background: #fef2f2;
    color: var(--accent-red); font-size: 12px; font-weight: 700;
    font-family: inherit; cursor: pointer; transition: var(--tr);
  }
  .btn-remove-photo:hover { background: #fee2e2; border-color: #fca5a5; }

  .avatar-name { font-size: 22px; font-weight: 800; color: var(--text-primary); }
  .avatar-role { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: var(--brand-blue); font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 20px; margin: 8px 0 20px; }

  .info-row { background: var(--bg-page); border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; text-align: left; }
  .info-row-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 3px; }
  .info-row-value { font-size: 13px; font-weight: 700; color: var(--text-primary); word-break: break-all; }

  .banner-card { background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-mid) 100%); border-radius: var(--radius-card); padding: 24px; color: #fff; position: relative; overflow: hidden; margin-top: 16px; min-height: 170px; display: flex; flex-direction: column; justify-content: space-between; border: none; box-shadow: var(--shadow-sm); transition: var(--tr); }
  .banner-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
  .banner-deco { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.07); pointer-events: none; }
  .banner-sub  { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; }
  .banner-title{ font-size: 18px; font-weight: 800; line-height: 1.3; }
  .banner-desc { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 8px; }
  .banner-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; margin-top: 16px; width: fit-content; }

  .form-card { padding: 28px 28px 24px; }
  .form-title { font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
  .form-subtitle { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }

  .form-label { font-size: 11px; font-weight: 700; color: var(--text-sec); letter-spacing: 0.5px; text-transform: uppercase; }

  .form-input { height: 46px; padding: 0 14px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 13.5px; font-family: inherit; color: var(--text-primary); background: var(--bg-page); outline: none; transition: var(--tr); width: 100%; }
  .form-input:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .form-input.error { border-color: #fca5a5; background: #fff; }
  .form-input.error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
  .form-input::placeholder { color: var(--text-muted); }

  .form-error { font-size: 11.5px; color: var(--accent-red); margin-top: 2px; }

  .pwd-strength { display: flex; gap: 4px; margin-top: 6px; }
  .pwd-bar { flex: 1; height: 3px; border-radius: 3px; background: var(--border); transition: background 0.3s; }
  .pwd-bar.active-weak   { background: #ef4444; }
  .pwd-bar.active-medium { background: #f97316; }
  .pwd-bar.active-strong { background: #16a34a; }
  .pwd-hint { font-size: 11px; color: var(--text-muted); margin-top: 4px; }

  .form-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-top: 20px; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .form-footer-msg { font-size: 13px; }
  .form-footer-msg.success { color: var(--accent-green); font-weight: 700; }
  .form-footer-msg.hint    { color: var(--text-muted); }

  .form-actions { display: flex; align-items: center; gap: 10px; }

  .btn-cancel { padding: 10px 22px; border-radius: 22px; border: 1.5px solid var(--border); background: #fff; color: var(--text-sec); font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); }
  .btn-cancel:hover { background: var(--bg-page); border-color: #c7d8ed; }

  .btn-save { padding: 10px 26px; border-radius: 22px; border: none; background: var(--brand-blue); color: #fff; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); box-shadow: 0 4px 14px rgba(41,128,232,0.3); }
  .btn-save:hover:not(:disabled) { background: var(--brand-mid); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(41,128,232,0.4); }
  .btn-save:disabled { background: #a5c8f4; cursor: not-allowed; box-shadow: none; }

  .toast { position: fixed; top: 18px; right: 18px; z-index: 200; background: var(--brand-dark); color: #fff; padding: 12px 18px; border-radius: 12px; font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); border-left: 3px solid var(--brand-light); animation: toastIn 0.3s ease; pointer-events: none; }
  @keyframes toastIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }

  @media (max-width: 1100px) { .profil-grid { grid-template-columns: 280px 1fr; } }
  @media (max-width: 900px) { .profil-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .form-group.full { grid-column: 1; } }
  @media (max-width: 768px) {
    .sidebar { position: fixed; left: 0; top: 0; bottom: 0; z-index: 30; transform: translateX(-100%); width: var(--sidebar-full) !important; transition: transform 0.3s ease !important; }
    .sidebar.open  { transform: translateX(0); }
    .sidebar.collapsed { transform: translateX(-100%); }
    .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; }
    .ph-menu-btn { display: flex; }
    .sb-toggle-btn { display: none; }
    .pc { padding: 16px; }
    .ph { padding: 0 16px; }
    .form-card { padding: 20px 18px 18px; }
    .form-footer { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 480px) { .user-info-r { display: none; } .pc { padding: 12px; } .profil-grid { gap: 14px; } .avatar-wrap { width: 110px; height: 110px; } .form-actions { width: 100%; justify-content: flex-end; } }
`;

if (typeof document !== "undefined" && !document.getElementById("profil-page-css")) {
  const tag = document.createElement("style");
  tag.id = "profil-page-css";
  tag.textContent = profilCSS;
  document.head.appendChild(tag);
}

/* ══ STORAGE KEYS (partagées avec toutes les pages) ══ */
export const STORAGE_FORM  = "airops_profil_form_v2";
export const STORAGE_PHOTO = "airops_profil_photo_v2";

/* Utilitaires partagés — lisibles depuis n'importe quelle page */
export function getStoredName() {
  try {
    const s = localStorage.getItem(STORAGE_FORM);
    return s ? (JSON.parse(s).nom || "Ahmed Ben Ali") : "Ahmed Ben Ali";
  } catch { return "Ahmed Ben Ali"; }
}
export function getStoredPhoto() {
  try { return localStorage.getItem(STORAGE_PHOTO) || ""; }
  catch { return ""; }
}
export function getStoredInitials(nom) {
  return (nom || "Ahmed Ben Ali").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "AB";
}

const defaultForm = {
  nom:       "Ahmed Ben Ali",
  email:     "ahmed@email.com",
  telephone: "+216 12 345 678",
  adresse:   "Tunis, Tunisie",
  password:  "",
};

const navItems = [
  { label: "Tableau de bord",  to: "/dashbordP",     icon: <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg> },
  { label: "Réserver demande", to: "/reserverD",     icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg> },
  { label: "Notifications",    to: "/notificationP", badge: 2, icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> },
  { label: "Profile",          to: "/profilP",       icon: <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
];

function pwdStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
  return score;
}
const pwdLabels = ["", "Faible", "Moyen", "Fort"];
const pwdColors = ["", "active-weak", "active-medium", "active-strong"];

export default function ProfilP() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const [form, setForm] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_FORM);
      return s ? { ...defaultForm, ...JSON.parse(s), password: "" } : defaultForm;
    } catch { return defaultForm; }
  });

  const [photo, setPhoto] = useState(() => getStoredPhoto());

  /* Persist form (sans password) */
  useEffect(() => {
    try {
      const { password: _p, ...rest } = form;
      localStorage.setItem(STORAGE_FORM, JSON.stringify(rest));
      /* Déclenche un event custom pour que les autres pages puissent réagir si besoin */
      window.dispatchEvent(new Event("airops-profile-update"));
    } catch {}
  }, [form]);

  /* Persist photo */
  useEffect(() => {
    try {
      if (photo) {
        localStorage.setItem(STORAGE_PHOTO, photo);
      } else {
        localStorage.removeItem(STORAGE_PHOTO);
      }
      window.dispatchEvent(new Event("airops-profile-update"));
    } catch {}
  }, [photo]);

  const [touched,        setTouched]        = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [toast,          setToast]          = useState("");
  const [collapsed,      setCollapsed]      = useState(false);
  const [sidebarMobile,  setSidebarMobile]  = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const errors = {
    nom:
      !form.nom.trim()           ? "Le nom est obligatoire." :
      form.nom.trim().length < 3 ? "Au moins 3 caractères." : "",
    email:
      !form.email.trim()         ? "L'email est obligatoire." :
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Email invalide." : "",
    telephone:
      !form.telephone.trim()     ? "Le téléphone est obligatoire." :
      !/^\+?[0-9\s]{8,20}$/.test(form.telephone) ? "Numéro invalide." : "",
    adresse:
      !form.adresse.trim()       ? "L'adresse est obligatoire." : "",
    password:
      form.password.length > 0 && form.password.length < 6
        ? "Minimum 6 caractères." : "",
  };

  const isValid = Object.values(errors).every(v => v === "");
  const strength = pwdStrength(form.password);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccessMessage("");
  };

  const handleBlur = e => setTouched(prev => ({ ...prev, [e.target.name]: true }));

  const handleReset = () => {
    try {
      const saved = localStorage.getItem(STORAGE_FORM);
      setForm(saved ? { ...defaultForm, ...JSON.parse(saved), password: "" } : defaultForm);
    } catch { setForm(defaultForm); }
    setTouched({});
    setSuccessMessage("");
  };

  const handleSubmit = e => {
    e.preventDefault();
    setTouched({ nom: true, email: true, telephone: true, adresse: true, password: true });
    if (!isValid) return;
    try {
      const { password: _p, ...rest } = form;
      localStorage.setItem(STORAGE_FORM, JSON.stringify(rest));
      window.dispatchEvent(new Event("airops-profile-update"));
    } catch {}
    setSuccessMessage("Profil mis à jour avec succès !");
    setToast("✓ Profil enregistré avec succès !");
    setForm(prev => ({ ...prev, password: "" }));
    setTouched({});
  };

  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result;
      setPhoto(b64);
      setToast("✓ Photo de profil mise à jour !");
    };
    reader.readAsDataURL(file);
    /* reset input so same file can be re-selected */
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setToast("✓ Photo supprimée.");
  };

  const initials = getStoredInitials(form.nom);
  const inputCls = field => `form-input${touched[field] && errors[field] ? " error" : ""}`;

  return (
    <div className="pw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">GESTION INTERNE</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label}
              className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`}
              onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
              {item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => navigate("/login")}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="pm">
        <header className="ph">
          <div className="ph-left">
            <button type="button" className="ph-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="ph-title">Profile</span>
          </div>
          <div className="ph-right">
            <div className="user-chip">
              <div className="user-info-r">
                <div className="user-name-h">{form.nom || "Ahmed Ben Ali"}</div>
                <div className="user-role-h">Passager Premium</div>
              </div>
              <div className="user-avatar-h" onClick={() => fileRef.current?.click()} title="Changer la photo">
                {photo ? <img src={photo} alt="profil"/> : <span>{initials}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="pc">
          <h1 className="page-title">Mon profil</h1>
          <p className="page-subtitle">Modifiez vos informations personnelles et vos préférences.</p>

          <div className="profil-grid">
            {/* Colonne gauche */}
            <div>
              <div className="card avatar-card">
                <div className="avatar-wrap" onClick={() => fileRef.current?.click()} title="Cliquer pour changer la photo">
                  {photo
                    ? <img src={photo} alt="Profil" className="avatar-img"/>
                    : <div className="avatar-placeholder">
                        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16l4-4a3 3 0 014.243 0L16 16m-2-2l1-1a3 3 0 014.243 0L21 15m-6-8h.01"/></svg>
                        <span style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>Ajouter photo</span>
                      </div>
                  }
                  <div className="avatar-overlay">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span>Changer photo</span>
                  </div>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }}/>

                {/* ── Bouton supprimer photo ── */}
                {photo && (
                  <button type="button" className="btn-remove-photo" onClick={handleRemovePhoto}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Supprimer la photo
                  </button>
                )}

                <p className="avatar-name">{form.nom || "Ahmed Ben Ali"}</p>
                <span className="avatar-role">
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Passager Premium
                </span>

                <div className="info-row"><p className="info-row-label">Email</p><p className="info-row-value">{form.email || "—"}</p></div>
                <div className="info-row"><p className="info-row-label">Téléphone</p><p className="info-row-value">{form.telephone || "—"}</p></div>
              </div>

              <div className="banner-card">
                <div className="banner-deco" style={{ width: 160, height: 160, right: -40, bottom: -40 }}/>
                <div className="banner-deco" style={{ width: 80, height: 80, right: 60, top: -20 }}/>
                <div>
                  <p className="banner-sub">Espace personnel</p>
                  <p className="banner-title">Gardez vos informations à jour</p>
                  <p className="banner-desc">Un profil complet facilite le traitement de vos demandes.</p>
                </div>
                <div className="banner-pill">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Compte sécurisé
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="card form-card">
              <p className="form-title">Informations du compte</p>
              <p className="form-subtitle">Modifiez les informations de votre compte passager.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nom complet</label>
                    <input type="text" name="nom" value={form.nom} onChange={handleChange} onBlur={handleBlur} className={inputCls("nom")} placeholder="Ahmed Ben Ali"/>
                    {touched.nom && errors.nom && <p className="form-error">{errors.nom}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Adresse email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputCls("email")} placeholder="ahmed@email.com"/>
                    {touched.email && errors.email && <p className="form-error">{errors.email}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input type="text" name="telephone" value={form.telephone} onChange={handleChange} onBlur={handleBlur} className={inputCls("telephone")} placeholder="+216 XX XXX XXX"/>
                    {touched.telephone && errors.telephone && <p className="form-error">{errors.telephone}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <input type="text" name="adresse" value={form.adresse} onChange={handleChange} onBlur={handleBlur} className={inputCls("adresse")} placeholder="Ville, Pays"/>
                    {touched.adresse && errors.adresse && <p className="form-error">{errors.adresse}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} onBlur={handleBlur} className={inputCls("password")} placeholder="Laisser vide si inchangé"/>
                    {touched.password && errors.password && <p className="form-error">{errors.password}</p>}
                    {form.password.length > 0 && (
                      <>
                        <div className="pwd-strength">
                          {[1, 2, 3].map(i => <div key={i} className={`pwd-bar${i <= strength ? ` ${pwdColors[strength]}` : ""}`}/>)}
                        </div>
                        <p className="pwd-hint">Force : <strong>{pwdLabels[strength]}</strong></p>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-footer">
                  <p className={`form-footer-msg ${successMessage ? "success" : "hint"}`}>
                    {successMessage || "Assurez-vous que vos données sont correctes."}
                  </p>
                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={handleReset}>Annuler</button>
                    <button type="submit" className="btn-save" disabled={!isValid}>Mettre à jour</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", padding: "20px 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>
            © 2026 AirOps Transport Management
          </div>
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}