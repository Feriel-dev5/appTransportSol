import { useEffect, useMemo, useState } from "react";
import airplaneBg from "../../assets/airplane2.png";

/* ── CSS cohérent avec Login ── */
const inscriptionCSS = `
  *, *::before, *::after { box-sizing: border-box; }

  .in-input {
    width:100%;
    padding:13px 16px;
    border-radius:12px;
    border:1.5px solid #e4ecf4;
    background:#f7faff;
    font-size:14px;
    color:#0d2b5e;
    outline:none;
    transition:all 0.2s;
    font-family:inherit;
  }

  .in-input::placeholder { color:#a0b0c8; }

  .in-input:hover { border-color:#a8c8f0; }

  .in-input:focus {
    border-color:#1252aa;
    background:#fff;
    box-shadow:0 0 0 3px rgba(18,82,170,0.08);
  }

  .in-input-error {
    border-color:#fca5a5 !important;
    background:#fff8f8 !important;
  }

  .in-input-error:focus {
    box-shadow:0 0 0 3px rgba(252,165,165,0.2) !important;
  }

  .in-submit {
    width:100%;
    padding:14px;
    border-radius:32px;
    border:none;
    background:#1252aa;
    color:#fff;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
    transition:all 0.25s ease;
    font-family:inherit;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
  }

  .in-submit:hover:not(:disabled) {
    background:#0d2b5e;
    transform:translateY(-2px);
    box-shadow:0 10px 28px rgba(18,82,170,0.35);
  }

  .in-submit:disabled {
    background:#a8c8f0;
    cursor:not-allowed;
  }

  .in-card-img:hover img {
    transform:scale(1.05);
  }

  @media (max-width: 1024px) {
    .in-card {
      max-width: 900px !important;
    }

    .in-card-form {
      padding:40px 32px !important;
    }

    .in-card-img-content {
      padding:28px !important;
    }

    .in-card-img-title {
      font-size:22px !important;
    }
  }

  @media (max-width: 768px) {
    .in-card {
      flex-direction:column !important;
      min-height:auto !important;
    }

    .in-card-img {
      display:none !important;
    }

    .in-card-form {
      padding:34px 24px !important;
    }
  }

  @media (max-width: 480px) {
    .in-page-body {
      padding:20px 12px !important;
    }

    .in-card-form {
      padding:28px 18px !important;
    }

    .in-form-title {
      font-size:24px !important;
    }

    .in-form-subtitle {
      font-size:13px !important;
    }

    .in-submit {
      font-size:14px !important;
      padding:13px !important;
    }
  }
`;

if (typeof document !== "undefined" && !document.getElementById("in-css")) {
  const tag = document.createElement("style");
  tag.id = "in-css";
  tag.textContent = inscriptionCSS;
  document.head.appendChild(tag);
}

