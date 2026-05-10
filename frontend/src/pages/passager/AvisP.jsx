import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useProfileSync, getStoredPhoto } from "../../services/useProfileSync";
import { createAvis, fetchAvis, createReclamation } from "../../services/passengerService";
import { logout } from "../../services/authService";

const avisCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --brand-dark:#0d2b5e;--brand-mid:#1252aa;--brand-blue:#2980e8;--brand-light:#7ec8ff;
    --accent-orange:#f97316;--accent-green:#16a34a;--accent-red:#ef4444;--accent-purple:#8b5cf6;--accent-yellow:#f59e0b;
    --bg-page:#f0f5fb;--border:#e4ecf4;--text-primary:#0d2b5e;--text-sec:#5a6e88;--text-muted:#94a3b8;
    --sidebar-full:230px;--sidebar-mini:66px;--header-h:64px;
    --shadow-sm:0 2px 12px rgba(13,43,94,0.07);--shadow-md:0 8px 32px rgba(13,43,94,0.13);--shadow-lg:0 20px 50px rgba(13,43,94,0.18);
    --tr:all 0.25s ease;
  }
  .aw { display:flex; height:100vh; overflow:hidden; background:var(--bg-page); font-family:'DM Sans','Segoe UI',sans-serif; color:var(--text-primary); }
  .sidebar { width:var(--sidebar-full); background:var(--brand-dark); display:flex; flex-direction:column; flex-shrink:0; position:relative; z-index:30; transition:width 0.3s ease; box-shadow:4px 0 24px rgba(0,0,0,0.2); overflow:hidden; }
  .sidebar.collapsed { width:var(--sidebar-mini); }
  .sb-brand { display:flex; align-items:center; gap:10px; padding:18px 13px 16px; border-bottom:1px solid rgba(255,255,255,0.07); cursor:pointer; flex-shrink:0; min-height:68px; overflow:hidden; }
  .sb-brand-icon { width:40px; height:40px; min-width:40px; background:var(--brand-blue); border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(41,128,232,0.4); }
  .sb-brand-text { overflow:hidden; white-space:nowrap; opacity:1; transition:opacity 0.2s ease; }
  .sidebar.collapsed .sb-brand-text { opacity:0; }
  .sb-brand-name { font-size:17px; font-weight:800; color:#fff; letter-spacing:-0.4px; display:block; }
  .sb-brand-sub  { font-size:9px; color:rgba(255,255,255,0.4); letter-spacing:1.8px; font-weight:600; display:block; }
  .sb-toggle-btn { position:absolute; top:22px; right:10px; width:22px; height:22px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; transition:var(--tr); flex-shrink:0; }
  .sb-toggle-btn:hover { background:var(--brand-blue); border-color:var(--brand-blue); }
  .sb-toggle-btn svg { transition:transform 0.3s ease; }
  .sidebar.collapsed .sb-toggle-btn svg { transform:rotate(180deg); }
  .sb-label { font-size:9px; font-weight:700; letter-spacing:1.8px; color:rgba(255,255,255,0.25); padding:14px 14px 5px; text-transform:uppercase; white-space:nowrap; overflow:hidden; transition:opacity 0.2s; }
  .sidebar.collapsed .sb-label { opacity:0; }
  .sb-nav { padding:0 9px; flex:1; overflow-y:auto; overflow-x:hidden; }
  .sb-nav::-webkit-scrollbar { display:none; }
  .sb-nav-item { display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; text-decoration:none; font-size:13.5px; font-weight:500; color:rgba(255,255,255,0.58); transition:var(--tr); margin-bottom:3px; position:relative; overflow:hidden; white-space:nowrap; }
  .sb-nav-item:hover { color:#fff; background:rgba(255,255,255,0.09); }
  .sb-nav-item.active { color:#fff; font-weight:700; background:linear-gradient(135deg,var(--brand-blue),#1a6fd4); box-shadow:0 4px 16px rgba(41,128,232,0.35); }
  .sb-nav-item.active::before { content:''; position:absolute; left:-9px; top:50%; transform:translateY(-50%); width:3px; height:55%; background:var(--brand-light); border-radius:0 3px 3px 0; }
  .sb-nav-icon { flex-shrink:0; width:18px; height:18px; display:flex; align-items:center; justify-content:center; }
  .sb-nav-lbl  { flex:1; overflow:hidden; transition:opacity 0.2s,max-width 0.3s; max-width:160px; }
  .sidebar.collapsed .sb-nav-lbl { opacity:0; max-width:0; }
  .sb-badge { background:#ef4444; color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; display:flex; align-items:center; justify-content:center; padding:0 4px; flex-shrink:0; transition:opacity 0.2s; margin-left:auto; }
  .sidebar.collapsed .sb-badge { opacity:0; }
  .sidebar.collapsed .sb-nav-item::after { content:attr(data-label); position:absolute; left:calc(var(--sidebar-mini) + 6px); top:50%; transform:translateY(-50%); background:var(--brand-dark); color:#fff; font-size:12px; font-weight:600; padding:6px 12px; border-radius:8px; white-space:nowrap; pointer-events:none; box-shadow:var(--shadow-md); border:1px solid rgba(255,255,255,0.1); z-index:200; opacity:0; transition:opacity 0.15s; }
  .sidebar.collapsed .sb-nav-item:hover::after { opacity:1; }
  .sb-footer { padding:6px 9px 16px; border-top:1px solid rgba(255,255,255,0.07); flex-shrink:0; }
  .sb-logout { width:100%; display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:12px; border:none; background:transparent; color:rgba(255,255,255,0.4); font-size:13.5px; font-weight:500; cursor:pointer; transition:var(--tr); font-family:inherit; white-space:nowrap; overflow:hidden; }
  .sb-logout:hover { color:#fca5a5; background:rgba(239,68,68,0.1); }
  .sb-logout-icon { flex-shrink:0; }
  .sb-logout-lbl  { transition:opacity 0.2s,max-width 0.3s; max-width:160px; overflow:hidden; }
  .sidebar.collapsed .sb-logout-lbl { opacity:0; max-width:0; }
  .sb-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:25; backdrop-filter:blur(2px); }

  .am { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
  .ah { height:var(--header-h); background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; flex-shrink:0; box-shadow:var(--shadow-sm); }
  .ah-left  { display:flex; align-items:center; gap:12px; }
  .ah-right { display:flex; align-items:center; gap:10px; }
  .ah-menu-btn { display:none; background:none; border:none; cursor:pointer; color:var(--text-sec); padding:6px; border-radius:8px; transition:var(--tr); }
  .ah-menu-btn:hover { background:var(--bg-page); color:var(--text-primary); }
  .ah-title { font-size:15px; font-weight:700; color:var(--text-primary); }
  .review-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
  .review-badge { background: #eff6ff; color: #2980e8; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
  .review-date { font-size: 11px; color: #94a3b8; margin-left: auto; }
  .user-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--brand-blue),var(--brand-mid)); display:flex; align-items:center; justify-content:center; color:#fff; font-size:13px; font-weight:700; box-shadow:0 3px 10px rgba(41,128,232,0.35); border:2.5px solid rgba(41,128,232,0.2); flex-shrink:0; overflow:hidden; }
  .user-avatar img { width:100%; height:100%; object-fit:cover; }

  .ac { flex:1; overflow-y:auto; padding:26px; }
  .avis-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; margin-bottom:22px; flex-wrap:wrap; }
  .avis-title { font-size:clamp(22px,3vw,34px); font-weight:800; color:var(--brand-blue); letter-spacing:-0.8px; line-height:1; }
  .avis-subtitle { font-size:13px; color:var(--text-muted); margin-top:6px; }
  .btn-add-avis { display:flex; align-items:center; gap:8px; background:linear-gradient(135deg,var(--brand-blue),#1a6fd4); color:#fff; border:none; border-radius:14px; padding:12px 20px; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(41,128,232,0.3); flex-shrink:0; }
  .btn-add-avis:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(41,128,232,0.4); }

  /* Stats row */
  .avis-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
  .astat { background:#fff; border:1px solid var(--border); border-radius:18px; padding:18px; display:flex; flex-direction:column; gap:6px; box-shadow:var(--shadow-sm); transition:var(--tr); }
  .astat:hover { transform:translateY(-4px); box-shadow:var(--shadow-md); }
  .astat-icon { font-size:24px; margin-bottom:2px; }
  .astat-val { font-size:26px; font-weight:800; color:var(--brand-dark); }
  .astat-lbl { font-size:11px; color:var(--text-muted); font-weight:600; }
  .astat-stars { display:flex; gap:2px; }

  /* Filters */
  .avis-filters { display:flex; align-items:center; gap:10px; margin-bottom:20px; flex-wrap:wrap; }
  .filter-btn { padding:7px 16px; border-radius:20px; border:1.5px solid var(--border); background:#fff; color:var(--text-sec); font-size:12px; font-weight:700; font-family:inherit; cursor:pointer; transition:var(--tr); }
  .filter-btn:hover { border-color:var(--brand-blue); color:var(--brand-blue); }
  .filter-btn.active { background:var(--brand-blue); color:#fff; border-color:var(--brand-blue); box-shadow:0 2px 8px rgba(41,128,232,0.25); }

  /* Cards grid */
  .avis-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; }
  .avis-card { background:#fff; border:1px solid var(--border); border-radius:20px; padding:22px; box-shadow:var(--shadow-sm); transition:var(--tr); position:relative; overflow:hidden; display:flex; flex-direction:column; gap:14px; }
  .avis-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0; }
  .avis-card.cat-chauffeur::before { background:var(--brand-blue); }
  .avis-card.cat-service::before { background:var(--accent-green); }
  .avis-card.cat-application::before { background:var(--accent-orange); }
  .avis-card:hover { transform:translateY(-5px); box-shadow:var(--shadow-md); }

  .avis-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
  .avis-author { display:flex; align-items:center; gap:10px; }
  .avis-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:#fff; flex-shrink:0; }
  .avis-author-info { display:flex; flex-direction:column; }
  .avis-author-name { font-size:13px; font-weight:700; color:var(--text-primary); }
  .avis-author-role { font-size:11px; color:var(--text-muted); }
  .avis-cat-badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; padding:4px 10px; border-radius:20px; white-space:nowrap; flex-shrink:0; }
  .cat-chauffeur .avis-cat-badge  { background:#eff6ff; color:var(--brand-blue); }
  .cat-service .avis-cat-badge    { background:#f0fdf4; color:var(--accent-green); }
  .cat-application .avis-cat-badge{ background:#fff7ed; color:var(--accent-orange); }

  .avis-stars { display:flex; gap:2px; }
  .star { font-size:15px; filter:grayscale(1); transition:filter 0.2s; }
  .star.on { filter:grayscale(0); }

  .avis-text { font-size:13px; color:var(--text-sec); line-height:1.65; }
  .avis-date { font-size:11px; color:var(--text-muted); margin-top:2px; }

  .avis-actions { display:flex; align-items:center; gap:8px; margin-top:2px; }
  .like-btn { display:flex; align-items:center; gap:5px; background:none; border:1.5px solid var(--border); border-radius:20px; padding:5px 12px; font-size:12px; font-weight:600; color:var(--text-sec); cursor:pointer; transition:var(--tr); font-family:inherit; }
  .like-btn:hover { border-color:var(--accent-red); color:var(--accent-red); background:#fef2f2; }
  .like-btn.liked { border-color:#fecaca; color:var(--accent-red); background:#fef2f2; }
  .delete-btn { display:flex; align-items:center; gap:4px; background:none; border:1.5px solid #fecaca; border-radius:20px; padding:5px 10px; font-size:11px; font-weight:700; color:var(--accent-red); cursor:pointer; transition:var(--tr); font-family:inherit; }
  .delete-btn:hover { background:#fef2f2; border-color:#fca5a5; transform:scale(1.04); }
  .card-actions { display:flex; align-items:center; gap:8px; margin-top:2px; }

  /* Empty state */
  .avis-empty { text-align:center; padding:60px 20px; color:var(--text-muted); }
  .avis-empty-icon { font-size:48px; margin-bottom:12px; }
  .avis-empty-title { font-size:16px; font-weight:700; color:var(--text-sec); margin-bottom:6px; }

  /* Modal */
  .modal-ov { position:fixed; inset:0; z-index:100; background:rgba(13,43,94,0.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .modal-box { background:#fff; border-radius:24px; width:100%; max-width:520px; overflow:hidden; box-shadow:var(--shadow-lg); animation:slideUp 0.25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }
  .mh { background:linear-gradient(135deg,var(--brand-dark),var(--brand-mid)); padding:22px 24px; color:#fff; }
  .mh-row { display:flex; align-items:flex-start; justify-content:space-between; }
  .mh-label { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.5); font-weight:700; margin-bottom:4px; }
  .mh-title { font-size:20px; font-weight:800; }
  .mh-close { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.14); border:none; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:15px; flex-shrink:0; transition:var(--tr); }
  .mh-close:hover { background:rgba(255,255,255,0.26); transform:rotate(90deg); }
  .modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:16px; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .form-label { font-size:11px; font-weight:700; color:var(--text-sec); letter-spacing:0.5px; text-transform:uppercase; }
  .form-select, .form-textarea { border:1.5px solid var(--border); border-radius:12px; font-size:13px; font-family:inherit; color:var(--text-primary); background:var(--bg-page); outline:none; transition:var(--tr); width:100%; }
  .form-select { padding:10px 14px; cursor:pointer; }
  .form-textarea { padding:12px 14px; resize:vertical; min-height:110px; }
  .form-select:focus, .form-textarea:focus { border-color:var(--brand-blue); background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .star-selector { display:flex; gap:6px; }
  .star-btn { font-size:26px; background:none; border:none; cursor:pointer; transition:transform 0.15s; filter:grayscale(1); }
  .star-btn:hover { transform:scale(1.2); }
  .star-btn.on { filter:grayscale(0); }
  .modal-footer { display:flex; gap:10px; justify-content:flex-end; padding:14px 24px; border-top:1px solid var(--border); }
  .btn-cancel-m { padding:10px 20px; font-size:13px; font-family:inherit; color:var(--text-sec); border:1px solid var(--border); border-radius:10px; background:#fff; cursor:pointer; transition:var(--tr); }
  .btn-cancel-m:hover { background:var(--bg-page); }
  .btn-submit-m { padding:10px 24px; font-size:13px; font-weight:700; font-family:inherit; color:#fff; border:none; border-radius:10px; background:linear-gradient(135deg,var(--brand-blue),#1a6fd4); cursor:pointer; transition:var(--tr); box-shadow:0 4px 14px rgba(41,128,232,0.3); }
  .btn-submit-m:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(41,128,232,0.4); }
  .btn-submit-m:disabled { opacity:0.5; cursor:not-allowed; }

  .toast { position:fixed; top:18px; right:18px; z-index:200; background:var(--brand-dark); color:#fff; padding:12px 18px; border-radius:12px; font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); border-left:3px solid var(--brand-light); animation:toastIn 0.3s ease; }
  @keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }

  .avis-footer { font-size:10px; color:var(--text-muted); text-align:center; padding:4px 0 10px; letter-spacing:1px; text-transform:uppercase; margin-top:20px; }

  @media (max-width:1100px) { .avis-stats { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:768px) {
    .sidebar { position:fixed; left:0; top:0; bottom:0; z-index:30; transform:translateX(-100%); width:var(--sidebar-full) !important; transition:transform 0.3s ease !important; }
    .sidebar.open { transform:translateX(0); } .sidebar.collapsed { transform:translateX(-100%); } .sidebar.collapsed.open { transform:translateX(0); }
    .sb-overlay { display:block; } .ah-menu-btn { display:flex; } .sb-toggle-btn { display:none; }
    .ac { padding:16px; } .ah { padding:0 16px; }
    .avis-grid { grid-template-columns:1fr; }
    .avis-header { flex-direction:column; gap:14px; }
  }
  @media (max-width:480px) { .user-info-r { display:none; } .avis-stats { grid-template-columns:1fr 1fr; } .ac { padding:12px; } }
`;

if (typeof document !== "undefined" && !document.getElementById("avis-page-css")) {
  const tag = document.createElement("style");
  tag.id = "avis-page-css";
  tag.textContent = avisCSS;
  document.head.appendChild(tag);
}


const CATEGORIES = ["Chauffeur", "Service", "Application"];
const CAT_ICONS = { Chauffeur: "🚗", Service: "🛎️", Application: "📱" };
const CAT_COLORS = { Chauffeur: "#2980e8", Service: "#16a34a", Application: "#f97316" };

/* Aucun avis de démonstration — chaque compte part avec une liste vide */

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
    label: "Ajouter avis",
    to: "/avisP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  },
  {
    label: "Profile",
    to: "/profilP",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  },
];

function Stars({ rating, size = 15 }) {
  return (
    <div className="avis-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star${i <= rating ? " on" : ""}`} style={{ fontSize: size }}>⭐</span>
      ))}
    </div>
  );
}

function AddAvisModal({ onClose, onSubmit, authorName, photo }) {
  const [cat, setCat] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const canSubmit = cat && rating > 0 && text.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const initials = (authorName || "A B").trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
    const colors = ["#2980e8","#16a34a","#8b5cf6","#f97316","#ef4444","#0d2b5e","#f59e0b"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    onSubmit({ author: authorName || "Anonyme", role: "Passager", initials, photo, color, cat, rating, text, date, likes: 0, liked: false });
    onClose();
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div className="mh-row">
            <div><p className="mh-label">DONNER VOTRE AVIS</p><p className="mh-title">Partager votre expérience</p></div>
            <button type="button" className="mh-close" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <select className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="">Sélectionner une catégorie…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note</label>
            <div className="star-selector">
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button" className={`star-btn${i <= (hoverRating || rating) ? " on" : ""}`}
                  onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}>⭐</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Votre avis <span style={{ fontWeight:400, textTransform:"none", color:"var(--text-muted)" }}>(min. 10 caractères)</span></label>
            <textarea className="form-textarea" value={text} onChange={e => setText(e.target.value)} placeholder="Partagez votre expérience avec l'application, le service, les chauffeurs…"/>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel-m" onClick={onClose}>Annuler</button>
          <button type="button" className="btn-submit-m" onClick={handleSubmit} disabled={!canSubmit}>Publier l'avis</button>
        </div>
      </div>
    </div>
  );
}

/* ── Clé localStorage stable par compte ── */
const AVIS_STORAGE_PREFIX = "airops_avis_v3";

function safeJsonParse(value, fallback = {}) {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}

function getAvisUserId() {
  const sources = [
    safeJsonParse(localStorage.getItem("user")),
    safeJsonParse(localStorage.getItem("authUser")),
    safeJsonParse(localStorage.getItem("airops_user")),
    safeJsonParse(sessionStorage.getItem("user")),
    safeJsonParse(sessionStorage.getItem("authUser")),
  ];
  for (const u of sources) {
    const uid = u?._id || u?.id || u?.email || u?.username || u?.name;
    if (uid) return String(uid).trim().toLowerCase();
  }
  return "default";
}

function getAvisKey() { return AVIS_STORAGE_PREFIX + "_" + getAvisUserId(); }

function readStoredAvis() {
  try {
    const raw = localStorage.getItem(getAvisKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeStoredAvis(list) {
  try { localStorage.setItem(getAvisKey(), JSON.stringify(Array.isArray(list) ? list : [])); } catch {}
}

function sameAvis(a, b) {
  return String(a.id || "") === String(b.id || "")
    || (String(a.text || "").trim() === String(b.text || "").trim()
      && String(a.date || "") === String(b.date || "")
      && String(a.cat || "") === String(b.cat || ""));
}

export default function AvisP() {
  const navigate = useNavigate();
  const { nom, photo, initials, unreadCount } = useProfileSync();

  /* ── Charger les avis du compte courant avec persistance immédiate ── */
  const [avisList, setAvisList] = useState(() => readStoredAvis());
  const [avisLoading, setAvisLoading] = useState(false);

  const saveAvisList = (updater) => {
    setAvisList(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const clean = Array.isArray(next) ? next : [];
      writeStoredAvis(clean);
      return clean;
    });
  };

  useEffect(() => {
    let cancelled = false;
    const local = readStoredAvis();
    setAvisList(local);
    setAvisLoading(true);

    fetchAvis({ limit: 50 })
      .then(res => {
        if (cancelled) return;
        const payload = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        const mapped = payload.map(a => ({
          id:       a._id || a.id || "api_" + Date.now() + "_" + Math.random(),
          author:   a.userId?.name || nom || "Anonyme",
          role:     "Passager",
          initials: (a.userId?.name || nom || "A").trim().split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase() || "A",
          photo:    a.userId?.photo || null,
          color:    "#2980e8",
          cat:      a.categorie === "chauffeur" ? "Chauffeur"
                  : a.categorie === "services"  ? "Service"
                  : "Application",
          rating:   Number(a.note) || 0,
          text:     a.message || "",
          date:     a.createdAt ? String(a.createdAt).slice(0,10) : new Date().toISOString().slice(0,10),
          statut:   a.statut || "EN_ATTENTE",
          likes:    0,
          liked:    false,
          _raw:     a
        }));
        writeStoredAvis(mapped);
        setAvisList(mapped);
      })
      .catch(() => { if (!cancelled) setAvisList(readStoredAvis()); })
      .finally(() => { if (!cancelled) setAvisLoading(false); });

    const onStorage = () => setAvisList(readStoredAvis());
    window.addEventListener("storage", onStorage);
    window.addEventListener("airops-avis-update", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("airops-avis-update", onStorage);
    };
  }, [nom]);

  const [collapsed,     setCollapsed]     = useState(false);
  const [sidebarMobile, setSidebarMobile] = useState(false);
  const [toast,         setToast]         = useState("");
  const [showModal,     setShowModal]     = useState(false);
  const [activeFilter,  setActiveFilter]  = useState("Tous");
  // Onglet principal: "avis" | "reclamation"
  const [mainTab,       setMainTab]       = useState("avis");
  // Formulaire réclamation
  const [reclForm,      setReclForm]      = useState({ categorie: "APPLICATION", description: "" });
  const [reclSubmitting,setReclSubmitting]= useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSubmitReclamation = async () => {
    if (!reclForm.description.trim() || reclForm.description.trim().length < 5) {
      setToast("⚠️ La description doit faire au moins 5 caractères.");
      return;
    }
    setReclSubmitting(true);
    try {
      await createReclamation({ categorie: reclForm.categorie, description: reclForm.description.trim() });
      setReclForm({ categorie: "APPLICATION", description: "" });
      setToast("✅ Réclamation soumise avec succès !");
    } catch (err) {
      setToast(err?.response?.data?.message || "Erreur lors de la soumission.");
    } finally { setReclSubmitting(false); }
  };

  const filters  = ["Tous", ...CATEGORIES];
  const filtered = activeFilter === "Tous" ? avisList : avisList.filter(a => a.cat === activeFilter);

  const avgRating  = avisList.length ? (avisList.reduce((s, a) => s + a.rating, 0) / avisList.length).toFixed(1) : "—";
  const totalLikes = avisList.reduce((s, a) => s + a.likes, 0);

  const handleLike = (id) => {
    saveAvisList(prev => prev.map(a =>
      a.id === id ? { ...a, liked: !a.liked, likes: a.liked ? Math.max(0, a.likes - 1) : a.likes + 1 } : a
    ));
    window.dispatchEvent(new Event("airops-avis-update"));
  };

  const handleDelete = (id) => {
    saveAvisList(prev => prev.filter(a => a.id !== id));
    window.dispatchEvent(new Event("airops-avis-update"));
    setToast("🗑️ Avis supprimé.");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleAddAvis = async (avis) => {
    const tempId = "local_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    // Ensure we have a photo even if the modal prop was slightly delayed
    const currentPhoto = avis.photo || getStoredPhoto();
    const newAvis = { ...avis, photo: currentPhoto, id: tempId, isLocal: true, statut: "EN_ATTENTE" };
    saveAvisList(prev => [newAvis, ...prev]);
    window.dispatchEvent(new Event("airops-avis-update"));
    setToast("✅ Votre avis a été publié avec succès !");

    try {
      const catMap = { "Chauffeur": "chauffeur", "Service": "services", "Application": "application" };
      const response = await createAvis({ categorie: catMap[avis.cat] || "services", note: avis.rating, message: avis.text });
      const created = response?.avis || response?.data?.avis || response?.data || response || {};
      const realId = created?._id || created?.id || tempId;
      saveAvisList(prev => prev.map(a => a.id === tempId ? { ...a, id: realId, isLocal: false, statut: created?.statut || "EN_ATTENTE" } : a));
      window.dispatchEvent(new Event("airops-avis-update"));
    } catch (err) {
      saveAvisList(prev => prev.map(a => a.id === tempId ? { ...a, isLocal: true, pendingSync: true } : a));
      setToast("⚠️ Avis enregistré localement.");
    }
  };

  const catCls = (cat) => `cat-${cat.toLowerCase()}`;

  return (
    <div className="aw">
      {sidebarMobile && <div className="sb-overlay" onClick={() => setSidebarMobile(false)}/>}

      <aside className={["sidebar", collapsed ? "collapsed" : "", sidebarMobile ? "open" : ""].filter(Boolean).join(" ")}>
        <button type="button" className="sb-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div className="sb-brand" onClick={() => navigate("/dashbordP")}>
          <div className="sb-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12"/>
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
              {item.label === "Notifications" && unreadCount > 0 ? <span className="sb-badge">{unreadCount}</span> : item.badge ? <span className="sb-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-label" style={{ paddingTop: 0 }}>Compte</div>
          <button type="button" className="sb-logout" onClick={handleLogout}>
            <span className="sb-logout-icon"><svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></span>
            <span className="sb-logout-lbl">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="am">
        <header className="ah">
          <div className="ah-left">
            <button type="button" className="ah-menu-btn" onClick={() => setSidebarMobile(v => !v)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <span className="ah-title">Ajouter avis</span>
          </div>
          <div className="ah-right">
            <div className="user-chip">
              <div className="user-info-r">
                <div className="user-name">{nom}</div>
                <div className="user-role">Passager</div>
              </div>
              <div className="user-avatar">
                {photo ? <img src={photo} alt="profil"/> : initials}
              </div>
            </div>
          </div>
        </header>

        <main className="ac">
          {/* ── Tabs: Avis / Réclamations ── */}
          <div style={{display:"none",gap:8,marginBottom:20,borderBottom:"2px solid var(--border)",paddingBottom:0}}>
            {[{id:"avis",label:"⭐ Mes Avis"}].map(tab=>(
              <button key={tab.id} type="button" onClick={()=>setMainTab(tab.id)}
                style={{padding:"10px 20px",fontFamily:"inherit",fontWeight:700,fontSize:13,border:"none",background:"none",cursor:"pointer",
                  borderBottom: mainTab===tab.id ? "2px solid #2980e8" : "2px solid transparent",
                  color: mainTab===tab.id ? "#2980e8" : "#5a6e88",
                  marginBottom: -2, transition:"all 0.2s"}}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Onglet Avis ─── */}
          {mainTab === "avis" && (<>
          <div className="avis-header">
            <div>
              <h1 className="avis-title">Mes avis</h1>
              <p className="avis-subtitle">Vos avis personnels — chaque compte ne voit que ses propres avis publiés.</p>
            </div>
            <button type="button" className="btn-add-avis" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Donner mon avis
            </button>
          </div>

          <div className="avis-filters">
            {filters.map(f => (
              <button key={f} type="button" className={`filter-btn${activeFilter === f ? " active" : ""}`} onClick={() => setActiveFilter(f)}>
                {f !== "Tous" && CAT_ICONS[f]} {f}
              </button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>{filtered.length} avis</span>
          </div>

          {filtered.length === 0 ? (
            <div className="avis-empty">
              <div className="avis-empty-icon">💬</div>
              <div className="avis-empty-title">Aucun avis pour cette catégorie</div>
              <p style={{ fontSize:13 }}>Vous n'avez pas encore d'avis dans cette catégorie. Partagez votre expérience !</p>
            </div>
          ) : (
            <div className="avis-grid">
              {filtered.map(avis => (
                <div key={avis.id} className={`avis-card ${catCls(avis.cat)}`}>
                  <div className="avis-card-top">
                    <div className="avis-author">
                      <div className="avis-avatar" style={{ background: avis.color }}>
                        {avis.photo ? (
                          <img src={avis.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                          avis.initials
                        )}
                      </div>
                      <div className="avis-author-info">
                        <span className="avis-author-name">{avis.author}</span>
                        <span className="avis-author-role">{avis.role}</span>
                      </div>
                    </div>
                    <span className="avis-cat-badge">{CAT_ICONS[avis.cat]} {avis.cat}</span>
                  </div>
                  <Stars rating={avis.rating}/>
                  <p className="avis-text">{avis.text}</p>
                  <div className="card-actions">
                    <span className="avis-date">{avis.date}</span>
                    <button type="button" className={`like-btn${avis.liked ? " liked" : ""}`} onClick={() => handleLike(avis.id)}>
                      ❤️ {avis.likes}
                    </button>
                    <button type="button" className="delete-btn" onClick={() => handleDelete(avis.id)} title="Supprimer cet avis">
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          </>)}


          <div className="avis-footer" style={{marginTop:32}}>© 2026 AirOps Transport Management</div>
        </main>
      </div>

      {showModal && <AddAvisModal onClose={() => setShowModal(false)} onSubmit={handleAddAvis} authorName={nom} photo={photo}/>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}