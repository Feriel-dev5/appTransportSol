import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import airplaneBg from "../../assets/airplane.png";
import airopsLogo from "../../assets/Logo_moderne_AirOps_avec_avion.png";
import { login } from "../../services/authService";

/* ── CSS cohérent avec Home ── */
const loginCSS = `
  *, *::before, *::after { box-sizing: border-box; }

  .lo-nav-link {
    text-decoration: none; font-size: 15px;
    color: rgba(255,255,255,0.85); font-weight: 500;
    padding: 8px 14px; border-radius: 8px;
    transition: all 0.2s; display: inline-block;
  }
  .lo-nav-link:hover { color:#fff; background:rgba(255,255,255,0.18); }

  .lo-btn-ghost:hover  { background:rgba(255,255,255,0.22)!important; color:#fff!important; }
  .lo-btn-signup:hover { background:#fff!important; color:#1a6fd4!important; transform:translateY(-2px); }

  .lo-input {
    width:100%; padding:13px 16px; border-radius:12px;
    border:1.5px solid #e4ecf4; background:#f7faff;
    font-size:14px; color:#0d2b5e; outline:none;
    transition:all 0.2s; font-family:inherit;
  }
  .lo-input::placeholder { color:#a0b0c8; }
  .lo-input:hover  { border-color:#a8c8f0; }
  .lo-input:focus  { border-color:#1252aa; background:#fff; box-shadow:0 0 0 3px rgba(18,82,170,0.08); }
  .lo-input-error  { border-color:#fca5a5!important; background:#fff8f8!important; }
  .lo-input-error:focus { box-shadow:0 0 0 3px rgba(252,165,165,0.2)!important; }

  .lo-submit {
    width:100%; padding:14px; border-radius:32px; border:none;
    background:#1252aa; color:#fff; font-size:15px; font-weight:700;
    cursor:pointer; transition:all 0.25s ease; font-family:inherit;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .lo-submit:hover:not(:disabled) { background:#0d2b5e; transform:translateY(-2px); box-shadow:0 10px 28px rgba(18,82,170,0.35); }
  .lo-submit:disabled { background:#a8c8f0; cursor:not-allowed; }

  .lo-social-btn {
    flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
    border:1.5px solid #e4ecf4; border-radius:12px; padding:11px 0;
    font-size:13px; font-weight:600; color:#0d2b5e; background:#fff;
    cursor:pointer; transition:all 0.2s; font-family:inherit;
  }
  .lo-social-btn:hover { background:#f0f5fb; border-color:#a8c8f0; transform:translateY(-2px); }

  .lo-checkbox {
    width:16px; height:16px; accent-color:#1252aa; cursor:pointer;
  }

  .lo-forgot:hover { color:#0d2b5e!important; }

  .lo-card-img:hover img { transform:scale(1.05); }

  @media (max-width: 768px) {
    .lo-card-img { display:none!important; }
    .lo-card-form { padding:40px 28px!important; }
    .lo-nav-links-d { display:none!important; }
    .lo-nav-auth-d  { display:none!important; }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("lo-css")) {
  const tag = document.createElement("style");
  tag.id = "lo-css";
  tag.textContent = loginCSS;
  document.head.appendChild(tag);
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (remember) {
      localStorage.setItem("rememberEmail", email);
    }
  }, [email, remember]);

  useEffect(() => {
    if (!remember) {
      localStorage.removeItem("rememberEmail");
    }
  }, [remember]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "L'adresse e-mail est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Veuillez entrer une adresse e-mail valide.";
    return "";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password.trim()) return "Le mot de passe est obligatoire.";
    if (password.trim().length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
    return "";
  }, [password, touched.password]);

  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  const handleBlur = (field) => setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setError("");

    if (!email.trim() || !password.trim() || emailError || passwordError) return;

    setLoading(true);
    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      const role = data.user.role.toLowerCase();

      if (role === "admin") navigate("/dashbordADMIN");
      else if (role === "chauffeur") navigate("/dashbordchauffeur");
      else if (role === "passager") navigate("/dashbordP");
      else if (role === "responsable") navigate("/dashbordRES");
      else navigate("/");
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.wrapper}>
      {/* ══ CONTENU ══ */}
      <div style={s.pageBody}>
        <div style={s.card}>
          {/* ── Côté image ── */}
          <div className="lo-card-img" style={s.cardImg}>
            <img src={airplaneBg} alt="Avion" style={s.cardImgTag} />
            <div style={s.cardImgOverlay} />
            <div style={s.cardImgContent}>
              <div style={s.dots}>
                <div style={s.dotActive} />
                <div style={s.dotInactive} />
                <div style={s.dotInactive} />
              </div>
              <h2 style={s.cardImgTitle}>Le ciel, à votre portée.</h2>
              <p style={s.cardImgText}>
                Connectez-vous à votre portail de gestion logistique pour optimiser
                vos opérations aériennes avec précision et élégance.
              </p>
            </div>
          </div>

          {/* ── Côté formulaire ── */}
          <div className="lo-card-form" style={s.cardForm}>
            <div style={s.formBadge}>
              <span style={s.badgeDot} />
              ESPACE MEMBRE
            </div>

            <h1 style={s.formTitle}>Connexion</h1>
            <p style={s.formSubtitle}>
              Veuillez saisir vos identifiants pour accéder à votre compte.
            </p>

            {error && <div style={s.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="nom@example.com"
                  className={`lo-input${touched.email && emailError ? " lo-input-error" : ""}`}
                />
                {touched.email && emailError && <p style={s.fieldError}>{emailError}</p>}
              </div>

              <div style={s.fieldGroup}>
                <div style={s.labelRow}>
                  <label style={s.label}>Mot de passe</label>
                  <a href="#" className="lo-forgot" style={s.forgotLink}>
                    Mot de passe oublié ?
                  </a>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Votre mot de passe"
                    style={{ paddingRight: "48px" }}
                    className={`lo-input${touched.password && passwordError ? " lo-input-error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={s.eyeBtn}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7a9abf">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.204-3.592m2.122-1.65A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.224M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 9L3 3" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7a9abf">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z" />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password && passwordError && <p style={s.fieldError}>{passwordError}</p>}
              </div>

              <div style={s.rememberRow}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="lo-checkbox"
                />
                <label htmlFor="remember" style={s.rememberLabel}>
                  Se souvenir de moi
                </label>
              </div>

              <button type="submit" disabled={loading || !isFormValid} className="lo-submit">
                {loading ? "Connexion en cours..." : "Se Connecter"}
                {!loading && (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                )}
              </button>
            </form>

            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>Ou continuer avec</span>
              <div style={s.dividerLine} />
            </div>

            <div style={s.socialRow}>
              <button className="lo-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="lo-social-btn">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1252aa">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                SSO Pro
              </button>
            </div>

            <p style={s.registerText}>
              Vous n'avez pas de compte ?{" "}
              <a href="/inscription" style={s.registerLink}>Inscrivez-vous ici</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ STYLES ══ */
const s = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    background: "#f0f5fb",
    overflowX: "hidden",
  },

  pageBody: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px clamp(16px,4vw,40px)",
    minHeight: "100vh",
  },

  card: {
    width: "100%",
    maxWidth: "960px",
    background: "#fff",
    borderRadius: "24px",
    boxShadow: "0 8px 40px rgba(18,82,170,0.10)",
    border: "1px solid #e4ecf4",
    overflow: "hidden",
    display: "flex",
    minHeight: "580px",
  },

  cardImg: {
    width: "42%",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  cardImgTag: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  cardImgOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(10,35,100,0.85) 100%)",
  },
  cardImgContent: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    padding: "36px",
  },
  dots: { display: "flex", gap: "6px", marginBottom: "18px" },
  dotActive: { width: "28px", height: "7px", borderRadius: "4px", background: "#fff" },
  dotInactive: { width: "7px", height: "7px", borderRadius: "50%", background: "rgba(255,255,255,0.35)" },
  cardImgTitle: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.2,
    marginBottom: "10px",
  },
  cardImgText: {
    fontSize: "13px",
    color: "rgba(200,220,255,0.9)",
    lineHeight: 1.65,
  },

  cardForm: {
    flex: 1,
    padding: "48px 44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  formBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "rgba(18,82,170,0.08)",
    border: "1px solid rgba(18,82,170,0.18)",
    color: "#1252aa",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1.2px",
    padding: "5px 14px",
    borderRadius: "24px",
    marginBottom: "20px",
    alignSelf: "flex-start",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#1252aa",
    display: "inline-block",
    flexShrink: 0,
  },
  formTitle: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#0d2b5e",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#5a6e88",
    lineHeight: 1.6,
    marginBottom: "28px",
  },
  errorBox: {
    background: "#fff5f5",
    border: "1.5px solid #fca5a5",
    color: "#c0392b",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#0d2b5e" },
  labelRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  forgotLink: {
    fontSize: "13px",
    color: "#1252aa",
    fontWeight: 600,
    textDecoration: "none",
    transition: "color 0.2s",
  },
  fieldError: { fontSize: "12px", color: "#e74c3c", margin: 0 },
  eyeBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
  },
  rememberRow: { display: "flex", alignItems: "center", gap: "10px" },
  rememberLabel: {
    fontSize: "13px",
    color: "#5a6e88",
    cursor: "pointer",
    userSelect: "none",
  },

  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" },
  dividerLine: { flex: 1, height: "1px", background: "#e4ecf4" },
  dividerText: {
    fontSize: "11px",
    color: "#a0b0c8",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  socialRow: { display: "flex", gap: "12px" },

  registerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#5a6e88",
    marginTop: "20px",
  },
  registerLink: {
    color: "#1252aa",
    fontWeight: 700,
    textDecoration: "none",
  },
};