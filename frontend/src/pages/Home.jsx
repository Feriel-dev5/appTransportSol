import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import airopsLogo from "../assets/Logo_moderne_AirOps_avec_avion.png";
import avionNouvelair from "../assets/avion_nouvelair.png";

/* ── Responsive CSS ── */
const responsiveCSS = `
  *, *::before, *::after { box-sizing: border-box; }

  .ao-nav-links { display: flex !important; }
  .ao-hamburger  { display: none !important; }
  .ao-btn-ghost-d, .ao-btn-primary-d { display: inline-block !important; }

  .ao-nav-link {
    text-decoration: none; font-size: 15px;
    color: rgba(255,255,255,0.85); font-weight: 500;
    padding: 8px 14px; border-radius: 8px;
    transition: all 0.2s; display: inline-block;
  }
  .ao-nav-link:hover { color:#fff; background:rgba(255,255,255,0.18); }
  .ao-nav-link-active {
    text-decoration: none; font-size: 15px;
    color:#fff; font-weight:700;
    padding:8px 18px; border-radius:24px;
    background:rgba(255,255,255,0.22); display:inline-block;
  }

  .ao-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
  .ao-card {
    background:#fff; border:1px solid #e4ecf4; border-radius:20px;
    padding:28px 22px; display:flex; flex-direction:column;
    gap:12px; cursor:default;
    transition: all 0.28s ease;
    box-shadow:0 2px 12px rgba(0,0,0,0.05);
  }
  .ao-card:hover { transform:translateY(-7px); box-shadow:0 20px 40px rgba(0,0,0,0.1); }

  .ao-stats-bar {
    display:flex; flex-wrap:wrap;
    justify-content:center; align-items:center;
    background:#fff;
    border-top:1px solid #e4ecf4;
    border-bottom:1px solid #e4ecf4;
  }
  .ao-stat-item {
    display:flex; flex-direction:column; align-items:center;
    gap:2px; padding:14px 36px; position:relative;
    cursor:default; transition:background 0.2s; border-radius:0;
  }
  .ao-stat-item:hover { background:#f0f5fb; }

  .ao-hero-buttons { display:flex; gap:14px; flex-wrap:wrap; justify-content:center; margin-bottom:28px; }

  .ao-btn-hero-primary:hover  { background:#1a6fd4!important; transform:translateY(-3px); box-shadow:0 16px 32px rgba(26,111,212,0.5)!important; }
  .ao-btn-hero-outline:hover  { background:rgba(255,255,255,0.92)!important; color:#1252aa!important; transform:translateY(-3px); }
  .ao-track-btn:hover         { background:#1a6fd4!important; transform:translateY(-2px); }
  .ao-btn-ghost-d:hover       { background:rgba(255,255,255,0.22)!important; color:#fff!important; }
  .ao-btn-primary-d:hover     { background:#fff!important; color:#1a6fd4!important; transform:translateY(-2px); }
  .ao-trust-cta:hover         { background:#fff!important; color:#0d2b5e!important; transform:translateY(-3px); }
  .ao-footer-link:hover       { color:#fff!important; }
  .ao-card-link               { transition:letter-spacing 0.2s; }
  .ao-card-link:hover         { letter-spacing:0.5px; }

  .ao-footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }

  /* ── Tablette ── */
  @media (max-width:1024px) {
    .ao-grid { grid-template-columns:repeat(2,1fr)!important; }
  }

  /* ── Mobile ── */
  @media (max-width:768px) {
    .ao-nav-links      { display:none!important; }
    .ao-hamburger      { display:flex!important; }
    .ao-btn-ghost-d,
    .ao-btn-primary-d  { display:none!important; }

    .ao-grid { grid-template-columns:1fr!important; }

    .ao-hero { height:auto!important; min-height:480px!important; }
    .ao-hero-content { padding:90px 20px 40px!important; }
    .ao-hero-title { font-size:26px!important; }
    .ao-hero-subtitle { font-size:14px!important; }
    .ao-quick-track { max-width:100%!important; }

    .ao-stat-item { padding:14px 20px!important; min-width:45%!important; }
    .ao-stat-divider { display:none!important; }

    .ao-services-section { padding:60px 20px!important; }
    .ao-trust-section    { padding:30px 20px!important; }
    .ao-footer-inner { flex-direction:column!important; text-align:center!important; }
    .ao-footer-links { justify-content:center!important; }
  }

  /* ── Petit mobile ── */
  @media (max-width:480px) {
    .ao-hero { min-height:420px!important; }
    .ao-hero-content { padding:80px 16px 32px!important; }
    .ao-hero-title { font-size:21px!important; letter-spacing:-0.3px!important; }
    .ao-track-row { flex-direction:column!important; }
    .ao-track-btn { width:100%!important; }
    .ao-stat-item { min-width:50%!important; padding:12px 10px!important; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("ao-css")) {
  const tag = document.createElement("style");
  tag.id = "ao-css";
  tag.textContent = responsiveCSS;
  document.head.appendChild(tag);
}

const Home = () => {
  const navigate = useNavigate();

  const [trackingCode, setTrackingCode] = useState(() =>
    localStorage.getItem("airops_tracking_code") || ""
  );
  const [trackingTouched, setTrackingTouched] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { localStorage.setItem("airops_tracking_code", trackingCode); }, [trackingCode]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const trackingError = useMemo(() => {
    const v = trackingCode.trim();
    if (!trackingTouched) return "";
    if (!v) return "Le numéro de réservation est obligatoire.";
    if (v.length < 5) return "Le numéro doit contenir au moins 5 caractères.";
    if (!/^[a-zA-Z0-9-]+$/.test(v)) return "Utilisez seulement des lettres, chiffres ou tirets.";
    return "";
  }, [trackingCode, trackingTouched]);

  const handleTrackingSubmit = () => {
    setTrackingTouched(true);
    if (trackingError || !trackingCode.trim()) return;
    navigate("/suivre-reservation", { state: { trackingCode: trackingCode.trim() } });
  };

  return (
    <div style={s.wrapper}>

      {/* ══ NAVBAR ══ */}
      <nav style={{ ...s.navbar, ...(scrolled ? s.navbarScrolled : s.navbarTop) }}>
        <div style={s.navBrand} onClick={() => navigate("/")}>
          <img src={airopsLogo} alt="AirOps" style={s.logoImg} />
          <span style={s.brandName}>AirOps</span>
        </div>

        <ul className="ao-nav-links" style={s.navList}>
          {["Accueil", "À propos", "Navettes", "Contact"].map((item, i) => (
            <li key={item} style={{ listStyle: "none" }}>
              <a href="#" className={i === 0 ? "ao-nav-link-active" : "ao-nav-link"}>{item}</a>
            </li>
          ))}
        </ul>

        <div style={s.navAuth}>
          <button className="ao-btn-ghost-d" style={s.btnGhost} onClick={() => navigate("/login")}>Connexion</button>
          <button className="ao-btn-primary-d" style={s.btnNavPrimary} onClick={() => navigate("/inscription")}>Inscription</button>
          <button className="ao-hamburger" style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span style={{ ...s.bar, transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "" }} />
            <span style={{ ...s.bar, opacity: menuOpen ? 0 : 1 }} />
            <span style={{ ...s.bar, transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "" }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {["Accueil", "À propos", "Navettes", "Contact"].map(item => (
            <a key={item} href="#" style={s.mobileLink} onClick={() => setMenuOpen(false)}>{item}</a>
          ))}
          <button style={s.mobileBtnLogin} onClick={() => navigate("/login")}>Connexion</button>
          <button style={s.mobileBtnSignup} onClick={() => navigate("/inscription")}>Inscription</button>
        </div>
      )}

      {/* ══ HERO ══ */}
      <div className="ao-hero" style={s.heroWrapper}>
        <img src={avionNouvelair} alt="Navette AirOps" style={s.heroBg} />
        <div style={s.heroOverlay} />

        <div className="ao-hero-content" style={s.heroContent}>
          <div style={s.heroBadge}>
            <span style={s.badgeDot} />
            TRANSFERT AÉROPORT ↔ HÔTEL — TUNISIE
          </div>

          <h1 className="ao-hero-title" style={s.heroTitle}>
            Votre <span style={s.heroAccent}>navette privée</span><br />
            entre tous les aéroports et hôtels de Tunisie
          </h1>

          <p className="ao-hero-subtitle" style={s.heroSubtitle}>
            Réservez en quelques clics votre transfert depuis ou vers n'importe quel aéroport tunisien directement à votre hôtel, en toute simplicité.
          </p>

          <div className="ao-hero-buttons">
            <button className="ao-btn-hero-primary" style={s.btnHeroPrimary} onClick={() => navigate("/reserver")}>
              Réserver une Navette →
            </button>
            <button className="ao-btn-hero-outline" style={s.btnHeroOutline} onClick={() => navigate("/suivre-reservation")}>
              Suivre ma Réservation
            </button>
          </div>

          {/* ── Quick Track ── */}
          <div className="ao-quick-track" style={s.quickTrack}>
            <p style={s.quickTrackLabel}>Suivi rapide de réservation</p>
            <div className="ao-track-row" style={s.trackRow}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input
                  value={trackingCode}
                  onChange={e => setTrackingCode(e.target.value)}
                  onBlur={() => setTrackingTouched(true)}
                  onKeyDown={e => e.key === "Enter" && handleTrackingSubmit()}
                  placeholder="Ex: NAV-2026-001"
                  style={{
                    ...s.trackInput,
                    border: trackingTouched && trackingError
                      ? "1.5px solid #fca5a5"
                      : "1.5px solid rgba(255,255,255,0.4)",
                  }}
                  onFocus={e => { e.target.style.border = "1.5px solid #fff"; e.target.style.background = "rgba(255,255,255,0.28)"; }}
                />
                {trackingTouched && trackingError && <p style={s.errorText}>{trackingError}</p>}
              </div>
              <button className="ao-track-btn" style={s.trackBtn} onClick={handleTrackingSubmit}>
                Vérifier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SERVICES ══ */}
      <section className="ao-services-section" style={s.servicesSection}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTag}>NOS SERVICES</span>
          <h2 style={s.sectionTitle}>Votre transfert aéroport-hôtel en Tunisie</h2>
          <p style={s.sectionSubtitle}>
            Une solution simple et fiable pour tous vos déplacements entre les aéroports et les hôtels tunisiens.
          </p>
        </div>
        <div className="ao-grid">
          {[
            { icon: "✈️", title: "Tous les Aéroports",     text: "Couverture complète : Tunis-Carthage, Monastir, Sfax, Djerba, Tozeur, Tabarka et plus encore.", color: "#2980e8", bg: "#e8f2fd" },
            { icon: "🏨", title: "Livraison à l'Hôtel",    text: "Prise en charge directement à votre hébergement, dans toutes les destinations touristiques de Tunisie.", color: "#16a34a", bg: "#e8f5ee" },
            { icon: "📍", title: "Suivi en Temps Réel",    text: "Suivez l'arrivée de votre navette en direct depuis votre téléphone, à chaque étape du trajet.",  color: "#d97706", bg: "#fef3e2" },
            { icon: "🛡️", title: "Trajets Sécurisés",      text: "Chauffeurs professionnels agréés et véhicules climatisés régulièrement contrôlés pour votre confort.", color: "#7c3aed", bg: "#f0ebff" },
          ].map(card => (
            <div
              key={card.title}
              className="ao-card"
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.color + "55"; e.currentTarget.style.background = card.bg; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e4ecf4"; e.currentTarget.style.background = "#fff"; }}
            >
              <div style={{ ...s.cardIcon, background: card.bg, color: card.color }}>{card.icon}</div>
              <h3 style={s.cardTitle}>{card.title}</h3>
              <p style={s.cardText}>{card.text}</p>
              <a href="#" className="ao-card-link" style={{ ...s.cardLink, color: card.color }}>En savoir plus →</a>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TRUST ══ */}
      <section className="ao-trust-section" style={s.trustSection}>
        <div style={s.trustContent}>
          <span style={{ ...s.sectionTag, color: "#7ec8ff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)" }}>
            POURQUOI AIROPS
          </span>
          <h2 style={{ ...s.sectionTitle, color: "#fff", marginTop: "14px" }}>
            La confiance de milliers de voyageurs en Tunisie
          </h2>
          <p style={{ ...s.sectionSubtitle, color: "rgba(255,255,255,0.65)" }}>
            Depuis notre lancement, nous assurons des transferts ponctuels et confortables entre tous les aéroports et hôtels du pays, avec un taux de satisfaction exceptionnel.
          </p>
          <div style={s.trustAvatars}>
            {[
              "https://randomuser.me/api/portraits/men/32.jpg",
              "https://randomuser.me/api/portraits/women/44.jpg",
              "https://randomuser.me/api/portraits/men/45.jpg",
              "https://randomuser.me/api/portraits/women/68.jpg",
            ].map((src, i) => (
              <img key={i} src={src} alt="voyageur" style={{ ...s.trustAvatar, marginLeft: i === 0 ? 0 : -12 }} />
            ))}
            <span style={s.trustText}>+5 000 voyageurs nous font confiance</span>
          </div>
          <button className="ao-trust-cta" style={s.btnTrustCta} onClick={() => navigate("/reserver")}>
            Réserver maintenant →
          </button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={s.footer}>
        <div className="ao-footer-inner">
          <div style={s.footerBrand}>
            <img src={airopsLogo} alt="AirOps" style={s.footerLogo} />
            <span style={s.footerBrandName}>AirOps</span>
          </div>
          <p style={s.footerCopy}>© {new Date().getFullYear()} AirOps. Tous droits réservés.</p>
          <div className="ao-footer-links" style={s.footerLinks}>
            {["Mentions légales", "Confidentialité", "CGU"].map(link => (
              <a key={link} href="#" className="ao-footer-link" style={s.footerLink}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════ STYLES ═══════════ */
const s = {
  wrapper: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    background: "#f0f5fb", overflowX: "hidden",
  },

  navbar: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 clamp(16px,4vw,60px)", height: "72px",
    transition: "all 0.35s ease",
  },
  navbarTop: {
    background: "rgba(18,82,170,0.95)", backdropFilter: "blur(12px)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
  },
  navbarScrolled: {
    background: "#1252aa", boxShadow: "0 4px 24px rgba(0,0,0,0.22)", height: "64px",
  },
  navBrand: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  logoImg: { height: "50px", width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" },
  brandName: { fontSize: "21px", fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" },
  navList: { display: "flex", listStyle: "none", gap: "4px", margin: 0, padding: 0 },
  navAuth: { display: "flex", alignItems: "center", gap: "10px" },
  btnGhost: {
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.35)",
    color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: 600,
    cursor: "pointer", padding: "9px 20px", borderRadius: "10px", transition: "all 0.2s",
  },
  btnNavPrimary: {
    background: "#f0f8ff", color: "#1252aa", border: "none",
    padding: "9px 22px", borderRadius: "24px", fontSize: "14px",
    fontWeight: 700, cursor: "pointer", transition: "all 0.2s ease",
  },
  hamburger: { flexDirection: "column", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: "4px" },
  bar: { display: "block", width: "22px", height: "2px", background: "#fff", borderRadius: "2px", transition: "all 0.25s ease" },

  mobileMenu: {
    position: "fixed", top: "72px", left: 0, right: 0, zIndex: 99,
    background: "#1252aa", display: "flex", flexDirection: "column",
    padding: "20px 24px 28px", gap: "4px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  mobileLink: { color: "rgba(255,255,255,0.85)", textDecoration: "none", fontSize: "16px", fontWeight: 500, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  mobileBtnLogin: { marginTop: "12px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "15px", fontWeight: 600, padding: "13px", borderRadius: "12px", cursor: "pointer" },
  mobileBtnSignup: { marginTop: "8px", background: "#f0f8ff", border: "none", color: "#1252aa", fontSize: "15px", fontWeight: 700, padding: "13px", borderRadius: "12px", cursor: "pointer" },

  heroWrapper: {
    position: "relative",
    width: "100%",
    height: "520px",
    marginTop: "72px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center 34%",
    zIndex: 0,
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(10,35,100,0.50) 0%, rgba(8,28,85,0.68) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    width: "100%",
    padding: "100px clamp(20px,6vw,80px) 30px",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.32)",
    color: "#fff", fontSize: "11px", fontWeight: 700,
    letterSpacing: "1.2px", padding: "6px 16px",
    borderRadius: "24px", marginBottom: "18px",
  },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#60c4ff", boxShadow: "0 0 8px #60c4ff", display: "inline-block", flexShrink: 0 },
  heroTitle: {
    fontSize: "clamp(22px,4vw,44px)", fontWeight: 800, color: "#fff",
    lineHeight: 1.15, letterSpacing: "-0.8px", marginBottom: "12px",
    textShadow: "0 2px 14px rgba(0,0,0,0.25)",
  },
  heroAccent: { color: "#7ec8ff", fontStyle: "italic" },
  heroSubtitle: {
    fontSize: "clamp(13px,1.5vw,16px)", color: "rgba(255,255,255,0.82)",
    lineHeight: 1.65, maxWidth: "540px", marginBottom: "26px",
  },
  btnHeroPrimary: {
    background: "#2980e8", color: "#fff", border: "none",
    padding: "13px 30px", borderRadius: "32px", fontSize: "14px",
    fontWeight: 700, cursor: "pointer",
    boxShadow: "0 8px 24px rgba(26,111,212,0.4)", transition: "all 0.25s ease",
  },
  btnHeroOutline: {
    background: "rgba(255,255,255,0.14)", color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.45)",
    padding: "12px 30px", borderRadius: "32px", fontSize: "14px",
    fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 0.25s ease",
  },

  quickTrack: {
    background: "rgba(255,255,255,0.13)",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: "16px", padding: "16px 18px",
    width: "100%", maxWidth: "500px",
    backdropFilter: "blur(14px)",
  },
  quickTrackLabel: {
    fontSize: "11px", fontWeight: 700,
    color: "rgba(255,255,255,0.82)", margin: "0 0 10px 0",
    textTransform: "uppercase", letterSpacing: "0.8px",
  },
  trackRow: { display: "flex", gap: "10px", alignItems: "flex-start" },
  trackInput: {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    background: "rgba(255,255,255,0.16)", color: "#fff",
    fontSize: "14px", outline: "none", transition: "all 0.2s ease",
  },
  trackBtn: {
    background: "#2980e8", color: "#fff", border: "none",
    padding: "11px 20px", borderRadius: "10px",
    fontSize: "14px", fontWeight: 700, cursor: "pointer",
    whiteSpace: "nowrap", transition: "all 0.2s ease", flexShrink: 0,
  },
  errorText: { marginTop: "6px", fontSize: "12px", color: "#fca5a5" },

  statDivider: {
    position: "absolute", left: 0, top: "20%", height: "60%",
    width: "1px", background: "#e4ecf4",
  },
  statValue: { fontSize: "clamp(18px,2.5vw,28px)", fontWeight: 800, color: "#1252aa", letterSpacing: "-0.5px" },
  statLabel: { fontSize: "11px", color: "#5a6e88", fontWeight: 500, textAlign: "center", letterSpacing: "0.2px" },

  servicesSection: { padding: "80px clamp(20px,6vw,80px)", background: "#f0f5fb" },
  sectionHeader: { textAlign: "center", marginBottom: "50px" },
  sectionTag: {
    display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
    color: "#1252aa", background: "rgba(18,82,170,0.08)", padding: "5px 14px",
    borderRadius: "24px", marginBottom: "14px",
  },
  sectionTitle: { fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 800, color: "#0d2b5e", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: "12px" },
  sectionSubtitle: { fontSize: "15px", color: "#5a6e88", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" },
  cardIcon: { width: "50px", height: "50px", borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 },
  cardTitle: { fontSize: "16px", fontWeight: 700, color: "#0d2b5e", margin: 0 },
  cardText: { fontSize: "13px", color: "#5a6e88", lineHeight: 1.65, margin: 0, flex: 1 },
  cardLink: { fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-block" },

  trustSection: { background: "linear-gradient(135deg,#0d2b5e 0%,#1252aa 100%)", padding: "40px clamp(20px,6vw,80px)", display: "flex", justifyContent: "center" },
  trustContent: { maxWidth: "620px", textAlign: "center" },
  trustAvatars: { display: "flex", alignItems: "center", justifyContent: "center", margin: "16px 0 20px", flexWrap: "wrap", rowGap: "12px" },
  trustAvatar: { width: "44px", height: "44px", borderRadius: "50%", border: "3px solid #1252aa", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" },
  trustText: { marginLeft: "14px", fontSize: "14px", color: "rgba(255,255,255,0.62)", fontWeight: 500 },
  btnTrustCta: { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.42)", padding: "14px 36px", borderRadius: "32px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.25s ease" },

  footer: { background: "#0d2b5e", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "32px clamp(20px,6vw,80px)" },
  footerBrand: { display: "flex", alignItems: "center", gap: "10px" },
  footerLogo: { height: "34px", objectFit: "contain" },
  footerBrandName: { fontSize: "17px", fontWeight: 800, color: "#fff" },
  footerCopy: { fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 },
  footerLinks: { display: "flex", gap: "20px", flexWrap: "wrap" },
  footerLink: { fontSize: "13px", color: "rgba(255,255,255,0.55)", textDecoration: "none", transition: "color 0.2s" },
};

export default Home;