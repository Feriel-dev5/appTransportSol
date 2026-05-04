import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import airopsLogo from "../assets/Logo_moderne_AirOps_avec_avion.png";
import vehicleBerline from "../assets/vehicle_berline.png";
import vehicleMinivan from "../assets/vehicle_minivan.png";
import vehicleBus from "../assets/vehicle_bus.png";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .nv-wrapper { min-height:100vh; font-family:'DM Sans','Segoe UI',sans-serif; background:#f0f5fb; color:#0d2b5e; overflow-x:hidden; }

  /* ─── NAVBAR ─── */
  .nv-nav { position:fixed; top:0; left:0; right:0; z-index:100; height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,5vw,80px); transition:all 0.35s ease; }
  .nv-nav.scrolled { background:#1252aa; box-shadow:0 4px 24px rgba(0,0,0,0.22); }
  .nv-nav.top { background:rgba(18,82,170,0.95); backdrop-filter:blur(12px); box-shadow:0 2px 12px rgba(0,0,0,0.18); }
  .nv-nav-brand { display:flex; align-items:center; gap:10px; cursor:pointer; }
  .nv-nav-brand-name { font-size:21px; font-weight:800; color:#fff; letter-spacing:-0.4px; }
  .nv-nav-logo { height:46px; width:auto; object-fit:contain; }
  .nv-nav-links { display:flex; list-style:none; gap:4px; }
  .nv-nav-link { text-decoration:none; font-size:15px; color:rgba(255,255,255,0.85); font-weight:500; padding:8px 14px; border-radius:8px; transition:all 0.2s; display:inline-block; }
  .nv-nav-link:hover { color:#fff; background:rgba(255,255,255,0.18); }
  .nv-nav-link-active { text-decoration:none; font-size:15px; color:#fff; font-weight:700; padding:8px 18px; border-radius:24px; background:rgba(255,255,255,0.22); display:inline-block; }
  .nv-nav-auth { display:flex; align-items:center; gap:10px; }
  .nv-btn-ghost { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.35); color:rgba(255,255,255,0.9); font-size:14px; font-weight:600; cursor:pointer; padding:9px 20px; border-radius:10px; transition:all 0.2s; font-family:inherit; }
  .nv-btn-ghost:hover { background:rgba(255,255,255,0.22); color:#fff; }
  .nv-btn-primary { background:#f0f8ff; color:#1252aa; border:none; padding:9px 22px; border-radius:24px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
  .nv-btn-primary:hover { background:#fff; transform:translateY(-2px); }
  .nv-hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
  .nv-bar { display:block; width:22px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s ease; }
  .nv-mobile-menu { position:fixed; top:72px; left:0; right:0; z-index:99; background:#1252aa; display:flex; flex-direction:column; padding:20px 24px 28px; gap:4px; border-bottom:1px solid rgba(255,255,255,0.12); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
  .nv-mobile-link { color:rgba(255,255,255,0.85); text-decoration:none; font-size:16px; font-weight:500; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.1); }
  .nv-mobile-btn-login { margin-top:12px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); color:#fff; font-size:15px; font-weight:600; padding:13px; border-radius:12px; cursor:pointer; font-family:inherit; }
  .nv-mobile-btn-signup { margin-top:8px; background:#f0f8ff; border:none; color:#1252aa; font-size:15px; font-weight:700; padding:13px; border-radius:12px; cursor:pointer; font-family:inherit; }

  /* ─── HERO ─── */
  .nv-hero { margin-top:72px; background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 60%,#2980e8 100%); padding:80px clamp(20px,6vw,100px) 60px; text-align:center; position:relative; overflow:hidden; }
  .nv-hero::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .nv-hero-content { position:relative; z-index:2; max-width:720px; margin:0 auto; }
  .nv-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); color:rgba(255,255,255,0.9); font-size:11px; font-weight:700; letter-spacing:1.5px; padding:6px 16px; border-radius:24px; margin-bottom:20px; text-transform:uppercase; }
  .nv-hero-dot { width:6px; height:6px; border-radius:50%; background:#60c4ff; box-shadow:0 0 8px #60c4ff; flex-shrink:0; }
  .nv-hero-title { font-size:clamp(28px,5vw,52px); font-weight:800; color:#fff; line-height:1.12; margin-bottom:16px; letter-spacing:-1px; }
  .nv-hero-title span { color:#7ec8ff; }
  .nv-hero-sub { font-size:16px; color:rgba(255,255,255,0.72); line-height:1.7; margin-bottom:36px; }

  /* ─── SEARCH BOX ─── */
  .nv-search-box { background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); border-radius:20px; padding:24px; max-width:720px; margin:0 auto; backdrop-filter:blur(14px); }
  .nv-search-grid { display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:12px; align-items:end; }
  .nv-search-field { display:flex; flex-direction:column; gap:6px; }
  .nv-search-label { font-size:10px; font-weight:700; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:1px; }
  .nv-search-select, .nv-search-input { width:100%; padding:11px 14px; border-radius:10px; background:rgba(255,255,255,0.14); border:1.5px solid rgba(255,255,255,0.3); color:#fff; font-size:14px; font-family:inherit; outline:none; cursor:pointer; transition:all 0.2s; }
  .nv-search-select:focus, .nv-search-input:focus { background:rgba(255,255,255,0.25); border-color:#fff; }
  .nv-search-select option { background:#1252aa; color:#fff; }
  .nv-search-input::placeholder { color:rgba(255,255,255,0.5); }
  .nv-search-btn { padding:11px 28px; background:#2980e8; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; white-space:nowrap; box-shadow:0 4px 16px rgba(41,128,232,0.4); }
  .nv-search-btn:hover { background:#1a6fd4; transform:translateY(-2px); }

 
  /* ─── CATEGORIES ─── */
  .nv-section { padding:80px clamp(20px,6vw,100px); }
  .nv-section-alt { background:#fff; }
  .nv-container { max-width:1100px; margin:0 auto; }
  .nv-section-tag { display:inline-block; font-size:11px; font-weight:700; letter-spacing:1.5px; color:#1252aa; background:rgba(18,82,170,0.08); padding:5px 14px; border-radius:24px; margin-bottom:14px; text-transform:uppercase; }
  .nv-section-title { font-size:clamp(22px,3.5vw,38px); font-weight:800; color:#0d2b5e; letter-spacing:-0.8px; line-height:1.15; margin-bottom:12px; }
  .nv-section-sub { font-size:15px; color:#5a6e88; line-height:1.7; max-width:560px; margin-bottom:50px; }

  /* Category cards */
  .nv-cat-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
  .nv-cat-card { border-radius:24px; padding:44px 40px; position:relative; overflow:hidden; transition:all 0.3s ease; }
  .nv-cat-card:hover { transform:translateY(-8px); box-shadow:0 32px 64px rgba(0,0,0,0.18); }
  .nv-cat-card.vip { background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 55%,#2980e8 100%); border:1.5px solid rgba(126,200,255,0.3); }
  .nv-cat-card.normal { background:#fff; border:1.5px solid #e4ecf4; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
  .nv-cat-badge { display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; letter-spacing:1.5px; padding:5px 14px; border-radius:20px; text-transform:uppercase; margin-bottom:20px; }
  .nv-cat-badge.vip { background:rgba(255,255,255,0.15); color:#7ec8ff; border:1px solid rgba(126,200,255,0.4); }
  .nv-cat-badge.normal { background:rgba(18,82,170,0.08); color:#1252aa; }
  .nv-cat-title { font-size:clamp(20px,2.5vw,28px); font-weight:800; line-height:1.15; margin-bottom:16px; }
  .nv-cat-title.vip { color:#fff; }
  .nv-cat-title.normal { color:#0d2b5e; }
  .nv-cat-desc { font-size:14.5px; line-height:1.75; margin-bottom:24px; }
  .nv-cat-desc.vip { color:rgba(255,255,255,0.75); }
  .nv-cat-desc.normal { color:#5a6e88; }
  .nv-cat-features { display:flex; flex-direction:column; gap:10px; margin-bottom:28px; }
  .nv-cat-feature { display:flex; align-items:center; gap:10px; font-size:13.5px; font-weight:500; }
  .nv-cat-feature.vip { color:rgba(255,255,255,0.88); }
  .nv-cat-feature.normal { color:#3a5070; }
  .nv-cat-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
  .nv-cat-dot.vip { background:#7ec8ff; }
  .nv-cat-dot.normal { background:#2980e8; }
  .nv-cat-btn.vip { background:rgba(255,255,255,0.18); border:1.5px solid rgba(255,255,255,0.4); color:#fff; padding:13px 28px; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
  .nv-cat-btn.vip:hover { background:rgba(255,255,255,0.3); }
  .nv-cat-btn.normal { background:#2980e8; border:none; color:#fff; padding:13px 28px; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; box-shadow:0 6px 20px rgba(41,128,232,0.3); }
  .nv-cat-btn.normal:hover { background:#1a6fd4; transform:translateY(-2px); }
  .nv-cat-deco { position:absolute; right:-20px; bottom:-20px; font-size:130px; opacity:0.06; line-height:1; pointer-events:none; }

  /* Véhicules */
  .nv-vehicles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .nv-vehicle-card { border:1.5px solid #e4ecf4; border-radius:20px; overflow:hidden; transition:all 0.28s ease; background:#fff; }
  .nv-vehicle-card:hover { transform:translateY(-6px); box-shadow:0 20px 40px rgba(13,43,94,0.1); }
  .nv-vehicle-hero { height:140px; display:flex; align-items:center; justify-content:center; font-size:64px; }
  .nv-vehicle-body { padding:20px 22px 24px; }
  .nv-vehicle-badge { display:inline-block; font-size:10px; font-weight:700; padding:3px 10px; border-radius:20px; margin-bottom:10px; }
  .nv-vehicle-name { font-size:16px; font-weight:800; color:#0d2b5e; margin-bottom:6px; }
  .nv-vehicle-desc { font-size:13px; color:#5a6e88; line-height:1.6; margin-bottom:14px; }
  .nv-vehicle-features { display:flex; flex-wrap:wrap; gap:6px; }
  .nv-feature { font-size:11px; font-weight:600; padding:3px 10px; border-radius:8px; background:#f0f5fb; color:#5a6e88; }

  /* Comment ça marche */
  .nv-steps-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; position:relative; }
  .nv-steps-grid::before { content:''; position:absolute; top:28px; left:12.5%; right:12.5%; height:2px; background:linear-gradient(to right,#2980e8,#7ec8ff); z-index:0; }
  .nv-step { text-align:center; position:relative; z-index:1; }
  .nv-step-num { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#1252aa,#2980e8); color:#fff; font-size:20px; font-weight:800; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; box-shadow:0 4px 16px rgba(41,128,232,0.3); }
  .nv-step-title { font-size:15px; font-weight:700; color:#0d2b5e; margin-bottom:8px; }
  .nv-step-text { font-size:13px; color:#5a6e88; line-height:1.6; }

  /* Aéroports */
  .nv-airports-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .nv-airport-card { background:#fff; border:1.5px solid #e4ecf4; border-radius:16px; padding:20px 16px; text-align:center; transition:all 0.2s; cursor:default; }
  .nv-airport-card:hover { border-color:#2980e8; box-shadow:0 8px 24px rgba(41,128,232,0.1); transform:translateY(-4px); }
  .nv-airport-emoji { font-size:28px; margin-bottom:10px; }
  .nv-airport-code { font-size:18px; font-weight:800; color:#1252aa; margin-bottom:4px; }
  .nv-airport-name { font-size:12px; color:#5a6e88; line-height:1.4; }

  /* CTA */
  .nv-cta { background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 100%); padding:80px clamp(20px,6vw,100px); text-align:center; }
  .nv-cta-title { font-size:clamp(22px,3.5vw,36px); font-weight:800; color:#fff; margin-bottom:14px; letter-spacing:-0.5px; }
  .nv-cta-sub { font-size:15px; color:rgba(255,255,255,0.7); margin-bottom:36px; }
  .nv-cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  .nv-cta-btn2 { background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,0.4); padding:14px 36px; border-radius:32px; font-size:15px; font-weight:600; cursor:pointer; transition:all 0.25s; font-family:inherit; }
  .nv-cta-btn2:hover { background:rgba(255,255,255,0.1); transform:translateY(-3px); }

  /* Footer */
  .nv-footer { background:#0d2b5e; border-top:1px solid rgba(255,255,255,0.1); padding:32px clamp(20px,6vw,80px); }
  .nv-footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .nv-footer-brand { display:flex; align-items:center; gap:10px; }
  .nv-footer-logo { height:34px; object-fit:contain; }
  .nv-footer-name { font-size:17px; font-weight:800; color:#fff; }
  .nv-footer-copy { font-size:13px; color:rgba(255,255,255,0.4); }
  .nv-footer-links { display:flex; gap:20px; flex-wrap:wrap; }
  .nv-footer-link { font-size:13px; color:rgba(255,255,255,0.55); text-decoration:none; transition:color 0.2s; }
  .nv-footer-link:hover { color:#fff; }

  @media(max-width:1024px){.nv-vehicles-grid{grid-template-columns:repeat(2,1fr)!important;}.nv-airports-grid{grid-template-columns:repeat(3,1fr)!important;}.nv-steps-grid{grid-template-columns:repeat(2,1fr)!important;}.nv-steps-grid::before{display:none;}.nv-cat-grid{grid-template-columns:1fr!important;}}
  @media(max-width:768px){
    .nv-nav-links,.nv-nav-auth .nv-btn-ghost,.nv-nav-auth .nv-btn-primary{display:none!important;}
    .nv-hamburger{display:flex!important;}
    .nv-vehicles-grid{grid-template-columns:1fr!important;}
    .nv-airports-grid{grid-template-columns:repeat(2,1fr)!important;}
    .nv-search-grid{grid-template-columns:1fr!important;}
    .nv-cat-grid{grid-template-columns:1fr!important;}
    .nv-stat{padding:14px 22px!important;}
    .nv-footer-inner{flex-direction:column!important;text-align:center!important;}
    .nv-footer-links{justify-content:center!important;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-navettes-css")) {
  const s = document.createElement("style"); s.id = "airops-navettes-css"; s.textContent = CSS; document.head.appendChild(s);
}

const NAV_ITEMS = [
  { label: "Accueil",  to: "/" },
  { label: "À propos", to: "/a-propos" },
  { label: "Navettes", to: "/navettes" },
  { label: "Contact",  to: "/contact" },
];

const VEHICLES = [
  { img: vehicleBerline, name: "Berline Standard", badge: "ÉCONOMIQUE", badgeColor: "#16a34a", badgeBg: "#e8f5ee", desc: "Véhicule climatisé confortable pour 1 à 3 passagers avec bagages inclus.", features: ["1–3 passagers", "Clim.", "Wifi"], bg: "#e8f5ee" },
  { img: vehicleMinivan, name: "Minivan Premium", badge: "POPULAIRE", badgeColor: "#2980e8", badgeBg: "#e8f2fd", desc: "Idéal pour les familles ou groupes jusqu'à 7 personnes avec grand espace bagages.", features: ["4–7 passagers", "Clim.", "Wifi", "USB"], bg: "#e8f2fd" },
  { img: vehicleBus, name: "Bus de Groupe", badge: "GROUPE", badgeColor: "#d97706", badgeBg: "#fef3e2", desc: "Solution parfaite pour les excursions et arrivées de groupes importants.", features: ["8–25 passagers", "Clim.", "Guide"], bg: "#fef3e2" },
];

const STEPS = [
  { num: "1", title: "Réservez en ligne", text: "Connectez-vous, choisissez votre catégorie (VIP ou Standard)." },
  { num: "2", title: "Confirmation rapide", text: "Recevez votre confirmation et les infos du chauffeur et notification dans l'application." },
  { num: "3", title: "Prise en charge", text: "Votre chauffeur vous attend." },
  { num: "4", title: "Arrivée à l'hôtel", text: "Transfert direct, ponctuel et confortable jusqu'à votre hébergement." },
];

const AIRPORTS = [
  { emoji: "✈️", code: "TUN", name: "Tunis-Carthage" },
  { emoji: "✈️", code: "MIR", name: "Monastir Habib Bourguiba" },
  { emoji: "✈️", code: "DJE", name: "Djerba-Zarzis" },
  { emoji: "✈️", code: "SFA", name: "Sfax-Thyna" },
  { emoji: "✈️", code: "TOE", name: "Tozeur-Nefta" },
  { emoji: "✈️", code: "TBJ", name: "Tabarka-Aïn Draham" },
  { emoji: "✈️", code: "GAE", name: "Gabès Matmata" },
  { emoji: "✈️", code: "GAF", name: "Gafsa Ksar" },
];

export default function Navettes() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dep, setDep] = useState("");
  const [arr, setArr] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="nv-wrapper">

      {/* ─── NAVBAR ─── */}
      <nav className={`nv-nav ${scrolled ? "scrolled" : "top"}`}>
        <div className="nv-nav-brand" onClick={() => navigate("/")}>
          <img src={airopsLogo} alt="AirOps" className="nv-nav-logo" />
          <span className="nv-nav-brand-name">AirOps</span>
        </div>
        <ul className="nv-nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.label} style={{ listStyle: "none" }}>
              <a href={item.to} onClick={e => { e.preventDefault(); navigate(item.to); }}
                className={item.to === "/navettes" ? "nv-nav-link-active" : "nv-nav-link"}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nv-nav-auth">
          <button className="nv-btn-ghost" onClick={() => navigate("/login")}>Connexion</button>
          <button className="nv-btn-primary" onClick={() => navigate("/inscription")}>Inscription</button>
          <button className="nv-hamburger" onClick={() => setMenuOpen(v => !v)}>
            <span className="nv-bar" style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "" }} />
            <span className="nv-bar" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="nv-bar" style={{ transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "" }} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="nv-mobile-menu">
          {NAV_ITEMS.map(item => (
            <a key={item.label} href={item.to} className="nv-mobile-link"
              onClick={e => { e.preventDefault(); navigate(item.to); setMenuOpen(false); }}>
              {item.label}
            </a>
          ))}
          <button className="nv-mobile-btn-login" onClick={() => navigate("/login")}>Connexion</button>
          <button className="nv-mobile-btn-signup" onClick={() => navigate("/inscription")}>Inscription</button>
        </div>
      )}

      {/* ─── HERO ─── */}
      <div className="nv-hero">
        <div className="nv-hero-content">
          <div className="nv-hero-tag"><span className="nv-hero-dot" />NOS NAVETTES</div>
          <h1 className="nv-hero-title">
            Tous les transferts<br />
            <span>aéroport ↔ hôtel</span> en Tunisie
          </h1>
          <p className="nv-hero-sub">
            Choisissez votre catégorie de navette et réservez en ligne en toute simplicité.
          </p>
          {/* Search box */}
          <div className="nv-search-box">
            <div className="nv-search-grid">
              <div className="nv-search-field">
                <span className="nv-search-label">Départ</span>
                <select className="nv-search-select" value={dep} onChange={e => setDep(e.target.value)}>
                  <option value="">Aéroport de départ</option>
                  {AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.code} – {a.name}</option>)}
                </select>
              </div>
              <div className="nv-search-field">
                <span className="nv-search-label">Arrivée</span>
                <select className="nv-search-select" value={arr} onChange={e => setArr(e.target.value)}>
                  <option value="">Destination hôtel</option>
                  <option value="hammamet">Hammamet</option>
                  <option value="sousse">Sousse</option>
                  <option value="djerba">Djerba</option>
                  <option value="tozeur">Tozeur</option>
                  <option value="tunis">Tunis Centre</option>
                  <option value="sidi-bou-said">Sidi Bou Saïd</option>
                </select>
              </div>
              <div className="nv-search-field">
                <span className="nv-search-label">Date</span>
                <input type="date" className="nv-search-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <button className="nv-search-btn" onClick={() => navigate("/login")}>Rechercher →</button>
            </div>
          </div>
        </div>
      </div>

  

      {/* ─── CATÉGORIES ─── */}
      <section className="nv-section">
        <div className="nv-container">
          <span className="nv-section-tag">NOS CATÉGORIES</span>
          <h2 className="nv-section-title">Choisissez votre formule</h2>
          <p className="nv-section-sub">Deux catégories de navette pensées pour tous les besoins : voyagez seul en VIP ou partagez avec d'autres passagers en Standard.</p>
          <div className="nv-cat-grid">

            {/* VIP */}
            <div className="nv-cat-card vip">
              <div className="nv-cat-badge vip">⭐ Catégorie VIP</div>
              <div className="nv-cat-title vip">Navette Privée<br />Exclusivement pour vous</div>
              <div className="nv-cat-desc vip">
                Vous voyagez seul dans un véhicule entièrement réservé à votre usage. Aucun autre passager ne partage votre véhicule. Votre chauffeur personnel vous attend dès votre sortie et vous conduit directement à destination, sans détour.
              </div>
              <div className="nv-cat-features">
                {[
                  "Véhicule privatisé — aucun autre passager",
                  "Départ immédiat à votre arrivée",
                  "Trajet direct sans arrêt intermédiaire",
                  "Véhicule premium climatisé",
                  "Disponible 24h/24, 7j/7",
                ].map(f => (
                  <div key={f} className="nv-cat-feature vip">
                    <span className="nv-cat-dot vip" />
                    {f}
                  </div>
                ))}
              </div>
              <button className="nv-cat-btn vip" onClick={() => navigate("/login")}>
                Réserver en VIP →
              </button>
              <div className="nv-cat-deco">✈</div>
            </div>

            {/* Standard */}
            <div className="nv-cat-card normal">
              <div className="nv-cat-badge normal">🚐 Catégorie Standard</div>
              <div className="nv-cat-title normal">Navette Partagée<br />Économique & Confortable</div>
              <div className="nv-cat-desc normal">
                Partagez votre navette avec d'autres voyageurs se rendant dans la même direction. Une option économique et pratique qui ne compromet ni le confort ni la sécurité.
              </div>
              <div className="nv-cat-features">
                {[
                  "Navette partagée avec d'autres passagers",
                  "Tarifs compétitifs et accessibles",
                  "Véhicule climatisé et entretenu",
                  "Chauffeurs professionnels certifiés",
                  "Idéal pour familles et groupes",
                ].map(f => (
                  <div key={f} className="nv-cat-feature normal">
                    <span className="nv-cat-dot normal" />
                    {f}
                  </div>
                ))}
              </div>
              <button className="nv-cat-btn normal" onClick={() => navigate("/login")}>
                Réserver Standard →
              </button>
              <div className="nv-cat-deco">🏨</div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── VÉHICULES ─── */}
      <section className="nv-section nv-section-alt">
        <div className="nv-container">
          <span className="nv-section-tag">NOS VÉHICULES</span>
          <h2 className="nv-section-title">C'est votre confort</h2>
          <p className="nv-section-sub">Une flotte moderne adaptée à tous vos besoins, de la berline au bus de groupe.</p>
          <div className="nv-vehicles-grid">
            {VEHICLES.map(v => (
              <div key={v.name} className="nv-vehicle-card">
                <div className="nv-vehicle-hero" style={{ background: v.bg }}>
                  <img src={v.img} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div className="nv-vehicle-body">
                  <span className="nv-vehicle-badge" style={{ color: v.badgeColor, background: v.badgeBg }}>{v.badge}</span>
                  <div className="nv-vehicle-name">{v.name}</div>
                  <div className="nv-vehicle-desc">{v.desc}</div>
                  <div className="nv-vehicle-features">
                    {v.features.map(f => <span key={f} className="nv-feature">{f}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="nv-section">
        <div className="nv-container">
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <span className="nv-section-tag">COMMENT ÇA MARCHE</span>
            <h2 className="nv-section-title">Réservez en 4 étapes simples</h2>
          </div>
          <div className="nv-steps-grid">
            {STEPS.map(s => (
              <div key={s.num} className="nv-step">
                <div className="nv-step-num">{s.num}</div>
                <div className="nv-step-title">{s.title}</div>
                <div className="nv-step-text">{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AÉROPORTS ─── */}
      <section className="nv-section nv-section-alt">
        <div className="nv-container">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="nv-section-tag">AÉROPORTS COUVERTS</span>
            <h2 className="nv-section-title">Toute la Tunisie</h2>
          </div>
          <div className="nv-airports-grid">
            {AIRPORTS.map(a => (
              <div key={a.code} className="nv-airport-card">
                <div className="nv-airport-emoji">{a.emoji}</div>
                <div className="nv-airport-code">{a.code}</div>
                <div className="nv-airport-name">{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <div className="nv-cta">
        <h2 className="nv-cta-title">Votre prochaine navette vous attend</h2>
        <p className="nv-cta-sub">Créez votre compte gratuitement et réservez en moins de 2 minutes.</p>
        <div className="nv-cta-btns">
         
          <button className="nv-cta-btn2" onClick={() => navigate("/contact")}>Nous contacter</button>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <footer className="nv-footer">
        <div className="nv-footer-inner">
          <div className="nv-footer-brand">
            <img src={airopsLogo} alt="AirOps" className="nv-footer-logo" />
            <span className="nv-footer-name">AirOps</span>
          </div>
          <p className="nv-footer-copy">© {new Date().getFullYear()} AirOps. Tous droits réservés.</p>
         
        </div>
      </footer>
    </div>
  );
}