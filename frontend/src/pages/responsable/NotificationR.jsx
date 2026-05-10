import { useEffect, useMemo, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  formatTimeAgo,
} from "../../services/responsableService";
import { useProfileSync } from "../../services/useProfileSync";

/* ═══════════════════════════════════════════════════════════════
   CSS — COPIE EXACTE de NotificationM, préfixe .chw → .nrw
   ════════════════════════════════════════════════════════════════ */
const NOTIF_CSS = `
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
  /* ── wrapper ── */
  .nrw{display:flex;height:100vh;overflow:hidden;background:var(--bg-page);font-family:'DM Sans','Segoe UI',sans-serif;color:var(--text-primary);}
  /* ── sidebar (identique NotifM) ── */
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
  .sidebar.collapsed .sb-nav-item::after{content:attr(data-label);position:absolute;left:calc(var(--sidebar-mini) + 6px);top:50%;transform:translateY(-50%);background:var(--brand-dark);color:#fff;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;white-space:nowrap;pointer-events:none;box-shadow:var(--shadow-md);border:1px solid rgba(255,255,255,0.1);z-index:200;opacity:0;transition:opacity 0.15s;}
  .sidebar.collapsed .sb-nav-item:hover::after{opacity:1;}
  .sb-footer{padding:6px 9px 16px;border-top:1px solid rgba(255,255,255,0.07);flex-shrink:0;}
  .sb-logout{width:100%;display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:none;background:transparent;color:rgba(255,255,255,0.4);font-size:13.5px;font-weight:500;cursor:pointer;transition:var(--tr);font-family:inherit;white-space:nowrap;overflow:hidden;}
  .sb-logout:hover{color:#fca5a5;background:rgba(239,68,68,0.1);}
  .sb-logout-lbl{transition:opacity 0.2s,max-width 0.3s;max-width:160px;overflow:hidden;}
  .sidebar.collapsed .sb-logout-lbl{opacity:0;max-width:0;}
  .sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:25;backdrop-filter:blur(2px);}
  /* ── main ── */
  .nrm{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
  .nrh{height:var(--header-h);background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;box-shadow:var(--shadow-sm);}
  .nrh-left{display:flex;align-items:center;gap:12px;}
  .nrh-right{display:flex;align-items:center;gap:10px;}
  .nrh-menu-btn{display:none;background:none;border:none;cursor:pointer;color:var(--text-sec);padding:6px;border-radius:8px;transition:var(--tr);}
  .nrh-menu-btn:hover{background:var(--bg-page);color:var(--text-primary);}
  .nrh-title{font-size:15px;font-weight:700;color:var(--text-primary);}
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
  .nrc{flex:1;overflow-y:auto;padding:26px;}
  .ch-footer-r{padding:12px 26px;background:#fff;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:var(--text-muted);flex-shrink:0;}
  .ch-footer-brand{display:flex;align-items:center;gap:6px;font-weight:600;}

  /* ══ NOTIFICATION PAGE — identique NotificationM ══ */
  .np-page-title{font-size:25px;font-weight:800;color:var(--brand-dark);letter-spacing:-0.5px;margin-bottom:4px;}
  .np-page-title span{color:var(--brand-blue);}
  .np-page-sub{font-size:13px;color:var(--text-muted);margin-bottom:22px;}

  .np-main-card{background:#fff;border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow-sm);overflow:hidden;}
  .np-toolbar{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid var(--border);gap:12px;flex-wrap:wrap;}
  .np-filters{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
  .np-filter-btn{padding:7px 16px;border-radius:10px;border:1.5px solid var(--border);background:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.2s;color:var(--text-sec);}
  .np-filter-btn:hover{border-color:var(--brand-blue);color:var(--brand-blue);}
  .np-filter-btn.active{background:#eff6ff;border-color:var(--brand-blue);color:var(--brand-blue);}
  .np-actions{display:flex;align-items:center;gap:6px;}
  .np-act-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1.5px solid var(--border);background:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.2s;color:var(--text-sec);}
  .np-act-btn:hover{border-color:var(--brand-blue);color:var(--brand-blue);background:#eff6ff;}
  .np-act-btn.danger:hover{border-color:#ef4444;color:#ef4444;background:#fef2f2;}

  /* ── card list ── */
  .np-list{padding:12px 16px;display:flex;flex-direction:column;gap:10px;}
  .np-card{border:1.5px solid var(--border);border-radius:16px;padding:16px 18px;transition:all 0.2s;position:relative;overflow:hidden;cursor:pointer;}
  .np-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;border-radius:16px 0 0 16px;background:transparent;}
  .np-card.unread{background:#f8fbff;border-color:#bfdbfe;}
  .np-card.unread::before{background:var(--brand-blue);}
  .np-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-md);}
  .np-card-inner{display:flex;align-items:flex-start;gap:14px;}
  .np-card-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#dbeafe,#93c5fd);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px;}
  .np-card-body{flex:1;min-width:0;}
  .np-card-head{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;}
  .np-card-ref{font-size:14px;font-weight:800;color:var(--brand-blue);}
  .np-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;}
  .np-badge.cat-demande{background:#fff7ed;color:#ea580c;}
  .np-badge.cat-reclam{background:#fef2f2;color:#dc2626;}
  .np-badge.unread{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
  .np-card-title{font-size:13.5px;font-weight:700;color:var(--text-primary);margin-bottom:4px;}
  .np-card-desc{font-size:12px;color:var(--text-sec);line-height:1.5;margin-bottom:6px;}
  .np-card-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
  .np-tag{font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap;}
  .np-tag.orange{color:var(--accent-orange);background:#fff7ed;}
  .np-tag.blue{color:var(--brand-blue);background:#eff6ff;}
  .np-tag.green{color:var(--accent-green);background:#f0fdf4;}
  .np-tag.red{color:var(--accent-red);background:#fef2f2;}
  .np-tag.sky{color:#0ea5e9;background:#f0f9ff;}
  .np-time{font-size:10px;font-weight:700;color:var(--text-muted);background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:3px 9px;white-space:nowrap;}
  /* ── card footer buttons (identiques NotifM) ── */
  .np-card-footer{display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;flex-wrap:wrap;}
  .np-btn-primary{display:flex;align-items:center;gap:6px;padding:8px 14px;background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid));color:#fff;border:none;border-radius:10px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;}
  .np-btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(41,128,232,0.35);}
  .np-btn-accept{display:flex;align-items:center;gap:5px;padding:8px 14px;border:1.5px solid #bbf7d0;background:#f0fdf4;color:var(--accent-green);border-radius:10px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;}
  .np-btn-accept:hover{background:var(--accent-green);border-color:var(--accent-green);color:#fff;}
  .np-btn-refuse{display:flex;align-items:center;gap:5px;padding:8px 14px;border:1.5px solid #fecaca;background:#fef2f2;color:var(--accent-red);border-radius:10px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;}
  .np-btn-refuse:hover{background:var(--accent-red);border-color:var(--accent-red);color:#fff;}
  .np-btn-mark{display:flex;align-items:center;gap:5px;padding:8px 14px;border:1.5px solid var(--border);color:var(--text-sec);background:#fff;border-radius:10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.2s;}
  .np-btn-mark:hover{background:#f0fdf4;border-color:#22c55e;color:#16a34a;}
  .np-btn-del{display:flex;align-items:center;gap:5px;padding:8px 14px;border:1.5px solid #fecaca;color:#ef4444;background:none;border-radius:10px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;}
  .np-btn-del:hover{background:#fef2f2;border-color:#ef4444;}

  .np-empty{padding:60px 22px;text-align:center;}
  .np-empty-icon{width:72px;height:72px;margin:0 auto 18px;border-radius:20px;background:#eff6ff;display:flex;align-items:center;justify-content:center;}

  /* ── modals (identiques NotifM) ── */
  .nm-ov{position:fixed;inset:0;z-index:100;background:rgba(13,43,94,0.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:nmFade 0.2s ease;}
  @keyframes nmFade{from{opacity:0}to{opacity:1}}
  .nm-confirm-box{background:#fff;border-radius:24px;width:100%;max-width:400px;padding:28px;box-shadow:var(--shadow-lg);animation:nmUp 0.25s ease;text-align:center;}
  @keyframes nmUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:none}}
  .nm-confirm-icon{width:64px;height:64px;border-radius:20px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}
  .nm-confirm-btns{display:flex;gap:10px;margin-top:22px;}
  .nm-confirm-cancel{flex:1;padding:11px;font-size:13px;font-family:inherit;font-weight:600;color:var(--text-sec);border:1.5px solid var(--border);border-radius:12px;background:#fff;cursor:pointer;transition:all 0.2s;}
  .nm-confirm-cancel:hover{background:var(--bg-page);}
  .nm-confirm-ok{flex:1;padding:11px;font-size:13px;font-family:inherit;font-weight:700;color:#fff;border:none;border-radius:12px;background:linear-gradient(135deg,#ef4444,#b91c1c);cursor:pointer;box-shadow:0 4px 14px rgba(239,68,68,0.3);transition:all 0.2s;}
  .nm-confirm-ok:hover{transform:translateY(-1px);}

  .nm-toast{position:fixed;top:18px;right:18px;z-index:600;background:var(--brand-dark);color:#fff;padding:12px 18px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);border-left:3px solid var(--brand-light);animation:nmToast 0.3s ease;}
  .nm-toast.green{border-left-color:#4ade80;}
  .nm-toast.red{border-left-color:#f87171;}
  @keyframes nmToast{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}

  @media(max-width:768px){
    .sidebar{position:fixed;left:0;top:0;bottom:0;z-index:30;transform:translateX(-100%);width:var(--sidebar-full)!important;transition:transform 0.3s ease!important;}
    .sidebar.open{transform:translateX(0);}.sidebar.collapsed{transform:translateX(-100%);}.sidebar.collapsed.open{transform:translateX(0);}
    .sb-overlay{display:block;}.nrh-menu-btn{display:flex;}.sb-toggle-btn{display:none;}
    .nrc{padding:16px;}.nrh{padding:0 16px;}.search-wrap{display:none;}.user-role{display:none;}
  }
  @media(max-width:480px){.np-card-footer{flex-wrap:wrap;}.nrc{padding:12px;}}
`;

