import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUser, fetchUsers, deleteUser } from "../../services/responsableService";
import { useProfileSync } from "../../services/useProfileSync";

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
  .apw{display:flex;height:100vh;overflow:hidden;background:var(--bg-page);font-family:'DM Sans','Segoe UI',sans-serif;color:var(--text-primary);}
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
  .apm{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .aph{height:var(--header-h);background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .aph-left{display:flex;align-items:center;gap:12px;}
  .aph-right{display:flex;align-items:center;gap:10px;}
  .aph-menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;border-radius:8px;transition:var(--tr);}
  .aph-menu-btn:hover{background:var(--bg-page);}
  .aph-title{font-size:15px;font-weight:700;color:var(--text-primary);}
  .user-chip{display:flex;align-items:center;gap:9px;}
  .user-name{font-size:13px;font-weight:700;color:var(--text-primary);}
  .user-role{font-size:11px;color:var(--text-muted);}
  .user-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;box-shadow:0 3px 10px rgba(41,128,232,0.35);border:2.5px solid rgba(41,128,232,0.2);flex-shrink:0;overflow:hidden;}
  .user-avatar img{width:100%;height:100%;object-fit:cover;}
  .apc{flex:1;overflow-y:auto;padding:26px;}
  .ap-page-title{font-size:25px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.5px;margin-bottom:4px;}
  .ap-page-title span{color:var(--brand-blue);}
  .ap-page-sub{font-size:13px;color:var(--text-muted);margin-bottom:24px;}
  .ap-layout{display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start;max-width:1000px;}
  .ap-preview-card{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow-sm);overflow:hidden;position:sticky;top:0;}
  .ap-preview-top{background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));padding:28px 20px;text-align:center;}
  .ap-avatar{width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,0.2);border:3px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;margin:0 auto 12px;}
  .ap-preview-name{font-size:17px;font-weight:800;color:#fff;margin-bottom:3px;}
  .ap-preview-email{font-size:11px;color:rgba(255,255,255,0.7);}
  .ap-preview-body{padding:16px;display:flex;flex-direction:column;gap:8px;}
  .ap-preview-row{display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-page);border-radius:10px;}
  .ap-preview-icon{width:28px;height:28px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .ap-preview-lbl{font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;}
  .ap-preview-val{font-size:12px;font-weight:600;color:var(--text-primary);}
  .ap-preview-empty{font-size:11px;color:var(--text-muted);font-style:italic;}
  .ap-form-card{background:#fff;border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow-sm);overflow:hidden;}
  .ap-form-header{background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));padding:22px 26px;display:flex;align-items:center;gap:14px;}
  .ap-form-header-icon{width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .ap-form-header-text h2{font-size:17px;font-weight:800;color:#fff;margin-bottom:2px;}
  .ap-form-header-text p{font-size:12px;color:rgba(255,255,255,0.65);}
  .ap-form-body{padding:24px;}
  .ap-section-label{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;display:flex;align-items:center;gap:8px;}
  .ap-section-label::after{content:'';flex:1;height:1px;background:var(--border);}
  .ap-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
  .ap-field{display:flex;flex-direction:column;gap:5px;}
  .ap-field.full{grid-column:1/-1;}
  .ap-label{font-size:11px;font-weight:700;color:var(--text-sec);letter-spacing:0.5px;text-transform:uppercase;}
  .ap-label span{color:var(--accent-red);margin-left:2px;font-weight:400;text-transform:none;}
  .ap-input{height:44px;padding:0 14px;border:1.5px solid var(--border);border-radius:11px;font-size:13.5px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);width:100%;}
  .ap-input:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .ap-input.err{border-color:#fca5a5;background:#fff;}
  .ap-input::placeholder{color:var(--text-muted);}
  .ap-select{height:44px;padding:0 14px;border:1.5px solid var(--border);border-radius:11px;font-size:13.5px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);width:100%;cursor:pointer;appearance:none;}
  .ap-select:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .ap-select-wrap{position:relative;}
  .ap-select-wrap svg{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted);}
  .ap-error{font-size:11px;color:var(--accent-red);margin-top:2px;}
  .phone-row-p{display:flex;gap:8px;}
  .phone-code-p{height:44px;border:1.5px solid var(--border);border-radius:11px;font-size:12px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);cursor:pointer;padding:0 10px;flex-shrink:0;min-width:140px;}
  .phone-code-p:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .passport-row{display:flex;gap:8px;}
  .passport-prefix{height:44px;border:1.5px solid var(--border);border-radius:11px;font-size:12px;font-family:inherit;color:var(--text-primary);background:var(--bg-page);outline:none;transition:var(--tr);cursor:pointer;padding:0 10px;flex-shrink:0;min-width:170px;}
  .passport-prefix:focus{border-color:var(--brand-blue);background:#fff;box-shadow:0 0 0 3px rgba(41,128,232,0.1);}
  .passport-num{flex:1;}
  .ptype-row{display:flex;gap:8px;flex-wrap:wrap;}
  .ptype-pill{padding:8px 16px;border:1.5px solid var(--border);border-radius:10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.2s;background:#fff;color:var(--text-sec);}
  .ptype-pill:hover{border-color:var(--brand-blue);color:var(--brand-blue);}
  .ptype-pill.active{border-color:var(--brand-blue);background:#eff6ff;color:var(--brand-blue);}
  .pax-counter{display:flex;align-items:center;gap:12px;}
  .pax-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid var(--border);background:#fff;color:var(--text-primary);font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;line-height:1;font-family:inherit;}
  .pax-btn:hover{border-color:var(--brand-blue);color:var(--brand-blue);background:#eff6ff;}
  .pax-btn:disabled{opacity:0.3;cursor:not-allowed;}
  .pax-val{font-size:22px;font-weight:800;color:var(--brand-dark);min-width:36px;text-align:center;}
  .pax-note{font-size:11px;color:var(--text-muted);margin-top:3px;}
  .ap-form-footer{padding:16px 24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;gap:12px;background:#f8fafc;}
  .btn-ap-reset{padding:10px 22px;border-radius:12px;border:1.5px solid var(--border);background:#fff;color:var(--text-sec);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:var(--tr);}
  .btn-ap-reset:hover{background:var(--bg-page);}
  .btn-ap-save{display:flex;align-items:center;gap:8px;padding:10px 26px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));color:#fff;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:var(--tr);box-shadow:0 4px 14px rgba(41,128,232,0.3);}
  .btn-ap-save:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(41,128,232,0.4);}
  .btn-ap-save:disabled{background:#a5c8f4;cursor:not-allowed;box-shadow:none;}
  .ap-list{margin-top:24px;max-width:1000px;}
  .ap-list-title{font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:14px;}
  .passenger-card{background:#fff;border:1.5px solid var(--border);border-radius:16px;padding:14px 18px;margin-bottom:10px;display:grid;grid-template-columns:44px 1fr auto;align-items:center;gap:14px;transition:all 0.2s;}
  .passenger-card:hover{border-color:var(--brand-blue);box-shadow:var(--shadow-sm);}
  .passenger-avatar{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:800;flex-shrink:0;}
  .passenger-name{font-size:14px;font-weight:700;color:var(--text-primary);margin-bottom:3px;}
  .passenger-info{font-size:11px;color:var(--text-muted);display:flex;gap:10px;flex-wrap:wrap;}
  .passenger-chip{display:inline-flex;align-items:center;gap:4px;background:var(--bg-page);border:1px solid var(--border);border-radius:6px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--text-sec);}
  .btn-del-pass{width:30px;height:30px;border-radius:8px;border:1.5px solid #fecaca;background:#fef2f2;color:var(--accent-red);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;}
  .btn-del-pass:hover{background:var(--accent-red);border-color:var(--accent-red);color:#fff;}
  .ap-toast{position:fixed;top:18px;right:18px;z-index:600;background:var(--brand-dark);color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);border-left:3px solid var(--brand-light);animation:apToast 0.3s ease;}
  @keyframes apToast{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
  .ap-dash-footer{font-size:10px;color:var(--text-muted);text-align:center;padding:16px 0 4px;letter-spacing:1px;text-transform:uppercase;}
  @media(max-width:900px){.ap-layout{grid-template-columns:1fr;}.ap-preview-card{display:none;}}
  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.aph-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .apc{padding:16px;}.aph{padding:0 16px;}.user-role{display:none;}
  }
  @media(max-width:480px){
    .ap-grid{grid-template-columns:1fr;}
    .ap-form-body{padding:16px;}.ap-form-footer{padding:14px 16px;}
    .phone-row-p,.passport-row{flex-direction:column;}
    .phone-code-p,.passport-prefix{min-width:100%;}
    .passenger-card{grid-template-columns:44px 1fr 30px;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-ap-css")) {
  const s = document.createElement("style"); s.id = "airops-ap-css"; s.textContent = CSS; document.head.appendChild(s);
}

/* Phone country codes */
const COUNTRIES = [
  { code: "TN", dial: "+216", flag: "🇹🇳", name: "Tunisie", digits: 8, passportDigits: 8, cinDigits: 8 },
  { code: "DZ", dial: "+213", flag: "🇩🇿", name: "Algérie", digits: 9, passportDigits: 9, cinDigits: 9 },
  { code: "MA", dial: "+212", flag: "🇲🇦", name: "Maroc", digits: 9, passportDigits: 8, cinDigits: 8 },
  { code: "EG", dial: "+20", flag: "🇪🇬", name: "Égypte", digits: 10, passportDigits: 9, cinDigits: 10 },
  { code: "LY", dial: "+218", flag: "🇱🇾", name: "Libye", digits: 9, passportDigits: 8, cinDigits: 8 },
  { code: "FR", dial: "+33", flag: "🇫🇷", name: "France", digits: 9, passportDigits: 9, cinDigits: 12 },
  { code: "DE", dial: "+49", flag: "🇩🇪", name: "Allemagne", digits: 11, passportDigits: 9, cinDigits: 12 },
  { code: "GB", dial: "+44", flag: "🇬🇧", name: "Royaume-Uni", digits: 10, passportDigits: 9, cinDigits: 12 },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espagne", digits: 9, passportDigits: 9, cinDigits: 9 },
  { code: "IT", dial: "+39", flag: "🇮🇹", name: "Italie", digits: 10, passportDigits: 9, cinDigits: 12 },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal", digits: 9, passportDigits: 9, cinDigits: 9 },
  { code: "BE", dial: "+32", flag: "🇧🇪", name: "Belgique", digits: 9, passportDigits: 9, cinDigits: 12 },
  { code: "NL", dial: "+31", flag: "🇳🇱", name: "Pays-Bas", digits: 9, passportDigits: 9, cinDigits: 12 },
  { code: "CH", dial: "+41", flag: "🇨🇭", name: "Suisse", digits: 9, passportDigits: 9, cinDigits: 12 },
  { code: "SA", dial: "+966", flag: "🇸🇦", name: "Arabie Saoudite", digits: 9, passportDigits: 9, cinDigits: 10 },
  { code: "AE", dial: "+971", flag: "🇦🇪", name: "Émirats Arabes", digits: 9, passportDigits: 9, cinDigits: 10 },
  { code: "QA", dial: "+974", flag: "🇶🇦", name: "Qatar", digits: 8, passportDigits: 8, cinDigits: 11 },
  { code: "KW", dial: "+965", flag: "🇰🇼", name: "Koweït", digits: 8, passportDigits: 8, cinDigits: 12 },
  { code: "BH", dial: "+973", flag: "🇧🇭", name: "Bahreïn", digits: 8, passportDigits: 8, cinDigits: 9 },
  { code: "OM", dial: "+968", flag: "🇴🇲", name: "Oman", digits: 8, passportDigits: 8, cinDigits: 10 },
  { code: "JO", dial: "+962", flag: "🇯🇴", name: "Jordanie", digits: 9, passportDigits: 9, cinDigits: 10 },
  { code: "LB", dial: "+961", flag: "🇱🇧", name: "Liban", digits: 8, passportDigits: 8, cinDigits: 12 },
  { code: "TR", dial: "+90", flag: "🇹🇷", name: "Turquie", digits: 10, passportDigits: 9, cinDigits: 11 },
  { code: "SN", dial: "+221", flag: "🇸🇳", name: "Sénégal", digits: 9, passportDigits: 9, cinDigits: 13 },
  { code: "CI", dial: "+225", flag: "🇨🇮", name: "Côte d Ivoire", digits: 10, passportDigits: 9, cinDigits: 11 },
  { code: "CM", dial: "+237", flag: "🇨🇲", name: "Cameroun", digits: 9, passportDigits: 9, cinDigits: 9 },
  { code: "GN", dial: "+224", flag: "🇬🇳", name: "Guinée", digits: 9, passportDigits: 9, cinDigits: 9 },
  { code: "ML", dial: "+223", flag: "🇲🇱", name: "Mali", digits: 8, passportDigits: 8, cinDigits: 8 },
  { code: "MR", dial: "+222", flag: "🇲🇷", name: "Mauritanie", digits: 8, passportDigits: 8, cinDigits: 10 },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "États-Unis", digits: 10, passportDigits: 9, cinDigits: 9 },
  { code: "CA", dial: "+1", flag: "🇨🇦", name: "Canada", digits: 10, passportDigits: 8, cinDigits: 9 },
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brésil", digits: 11, passportDigits: 8, cinDigits: 11 },
  { code: "CN", dial: "+86", flag: "🇨🇳", name: "Chine", digits: 11, passportDigits: 9, cinDigits: 18 },
  { code: "JP", dial: "+81", flag: "🇯🇵", name: "Japon", digits: 10, passportDigits: 7, cinDigits: 12 },
  { code: "KR", dial: "+82", flag: "🇰🇷", name: "Corée du Sud", digits: 10, passportDigits: 9, cinDigits: 13 },
  { code: "AU", dial: "+61", flag: "🇦🇺", name: "Australie", digits: 9, passportDigits: 8, cinDigits: 9 },
  { code: "IN", dial: "+91", flag: "🇮🇳", name: "Inde", digits: 10, passportDigits: 8, cinDigits: 12 },
  { code: "PK", dial: "+92", flag: "🇵🇰", name: "Pakistan", digits: 10, passportDigits: 9, cinDigits: 13 },
  { code: "NG", dial: "+234", flag: "🇳🇬", name: "Nigéria", digits: 10, passportDigits: 9, cinDigits: 11 },
  { code: "ZA", dial: "+27", flag: "🇿🇦", name: "Afrique du Sud", digits: 9, passportDigits: 9, cinDigits: 13 },
  { code: "RU", dial: "+7", flag: "🇷🇺", name: "Russie", digits: 10, passportDigits: 9, cinDigits: 10 },
];

function formatDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function yearsAgo(years) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return formatDateInput(d);
}
function calcAge(dateValue) {
  if (!dateValue) return 0;
  const birth = new Date(dateValue);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
function pwdStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^a-zA-Z0-9]/.test(pwd)) s++;
  return Math.min(s, 3);
}
const pwdLabels = ["", "Faible", "Moyen", "Fort"];
const pwdBarColors = ["", "#ef4444", "#f97316", "#16a34a"];
const maxDateNaissance = yearsAgo(18);
const minDateNaissance = yearsAgo(100);

const defaultForm = {
  nom: "", prenom: "", email: "", phone: "", phoneCountry: "TN",
  cin: "", cinPays: "TN", passeport: "", passeportPays: "FR",
  nationalite: "Tunisie", dateNaissance: maxDateNaissance,
  password: "", confirmPwd: "",
};

function calcProgress(form) {
  const all = [form.nom, form.prenom, form.cin, form.nationalite, form.email, form.phone, form.password, form.confirmPwd, form.dateNaissance];
  const filled = all.filter(v => String(v || "").trim()).length;
  return Math.round((filled / all.length) * 100);
}

function getInitials(n, p) {
  if (!n && !p) return "";
  return ((p?.[0] || "") + (n?.[0] || "")).toUpperCase();
}


export default function AjouterPassager() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [touched, setTouched] = useState({});
  const [toast, setToast] = useState("");

  const { nom: nomR, photo, initials: initR, unreadCount } = useProfileSync();

  const navItems = [
    {
      label: "Tableau de bord",
      to: "/dashbordRES",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    },
    {
      label: "Notifications",
      to: "/notificationR",
      badge: unreadCount,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    },
    {
      label: "Ajouter Chauffeur",
      to: "/ajouterChauffeur",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="16" y1="11" x2="22" y2="11"></line></svg>,
    },
    {
      label: "Ajouter Passager",
      to: "/ajouterPassager",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    },
  ];

  const sel = COUNTRIES.find(c => c.code === form.phoneCountry) || COUNTRIES[0];
  const cinSel = COUNTRIES.find(c => c.code === form.cinPays) || COUNTRIES[0];
  const pSel = COUNTRIES.find(c => c.code === form.passeportPays) || COUNTRIES[0];

  const validate = (f) => {
    const e = {};
    const cleanNom = f.nom.trim();
    const cleanPrenom = f.prenom.trim();

    if (!cleanNom) e.nom = "Le nom est obligatoire.";
    else if (cleanNom.length < 2) e.nom = "Minimum 2 caractères.";
    else if (cleanNom.length > 50) e.nom = "Maximum 50 caractères.";
    else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(cleanNom)) e.nom = "Lettres uniquement.";

    if (!cleanPrenom) e.prenom = "Le prénom est obligatoire.";
    else if (cleanPrenom.length < 2) e.prenom = "Minimum 2 caractères.";
    else if (cleanPrenom.length > 50) e.prenom = "Maximum 50 caractères.";
    else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']+$/.test(cleanPrenom)) e.prenom = "Lettres uniquement.";

    if (!f.cin.trim()) e.cin = "Le CIN est obligatoire.";
    else if (f.cinPays === "TN" && !/^\d{8}$/.test(f.cin.trim())) e.cin = "8 chiffres exacts (Tunisie).";

    if (!f.email.trim()) e.email = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = "Format email invalide.";

    const country = COUNTRIES.find(c => c.code === f.phoneCountry) || COUNTRIES[0];
    const phoneDigits = f.phone.replace(/\D/g, "");
    if (!f.phone.trim()) e.phone = "Téléphone obligatoire.";
    else if (phoneDigits.length !== country.digits) e.phone = `${country.digits} chiffres requis.`;

    if (!f.password.trim()) e.password = "Le mot de passe est obligatoire.";
    else if (f.password.length < 8) e.password = "Minimum 8 caractères.";
    else if (!/[A-Z]/.test(f.password)) e.password = "Majuscule requise.";
    else if (!/[0-9]/.test(f.password)) e.password = "Chiffre requis.";

    if (!f.confirmPwd) e.confirmPwd = "Confirmation requise.";
    else if (f.confirmPwd !== f.password) e.confirmPwd = "Mots de passe différents.";

    if (!f.dateNaissance) e.dateNaissance = "Date de naissance obligatoire.";
    else if (calcAge(f.dateNaissance) < 18) e.dateNaissance = "Âge minimum : 18 ans.";

    return e;
  };

  const errs = validate(form);
  const isValid = Object.keys(errs).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Real-time filtering
    if ((name === "nom" || name === "prenom") && value !== "" && !/^[a-zA-ZÀ-ÖØ-öø-ÿ\s\-']*$/.test(value)) return;
    if ((name === "cin" || name === "phone") && value !== "" && !/^\d*$/.test(value)) return;
    if (name === "passeport" && value !== "" && !/^[a-zA-Z0-9]*$/.test(value)) return;

    setForm(p => ({ ...p, [name]: value }));
  };
  const progress = calcProgress(form);

  const hc = handleChange;
  const hb = e => setTouched(p => ({ ...p, [e.target.name]: true }));
  const cls = f => `ap-input${touched[f] && errs[f] ? " err" : ""}`;

  const handleSave = async () => {
    setTouched(Object.fromEntries(Object.keys(errs).map(k => [k, true])));
    if (!isValid) return;
    const payload = {
      name: `${form.nom.trim()} ${form.prenom.trim()}`,
      email: form.email.trim(),
      role: "PASSAGER",
      phone: `${sel.dial}${form.phone.replace(/^0/, "")}`,
      cin: form.cin.trim() || undefined,
      passportNumber: form.passeport.trim() || undefined,
      address: form.nationalite || undefined,
      password: form.password,
    };

    try {
      await createUser(payload);
      setToast(`✓ Passager ${form.prenom} ${form.nom} ajouté !`);
      setForm(defaultForm); setTouched({});
      setTimeout(() => setToast(""), 3000);
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de l'enregistrement.");
      setTimeout(() => setToast(""), 3000);
    }
  };

  const previewName = `${form.nom} ${form.prenom}`.trim() || "Nouveau Passager";
  const previewInitials = getInitials(form.nom, form.prenom) || "P";
  const fullPassportPreview = form.passeport.trim() ? `${pSel.flag} ${form.passeport.trim()}` : "";

  return (
    <div className="apw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}
      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/")}>
          <div className="sb-brand-icon"><svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12" /></svg></div>
          <div className="sb-brand-text"><span className="sb-brand-name">AirOps</span><span className="sb-brand-sub">ESPACE RESPONSABLE</span></div>
        </div>
        <div className="sb-label">Navigation</div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span><span className="sb-nav-lbl">{item.label}</span>
              {item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={() => { localStorage.clear(); navigate("/login"); }}>
            <span style={{ flexShrink: 0 }}><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="apm">
        <header className="aph">
          <div className="aph-left">
            <button type="button" className="aph-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="aph-title">Ajouter un passager</span>
          </div>
          <div className="aph-right">
            <div className="user-chip">
              <div style={{ textAlign: "right" }}><div className="user-name">{nomR}</div><div className="user-role">Responsable</div></div>
              <div className="user-avatar">{initR}</div>
            </div>
          </div>
        </header>

        <main className="apc">
          <h1 className="ap-page-title">Ajouter un <span>Passager</span></h1>
          <p className="ap-page-sub">Renseignez les informations du nouveau passager.</p>

          <div className="ap-layout">
            <div className="ap-preview-card">
              <div className="ap-preview-top">
                <div className="ap-avatar">{previewInitials}</div>
                <div className="ap-preview-name">{previewName}</div>
                <div className="ap-preview-email">{form.email}</div>
              </div>
              <div className="ap-preview-body">
                {[
                  { icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#2980e8" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>, lbl: "CIN", val: form.cin },
                  { icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>, lbl: "Passeport", val: fullPassportPreview },
                  { icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, lbl: "Téléphone", val: form.phone ? `${sel.dial} ${form.phone}` : "" },
                ].map(r => (
                  <div key={r.lbl} className="ap-preview-row">
                    <div className="ap-preview-icon">{r.icon}</div>
                    <div><div className="ap-preview-lbl">{r.lbl}</div>{r.val ? <div className="ap-preview-val">{r.val}</div> : <div className="ap-preview-empty"></div>}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ap-form-card">
              <div className="ap-form-header">
                <div className="ap-form-header-icon">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <div className="ap-form-header-text"><h2>Nouveau passager</h2><p>Champs marqués * obligatoires</p></div>
              </div>

              <div className="ap-form-body">
                <div className="ap-section-label">Identité</div>
                <div className="ap-grid">
                  <div className="ap-field">
                    <label className="ap-label">Nom <span>*</span></label>
                    <input name="nom" value={form.nom} onChange={hc} onBlur={hb} className={cls("nom")} />
                    {touched.nom && errs.nom && <p className="ap-error">{errs.nom}</p>}
                  </div>
                  <div className="ap-field">
                    <label className="ap-label">Prénom <span>*</span></label>
                    <input name="prenom" value={form.prenom} onChange={hc} onBlur={hb} className={cls("prenom")} />
                    {touched.prenom && errs.prenom && <p className="ap-error">{errs.prenom}</p>}
                  </div>
                  <div className="ap-field">
                    <label className="ap-label">CIN <span>*</span></label>
                    <div className="passport-row">
                      <select className="passport-prefix" name="cinPays" value={form.cinPays} onChange={hc}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                      </select>
                      <input name="cin" value={form.cin} onChange={hc} onBlur={hb} className={cls("cin")} maxLength={cinSel.cinDigits} placeholder={`${cinSel.cinDigits} chiffres`} />
                    </div>
                    {touched.cin && errs.cin && <p className="ap-error">{errs.cin}</p>}
                  </div>
                  <div className="ap-field">
                    <label className="ap-label">Passeport</label>
                    <div className="passport-row">
                      <select className="passport-prefix" name="passeportPays" value={form.passeportPays} onChange={hc}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.code} {c.name}</option>)}
                      </select>
                      <input name="passeport" value={form.passeport} onChange={hc} onBlur={hb} className={cls("passeport")} maxLength={pSel.passportDigits} placeholder={`${pSel.passportDigits} car.`} />
                    </div>
                  </div>
                  <div className="ap-field">
                    <label className="ap-label">Nationalité</label>
                    <select name="nationalite" value={form.nationalite} onChange={hc} className="ap-select">
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="ap-field">
                    <label className="ap-label">Date de naissance <span>*</span></label>
                    <input type="date" name="dateNaissance" value={form.dateNaissance} onChange={hc} onBlur={hb} className={cls("dateNaissance")} />
                    {touched.dateNaissance && errs.dateNaissance && <p className="ap-error">{errs.dateNaissance}</p>}
                  </div>
                </div>

                <div className="ap-section-label">Contact</div>
                <div className="ap-grid">
                  <div className="ap-field full">
                    <label className="ap-label">Email <span>*</span></label>
                    <input type="email" name="email" value={form.email} onChange={hc} onBlur={hb} className={cls("email")} />
                    {touched.email && errs.email && <p className="ap-error">{errs.email}</p>}
                  </div>
                  <div className="ap-field full">
                    <label className="ap-label">Téléphone <span>*</span></label>
                    <div className="phone-row-p">
                      <select className="phone-code-p" name="phoneCountry" value={form.phoneCountry} onChange={hc}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.dial} ({c.name})</option>)}
                      </select>
                      <input name="phone" type="tel" value={form.phone} onChange={hc} onBlur={hb} className={cls("phone")} maxLength={sel.digits} placeholder={`${sel.digits} chiffres`} />
                    </div>
                    {touched.phone && errs.phone && <p className="ap-error">{errs.phone}</p>}
                  </div>
                </div>

                <div className="ap-section-label">Accès</div>
                <div className="ap-grid">
                  <div className="ap-field full">
                    <label className="ap-label">Mot de passe <span>*</span> <span style={{ textTransform: "none", fontWeight: 400 }}>(8+ car., Maj., Chiffre)</span></label>
                    <input type="password" name="password" value={form.password} onChange={hc} onBlur={hb} className={cls("password")} placeholder="••••••••" />
                    {touched.password && errs.password && <p className="ap-error">{errs.password}</p>}
                    {form.password.length > 0 && (() => {
                      const s = pwdStrength(form.password);
                      return (
                        <div style={{ marginTop: 6 }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 3, background: i <= s ? pwdBarColors[s] : "#e4ecf4", transition: "background 0.3s" }} />)}
                          </div>
                          <p style={{ fontSize: 10, color: pwdBarColors[s], marginTop: 3, fontWeight: 700 }}>Force : {pwdLabels[s]}</p>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="ap-field full">
                    <label className="ap-label">Confirmer le mot de passe <span>*</span></label>
                    <input type="password" name="confirmPwd" value={form.confirmPwd} onChange={hc} onBlur={hb} className={cls("confirmPwd")} placeholder="••••••••" />
                    {touched.confirmPwd && errs.confirmPwd && <p className="ap-error">{errs.confirmPwd}</p>}
                    {touched.confirmPwd && !errs.confirmPwd && form.confirmPwd && <p style={{ fontSize: 10, color: "#16a34a", marginTop: 3 }}>✓ Correspond</p>}
                  </div>
                </div>
              </div>

              <div className="ap-form-footer">
                <button type="button" className="btn-ap-reset" onClick={() => { setForm(defaultForm); setTouched({}); }}>Réinitialiser</button>
                <button type="button" className="btn-ap-save" onClick={handleSave} disabled={progress < 25}>Enregistrer le passager</button>
              </div>
            </div>
          </div>

          <div className="ap-dash-footer">© 2026 AirOps Transport Management</div>
        </main>
      </div>

      {toast && <div className="ap-toast">{toast}</div>}
    </div>
  );
}