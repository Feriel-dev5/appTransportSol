import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import airplaneBg from "../../assets/airplane.png";
import { resetPassword } from "../../services/authService";

const resetCSS = `
  *, *::before, *::after { box-sizing: border-box; }

  .rp-page {
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#f0f5fb;
    font-family:'DM Sans','Segoe UI',sans-serif;
    padding:40px clamp(16px,4vw,40px);
  }

  .rp-card {
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

  .rp-card-img {
    width:42%;
    position:relative;
    overflow:hidden;
    flex-shrink:0;
  }

  .rp-card-img img {
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    object-fit:cover;
  }

  .rp-img-overlay {
    position:absolute;
    inset:0;
    background:linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(10,35,100,0.88) 100%);
  }

  .rp-img-content {
    position:relative;
    z-index:2;
    height:100%;
    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    padding:36px;
  }

  .rp-dots {
    display:flex;
    gap:6px;
    margin-bottom:18px;
  }

  .rp-dot-active {
    width:28px;
    height:7px;
    border-radius:4px;
    background:#fff;
  }

  .rp-dot {
    width:7px;
    height:7px;
    border-radius:50%;
    background:rgba(255,255,255,0.35);
  }

  .rp-img-title {
    font-size:24px;
    font-weight:800;
    color:#fff;
    line-height:1.2;
    margin:0 0 10px;
  }

  .rp-img-text {
    font-size:13px;
    color:rgba(200,220,255,0.9);
    line-height:1.65;
    margin:0;
  }

  .rp-card-form {
    flex:1;
    padding:44px 44px;
    display:flex;
    flex-direction:column;
    justify-content:center;
  }

  .rp-back-btn {
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

  .rp-badge {
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

  .rp-badge-dot {
    width:6px;
    height:6px;
    border-radius:50%;
    background:#1252aa;
    display:inline-block;
  }

  .rp-title {
    text-align:center;
    font-size:26px;
    font-weight:800;
    color:#0d2b5e;
    letter-spacing:-0.5px;
    margin:0 0 14px;
  }

  .rp-line {
    width:48px;
    height:4px;
    background:#15bfd0;
    border-radius:10px;
    margin:0 auto 28px;
  }

  .rp-form {
    display:flex;
    flex-direction:column;
    gap:16px;
  }

  .rp-email-box {
    width:100%;
    border:none;
    outline:none;
    background:#f1f3f6;
    padding:13px 10px;
    font-size:15px;
    color:#5a6e88;
    font-family:inherit;
  }

  .rp-field {
    position:relative;
    border-bottom:1.5px solid #cbd5e1;
  }

  .rp-input {
    width:100%;
    border:none;
    outline:none;
    padding:13px 42px 13px 8px;
    font-size:15px;
    color:#0d2b5e;
    background:transparent;
    font-family:inherit;
  }

  .rp-input::placeholder {
    color:#94a3b8;
  }

  .rp-eye {
    position:absolute;
    right:8px;
    top:50%;
    transform:translateY(-50%);
    border:none;
    background:transparent;
    cursor:pointer;
    color:#94a3b8;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:2px;
  }

  .rp-error {
    color:#ef4444;
    font-size:12px;
    margin-top:-8px;
  }

  .rp-success {
    background:#f0fdf4;
    border:1.5px solid #86efac;
    color:#15803d;
    padding:12px 16px;
    border-radius:12px;
    font-size:13px;
  }

  .rp-primary {
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

  .rp-primary:hover:not(:disabled) {
    background:#0d2b5e;
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(18,82,170,0.35);
  }

  .rp-primary:disabled {
    background:#a8c8f0;
    cursor:not-allowed;
  }

  @media (max-width:768px) {
    .rp-card-img { display:none; }
    .rp-card-form { padding:40px 28px; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("rp-direct-css")) {
  const tag = document.createElement("style");
  tag.id = "rp-direct-css";
  tag.textContent = resetCSS;
  document.head.appendChild(tag);
}

function EyeIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z" />
    </svg>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ password:false, confirm:false });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password) return "Mot de passe obligatoire.";
    if (password.length < 6) return "Minimum 6 caractères.";
    return "";
  }, [password, touched.password]);

  const confirmError = useMemo(() => {
    if (!touched.confirm) return "";
    if (!confirm) return "Confirmation obligatoire.";
    if (confirm !== password) return "Les mots de passe ne correspondent pas.";
    return "";
  }, [confirm, password, touched.confirm]);

  const emailError = useMemo(() => {
    if (email) return "";
    return "Adresse e-mail manquante. Retournez à l'étape précédente.";
  }, [email]);

  const isValid =
    email &&
    password &&
    confirm &&
    password === confirm &&
    !passwordError &&
    !confirmError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password:true, confirm:true });
    setSuccess("");
    setError("");

    if (!isValid) return;

    setLoading(true);

    try {
      await resetPassword({
        email,
        newPassword: password,
      });

      setSuccess("Mot de passe modifié avec succès. Redirection vers la connexion...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Erreur serveur. Vérifiez que la route /auth/reset-password existe.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      <div className="rp-card">
        <div className="rp-card-img">
          <img src={airplaneBg} alt="Avion" />
          <div className="rp-img-overlay" />
          <div className="rp-img-content">
            <div className="rp-dots">
              <div className="rp-dot-active" />
              <div className="rp-dot" />
              <div className="rp-dot" />
            </div>
            <h2 className="rp-img-title">Nouveau mot de passe</h2>
            <p className="rp-img-text">
              Définissez un nouveau mot de passe pour sécuriser votre compte AirOps.
            </p>
          </div>
        </div>

        <div className="rp-card-form">
          <button type="button" className="rp-back-btn" onClick={() => navigate("/forgot-password")}>
            Retour
          </button>

          <div className="rp-badge">
            <span className="rp-badge-dot" />
            RÉINITIALISATION
          </div>

          <h1 className="rp-title">Définir un nouveau mot de passe</h1>
          <div className="rp-line" />

          <form className="rp-form" onSubmit={handleSubmit}>
            {success && <div className="rp-success">{success}</div>}
            {error && <div className="rp-error" style={{ marginTop: 0 }}>{error}</div>}
            {emailError && <div className="rp-error" style={{ marginTop: 0 }}>{emailError}</div>}

            <input
              type="text"
              value={email}
              readOnly
              placeholder="Adresse e-mail"
              className="rp-email-box"
            />

            <div className="rp-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, password:true }))}
                className="rp-input"
              />
              <button type="button" className="rp-eye" onClick={() => setShowPassword(v => !v)}>
                <EyeIcon />
              </button>
            </div>

            {passwordError && <div className="rp-error">{passwordError}</div>}

            <div className="rp-field">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmer votre nouveau mot de passe"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, confirm:true }))}
                className="rp-input"
              />
              <button type="button" className="rp-eye" onClick={() => setShowConfirm(v => !v)}>
                <EyeIcon />
              </button>
            </div>

            {confirmError && <div className="rp-error">{confirmError}</div>}

            <button type="submit" disabled={!isValid || loading} className="rp-primary">
              {loading ? "Validation..." : "Valider"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