if (typeof document !== "undefined" && !document.getElementById("airops-notifr2-css")) {
  const s = document.createElement("style"); s.id = "airops-notifr2-css"; s.textContent = NOTIF_CSS; document.head.appendChild(s);
}



/* Unified nav — responsable */

const TABS = ["Tout", "Demandes", "Incidents"];

const TYPE_MAP = {
  VALIDATION: { category: "Demandes", emoji: "✅", tag: "Confirmée", tagColor: "green" },
  REJET: { category: "Demandes", emoji: "❌", tag: "Refusée", tagColor: "red" },
  MISSION: { category: "Demandes", emoji: "🚗", tag: "Mission", tagColor: "blue" },
  INFO: { category: "Incidents", emoji: "⚠️", tag: "Incident", tagColor: "orange" },
  INCIDENT: { category: "Incidents", emoji: "⚠️", tag: "Incident", tagColor: "red" },
  GENERAL: { category: "Demandes", emoji: "⏳", tag: "Général", tagColor: "orange" },
};

/* ─── Confirm Delete ─────────────────────────────────────────── */
function ConfirmDelete({ notif, onConfirm, onClose }) {
  if (!notif) return null;
  return (
    <div className="nm-ov" onClick={onClose}>
      <div className="nm-confirm-box" onClick={e => e.stopPropagation()}>
        <div className="nm-confirm-icon">
          <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Supprimer la notification</h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Voulez-vous supprimer <strong style={{ color: "var(--brand-blue)" }}>{notif.ref}</strong> ? Cette action est irréversible.</p>
        <div className="nm-confirm-btns">
          <button type="button" className="nm-confirm-cancel" onClick={onClose}>Annuler</button>
          <button type="button" className="nm-confirm-ok" onClick={() => { onConfirm(notif.id); onClose(); }}>Supprimer</button>
        </div>
      </div>
    </div>
  );
}


