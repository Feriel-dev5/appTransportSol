import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import airopsLogo from "../assets/Logo_moderne_AirOps_avec_avion.png";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  .ct-wrapper { min-height:100vh; font-family:'DM Sans','Segoe UI',sans-serif; background:#f0f5fb; color:#0d2b5e; overflow-x:hidden; }

  /* ─── NAVBAR ─── */
  .ct-nav { position:fixed; top:0; left:0; right:0; z-index:100; height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 clamp(16px,5vw,80px); transition:all 0.35s ease; }
  .ct-nav.scrolled { background:#1252aa; box-shadow:0 4px 24px rgba(0,0,0,0.22); }
  .ct-nav.top { background:rgba(18,82,170,0.95); backdrop-filter:blur(12px); box-shadow:0 2px 12px rgba(0,0,0,0.18); }
  .ct-nav-brand { display:flex; align-items:center; gap:10px; cursor:pointer; }
  .ct-nav-brand-name { font-size:21px; font-weight:800; color:#fff; letter-spacing:-0.4px; }
  .ct-nav-logo { height:46px; width:auto; object-fit:contain; }
  .ct-nav-links { display:flex; list-style:none; gap:4px; }
  .ct-nav-link { text-decoration:none; font-size:15px; color:rgba(255,255,255,0.85); font-weight:500; padding:8px 14px; border-radius:8px; transition:all 0.2s; display:inline-block; }
  .ct-nav-link:hover { color:#fff; background:rgba(255,255,255,0.18); }
  .ct-nav-link-active { text-decoration:none; font-size:15px; color:#fff; font-weight:700; padding:8px 18px; border-radius:24px; background:rgba(255,255,255,0.22); display:inline-block; }
  .ct-nav-auth { display:flex; align-items:center; gap:10px; }
  .ct-btn-ghost { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.35); color:rgba(255,255,255,0.9); font-size:14px; font-weight:600; cursor:pointer; padding:9px 20px; border-radius:10px; transition:all 0.2s; font-family:inherit; }
  .ct-btn-ghost:hover { background:rgba(255,255,255,0.22); color:#fff; }
  .ct-btn-primary { background:#f0f8ff; color:#1252aa; border:none; padding:9px 22px; border-radius:24px; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; }
  .ct-btn-primary:hover { background:#fff; transform:translateY(-2px); }
  .ct-hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }
  .ct-bar { display:block; width:22px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s ease; }
  .ct-mobile-menu { position:fixed; top:72px; left:0; right:0; z-index:99; background:#1252aa; display:flex; flex-direction:column; padding:20px 24px 28px; gap:4px; border-bottom:1px solid rgba(255,255,255,0.12); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
  .ct-mobile-link { color:rgba(255,255,255,0.85); text-decoration:none; font-size:16px; font-weight:500; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.1); }
  .ct-mobile-btn-login { margin-top:12px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); color:#fff; font-size:15px; font-weight:600; padding:13px; border-radius:12px; cursor:pointer; font-family:inherit; }
  .ct-mobile-btn-signup { margin-top:8px; background:#f0f8ff; border:none; color:#1252aa; font-size:15px; font-weight:700; padding:13px; border-radius:12px; cursor:pointer; font-family:inherit; }

  /* ─── HERO ─── */
  .ct-hero { margin-top:72px; background:linear-gradient(135deg,#0d2b5e 0%,#1252aa 60%,#2980e8 100%); padding:80px clamp(20px,6vw,100px) 60px; text-align:center; position:relative; overflow:hidden; }
  .ct-hero::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
  .ct-hero-content { position:relative; z-index:2; max-width:620px; margin:0 auto; }
  .ct-hero-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.25); color:rgba(255,255,255,0.9); font-size:11px; font-weight:700; letter-spacing:1.5px; padding:6px 16px; border-radius:24px; margin-bottom:20px; text-transform:uppercase; }
  .ct-hero-dot { width:6px; height:6px; border-radius:50%; background:#60c4ff; box-shadow:0 0 8px #60c4ff; flex-shrink:0; }
  .ct-hero-title { font-size:clamp(28px,5vw,50px); font-weight:800; color:#fff; line-height:1.12; margin-bottom:16px; letter-spacing:-1px; }
  .ct-hero-title span { color:#7ec8ff; }
  .ct-hero-sub { font-size:15px; color:rgba(255,255,255,0.72); line-height:1.7; }

  /* ─── MAIN ─── */
  .ct-main { padding:80px clamp(20px,6vw,100px); }
  .ct-container { max-width:1100px; margin:0 auto; }
  .ct-grid { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:start; }

  /* Info côté gauche */
  .ct-section-tag { display:inline-block; font-size:11px; font-weight:700; letter-spacing:1.5px; color:#1252aa; background:rgba(18,82,170,0.08); padding:5px 14px; border-radius:24px; margin-bottom:14px; text-transform:uppercase; }
  .ct-info-title { font-size:clamp(22px,3.5vw,36px); font-weight:800; color:#0d2b5e; letter-spacing:-0.8px; line-height:1.15; margin-bottom:14px; }
  .ct-info-sub { font-size:15px; color:#5a6e88; line-height:1.7; margin-bottom:36px; }
  .ct-contact-cards { display:flex; flex-direction:column; gap:14px; margin-bottom:36px; }
  .ct-contact-card { background:#fff; border:1.5px solid #e4ecf4; border-radius:16px; padding:18px 20px; display:flex; align-items:center; gap:16px; transition:all 0.2s; }
  .ct-contact-card:hover { border-color:#2980e8; box-shadow:0 8px 24px rgba(41,128,232,0.1); transform:translateY(-2px); }
  .ct-contact-icon { width:46px; height:46px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .ct-contact-label { font-size:11px; font-weight:700; color:#5a6e88; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:3px; }
  .ct-contact-val { font-size:14px; font-weight:700; color:#0d2b5e; }

  /* Horaires */
  .ct-hours { background:#fff; border:1.5px solid #e4ecf4; border-radius:20px; padding:24px; }
  .ct-hours-title { font-size:14px; font-weight:800; color:#0d2b5e; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .ct-hours-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:13px; }
  .ct-hours-row:last-child { border-bottom:none; }
  .ct-hours-day { color:#5a6e88; font-weight:500; }
  .ct-hours-time { color:#0d2b5e; font-weight:700; }
  .ct-hours-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; background:#e8f5ee; color:#16a34a; }

  /* Formulaire côté droit */
  .ct-form-card { background:#fff; border:1.5px solid #e4ecf4; border-radius:24px; padding:36px 32px; box-shadow:0 8px 32px rgba(13,43,94,0.07); }
  .ct-form-title { font-size:20px; font-weight:800; color:#0d2b5e; margin-bottom:6px; }
  .ct-form-sub { font-size:13px; color:#5a6e88; margin-bottom:28px; }
  .ct-form-group { margin-bottom:18px; }
  .ct-form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .ct-form-label { font-size:12px; font-weight:700; color:#0d2b5e; margin-bottom:6px; display:block; letter-spacing:0.3px; }
  .ct-form-input, .ct-form-select, .ct-form-textarea { width:100%; padding:12px 14px; border:1.5px solid #e4ecf4; border-radius:11px; background:#f8fafc; font-size:14px; font-family:inherit; color:#0d2b5e; outline:none; transition:all 0.2s; resize:vertical; }
  .ct-form-input:focus, .ct-form-select:focus, .ct-form-textarea:focus { border-color:#2980e8; background:#fff; box-shadow:0 0 0 3px rgba(41,128,232,0.1); }
  .ct-form-input::placeholder, .ct-form-textarea::placeholder { color:#94a3b8; }
  .ct-form-textarea { min-height:120px; }
  .ct-form-required { color:#ef4444; }
  .ct-form-submit { width:100%; padding:14px; background:linear-gradient(135deg,#1252aa,#2980e8); color:#fff; border:none; border-radius:14px; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.25s; font-family:inherit; box-shadow:0 6px 20px rgba(41,128,232,0.3); margin-top:8px; }
  .ct-form-submit:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(41,128,232,0.45); }
  .ct-form-submit:disabled { background:#a5c8f4; cursor:not-allowed; box-shadow:none; transform:none; }

  /* Success */
  .ct-success { text-align:center; padding:40px 20px; }
  .ct-success-icon { width:72px; height:72px; border-radius:24px; background:#e8f5ee; display:flex; align-items:center; justify-content:center; font-size:32px; margin:0 auto 20px; }
  .ct-success-title { font-size:20px; font-weight:800; color:#0d2b5e; margin-bottom:8px; }
  .ct-success-sub { font-size:14px; color:#5a6e88; margin-bottom:24px; line-height:1.6; }
  .ct-success-btn { padding:12px 28px; background:#2980e8; color:#fff; border:none; border-radius:12px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; }

  /* FAQ */
  .ct-faq-section { background:#fff; padding:80px clamp(20px,6vw,100px); }
  .ct-faq-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; margin-top:40px; }
  .ct-faq-item { border:1.5px solid #e4ecf4; border-radius:16px; padding:22px; transition:all 0.2s; cursor:pointer; }
  .ct-faq-item:hover { border-color:#2980e8; background:#f8fbff; }
  .ct-faq-q { font-size:14px; font-weight:700; color:#0d2b5e; margin-bottom:8px; display:flex; align-items:flex-start; gap:8px; }
  .ct-faq-q span { color:#2980e8; flex-shrink:0; }
  .ct-faq-a { font-size:13px; color:#5a6e88; line-height:1.6; }

  /* Footer */
  .ct-footer { background:#0d2b5e; border-top:1px solid rgba(255,255,255,0.1); padding:32px clamp(20px,6vw,80px); }
  .ct-footer-inner { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .ct-footer-brand { display:flex; align-items:center; gap:10px; }
  .ct-footer-logo { height:34px; object-fit:contain; }
  .ct-footer-name { font-size:17px; font-weight:800; color:#fff; }
  .ct-footer-copy { font-size:13px; color:rgba(255,255,255,0.4); }
  .ct-footer-links { display:flex; gap:20px; flex-wrap:wrap; }
  .ct-footer-link { font-size:13px; color:rgba(255,255,255,0.55); text-decoration:none; transition:color 0.2s; }
  .ct-footer-link:hover { color:#fff; }

  .ct-toast { position:fixed; top:18px; right:18px; z-index:600; background:#0d2b5e; color:#fff; padding:14px 20px; border-radius:14px; font-size:13px; font-weight:600; box-shadow:0 12px 32px rgba(13,43,94,0.2); border-left:3px solid #4ade80; animation:ctToast 0.3s ease; }
  @keyframes ctToast { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none} }

  @media(max-width:768px){
    .ct-nav-links,.ct-nav-auth .ct-btn-ghost,.ct-nav-auth .ct-btn-primary{display:none!important;}
    .ct-hamburger{display:flex!important;}
    .ct-grid{grid-template-columns:1fr!important;gap:32px!important;}
    .ct-faq-grid{grid-template-columns:1fr!important;}
    .ct-form-row{grid-template-columns:1fr!important;}
    .ct-footer-inner{flex-direction:column!important;text-align:center!important;}
    .ct-footer-links{justify-content:center!important;}
  }
`;

if (typeof document !== "undefined" && !document.getElementById("airops-contact-css")) {
  const s = document.createElement("style"); s.id = "airops-contact-css"; s.textContent = CSS; document.head.appendChild(s);
}

const NAV_ITEMS = [
  { label: "Accueil",  to: "/" },
  { label: "À propos", to: "/a-propos" },
  { label: "Navettes", to: "/navettes" },
  { label: "Contact",  to: "/contact" },
];

const FAQ = [
  { q: "Comment puis-je réserver une demande ?", a: "Créez un compte gratuitement, choisissez votre trajet." },
  { q: "Quels modes de paiement acceptez-vous ?", a: "Paiement en ligne par carte bancaire, ou en espèces directement au chauffeur à la fin du trajet." },
  { q: "Que faire si mon vol a du retard ?", a: "Nos chauffeurs suivent les horaires en temps réel. Votre navette vous attendra sans frais supplémentaires." },
  { q: "Puis-je annuler ma réservation ?", a: "Oui, toute annulation effectuée plus de 2h avant le départ est remboursée intégralement." },
  { q: "Combien de bagages puis-je emporter ?", a: "Chaque passager peut emporter 1 valise et 1 bagage à main. Pour les groupes, contactez-nous pour des arrangements." },
  { q: "Le service est-il disponible 24h/24 ?", a: "Oui, notre service de navettes opère 24h/24 et 7j/7 pour tous les aéroports couverts." },
];

const SUBJECTS = ["Réservation", "Réclamation", "Renseignement général", "Partenariat", "Autre"];

const defaultForm = { prenom: "", nom: "", email: "", phone: "", sujet: "", message: "" };

export default function Contact() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [touched, setTouched] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const hc = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const hb = e => setTouched(p => ({ ...p, [e.target.name]: true }));

  const errors = {
    prenom: !form.prenom.trim() ? "Prénom requis" : "",
    nom: !form.nom.trim() ? "Nom requis" : "",
    email: !form.email.trim() ? "Email requis" : !/\S+@\S+\.\S+/.test(form.email) ? "Email invalide" : "",
    sujet: !form.sujet ? "Sujet requis" : "",
    message: form.message.trim().length < 10 ? "Message trop court (min. 10 caractères)" : "",
  };
  const isValid = Object.values(errors).every(e => !e);

  const handleSubmit = () => {
    setTouched({ prenom: true, nom: true, email: true, phone: true, sujet: true, message: true });
    if (!isValid) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setToast("✓ Message envoyé avec succès !"); }, 1500);
  };

  return (
    <div className="ct-wrapper">

      {/* ─── NAVBAR ─── */}
      <nav className={`ct-nav ${scrolled ? "scrolled" : "top"}`}>
        <div className="ct-nav-brand" onClick={() => navigate("/")}>
          <img src={airopsLogo} alt="AirOps" className="ct-nav-logo" />
          <span className="ct-nav-brand-name">AirOps</span>
        </div>
        <ul className="ct-nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.label} style={{ listStyle: "none" }}>
              <a href={item.to} onClick={e => { e.preventDefault(); navigate(item.to); }}
                className={item.to === "/contact" ? "ct-nav-link-active" : "ct-nav-link"}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ct-nav-auth">
          <button className="ct-btn-ghost" onClick={() => navigate("/login")}>Connexion</button>
          <button className="ct-btn-primary" onClick={() => navigate("/inscription")}>Inscription</button>
          <button className="ct-hamburger" onClick={() => setMenuOpen(v => !v)}>
            <span className="ct-bar" style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "" }} />
            <span className="ct-bar" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="ct-bar" style={{ transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "" }} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="ct-mobile-menu">
          {NAV_ITEMS.map(item => (
            <a key={item.label} href={item.to} className="ct-mobile-link"
              onClick={e => { e.preventDefault(); navigate(item.to); setMenuOpen(false); }}>
              {item.label}
            </a>
          ))}
          <button className="ct-mobile-btn-login" onClick={() => navigate("/login")}>Connexion</button>
          <button className="ct-mobile-btn-signup" onClick={() => navigate("/inscription")}>Inscription</button>
        </div>
      )}

      {/* ─── HERO ─── */}
      <div className="ct-hero">
        <div className="ct-hero-content">
          <div className="ct-hero-tag"><span className="ct-hero-dot" />CONTACTEZ-NOUS</div>
          <h1 className="ct-hero-title">
            Nous sommes<br /><span>là pour vous</span>
          </h1>
          <p className="ct-hero-sub">
            Une question, une réclamation ou besoin d'un devis personnalisé ? Notre équipe vous répond en moins de 24h.
          </p>
        </div>
      </div>

      {/* ─── MAIN ─── */}
      <section className="ct-main">
        <div className="ct-container">
          <div className="ct-grid">

            {/* ── Infos ── */}
            <div>
              <span className="ct-section-tag">NOS COORDONNÉES</span>
              <h2 className="ct-info-title">Parlons de votre projet de transport</h2>
              <p className="ct-info-sub">Notre équipe est disponible 7j/7 pour répondre à toutes vos questions et organiser votre transfert sur mesure.</p>

              <div className="ct-contact-cards">
                {[
                  { icon: "📞", label: "Téléphone", val: "+216 71 123 456", color: "#2980e8", bg: "#e8f2fd" },
                  { icon: "✉️", label: "Email", val: "contact@airops.tn", color: "#16a34a", bg: "#e8f5ee" },
                  { icon: "📍", label: "Adresse", val: "Immeuble AirOps, Av. Habib Bourguiba, Tunis 1001", color: "#d97706", bg: "#fef3e2" },
                  { icon: "💬", label: "WhatsApp", val: "+216 90 123 456", color: "#7c3aed", bg: "#f0ebff" },
                ].map(c => (
                  <div key={c.label} className="ct-contact-card">
                    <div className="ct-contact-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                    <div>
                      <div className="ct-contact-label">{c.label}</div>
                      <div className="ct-contact-val">{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ct-hours">
                <div className="ct-hours-title">🕐 Horaires d'assistance</div>
                {[
                  ["Lundi – Vendredi", "08h00 – 20h00", true],
                  ["Samedi", "09h00 – 18h00", false],
                  ["Dimanche", "10h00 – 16h00", false],
                  ["Urgences navette", "24h/24 – 7j/7", true],
                ].map(([day, time, open]) => (
                  <div key={day} className="ct-hours-row">
                    <span className="ct-hours-day">{day}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="ct-hours-time">{time}</span>
                      {open && <span className="ct-hours-badge">Ouvert</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Formulaire ── */}
            <div>
              <div className="ct-form-card">
                {sent ? (
                  <div className="ct-success">
                    <div className="ct-success-icon">✅</div>
                    <div className="ct-success-title">Message envoyé !</div>
                    <div className="ct-success-sub">Merci pour votre message. Notre équipe vous répondra dans les prochaines 24 heures.</div>
                    <button className="ct-success-btn" onClick={() => { setSent(false); setForm(defaultForm); setTouched({}); }}>Envoyer un autre message</button>
                  </div>
                ) : (
                  <>
                    <div className="ct-form-title">Envoyez-nous un message</div>
                    <div className="ct-form-sub">Tous les champs marqués <span className="ct-form-required">*</span> sont obligatoires.</div>

                    <div className="ct-form-row">
                      {[["prenom", "Prénom", "Ahmed"], ["nom", "Nom", "Ben Salem"]].map(([name, label, ph]) => (
                        <div key={name} className="ct-form-group">
                          <label className="ct-form-label">{label} <span className="ct-form-required">*</span></label>
                          <input name={name} value={form[name]} onChange={hc} onBlur={hb} placeholder={ph} className="ct-form-input"
                            style={{ borderColor: touched[name] && errors[name] ? "#ef4444" : "" }} />
                          {touched[name] && errors[name] && <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors[name]}</span>}
                        </div>
                      ))}
                    </div>

                    <div className="ct-form-row">
                      <div className="ct-form-group">
                        <label className="ct-form-label">Email <span className="ct-form-required">*</span></label>
                        <input type="email" name="email" value={form.email} onChange={hc} onBlur={hb} placeholder="ahmed@gmail.com" className="ct-form-input"
                          style={{ borderColor: touched.email && errors.email ? "#ef4444" : "" }} />
                        {touched.email && errors.email && <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.email}</span>}
                      </div>
                      <div className="ct-form-group">
                        <label className="ct-form-label">Téléphone</label>
                        <input type="tel" name="phone" value={form.phone} onChange={hc} placeholder="+216 XX XXX XXX" className="ct-form-input" />
                      </div>
                    </div>

                    <div className="ct-form-group">
                      <label className="ct-form-label">Sujet <span className="ct-form-required">*</span></label>
                      <select name="sujet" value={form.sujet} onChange={hc} onBlur={hb} className="ct-form-select"
                        style={{ borderColor: touched.sujet && errors.sujet ? "#ef4444" : "" }}>
                        <option value="">Choisissez un sujet</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {touched.sujet && errors.sujet && <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.sujet}</span>}
                    </div>

                    <div className="ct-form-group">
                      <label className="ct-form-label">Message <span className="ct-form-required">*</span></label>
                      <textarea name="message" value={form.message} onChange={hc} onBlur={hb} placeholder="Décrivez votre demande en détail…" className="ct-form-textarea"
                        style={{ borderColor: touched.message && errors.message ? "#ef4444" : "" }} />
                      {touched.message && errors.message && <span style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", display: "block" }}>{errors.message}</span>}
                    </div>

                    <button className="ct-form-submit" onClick={handleSubmit} disabled={sending}>
                      {sending ? "Envoi en cours…" : "Envoyer le message →"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="ct-faq-section">
        <div className="ct-container">
          <div style={{ textAlign: "center", marginBottom: "0" }}>
            <span className="ct-section-tag">FAQ</span>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 800, color: "#0d2b5e", letterSpacing: "-0.8px" }}>Questions fréquentes</h2>
          </div>
          <div className="ct-faq-grid">
            {FAQ.map(f => (
              <div key={f.q} className="ct-faq-item">
                <div className="ct-faq-q"><span>Q.</span>{f.q}</div>
                <div className="ct-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="ct-footer">
        <div className="ct-footer-inner">
          <div className="ct-footer-brand">
            <img src={airopsLogo} alt="AirOps" className="ct-footer-logo" />
            <span className="ct-footer-name">AirOps</span>
          </div>
          <p className="ct-footer-copy">© {new Date().getFullYear()} AirOps. Tous droits réservés.</p>
         
        </div>
      </footer>

      {toast && <div className="ct-toast">{toast}</div>}
    </div>
  );
}