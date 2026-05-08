import api from "../services/api";
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

  /* ── Categories VIP/Normal ── */
  .ao-cat-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-top:48px; }
  .ao-cat-card {
    border-radius:24px; padding:40px 36px; position:relative; overflow:hidden;
    display:flex; flex-direction:column; gap:16px;
    transition: all 0.3s ease;
    cursor: default;
  }
  .ao-cat-card:hover { transform:translateY(-6px); box-shadow:0 28px 56px rgba(0,0,0,0.15); }
  .ao-cat-card.vip {
    background: linear-gradient(135deg,#0d2b5e 0%,#1252aa 50%,#2980e8 100%);
    border: 1.5px solid rgba(126,200,255,0.3);
  }
  .ao-cat-card.normal {
    background: #fff;
    border: 1.5px solid #e4ecf4;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }
  .ao-cat-badge {
    display: inline-flex; align-items:center; gap:6px;
    font-size:11px; font-weight:700; letter-spacing:1.5px;
    padding:5px 14px; border-radius:20px;
    text-transform:uppercase; width:fit-content;
  }
  .ao-cat-badge.vip { background:rgba(255,255,255,0.15); color:#7ec8ff; border:1px solid rgba(126,200,255,0.4); }
  .ao-cat-badge.normal { background:rgba(18,82,170,0.08); color:#1252aa; }
  .ao-cat-title { font-size:clamp(20px,2.5vw,28px); font-weight:800; line-height:1.15; }
  .ao-cat-title.vip { color:#fff; }
  .ao-cat-title.normal { color:#0d2b5e; }
  .ao-cat-desc { font-size:14px; line-height:1.7; }
  .ao-cat-desc.vip { color:rgba(255,255,255,0.72); }
  .ao-cat-desc.normal { color:#5a6e88; }
  .ao-cat-features { display:flex; flex-direction:column; gap:8px; }
  .ao-cat-feature { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:500; }
  .ao-cat-feature.vip { color:rgba(255,255,255,0.85); }
  .ao-cat-feature.normal { color:#3a5070; }
  .ao-cat-feature-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
  .ao-cat-feature-dot.vip { background:#7ec8ff; }
  .ao-cat-feature-dot.normal { background:#2980e8; }
  .ao-cat-deco { position:absolute; right:-20px; bottom:-20px; font-size:120px; opacity:0.06; line-height:1; pointer-events:none; }

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
  .ao-btn-ghost-d:hover       { background:rgba(255,255,255,0.22)!important; color:#fff!important; }
  .ao-btn-primary-d:hover     { background:#fff!important; color:#1a6fd4!important; transform:translateY(-2px); }
  .ao-trust-cta:hover         { background:#fff!important; color:#0d2b5e!important; transform:translateY(-3px); }
  .ao-footer-link:hover       { color:#fff!important; }
  .ao-card-link               { transition:letter-spacing 0.2s; }
  .ao-card-link:hover         { letter-spacing:0.5px; }

  .ao-footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }

  /* ── Testimonials ── */
  .ao-testimonials-slider { width:100%; overflow:hidden; margin-top:40px; position:relative; padding:10px 0 40px; }
  .ao-testimonials-track { display:flex; gap:24px; transition:transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
  .ao-testimonial { 
    flex: 0 0 calc(33.333% - 16px); 
    background:#fff; border:1px solid #e4ecf4; border-radius:24px; padding:32px; 
    box-shadow:0 10px 30px rgba(13,43,94,0.05); transition:all 0.3s;
    display:flex; flex-direction:column; justify-content:space-between;
  }
  @media (max-width:1024px) { .ao-testimonial { flex:0 0 calc(50% - 12px); } }
  @media (max-width:768px)  { .ao-testimonial { flex:0 0 100%; } }
  .ao-testimonial:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(13,43,94,0.1); border-color:#2980e8; }
  .ao-slider-dots { display:flex; justify-content:center; gap:8px; margin-top:30px; }
  .ao-dot { width:8px; height:8px; border-radius:50%; background:#e4ecf4; cursor:pointer; transition:all 0.3s; }
  .ao-dot.active { width:24px; background:#2980e8; border-radius:4px; }
  .ao-testimonial-stars { color:#f59e0b; font-size:14px; letter-spacing:2px; }
  .ao-testimonial-text { font-size:14px; color:#3a5070; line-height:1.7; font-style:italic; flex:1; }
  .ao-testimonial-author { display:flex; align-items:center; gap:10px; }
  .ao-testimonial-avatar { width:38px; height:38px; border-radius:50%; object-fit:cover; border:2px solid #e4ecf4; }
  .ao-testimonial-name { font-size:13px; font-weight:700; color:#0d2b5e; }

  /* ── Tablette ── */
  @media (max-width:1024px) {
    .ao-grid { grid-template-columns:repeat(2,1fr)!important; }
    .ao-cat-grid { grid-template-columns:1fr!important; }
  }

  /* ── Mobile ── */
  @media (max-width:768px) {
    .ao-nav-links      { display:none!important; }
    .ao-hamburger      { display:flex!important; }
    .ao-btn-ghost-d,
    .ao-btn-primary-d  { display:none!important; }

    .ao-grid { grid-template-columns:1fr!important; }
    .ao-cat-grid { grid-template-columns:1fr!important; }

    .ao-hero { height:auto!important; min-height:480px!important; }
    .ao-hero-content { padding:90px 20px 40px!important; }
    .ao-hero-title { font-size:26px!important; }
    .ao-hero-subtitle { font-size:14px!important; }

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
    .ao-stat-item { min-width:50%!important; padding:12px 10px!important; }
    .ao-cat-card { padding:28px 22px!important; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("ao-css")) {
  const tag = document.createElement("style");
  tag.id = "ao-css";
  tag.textContent = responsiveCSS;
  document.head.appendChild(tag);
}

/* ── Témoignages de secours (si aucun avis accepté en base) ── */
const FALLBACK_TESTIMONIALS = [
  { text: "Service impeccable ! Le chauffeur était à l'heure et très professionnel. Je recommande vivement AirOps pour tous les transferts aéroport.", name: "Mehdi B.", origin: "Tunis", stars: "★★★★★", src: "https://randomuser.me/api/portraits/men/32.jpg" },
  { text: "J'ai opté pour la navette VIP et c'était une expérience exceptionnelle. Véhicule luxueux, trajet privé, rien à partager avec personne.", name: "Sarra K.", origin: "Sousse", stars: "★★★★★", src: "https://randomuser.me/api/portraits/women/44.jpg" },
  { text: "Réservation en 2 minutes, confirmation immédiate. Le suivi GPS en temps réel m'a vraiment rassurée. Je reviendrai !", name: "Fatma L.", origin: "Sfax", stars: "★★★★★", src: "https://randomuser.me/api/portraits/women/68.jpg" },
];

/* ── Helpers ── */
function passengerAbbrev(name) {
  if (!name) return "Anonyme";
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const prenom = parts[0];
  const nom = parts[parts.length - 1];
  return `${nom}.${prenom[0].toUpperCase()}`;
}

function noteToStars(note) {
  const n = Math.round(Number(note) || 0);
  return "★".repeat(Math.max(0, Math.min(5, n))) + "☆".repeat(5 - Math.max(0, Math.min(5, n)));
}

const Home = () => {
  const navigate = useNavigate();

  const [trackingCode, setTrackingCode] = useState(() =>
    localStorage.getItem("airops_tracking_code") || ""
  );
  const [trackingTouched, setTrackingTouched] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Avis acceptés depuis l'API ── */
  const [apiTestimonials, setApiTestimonials] = useState([]);

  useEffect(() => {
    api.get("/avis/acceptes")
      .then(res => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        if (list.length > 0) setApiTestimonials(list);
      })
      .catch(() => {}); // fallback silencieux vers les témoignages statiques
  }, []);

  /* Si des avis acceptés existent en base → les afficher, sinon fallback statique */
  const testimonials = apiTestimonials.length > 0
    ? apiTestimonials.map(a => {
        // userId might be populated (object) or just an ID (string)
        const userObj = (typeof a.userId === 'object' && a.userId !== null) ? a.userId : {};
        const userName = userObj.name || (typeof a.userId === 'string' ? "Passager" : "Passager");
        let photoSrc = userObj.photo || null;

        // Ensure photo has data URI prefix if it's a raw base64 string
        if (photoSrc && photoSrc.length > 50 && !photoSrc.startsWith("data:")) {
          photoSrc = `data:image/jpeg;base64,${photoSrc}`;
        }

        return {
          text:   a.message || "",
          name:   passengerAbbrev(userName),
          origin: "Client AirOps",
          stars:  noteToStars(a.note),
          src:    photoSrc,
        };
      })
    : FALLBACK_TESTIMONIALS;

  useEffect(() => {
    localStorage.setItem("airops_tracking_code", trackingCode);
  }, [trackingCode]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (testimonials.length <= 3) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (testimonials.length - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials]);

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
    navigate("/login");
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
          {[
            { label: "Accueil", to: "/" },
            { label: "À propos", to: "/a-propos" },
            { label: "Navettes", to: "/navettes" },
            { label: "Contact", to: "/contact" },
          ].map((item, i) => (
            <li key={item.label} style={{ listStyle: "none" }}>
              <a
                href={item.to}
                onClick={e => { e.preventDefault(); navigate(item.to); }}
                className={i === 0 ? "ao-nav-link-active" : "ao-nav-link"}
              >
                {item.label}
              </a>
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

      {/* Menu mobile */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {[
            { label: "Accueil", to: "/" },
            { label: "À propos", to: "/a-propos" },
            { label: "Navettes", to: "/navettes" },
            { label: "Contact", to: "/contact" },
          ].map(item => (
            <a key={item.label} href={item.to} style={s.mobileLink}
              onClick={e => { e.preventDefault(); navigate(item.to); setMenuOpen(false); }}>
              {item.label}
            </a>
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
            <button className="ao-btn-hero-primary" style={s.btnHeroPrimary} onClick={() => navigate("/login")}>
              ✈ Réserver une Navette
            </button>
            <button className="ao-btn-hero-outline" style={s.btnHeroOutline} onClick={() => navigate("/login")}>
              Suivre ma Réservation
            </button>
          </div>
        </div>
      </div>

      {/* ══ NOS CATÉGORIES ══ */}
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#f0f5fb" }}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTag}>NOS CATÉGORIES</span>
          <h2 style={s.sectionTitle}>Deux formules, un seul standard de qualité</h2>
          <p style={s.sectionSubtitle}>
            Choisissez l'expérience qui vous correspond : voyage en groupe partagé ou trajet entièrement privatisé.
          </p>
        </div>
        <div className="ao-cat-grid">

          {/* VIP */}
          <div className="ao-cat-card vip">
            <div className="ao-cat-badge vip">⭐ Catégorie VIP</div>
            <div className="ao-cat-title vip">Navette Privée<br />Exclusivement pour vous</div>
            <div className="ao-cat-desc vip">
              Voyagez seul dans votre véhicule dédié, sans partager avec d'autres passagers. Un chauffeur personnel vous attend à votre arrivée et vous conduit directement à destination.
            </div>
            <div className="ao-cat-features">
              {[
                "Véhicule privatisé — aucun autre passager",
                "Prise en charge immédiate à la descente d'avion",
                "Itinéraire direct, sans détour",
                "Véhicule premium climatisé",
                "Disponible 24h/24, 7j/7",
              ].map(f => (
                <div key={f} className="ao-cat-feature vip">
                  <span className="ao-cat-feature-dot vip" />
                  {f}
                </div>
              ))}
            </div>
            <button
              style={{ marginTop: "8px", background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff", padding: "13px 28px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", width: "fit-content" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
              onClick={() => navigate("/login")}
            >
              Réserver en VIP →
            </button>
            <div className="ao-cat-deco">✈</div>
          </div>

          {/* Standard */}
          <div className="ao-cat-card normal">
            <div className="ao-cat-badge normal">🚐 Catégorie Standard</div>
            <div className="ao-cat-title normal">Navette Partagée<br />Économique & Confortable</div>
            <div className="ao-cat-desc normal">
              Partagez votre navette avec d'autres passagers se dirigeant vers la même destination. Une option économique sans compromis sur le confort ni la sécurité.
            </div>
            <div className="ao-cat-features">
              {[
                "Navette partagée avec d'autres voyageurs",
                "Tarifs réduits et accessibles",
                "Véhicule climatisé confortable",
                "Chauffeurs professionnels certifiés",
                "Idéal pour les familles et groupes",
              ].map(f => (
                <div key={f} className="ao-cat-feature normal">
                  <span className="ao-cat-feature-dot normal" />
                  {f}
                </div>
              ))}
            </div>
            <button
              style={{ marginTop: "8px", background: "#2980e8", border: "none", color: "#fff", padding: "13px 28px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", width: "fit-content", boxShadow: "0 6px 20px rgba(41,128,232,0.3)" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a6fd4"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#2980e8"; e.currentTarget.style.transform = ""; }}
              onClick={() => navigate("/login")}
            >
              Réserver Standard →
            </button>
            <div className="ao-cat-deco">🏨</div>
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section style={{ padding: "80px clamp(20px,6vw,80px)", background: "#fff" }}>
        <div style={s.sectionHeader}>
          <span style={s.sectionTag}>TÉMOIGNAGES</span>
          <h2 style={s.sectionTitle}>Ce que disent nos voyageurs</h2>
          <p style={s.sectionSubtitle}>Des milliers de passagers satisfaits nous font confiance chaque année.</p>
        </div>
        <div className="ao-testimonials-slider">
          <div 
            className="ao-testimonials-track" 
            style={{ transform: `translateX(calc(-${currentSlide * (100 / 3.03)}%))` }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="ao-testimonial">
                <div style={{ flex: 1 }}>
                  <div className="ao-testimonial-stars">{t.stars}</div>
                  <p className="ao-testimonial-text">"{t.text}"</p>
                </div>
                  <div className="ao-testimonial-author">
                    {t.src && t.src.length > 10
                      ? <img src={t.src} alt={t.name} className="ao-testimonial-avatar" key={t.src.substring(0,20)} />
                      : <div className="ao-testimonial-avatar" style={{
                          background: "linear-gradient(135deg,#2980e8,#0d2b5e)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 13, fontWeight: 800,
                        }}>
                          {(t.name || "A").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                    }
                    <div>
                      <div className="ao-testimonial-name">{t.name}</div>
                      <div className="ao-testimonial-origin">{t.origin}</div>
                    </div>
                  </div>
              </div>
            ))}
          </div>
          
          {testimonials.length > 3 && (
            <div className="ao-slider-dots">
              {Array.from({ length: testimonials.length - 2 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`ao-dot ${currentSlide === i ? "active" : ""}`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══ TRUST / CTA ══ */}
      <section className="ao-trust-section" style={s.trustSection}>
        <div style={s.trustContent}>
          <span style={{ ...s.sectionTag, color: "#7ec8ff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)" }}>
            POURQUOI AIROPS
          </span>
          <h2 style={{ ...s.sectionTitle, color: "#fff", marginTop: "14px" }}>
            La confiance de voyageurs à travers toute la Tunisie
          </h2>
          <p style={{ ...s.sectionSubtitle, color: "rgba(255,255,255,0.65)" }}>
            Depuis notre lancement, nous assurons des transferts ponctuels et confortables entre tous les aéroports et hôtels du pays, avec un taux de satisfaction exceptionnel.
          </p>
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
    position: "relative", width: "100%", height: "580px",
    marginTop: "72px", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  heroBg: {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", objectPosition: "center 34%", zIndex: 0,
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, rgba(10,35,100,0.55) 0%, rgba(8,28,85,0.72) 100%)",
    zIndex: 1,
  },
  heroContent: {
    position: "relative", zIndex: 2,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", width: "100%",
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
    fontSize: "clamp(22px,4vw,46px)", fontWeight: 800, color: "#fff",
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
    padding: "14px 32px", borderRadius: "32px", fontSize: "15px",
    fontWeight: 700, cursor: "pointer",
    boxShadow: "0 8px 24px rgba(26,111,212,0.4)", transition: "all 0.25s ease",
  },
  btnHeroOutline: {
    background: "rgba(255,255,255,0.14)", color: "#fff",
    border: "1.5px solid rgba(255,255,255,0.45)",
    padding: "13px 32px", borderRadius: "32px", fontSize: "15px",
    fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)", transition: "all 0.25s ease",
  },

  sectionHeader: { textAlign: "center", marginBottom: "50px" },
  sectionTag: {
    display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
    color: "#1252aa", background: "rgba(18,82,170,0.08)", padding: "5px 14px",
    borderRadius: "24px", marginBottom: "14px",
  },
  sectionTitle: { fontSize: "clamp(22px,3.5vw,38px)", fontWeight: 800, color: "#0d2b5e", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: "12px" },
  sectionSubtitle: { fontSize: "15px", color: "#5a6e88", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto" },

  trustSection: { background: "linear-gradient(135deg,#0d2b5e 0%,#1252aa 100%)", padding: "60px clamp(20px,6vw,80px)", display: "flex", justifyContent: "center" },
  trustContent: { maxWidth: "620px", textAlign: "center" },

  footer: { background: "#0d2b5e", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "32px clamp(20px,6vw,80px)" },
  footerBrand: { display: "flex", alignItems: "center", gap: "10px" },
  footerLogo: { height: "34px", objectFit: "contain" },
  footerBrandName: { fontSize: "17px", fontWeight: 800, color: "#fff" },
  footerCopy: { fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 },
};

export default Home;