export default function Inscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [touched, setTouched] = useState({
    nom: false,
    email: false,
    telephone: false,
    password: false,
  });

  useEffect(() => {
    const savedNom = localStorage.getItem("inscription_nom");
    const savedEmail = localStorage.getItem("inscription_email");
    const savedTelephone = localStorage.getItem("inscription_telephone");

    if (savedNom) setNom(savedNom);
    if (savedEmail) setEmail(savedEmail);
    if (savedTelephone) setTelephone(savedTelephone);
  }, []);

  useEffect(() => {
    localStorage.setItem("inscription_nom", nom);
  }, [nom]);

  useEffect(() => {
    localStorage.setItem("inscription_email", email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem("inscription_telephone", telephone);
  }, [telephone]);

  const nomError = useMemo(() => {
    if (!touched.nom) return "";
    if (!nom.trim()) return "Le nom complet est obligatoire.";
    if (nom.trim().length < 3) return "Le nom doit contenir au moins 3 caractères.";
    return "";
  }, [nom, touched.nom]);

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "L'adresse e-mail est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Veuillez entrer une adresse e-mail valide.";
    }
    return "";
  }, [email, touched.email]);

  const telephoneError = useMemo(() => {
    if (!touched.telephone) return "";
    if (!telephone.trim()) return "Le numéro de téléphone est obligatoire.";
    if (!/^[+\d\s]{8,20}$/.test(telephone.trim())) {
      return "Veuillez entrer un numéro de téléphone valide.";
    }
    return "";
  }, [telephone, touched.telephone]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password.trim()) return "Le mot de passe est obligatoire.";
    if (password.trim().length < 6) {
      return "Le mot de passe doit contenir au moins 6 caractères.";
    }
    return "";
  }, [password, touched.password]);

  const isFormValid =
    nom.trim() &&
    email.trim() &&
    telephone.trim() &&
    password.trim() &&
    !nomError &&
    !emailError &&
    !telephoneError &&
    !passwordError;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      nom: true,
      email: true,
      telephone: true,
      password: true,
    });

    if (!isFormValid) {
      setSuccessMessage("");
      return;
    }

    setSuccessMessage("Compte créé avec succès.");

    localStorage.removeItem("inscription_nom");
    localStorage.removeItem("inscription_email");
    localStorage.removeItem("inscription_telephone");

    setNom("");
    setEmail("");
    setTelephone("");
    setPassword("");
    setTouched({
      nom: false,
      email: false,
      telephone: false,
      password: false,
    });
  };

  return (
    <div style={s.wrapper}>
      <div className="in-page-body" style={s.pageBody}>
        <div className="in-card" style={s.card}>
          <div className="in-card-img" style={s.cardImg}>
            <img src={airplaneBg} alt="Avion" style={s.cardImgTag} />
            <div style={s.cardImgOverlay} />
            <div className="in-card-img-content" style={s.cardImgContent}>
              <div style={s.dots}>
                <div style={s.dotActive} />
                <div style={s.dotInactive} />
                <div style={s.dotInactive} />
              </div>
              <h2 className="in-card-img-title" style={s.cardImgTitle}>
                L'excellence du transport aérien, à votre portée.
              </h2>
              <p style={s.cardImgText}>
                Créez votre compte pour accéder à une gestion moderne, fluide
                et intelligente de vos opérations.
              </p>
            </div>
          </div>

          <div className="in-card-form" style={s.cardForm}>
            <div style={s.formBadge}>
              <span style={s.badgeDot} />
              ESPACE MEMBRE
            </div>

            <h1 className="in-form-title" style={s.formTitle}>
              Inscription
            </h1>
            <p className="in-form-subtitle" style={s.formSubtitle}>
              Veuillez remplir le formulaire pour créer votre compte.
            </p>

            {successMessage && (
              <div style={s.successBox}>{successMessage}</div>
            )}

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Nom complet</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  onBlur={() => handleBlur("nom")}
                  placeholder="Votre nom complet"
                  className={`in-input${touched.nom && nomError ? " in-input-error" : ""}`}
                />
                {touched.nom && nomError && (
                  <p style={s.fieldError}>{nomError}</p>
                )}
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="nom@example.com"
                  className={`in-input${touched.email && emailError ? " in-input-error" : ""}`}
                />
                {touched.email && emailError && (
                  <p style={s.fieldError}>{emailError}</p>
                )}
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Numéro de téléphone</label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  onBlur={() => handleBlur("telephone")}
                  placeholder="+216 XX XXX XXX"
                  className={`in-input${touched.telephone && telephoneError ? " in-input-error" : ""}`}
                />
                {touched.telephone && telephoneError && (
                  <p style={s.fieldError}>{telephoneError}</p>
                )}
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Mot de passe</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Votre mot de passe"
                    style={{ paddingRight: "48px" }}
                    className={`in-input${touched.password && passwordError ? " in-input-error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={s.eyeBtn}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7a9abf">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.204-3.592m2.122-1.65A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.224M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 9L3 3"
                        />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#7a9abf">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S3.732 16.057 2.458 12z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {touched.password && passwordError && (
                  <p style={s.fieldError}>{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className="in-submit"
              >
                Créer un compte
                {isFormValid && (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                )}
              </button>
            </form>

            <p style={s.loginText}>
              Vous avez déjà un compte ?{" "}
              <a href="/login" style={s.loginLink}>
                Connectez-vous ici
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    padding: "40px clamp(12px,4vw,40px)",
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

  dots: {
    display: "flex",
    gap: "6px",
    marginBottom: "18px",
  },

  dotActive: {
    width: "28px",
    height: "7px",
    borderRadius: "4px",
    background: "#fff",
  },

  dotInactive: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
  },

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

  successBox: {
    background: "#eefaf1",
    border: "1.5px solid #9dd8aa",
    color: "#1f7a36",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "16px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#0d2b5e",
  },

  fieldError: {
    fontSize: "12px",
    color: "#e74c3c",
    margin: 0,
  },

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

  loginText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#5a6e88",
    marginTop: "20px",
  },

  loginLink: {
    color: "#1252aa",
    fontWeight: 700,
    textDecoration: "none",
  },
};