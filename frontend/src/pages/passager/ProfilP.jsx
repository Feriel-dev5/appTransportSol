import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { updateMyProfile, fetchMyProfile } from "../../services/passengerService";
import { getAuthUser, useProfileSync } from "../../services/useProfileSync";
import { logout } from "../../services/authService";

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
  .sb-brand-icon { width: 40px; height: 40px; min-width: 40px; background: var(--brand-blue); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(41,128,232,0.4); transition: var(--tr); }
  .sb-brand-icon:hover { background: #1a6fd4; }
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
  .user-avatar-h { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-blue), var(--brand-mid)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 3px 10px rgba(41,128,232,0.35); border: 2.5px solid rgba(41,128,232,0.2); overflow: hidden; flex-shrink: 0; cursor: pointer; transition: var(--tr); }
  .user-avatar-h:hover { transform: scale(1.08); box-shadow: 0 4px 14px rgba(41,128,232,0.45); }
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
  .btn-remove-photo { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; margin-bottom: 12px; padding: 6px 14px; border-radius: 20px; border: 1.5px solid #fecaca; background: #fef2f2; color: var(--accent-red); font-size: 12px; font-weight: 700; font-family: inherit; cursor: pointer; transition: var(--tr); }
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

  /* Phone row with country select */
  .phone-row { display: flex; gap: 8px; align-items: flex-start; }
  .country-select { height: 46px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 12px; font-family: inherit; color: var(--text-primary); background: var(--bg-page); outline: none; transition: var(--tr); cursor: pointer; padding: 0 8px; flex-shrink: 0; min-width: 120px; }
  .country-select:focus { border-color: var(--brand-blue); background: #fff; box-shadow: 0 0 0 3px rgba(41,128,232,0.1); }
  .phone-input { flex: 1; }

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
    .sidebar.open  { transform: translateX(0); } .sidebar.collapsed { transform: translateX(-100%); } .sidebar.collapsed.open { transform: translateX(0); }
    .sb-overlay { display: block; } .ph-menu-btn { display: flex; } .sb-toggle-btn { display: none; }
    .pc { padding: 16px; } .ph { padding: 0 16px; } .form-card { padding: 20px 18px 18px; } .form-footer { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 480px) { .user-info-r { display: none; } .pc { padding: 12px; } .profil-grid { gap: 14px; } .avatar-wrap { width: 110px; height: 110px; } .form-actions { width: 100%; justify-content: flex-end; } .phone-row { flex-direction: column; } .country-select { min-width: 100%; } }
`;

if (typeof document !== "undefined" && !document.getElementById("profil-page-css")) {
  const tag = document.createElement("style");
  tag.id = "profil-page-css";
  tag.textContent = profilCSS;
  document.head.appendChild(tag);
}

export const STORAGE_FORM = "airops_profil_form_v2";
export const STORAGE_PHOTO = "airops_profil_photo_v2";

/* ── Clé photo par compte (user ID ou email) ── */
function getPhotoKey() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    const uid = u._id || u.id || u.email || "default";
    return `${STORAGE_PHOTO}_${uid}`;
  } catch { return STORAGE_PHOTO; }
}

export function getStoredName() {
  const authUser = getAuthUser();
  if (authUser?.name) return authUser.name;
  try {
    const s = localStorage.getItem(STORAGE_FORM);
    return s ? (JSON.parse(s).nom || "Passager") : "Passager";
  } catch { return "Passager"; }
}
export function getStoredPhoto() {
  try { return localStorage.getItem(getPhotoKey()) || ""; }
  catch { return ""; }
}
export function getStoredInitials(nom) {
  return (nom || "P").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "P";
}

/* ══ COUNTRY DIAL CODES ══ */
const COUNTRIES = [
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie", digits: 8 },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie", digits: 9 },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc", digits: 9 },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Égypte", digits: 10 },
  { code: "LY", dial: "+218", flag: "🇱🇾", name: "Libye", digits: 9 },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France", digits: 9 },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne", digits: 11 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni", digits: 10 },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne", digits: 9 },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italie", digits: 10 },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal", digits: 9 },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique", digits: 9 },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Pays-Bas", digits: 9 },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse", digits: 9 },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Arabie Saoudite", digits: 9 },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats Arabes", digits: 9 },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar", digits: 8 },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Koweït", digits: 8 },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahreïn", digits: 8 },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman", digits: 8 },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordanie", digits: 9 },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Liban", digits: 8 },
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turquie", digits: 10 },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal", digits: 9 },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d Ivoire", digits: 10 },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun", digits: 9 },
  { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée", digits: 9 },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali", digits: 8 },
  { code: "MR", dial: "+222", flag: "🇲🇷", name: "Mauritanie", digits: 8 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis", digits: 10 },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada", digits: 10 },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brésil", digits: 11 },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "Chine", digits: 11 },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japon", digits: 10 },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "Corée du Sud", digits: 10 },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australie", digits: 9 },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "Inde", digits: 10 },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan", digits: 10 },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigéria", digits: 10 },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "Afrique du Sud", digits: 9 },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Russie", digits: 10 },
];
function isAlphaOnly(str) {
  return /^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(str);
}

function parseStoredPhone(stored) {
  if (!stored) return { phoneCountry: "TN", phoneLocal: "" };
  const found = COUNTRIES.find(c => stored.startsWith(c.dial + " "));
  if (found) return { phoneCountry: found.code, phoneLocal: stored.slice(found.dial.length + 1).replace(/\D/g, "") };
  return { phoneCountry: "TN", phoneLocal: stored.replace(/\D/g, "").slice(-8) };
}

function buildDefaultForm() {
  try {
    const authUser = getAuthUser();
    const saved = localStorage.getItem("airops_profil_form_v2");
    const savedParsed = saved ? JSON.parse(saved) : {};
    const phoneData = parseStoredPhone(authUser?.phone || savedParsed.phoneLocal || "");

    return {
      nom: authUser?.name || savedParsed.nom || "Passager",
      email: authUser?.email || savedParsed.email || "",
      phoneLocal: phoneData.phoneLocal,
      phoneCountry: phoneData.phoneCountry || "TN",
      adresse: authUser?.address || savedParsed.adresse || "",
      password: "",
    };
  } catch {
    return { nom: "Passager", email: "", phoneLocal: "", phoneCountry: "TN", adresse: "", password: "" };
  }
}
const defaultForm = buildDefaultForm();

const navItems = [
  {
    label: "Tableau de bord",
    to: "/dashbordP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  },
  {
    label: "Réserver demande",
    to: "/reserverD",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>,
  },
  {
    label: "Notifications",
    to: "/notificationP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
  },
  {
    label: "Avis des acteurs",
    to: "/avisP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  },
  {
    label: "Profile",
    to: "/profilP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  },
];

function pwdStrength(pwd) {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
  return score;
}
const pwdLabels = ["", "Faible", "Moyen", "Fort"];
const pwdColors = ["", "active-weak", "active-medium", "active-strong"];

/* ── Only alphabet + spaces + hyphens ── */
// isAlphaOnly moved above

export default function ProfilP() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const STORAGE_PHOTO = "airops_profil_photo_v2";

  const getPhotoKey = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      const uid = u._id || u.id || u.email || "default";
      return `${STORAGE_PHOTO}_${uid}`;
    } catch { return STORAGE_PHOTO; }
  };

  const [form, setForm] = useState(() => buildDefaultForm());
  const [apiLoading, setApiLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  // Charger les données réelles du serveur au montage
  useEffect(() => {
    let cancelled = false;
    fetchMyProfile()
      .then(user => {
        if (cancelled || !user) return;
        const phoneData = parseStoredPhone(user.phone || "");
        setForm({
          nom: user.name || "Passager",
          email: user.email || "",
          phoneLocal: phoneData.phoneLocal,
          phoneCountry: phoneData.phoneCountry || "TN",
          adresse: user.address || "",
          password: "",
        });
        setPhoto(user.photo || null);
        // Sync local
        try {
          const current = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({ ...current, name: user.name, email: user.email }));
          window.dispatchEvent(new Event("airops-profile-update"));
        } catch { }
      })
      .catch(err => console.error("Erreur fetch profile:", err));
    return () => { cancelled = true; };
  }, []);

  const { nom: syncNom, photo: syncPhoto, initials } = useProfileSync();
  const nom = syncNom || form.nom || "Passager";

  /* Persist form (sans password) */
  useEffect(() => {
    try {
      const { password: _p, ...rest } = form;
      localStorage.setItem(STORAGE_FORM, JSON.stringify(rest));
      window.dispatchEvent(new Event("airops-profile-update"));
    } catch { }
  }, [form]);


  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedCountry = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];

  const errors = {
    nom:
      !form.nom.trim() ? "Le nom est obligatoire." :
        form.nom.trim().length < 3 ? "Au moins 3 caractères." :
          !isAlphaOnly(form.nom) ? "Le nom ne doit contenir que des lettres." : "",
    email:
      !form.email.trim() ? "L'email est obligatoire." :
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Email invalide." : "",
    phoneLocal:
      !form.phoneLocal.trim() ? "Le téléphone est obligatoire." :
        !/^\d+$/.test(form.phoneLocal) ? "Uniquement des chiffres." :
          form.phoneLocal.length !== selectedCountry.digits ? `${selectedCountry.digits} chiffres requis pour ${selectedCountry.name}.` : "",
    adresse:
      !form.adresse.trim() ? "L'adresse est obligatoire." : "",
    password:
      form.password.length > 0 && form.password.length < 6
        ? "Minimum 6 caractères." : "",
  };

  const isValid = Object.values(errors).every(v => v === "");
  const strength = pwdStrength(form.password);

  const handleChange = e => {
    const { name, value } = e.target;
    // Block digits and special chars from nom field
    if (name === "nom" && value !== "" && !/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']*$/.test(value)) return;
    // Block non-digits from phoneLocal
    if (name === "phoneLocal" && value !== "" && !/^\d*$/.test(value)) return;
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

  const handleSubmit = async e => {
    e.preventDefault();
    setTouched({ nom: true, email: true, phoneLocal: true, adresse: true, password: true });
    if (!isValid) return;
    setApiLoading(true);
    try {
      const uData = JSON.parse(localStorage.getItem("user") || "{}");
      const currentUserId = uData.id || uData._id;
      const photoToSave = localStorage.getItem("airops_profil_photo_v2_" + currentUserId) || photo;
      const selectedCountry2 = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];

      const payload = {
        name: form.nom,
        email: form.email,
        phone: form.phoneLocal ? `${selectedCountry2.dial} ${form.phoneLocal}` : undefined,
        address: form.adresse,
        photo: photoToSave,
        ...(form.password ? { password: form.password } : {}),
      };
      const updated = await updateMyProfile(payload);
      // Sync localStorage user with new name/email from server
      try {
        const current = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...current, name: updated.name || form.nom, email: updated.email || form.email }));
        window.dispatchEvent(new Event("airops-profile-update"));
      } catch { }
      // Persist form locally (sans password)
      const { password: _p, ...rest } = form;
      localStorage.setItem(STORAGE_FORM, JSON.stringify(rest));
    } catch (err) {
      setToast("❌ " + (err?.response?.data?.message || "Erreur lors de la sauvegarde."));
      setApiLoading(false);
      return;
    }
    setApiLoading(false);
    setSuccessMessage("Profil mis à jour avec succès !");
    setToast("✓ Profil enregistré avec succès !");
    setForm(prev => ({ ...prev, password: "" }));
    setTouched({});
  };

  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compression d'image avant stockage
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedData = canvas.toDataURL("image/jpeg", 0.7); // 70% qualité

        try {
          const key = getPhotoKey();
          localStorage.setItem(key, compressedData);
          sessionStorage.setItem("airops_photo_current", compressedData);
          setPhoto(compressedData);
          window.dispatchEvent(new Event("airops-profile-update"));
          setToast("✓ Photo optimisée et sélectionnée ! Cliquez sur 'Mettre à jour'.");
        } catch (err) {
          setToast("⚠️ Erreur lors du stockage de la photo.");
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    try {
      const key = getPhotoKey();
      localStorage.removeItem(key);
      sessionStorage.removeItem("airops_photo_current");
      window.dispatchEvent(new Event("airops-profile-update"));
      setToast("✓ Photo supprimée.");
    } catch { }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const formInitials = getStoredInitials(form.nom);
  const inputCls = field => `form-input${touched[field] && errors[field] ? " error" : ""}`;

  // Build display telephone string
  const displayTel = form.phoneLocal ? `${selectedCountry.dial} ${form.phoneLocal}` : "—";

  return (
    <div className="pw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" />
            </svg>
          </div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE PASSAGER</span></div>
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
          <button type="button" className="sb-logout" onClick={handleLogout}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="pm">
        <header className="ph">
          <div className="ph-left">
            <button type="button" className="ph-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="ph-title">Profile</span>
          </div>
          <div className="ph-right">
            <div className="user-chip">
              <div className="user-info-r">
                <div className="user-name-h">{nom || "Passager"}</div>
                <div className="user-role-h">Passager</div>
              </div>
              <div className="user-avatar-h" onClick={() => fileRef.current?.click()} title="Changer la photo">
                {photo ? <img src={photo} alt="profil" /> : <span>{initials}</span>}
              </div>
            </div>
          </div>
        </header>

        <main className="pc">
          <h1 className="page-title">Mon profil</h1>
          <p className="page-subtitle">Modifiez vos informations personnelles et vos préférences.</p>

          <div className="profil-grid">
            {/* Left column */}
            <div>
              <div className="card avatar-card">
                <div className="avatar-wrap" onClick={() => fileRef.current?.click()} title="Cliquer pour changer la photo">
                  {photo
                    ? <img src={photo} alt="Profil" className="avatar-img" />
                    : <div className="avatar-placeholder">
                      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16l4-4a3 3 0 014.243 0L16 16m-2-2l1-1a3 3 0 014.243 0L21 15m-6-8h.01" /></svg>
                      <span style={{ fontSize: 12, marginTop: 6, fontWeight: 600 }}>Ajouter photo</span>
                    </div>
                  }
                  <div className="avatar-overlay">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>Changer photo</span>
                  </div>
                </div>

                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />

                {photo && (
                  <button type="button" className="btn-remove-photo" onClick={handleRemovePhoto}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    Supprimer la photo
                  </button>
                )}

                <p className="avatar-name">{nom || "Passager"}</p>
                <span className="avatar-role">
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Passager
                </span>

                <div className="info-row"><p className="info-row-label">Email</p><p className="info-row-value">{form.email || "—"}</p></div>
                <div className="info-row"><p className="info-row-label">Téléphone</p><p className="info-row-value">{displayTel}</p></div>
              </div>

              <div className="banner-card">
                <div className="banner-deco" style={{ width: 160, height: 160, right: -40, bottom: -40 }} />
                <div className="banner-deco" style={{ width: 80, height: 80, right: 60, top: -20 }} />
                <div>
                  <p className="banner-sub">Espace personnel</p>
                  <p className="banner-title">Gardez vos informations à jour</p>
                  <p className="banner-desc">Un profil complet facilite le traitement de vos demandes.</p>
                </div>
                <div className="banner-pill">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Compte sécurisé
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="card form-card">
              <p className="form-title">Informations du compte</p>
              <p className="form-subtitle">Modifiez les informations de votre compte passager.</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  {/* Nom — alphabet only */}
                  <div className="form-group">
                    <label className="form-label">Nom complet <span style={{ fontWeight: 400, color: "var(--text-muted)", textTransform: "none" }}>(lettres uniquement)</span></label>
                    <input type="text" name="nom" value={form.nom} onChange={handleChange} onBlur={handleBlur}
                      className={inputCls("nom")} placeholder="Votre nom complet"
                      inputMode="text" autoComplete="name" />
                    {touched.nom && errors.nom && <p className="form-error">{errors.nom}</p>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">Adresse email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} className={inputCls("email")} placeholder="ahmed@email.com" />
                    {touched.email && errors.email && <p className="form-error">{errors.email}</p>}
                  </div>

                  {/* Phone with country selector */}
                  <div className="form-group full">
                    <label className="form-label">
                      Téléphone
                      <span style={{ fontWeight: 400, color: "var(--text-muted)", textTransform: "none", marginLeft: 6 }}>
                        ({selectedCountry.digits} chiffres pour {selectedCountry.name})
                      </span>
                    </label>
                    <div className="phone-row">
                      <select
                        className="country-select"
                        name="phoneCountry"
                        value={form.phoneCountry}
                        onChange={e => { setForm(p => ({ ...p, phoneCountry: e.target.value, phoneLocal: "" })); setSuccessMessage(""); }}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phoneLocal"
                        value={form.phoneLocal}
                        onChange={handleChange}
                        onBlur={e => setTouched(p => ({ ...p, phoneLocal: true }))}
                        className={`form-input phone-input${touched.phoneLocal && errors.phoneLocal ? " error" : ""}`}
                        placeholder={`${"0".repeat(selectedCountry.digits)}`}
                        inputMode="numeric"
                        maxLength={selectedCountry.digits}
                      />
                    </div>
                    {touched.phoneLocal && errors.phoneLocal && <p className="form-error">{errors.phoneLocal}</p>}
                  </div>

                  {/* Adresse */}
                  <div className="form-group">
                    <label className="form-label">Adresse</label>
                    <input type="text" name="adresse" value={form.adresse} onChange={handleChange} onBlur={handleBlur} className={inputCls("adresse")} placeholder="Ville, Pays" />
                    {touched.adresse && errors.adresse && <p className="form-error">{errors.adresse}</p>}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} onBlur={handleBlur} className={inputCls("password")} placeholder="Laisser vide si inchangé" />
                    {touched.password && errors.password && <p className="form-error">{errors.password}</p>}
                    {form.password.length > 0 && (
                      <>
                        <div className="pwd-strength">
                          {[1, 2, 3].map(i => <div key={i} className={`pwd-bar${i <= strength ? ` ${pwdColors[strength]}` : ""}`} />)}
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