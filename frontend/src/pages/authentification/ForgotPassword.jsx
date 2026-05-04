import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import airplaneBg from "../../assets/airplane.png";

const fpCSS = `
  *, *::before, *::after { box-sizing: border-box; }

  .fp-page {
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#f0f5fb;
    font-family:'DM Sans','Segoe UI',sans-serif;
    padding:40px clamp(16px,4vw,40px);
  }

  .fp-card {
    width:100%;
    max-width:960px;
    min-height:580px;
    display:flex;
    overflow:hidden;
    background:#fff;
    border:1px solid #e4ecf4;
    border-radius:24px;
    box-shadow:0 8px 40px rgba(18,82,170,0.10);
  }

  .fp-card-img {
    width:42%;
    position:relative;
    overflow:hidden;
    flex-shrink:0;
  }

  .fp-card-img img {
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    object-fit:cover;
  }

  .fp-img-overlay {
    position:absolute;
    inset:0;
    background:linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(10,35,100,0.88) 100%);
  }

  .fp-img-content {
    position:relative;
    z-index:2;
    height:100%;
    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    padding:36px;
  }

  .fp-dots {
    display:flex;
    gap:6px;
    margin-bottom:18px;
  }

  .fp-dot-active {
    width:28px;
    height:7px;
    border-radius:4px;
    background:#fff;
  }

  .fp-dot {
    width:7px;
    height:7px;
    border-radius:50%;
    background:rgba(255,255,255,0.35);
  }

  .fp-img-title {
    font-size:24px;
    font-weight:800;
    color:#fff;
    line-height:1.2;
    margin:0 0 10px;
  }

  .fp-img-text {
    font-size:13px;
    color:rgba(200,220,255,0.9);
    line-height:1.65;
    margin:0;
  }

  .fp-card-form {
    flex:1;
    padding:44px 44px;
    display:flex;
    flex-direction:column;
    justify-content:center;
  }

  .fp-back-btn {
    display:inline-flex;
    align-items:center;
    gap:7px;
    color:#1252aa;
    font-size:13px;
    font-weight:600;
    background:none;
    border:none;
    cursor:pointer;
    font-family:inherit;
    padding:0;
    margin-bottom:20px;
    width:fit-content;
  }

  .fp-badge {
    display:inline-flex;
    align-items:center;
    gap:7px;
    background:rgba(18,82,170,0.08);
    border:1px solid rgba(18,82,170,0.18);
    color:#1252aa;
    font-size:11px;
    font-weight:700;
    letter-spacing:1.2px;
    padding:5px 14px;
    border-radius:24px;
    margin-bottom:20px;
    align-self:flex-start;
  }

  .fp-badge-dot {
    width:6px;
    height:6px;
    border-radius:50%;
    background:#1252aa;
    display:inline-block;
  }

  .fp-title {
    text-align:center;
    font-size:26px;
    font-weight:800;
    color:#0d2b5e;
    letter-spacing:-0.5px;
    margin:0 0 14px;
  }

  .fp-line {
    width:48px;
    height:4px;
    background:#15bfd0;
    border-radius:10px;
    margin:0 auto 28px;
  }

  .fp-subtitle {
    text-align:center;
    font-size:14px;
    color:#5a6e88;
    line-height:1.6;
    margin:0 0 26px;
  }

  .fp-form {
    display:flex;
    flex-direction:column;
    gap:16px;
  }

  .fp-field {
    position:relative;
    border-bottom:1.5px solid #cbd5e1;
  }

  .fp-input {
    width:100%;
    border:none;
    outline:none;
    padding:13px 42px 13px 8px;
    font-size:15px;
    color:#0d2b5e;
    background:transparent;
    font-family:inherit;
  }

  .fp-input::placeholder {
    color:#94a3b8;
  }

  .fp-icon {
    position:absolute;
    right:8px;
    top:50%;
    transform:translateY(-50%);
    color:#94a3b8;
    font-size:17px;
  }

  .fp-error {
    color:#ef4444;
    font-size:12px;
    margin-top:-8px;
  }

  .fp-primary {
    height:44px;
    border:none;
    border-radius:8px;
    background:#1252aa;
    color:#fff;
    font-size:14px;
    font-weight:700;
    cursor:pointer;
    font-family:inherit;
    transition:all 0.25s ease;
  }

  .fp-primary:hover:not(:disabled) {
    background:#0d2b5e;
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(18,82,170,0.35);
  }

  .fp-primary:disabled {
    background:#a8c8f0;
    cursor:not-allowed;
  }

  .fp-secondary {
    height:44px;
    border:1.5px solid #1252aa;
    border-radius:8px;
    background:#fff;
    color:#1252aa;
    font-size:14px;
    font-weight:700;
    cursor:pointer;
    font-family:inherit;
  }

  @media (max-width:768px) {
    .fp-card-img { display:none; }
    .fp-card-form { padding:40px 28px; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("fp-direct-css")) {
  const tag = document.createElement("style");
  tag.id = "fp-direct-css";
  tag.textContent = fpCSS;
  document.head.appendChild(tag);
}

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const emailError = useMemo(() => {
    if (!touched) return "";
    if (!email.trim()) return "Adresse e-mail obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Adresse e-mail invalide.";
    return "";
  }, [email, touched]);

  const isValid = email.trim() && !emailError;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) return;

    navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-card-img">
          <img src={airplaneBg} alt="Avion" />
          <div className="fp-img-overlay" />
          <div className="fp-img-content">
            <div className="fp-dots">
              <div className="fp-dot-active" />
              <div className="fp-dot" />
              <div className="fp-dot" />
            </div>
            <h2 className="fp-img-title">Récupération de compte</h2>
            <p className="fp-img-text">
              Entrez votre adresse e-mail puis définissez directement un nouveau mot de passe.
            </p>
          </div>
        </div>

        <div className="fp-card-form">
          <button type="button" className="fp-back-btn" onClick={() => navigate("/login")}>
            Retour à la connexion
          </button>

          <div className="fp-badge">
            <span className="fp-badge-dot" />
            MOT DE PASSE OUBLIÉ
          </div>

          <h1 className="fp-title">Réinitialisez votre mot de passe</h1>
          <div className="fp-line" />

          <p className="fp-subtitle">
            Entrez l'adresse e-mail associée à votre compte.
          </p>

          <form className="fp-form" onSubmit={handleSubmit}>
            <div className="fp-field">
              <input
                type="email"
                placeholder="Adresse E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                className="fp-input"
              />
              <span className="fp-icon">✉</span>
            </div>

            {emailError && <div className="fp-error">{emailError}</div>}

            <button type="submit" disabled={!isValid} className="fp-primary">
              Continuer
            </button>

            <button type="button" className="fp-secondary" onClick={() => navigate("/login")}>
              Annuler
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
