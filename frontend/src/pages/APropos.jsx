import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import airopsLogo from "../assets/Logo_moderne_AirOps_avec_avion.png";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .ap-wrapper { min-height:100vh; font-family:'DM Sans','Segoe UI',sans-serif; background:#f0f5fb; color:#0d2b5e; overflow-x:hidden; }

  /* ─── NAVBAR ─── */
  .ap-nav { position:fixed; top:0; left:0; right:0; z-index:100; height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,5vw,80px); transition:all 0.35s ease; }
  .ap-nav.scrolled { background:#1252aa; box-shadow:0 4px 24px rgba(0,0,0,0.22); }
  .ap-nav.top { background:rgba(18,82,170,0.95); backdrop-filter:blur(12px); box-shadow:0 2px 12px rgba(0,0,0,0.18); }
  .ap-nav-brand { display:flex; align-items:center; gap:10px; cursor:pointer; text-decoration:none; }
  .ap-nav-brand-name { font-size:21px; font-weight:800; color:#fff; letter-spacing:-0.4px; }
  .ap-nav-logo { height:46px; width:auto; object-fit:contain; }
  .ap-nav-links { display:flex; list-style:none; gap:4px; }
  .ap-nav-link { text-decoration:none; font-size:15px; color:rgba(255,255,255,0.85); font-weight:500; padding:8px 14px; border-radius:8px; transition:all 0.2s; display:inline-block; }
  .ap-nav-link:hover { color:#fff; background:rgba(255,255,255,0.18); }
  .ap-nav-link-active { text-decoration:none; font-size:15px; color:#fff; font-weight:700; padding:8px 18px; border-radius:24px; background:rgba(255,255,255,0.22); display:inline-block; }
  .ap-nav-auth { display:flex; align-items:center; gap:10px; }
  .ap-btn-ghost { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.35); color:rgba(255,255,255,0.9); font-size:14px; font-weight:600; cursor:pointer; padding:9px 20px; border-radius:10px; transition:all 0.2s; font-family:inherit; }
  .ap-btn-ghost:hover { background:rgba(255,255,255,0.22); color:#fff; }
  .ap-btn-primary { background:#f0f8ff; color:#1252aa; border:none; padding:9px 22px; border-radius:24px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
  .ap-btn-primary:hover { background:#fff; transform:translateY(-2px); }
  .ap-hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
  .ap-bar { display:block; width:22px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s ease; }
  .ap-mobile-menu { position:fixed; top:72px; left:0; right:0; z-index:99; background:#1252aa; display:flex; flex-direction:column; padding:20px 24px 28px; gap:4px; border-bottom:1px solid rgba(255,255,255,0.12); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
  .ap-mobile-link { color:rgba(255,255,255,0.85); text-decoration:none; font-size:16px; font-weight:500; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.1); }
  .ap-mobile-btn-login { margin-top:12px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); color:#fff; font-size:15px; font-weight:600; padding:13px; border-radius:12px; cursor:pointer; font-family:inherit; }
  .ap-mobile-btn-signup { margin-top:8px; background:#f0f8ff; border:none; color:#1252aa; font-size:15px; font-weight:700; padding:13px; border-radius:12px; cursor:pointer; font-family:inherit; }

  /* ─── HERO ─── */
  .ap-hero { margin-top:72px; background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 60%,#2980e8 100%); padding:80px clamp(20px,6vw,100px) 0; display:flex; align-items:flex-end; justify-content:center; overflow:hidden; min-height:380px; position:relative; }
  .ap-hero::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .ap-hero-content { position:relative; z-index:2; max-width:800px; text-align:center; padding-bottom:60px; }
  .ap-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); color:rgba(255,255,255,0.9); font-size:11px; font-weight:700; letter-spacing:1.5px; padding:6px 16px; border-radius:24px; margin-bottom:20px; text-transform:uppercase; }
  .ap-hero-dot { width:6px; height:6px; border-radius:50%; background:#60c4ff; box-shadow:0 0 8px #60c4ff; flex-shrink:0; }
  .ap-hero-title { font-family:'Playfair Display',serif; font-size:clamp(28px,5vw,54px); font-weight:700; color:#fff; line-height:1.15; margin-bottom:16px; }
  .ap-hero-title em { font-style:italic; color:#7ec8ff; }
  .ap-hero-sub { font-size:16px; color:rgba(255,255,255,0.72); line-height:1.7; max-width:580px; margin:0 auto; }

  /* ─── WAVE ─── */
  .ap-wave { display:block; width:100%; height:64px; }

  /* ─── SECTIONS ─── */
  .ap-section { padding:80px clamp(20px,6vw,100px); }
  .ap-section-alt { background:#fff; }
  .ap-container { max-width:1100px; margin:0 auto; }
  .ap-section-tag { display:inline-block; font-size:11px; font-weight:700; letter-spacing:1.5px; color:#1252aa; background:rgba(18,82,170,0.08); padding:5px 14px; border-radius:24px; margin-bottom:14px; text-transform:uppercase; }
  .ap-section-title { font-size:clamp(22px,3.5vw,38px); font-weight:800; color:#0d2b5e; letter-spacing:-0.8px; line-height:1.15; margin-bottom:14px; }
  .ap-section-sub { font-size:15px; color:#5a6e88; line-height:1.7; max-width:560px; }

  /* Mission 2 col */
  .ap-mission-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
  .ap-mission-text { display:flex; flex-direction:column; gap:16px; }
  .ap-mission-visual { position:relative; }
  .ap-mission-card { background:linear-gradient(135deg,#1252aa,#2980e8); border-radius:28px; padding:40px 36px; color:#fff; position:relative; overflow:hidden; }
  .ap-mission-card::before { content:'✈'; position:absolute; right:-10px; bottom:-20px; font-size:130px; opacity:0.07; line-height:1; }
  .ap-mission-stat { margin-bottom:28px; }
  .ap-mission-stat-val { font-size:48px; font-weight:800; letter-spacing:-2px; line-height:1; }
  .ap-mission-stat-lbl { font-size:13px; color:rgba(255,255,255,0.7); margin-top:4px; }
  .ap-mission-divider { height:1px; background:rgba(255,255,255,0.15); margin:20px 0; }
  .ap-mini-stats { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .ap-mini-stat-val { font-size:22px; font-weight:800; }
  .ap-mini-stat-lbl { font-size:11px; color:rgba(255,255,255,0.65); margin-top:2px; }

  /* Values */
  .ap-values-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; margin-top:50px; }
  .ap-value-card { background:#fff; border:1.5px solid #e4ecf4; border-radius:20px; padding:32px 26px; transition:all 0.28s ease; }
  .ap-value-card:hover { transform:translateY(-8px); box-shadow:0 24px 48px rgba(13,43,94,0.1); border-color:transparent; }
  .ap-value-icon { width:56px; height:56px; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:20px; }
  .ap-value-title { font-size:17px; font-weight:800; color:#0d2b5e; margin-bottom:10px; }
  .ap-value-text { font-size:13.5px; color:#5a6e88; line-height:1.65; }

  /* Team */
  .ap-team-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-top:50px; }
  .ap-team-card { background:#fff; border:1.5px solid #e4ecf4; border-radius:20px; overflow:hidden; transition:all 0.28s ease; text-align:center; }
  .ap-team-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(13,43,94,0.1); }
  .ap-team-avatar { width:100%; height:160px; display:flex; align-items:center; justify-content:center; font-size:48px; }
  .ap-team-body { padding:20px 16px 24px; }
  .ap-team-name { font-size:15px; font-weight:800; color:#0d2b5e; margin-bottom:4px; }
  .ap-team-role { font-size:12px; color:#2980e8; font-weight:600; margin-bottom:8px; }
  .ap-team-bio { font-size:12px; color:#5a6e88; line-height:1.6; }

  /* Timeline */
  .ap-timeline { margin-top:50px; position:relative; padding-left:32px; }
  .ap-timeline::before { content:''; position:absolute; left:11px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,#2980e8,#7ec8ff); border-radius:2px; }
  .ap-tl-item { position:relative; margin-bottom:36px; }
  .ap-tl-item::before { content:''; position:absolute; left:-28px; top:6px; width:14px; height:14px; border-radius:50%; background:#2980e8; border:3px solid #fff; box-shadow:0 0 0 3px rgba(41,128,232,0.25); }
  .ap-tl-year { font-size:11px; font-weight:700; color:#2980e8; letter-spacing:1px; margin-bottom:4px; text-transform:uppercase; }
  .ap-tl-title { font-size:16px; font-weight:700; color:#0d2b5e; margin-bottom:6px; }
  .ap-tl-text { font-size:13.5px; color:#5a6e88; line-height:1.6; }

  /* Categories section */
  .ap-cat-section { background:#f0f5fb; padding:80px clamp(20px,6vw,100px); }
  .ap-cat-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-top:50px; }
  .ap-cat-card { border-radius:24px; padding:40px 36px; position:relative; overflow:hidden; transition:all 0.3s ease; }
  .ap-cat-card:hover { transform:translateY(-6px); box-shadow:0 28px 56px rgba(0,0,0,0.15); }
  .ap-cat-card.vip { background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 50%,#2980e8 100%); border:1.5px solid rgba(126,200,255,0.3); }
  .ap-cat-card.normal { background:#fff; border:1.5px solid #e4ecf4; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
  .ap-cat-badge { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:1.5px; padding:5px 14px; border-radius:20px; text-transform:uppercase; margin-bottom:16px; }
  .ap-cat-badge.vip { background:rgba(255,255,255,0.15); color:#7ec8ff; border:1px solid rgba(126,200,255,0.4); }
  .ap-cat-badge.normal { background:rgba(18,82,170,0.08); color:#1252aa; }
  .ap-cat-title { font-size:clamp(18px,2vw,24px); font-weight:800; line-height:1.2; margin-bottom:14px; }
  .ap-cat-title.vip { color:#fff; }
  .ap-cat-title.normal { color:#0d2b5e; }
  .ap-cat-desc { font-size:14px; line-height:1.7; margin-bottom:20px; }
  .ap-cat-desc.vip { color:rgba(255,255,255,0.72); }
  .ap-cat-desc.normal { color:#5a6e88; }
  .ap-cat-feature { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; margin-bottom:8px; }
  .ap-cat-feature.vip { color:rgba(255,255,255,0.85); }
  .ap-cat-feature.normal { color:#3a5070; }
  .ap-cat-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .ap-cat-dot.vip { background:#7ec8ff; }
  .ap-cat-dot.normal { background:#2980e8; }
  .ap-cat-deco { position:absolute; right:-20px; bottom:-20px; font-size:120px; opacity:0.06; line-height:1; pointer-events:none; }

  /* CTA */
  .ap-cta { background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 100%); padding:80px clamp(20px,6vw,100px); text-align:center; }
  .ap-cta-title { font-size:clamp(22px,3.5vw,36px); font-weight:800; color:#fff; margin-bottom:14px; letter-spacing:-0.5px; }
  .ap-cta-sub { font-size:15px; color:rgba(255,255,255,0.7); margin-bottom:36px; }
  .ap-cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  
  .ap-cta-btn2 { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,0.4); padding:14px 36px; border-radius:32px; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.25s; font-family:inherit; }
  .ap-cta-btn2:hover { background:rgba(255,255,255,0.1); transform:translateY(-3px); }

  /* Footer */
  .ap-footer { background:#0d2b5e; border-top:1px solid rgba(255,255,255,0.1); padding:32px clamp(20px,6vw,80px); }
  .ap-footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .ap-footer-brand { display:flex; align-items:center; gap:10px; }
  .ap-footer-logo { height:34px; object-fit:contain; }
  .ap-footer-name { font-size:17px; font-weight:800; color:#fff; }
  .ap-footer-copy { font-size:13px; color:rgba(255,255,255,0.4); }
  .ap-footer-links { display:flex; gap:20px; flex-wrap:wrap; }
  .ap-footer-link { font-size:13px; color:rgba(255,255,255,0.55); text-decoration:none; transition:color 0.2s; }
  .ap-footer-link:hover { color:#fff; }

  @media(max-width:1024px) { .ap-team-grid{grid-template-columns:repeat(2,1fr)!important;} .ap-values-grid{grid-template-columns:repeat(2,1fr)!important;} .ap-cat-grid{grid-template-columns:1fr!important;} }
  @media(max-width:768px) {
    .ap-nav-links,.ap-nav-auth .ap-btn-ghost,.ap-nav-auth .ap-btn-primary{display:none!important;}
    .ap-hamburger{display:flex!important;}
    .ap-mission-grid{grid-template-columns:1fr!important;gap:32px!important;}
    .ap-values-grid{grid-template-columns:1fr!important;}
    .ap-team-grid{grid-template-columns:1fr 1fr!important;}
    .ap-cat-grid{grid-template-columns:1fr!important;}
    .ap-footer-inner{flex-direction:column!important;text-align:center!important;}
    .ap-footer-links{justify-content:center!important;}
  }
  @media(max-width:480px){ .ap-team-grid{grid-template-columns:1fr!important;} }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-apropos-css")) {
  const s = document.createElement("style"); s.id = "airops-apropos-css"; s.textContent = CSS; document.head.appendChild(s);
}

const NAV_ITEMS = [
  { label: "Accueil",  to: "/" },
  { label: "À propos", to: "/a-propos" },
  { label: "Navettes", to: "/navettes" },
  { label: "Contact",  to: "/contact" },
];

const VALUES = [
  { emoji: "⚡", title: "Réactivité", text: "Confirmation instantanée de votre réservation et notification en temps réel à chaque étape de votre trajet.", color: "#2980e8", bg: "#e8f2fd" },
  { emoji: "🛡️", title: "Fiabilité",  text: "Chauffeurs certifiés, ponctualité garantie et véhicules premium régulièrement entretenus pour votre sécurité.", color: "#7c3aed", bg: "#f0ebff" },
  { emoji: "💎", title: "Confort",    text: "Véhicules climatisés haut de gamme, accueil personnalisé et assistance 7j/7 pour une expérience sans stress.", color: "#16a34a", bg: "#e8f5ee" },
];



// AirOps créé en 2020, application lancée en 2026
const TIMELINE = [
  { year: "2020", title: "Création d'AirOps", text: "Fondation d'AirOps à Tunis avec une première flotte de véhicules dédiés aux transferts aéroport-hôtel." },
  { year: "2022", title: "Expansion nationale", text: "Extension aux aéroports de Monastir, Djerba et Sfax. Croissance rapide du réseau de chauffeurs partenaires." },
  { year: "2024", title: "Catégories VIP & Standard", text: "Lancement des deux catégories de service : navette partagée Standard et trajet privatisé VIP pour plus de flexibilité." },
  { year: "2026", title: "Plateforme digitale AirOps", text: "Lancement officiel de l'application AirOps avec suivi GPS en temps réel, réservation instantanée et interface passager dédiée." },
];

export default function APropos() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="ap-wrapper">

      {/* ─── NAVBAR ─── */}
      <nav className={`ap-nav ${scrolled ? "scrolled" : "top"}`}>
        <div className="ap-nav-brand" onClick={() => navigate("/")}>
          <img src={airopsLogo} alt="AirOps" className="ap-nav-logo" />
          <span className="ap-nav-brand-name">AirOps</span>
        </div>
        <ul className="ap-nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.label} style={{ listStyle: "none" }}>
              <a href={item.to} onClick={e => { e.preventDefault(); navigate(item.to); }}
                className={item.to === "/a-propos" ? "ap-nav-link-active" : "ap-nav-link"}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ap-nav-auth">
          <button className="ap-btn-ghost" onClick={() => navigate("/login")}>Connexion</button>
          <button className="ap-btn-primary" onClick={() => navigate("/inscription")}>Inscription</button>
          <button className="ap-hamburger" onClick={() => setMenuOpen(v => !v)}>
            <span className="ap-bar" style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "" }} />
            <span className="ap-bar" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="ap-bar" style={{ transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "" }} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="ap-mobile-menu">
          {NAV_ITEMS.map(item => (
            <a key={item.label} href={item.to} className="ap-mobile-link"
              onClick={e => { e.preventDefault(); navigate(item.to); setMenuOpen(false); }}>
              {item.label}
            </a>
          ))}
          <button className="ap-mobile-btn-login" onClick={() => navigate("/login")}>Connexion</button>
          <button className="ap-mobile-btn-signup" onClick={() => navigate("/inscription")}>Inscription</button>
        </div>
      )}

      {/* ─── HERO ─── */}
      <div className="ap-hero">
        <div className="ap-hero-content">
          <div className="ap-hero-tag">
            <span className="ap-hero-dot" />
            À PROPOS D'AIROPS
          </div>
          <h1 className="ap-hero-title">
            Le transport aéroport-hôtel<br />
            <em>réinventé pour la Tunisie</em>
          </h1>
          <p className="ap-hero-sub">
            Depuis 2020, AirOps connecte voyageurs et chauffeurs professionnels pour des transferts fluides, ponctuels et sereins à travers tout le territoire tunisien.
          </p>
        </div>
      </div>

      <svg className="ap-wave" viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "linear-gradient(135deg,#0d2b5e,#2980e8)", marginTop: -1 }}>
        <path d="M0,32 C360,80 1080,-16 1440,32 L1440,64 L0,64 Z" fill="#f0f5fb" />
      </svg>

      {/* ─── MISSION ─── */}
      <section className="ap-section ap-container" style={{ maxWidth: "none", padding: "80px clamp(20px,6vw,100px)" }}>
        <div className="ap-container">
          <div className="ap-mission-grid">
            <div className="ap-mission-text">
              <span className="ap-section-tag">NOTRE MISSION</span>
              <h2 className="ap-section-title">Rendre le transport aéroport accessible, fiable et digital</h2>
              <p className="ap-section-sub">
                AirOps est né d'un constat simple : les voyageurs arrivant dans les aéroports tunisiens méritaient mieux qu'une attente incertaine ou une course de taxi non réglementée.
              </p>
              <p style={{ fontSize: "14px", color: "#5a6e88", lineHeight: 1.7 }}>
                Notre plateforme connecte en temps réel les passagers avec des chauffeurs professionnels certifiés, offrant une expérience de transport moderne, transparente et confortable — de la réservation jusqu'à l'arrivée à l'hôtel.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}>
                {[["Ponctualité", "#2980e8"], ["Confort", "#7c3aed"], ["Transparence", "#16a34a"]].map(([tag, color]) => (
                  <span key={tag} style={{ background: color + "15", color, fontSize: "12px", fontWeight: 700, padding: "5px 14px", borderRadius: "20px" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="ap-mission-visual">
              <div className="ap-mission-card">
                <div className="ap-mission-stat">
                  <div className="ap-mission-stat-val">Depuis 2020</div>
                  <div className="ap-mission-stat-lbl">AirOps au service des voyageurs tunisiens</div>
                </div>
                <div className="ap-mission-divider" />
                <div className="ap-mini-stats">
                  {[["200+", "missions/sem."], ["7", "aéroports"], ["98%", "satisfaction"], ["24/7", "disponible"]].map(([v, l]) => (
                    <div key={l}>
                      <div className="ap-mini-stat-val">{v}</div>
                      <div className="ap-mini-stat-lbl">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATÉGORIES ─── */}
      <div className="ap-cat-section">
        <div className="ap-container">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <span className="ap-section-tag">NOS CATÉGORIES</span>
            <h2 className="ap-section-title" style={{ fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 800, color: "#0d2b5e", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: "12px" }}>
              Deux formules adaptées à vos besoins
            </h2>
            <p style={{ fontSize: "15px", color: "#5a6e88", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" }}>
              Voyagez seul en VIP ou partagez une navette confortable avec d'autres passagers.
            </p>
          </div>
          <div className="ap-cat-grid">
            {/* VIP */}
            <div className="ap-cat-card vip">
              <div className="ap-cat-badge vip">⭐ Catégorie VIP</div>
              <div className="ap-cat-title vip">Navette Privée — Pour vous seul</div>
              <div className="ap-cat-desc vip">
                Réservez un véhicule entièrement dédié à votre trajet. Vous voyagez seul, sans aucun autre passager dans le même véhicule. Le chauffeur vous attend à la sortie et vous conduit directement à destination.
              </div>
              {["Véhicule privatisé, aucun autre passager", "Départ immédiat à votre arrivée", "Trajet direct sans détour", "Véhicule premium climatisé"].map(f => (
                <div key={f} className="ap-cat-feature vip">
                  <span className="ap-cat-dot vip" />
                  {f}
                </div>
              ))}
              <div className="ap-cat-deco">✈</div>
            </div>
            {/* Standard */}
            <div className="ap-cat-card normal">
              <div className="ap-cat-badge normal">🚐 Catégorie Standard</div>
              <div className="ap-cat-title normal">Navette Partagée — Économique & Confortable</div>
              <div className="ap-cat-desc normal">
                Partagez votre navette avec d'autres voyageurs se rendant dans la même direction. Une solution économique, confortable et fiable pour tous les budgets.
              </div>
              {["Navette mutualisée avec d'autres passagers", "Tarifs accessibles et compétitifs", "Véhicule climatisé et entretenu", "Chauffeurs professionnels certifiés"].map(f => (
                <div key={f} className="ap-cat-feature normal">
                  <span className="ap-cat-dot normal" />
                  {f}
                </div>
              ))}
              <div className="ap-cat-deco">🏨</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── VALUES ─── */}
      <section className="ap-section ap-section-alt" style={{ padding: "80px clamp(20px,6vw,100px)" }}>
        <div className="ap-container">
          <div style={{ textAlign: "center", marginBottom: 0 }}>
            <span className="ap-section-tag">NOS VALEURS</span>
            <h2 className="ap-section-title">Ce qui nous distingue</h2>
          </div>
          <div className="ap-values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="ap-value-card">
                <div className="ap-value-icon" style={{ background: v.bg, color: v.color }}>{v.emoji}</div>
                <div className="ap-value-title">{v.title}</div>
                <div className="ap-value-text">{v.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="ap-section" style={{ padding: "80px clamp(20px,6vw,100px)" }}>
        <div className="ap-container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "start" }}>
            <div>
              <span className="ap-section-tag">NOTRE PARCOURS</span>
              <h2 className="ap-section-title">Une histoire construite étape par étape</h2>
              <p className="ap-section-sub">De la création en 2020 au lancement de notre plateforme digitale en 2026, AirOps grandit avec ses voyageurs.</p>
            </div>
            <div className="ap-timeline">
              {TIMELINE.map(t => (
                <div key={t.year} className="ap-tl-item">
                  <div className="ap-tl-year">{t.year}</div>
                  <div className="ap-tl-title">{t.title}</div>
                  <div className="ap-tl-text">{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ─── */}
    

      {/* ─── CTA ─── */}
      <div className="ap-cta">
        <h2 className="ap-cta-title">Prêt à voyager avec AirOps ?</h2>
        <p className="ap-cta-sub">Réservez votre navette en quelques clics et profitez d'un transfert sans stress.</p>
        <div className="ap-cta-btns">
      
          <button className="ap-cta-btn2" onClick={() => navigate("/navettes")}>Voir nos navettes</button>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="ap-footer">
        <div className="ap-footer-inner">
          <div className="ap-footer-brand">
            <img src={airopsLogo} alt="AirOps" className="ap-footer-logo" />
            <span className="ap-footer-name">AirOps</span>
          </div>
          <p className="ap-footer-copy">© {new Date().getFullYear()} AirOps. Tous droits réservés.</p>
         
        </div>
      </footer>
    </div>
  );
}