const translateMsg = (msg) => {
  if (!msg) return '';
  let t = msg;
  t = t.replace(/Your request (.*?) was approved/g, 'Votre demande $1 a été approuvée');
  t = t.replace(/Your request (.*?) was rejected/g, 'Votre demande $1 a été rejetée');
  t = t.replace(/New mission assigned for request (.*?)$/g, 'Nouvelle mission assignée pour la demande $1');
  t = t.replace(/New mission assigned (.*?)$/g, 'Nouvelle mission assignée : $1');
  t = t.replace(/Mission (.*?) was reassigned/g, 'La mission $1 a été réassignée');
  t = t.replace(/Mission (.*?) was cancelled/g, 'La mission $1 a été annulée');
  t = t.replace(/Mission for request (.*?) was cancelled/g, 'La mission pour la demande $1 a été annulée');
  t = t.replace(/New mission created for request (.*?)$/g, 'Nouvelle mission créée pour la demande $1');
  return t;
};

/* ─── MAIN ───────────────────────────────────────────────────── */
export default function NotificationR() {
  const navigate = useNavigate();
  const { nom, photo, initials, unreadCount, refreshNotifs } = useProfileSync();

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

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load from API
  const loadNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotifications({ limit: 50 });
      setNotifs((data.data || []).map(n => {
        const cfg = TYPE_MAP[n.type] || TYPE_MAP.GENERAL;
        return {
          id: n._id || n.id,
          _id: n._id || n.id,
          category: cfg.category,
          ref: `#NT-${String(n._id || n.id).slice(-4).toUpperCase()}`,
          emoji: cfg.emoji,
          catBadge: cfg.category === "Demandes" ? "cat-demande" : "cat-reclam",
          catLabel: cfg.category === "Incidents" ? "Incident" : cfg.category.slice(0, -1),
          title: translateMsg(n.message)?.split(":")[0] || "Notification",
          desc: translateMsg(n.message) || "",
          tag: cfg.tag,
          tagColor: cfg.tagColor,
          time: formatTimeAgo(n.createdAt),
          lu: n.isRead,
          actionable: false,
        };
      }));
    } catch {
      setToast({ msg: "Erreur lors du chargement.", type: "" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);
  const [filter, setFilter] = useState("Tout"); // Tout | Demandes | Réclamations | Avis
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "" });

  useEffect(() => { if (!toast.msg) return; const t = setTimeout(() => setToast({ msg: "", type: "" }), 2800); return () => clearTimeout(t); }, [toast]);

  const unread = notifs.filter(n => !n.lu).length;

  const filtered = useMemo(() => {
    let list = notifs;
    if (filter !== "Tout") list = list.filter(n => n.category === filter);
    if (search.trim()) { const q = search.trim().toLowerCase(); list = list.filter(n => [n.ref, n.title, n.desc, n.tag, n.category].join(" ").toLowerCase().includes(q)); }
    return list;
  }, [notifs, filter, search]);

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifs(p => p.map(n => ({ ...n, lu: true })));
      setToast({ msg: "✓ Toutes les notifications marquées comme lues.", type: "green" });
      window.dispatchEvent(new CustomEvent("airops-notif-update"));
    } catch { setToast({ msg: "Erreur.", type: "" }); }
  };
  const markRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n));
      window.dispatchEvent(new CustomEvent("airops-notif-update"));
    } catch {/* silently fail */ }
  };
  const deleteAll = () => { setNotifs([]); setToast({ msg: "✓ Toutes les notifications supprimées.", type: "red" }); };
  const deleteOne = id => { setNotifs(p => p.filter(n => n.id !== id)); setToast({ msg: "✓ Notification supprimée.", type: "red" }); };
  const handleAccept = ref => { setNotifs(p => p.map(n => n.ref === ref ? { ...n, lu: true, tag: "Confirmée", tagColor: "green", actionable: false } : n)); setToast({ msg: `✓ Demande ${ref} acceptée.`, type: "green" }); };
  const handleRefuse = ref => { setNotifs(p => p.map(n => n.ref === ref ? { ...n, lu: true, tag: "Refusée", tagColor: "red", actionable: false } : n)); setToast({ msg: `Demande ${ref} refusée.`, type: "" }); };


  const navWithBadge = navItems.map(i => i.to === "/notificationR" ? { ...i, badge: unread > 0 ? unread : undefined } : i);

  const tabCounts = { "Tout": notifs.length, "Demandes": notifs.filter(n => n.category === "Demandes").length, "Incidents": notifs.filter(n => n.category === "Incidents").length };

  return (
    <div className="nrw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)} />}

      {/* Sidebar */}
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
          {navWithBadge.map(item => (
            <NavLink key={item.label} to={item.to} data-label={item.label} className={({ isActive }) => `sb-nav-item${isActive ? " active" : ""}`} onClick={() => setSidebarMobile(false)}>
              <span className="sb-nav-icon">{item.icon}</span>
              <span className="sb-nav-lbl">{item.label}</span>
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

      {/* Main */}
      <div className="nrm">
        <header className="nrh">
          <div className="nrh-left">
            <button type="button" className="nrh-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="nrh-title">Notifications</span>
          </div>
          <div className="nrh-right">
            <div className="search-wrap">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" className="search-input" placeholder="Rechercher une notification…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="user-chip">
              <div style={{ textAlign: "right" }}><div className="user-name">{nom}</div><div className="user-role">Responsable</div></div>
              <div className="user-avatar">{photo ? <img src={photo} alt="profil" /> : initials}</div>
            </div>
          </div>
        </header>

        <main className="nrc">
          {/* ── Titre identique NotificationM ── */}
          <h1 className="np-page-title">Mes <span>Notifications</span></h1>
          <p className="np-page-sub">Suivez les nouvelles demandes, les changements de mission et les incidents en temps réel.</p>

          {/* ── Card principale identique NotificationM ── */}
          <div className="np-main-card">
            <div className="np-toolbar">
              <div className="np-filters">
                {TABS.map(tab => (
                  <button key={tab} type="button" className={`np-filter-btn${filter === tab ? " active" : ""}`} onClick={() => setFilter(tab)}>
                    {tab}
                    <span style={{ marginLeft: 5, background: filter === tab ? "rgba(41,128,232,0.2)" : "#f0f5fb", color: filter === tab ? "var(--brand-blue)" : "var(--text-muted)", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{tabCounts[tab]}</span>
                  </button>
                ))}
              </div>
              <div className="np-actions">
                {unread > 0 && (
                  <button type="button" className="np-act-btn" onClick={markAllRead}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Tout marquer lu
                  </button>
                )}
                {notifs.length > 0 && (
                  <button type="button" className="np-act-btn danger" onClick={deleteAll}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Tout supprimer
                  </button>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="np-empty">
                <div className="np-empty-icon">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#93c5fd" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Aucune notification</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{filter === "Tout" ? "Vous n'avez aucune notification pour le moment." : ` Aucune notification dans "${filter}".`}</p>
              </div>
            ) : (
              <div className="np-list">
                {filtered.map(n => (
                  <div key={n.id} className={`np-card ${n.lu ? "" : "unread"}`} onClick={() => markRead(n.id)}>
                    <div className="np-card-inner">
                      {/* icône identique NotificationM — gradient bleu */}
                      <div className="np-card-icon">{n.emoji}</div>
                      <div className="np-card-body">
                        <div className="np-card-head">
                          <span className="np-card-ref">{n.ref}</span>
                          <span className={`np-badge ${n.catBadge}`}>{n.catLabel}</span>
                          {!n.lu && <span className="np-badge unread">Non lu</span>}
                        </div>
                        <div className="np-card-title">{n.title}</div>
                        <div className="np-card-desc">{n.desc}</div>
                        <div className="np-card-meta">
                          <span className={`np-tag ${n.tagColor}`}>{n.tag}</span>
                          <span className="np-time">{n.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* footer identique NotificationM */}
                    <div className="np-card-footer" onClick={e => e.stopPropagation()}>
                      {n.actionable && n.category === "Demandes" && (
                        <>
                          <button type="button" className="np-btn-accept" onClick={() => handleAccept(n.ref)}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            Accepter
                          </button>
                          <button type="button" className="np-btn-refuse" onClick={() => handleRefuse(n.ref)}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Refuser
                          </button>
                        </>
                      )}
                      {!n.lu && (
                        <button type="button" className="np-btn-mark" onClick={() => markRead(n.id)}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Marquer lu
                        </button>
                      )}
                      <button type="button" className="np-btn-del" onClick={() => setConfirmDel(n)}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", padding: "14px 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>© 2026 AirOps – Gestion Transport Responsable</div>
        </main>

        {/* Footer identique NotificationM */}
        <footer className="ch-footer-r">
          <div className="ch-footer-brand">
            <svg width="14" height="14" fill="#22c55e" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
            Système de gestion sécurisé — AirOps Transport 2026
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</span>
        </footer>
      </div>

      {confirmDel && <ConfirmDelete notif={confirmDel} onClose={() => setConfirmDel(null)} onConfirm={deleteOne} />}
      {toast.msg && <div className={`nm-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}