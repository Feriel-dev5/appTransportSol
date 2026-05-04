import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import airplaneBg from "../../assets/airplane2.png";
import { register as registerUser } from "../../services/authService";

const COUNTRIES = [
  { code:"TN", dial:"+216", flag:"🇹🇳", name:"Tunisie", digits:8 },
  { code:"DZ", dial:"+213", flag:"🇩🇿", name:"Algérie", digits:9 },
  { code:"MA", dial:"+212", flag:"🇲🇦", name:"Maroc", digits:9 },
  { code:"FR", dial:"+33", flag:"🇫🇷", name:"France", digits:9 },
  { code:"GB", dial:"+44", flag:"🇬🇧", name:"Royaume-Uni", digits:10 },
  { code:"SA", dial:"+966", flag:"🇸🇦", name:"Arabie Saoudite", digits:9 },
  { code:"AE", dial:"+971", flag:"🇦🇪", name:"Émirats Arabes", digits:9 },
  { code:"US", dial:"+1", flag:"🇺🇸", name:"États-Unis", digits:10 },
  { code:"DE", dial:"+49", flag:"🇩🇪", name:"Allemagne", digits:11 },
  { code:"IT", dial:"+39", flag:"🇮🇹", name:"Italie", digits:10 },
  { code:"ES", dial:"+34", flag:"🇪🇸", name:"Espagne", digits:9 },
  { code:"TR", dial:"+90", flag:"🇹🇷", name:"Turquie", digits:10 },
  { code:"EG", dial:"+20", flag:"🇪🇬", name:"Égypte", digits:10 },
  { code:"LY", dial:"+218", flag:"🇱🇾", name:"Libye", digits:9 },
  { code:"QA", dial:"+974", flag:"🇶🇦", name:"Qatar", digits:8 },
  { code:"KW", dial:"+965", flag:"🇰🇼", name:"Koweït", digits:8 },
  { code:"CN", dial:"+86", flag:"🇨🇳", name:"Chine", digits:11 },
  { code:"JP", dial:"+81", flag:"🇯🇵", name:"Japon", digits:10 },
  { code:"CA", dial:"+1", flag:"🇨🇦", name:"Canada", digits:10 },
  { code:"BR", dial:"+55", flag:"🇧🇷", name:"Brésil", digits:11 },
  { code:"RU", dial:"+7", flag:"🇷🇺", name:"Russie", digits:10 },
  { code:"IN", dial:"+91", flag:"🇮🇳", name:"Inde", digits:10 },
  { code:"AU", dial:"+61", flag:"🇦🇺", name:"Australie", digits:9 },
];

const PASSPORT_PREFIXES = [
  { code:"TUN", flag:"🇹🇳", country:"Tunisie", prefix:"TUN" },
  { code:"DZA", flag:"🇩🇿", country:"Algérie", prefix:"DZA" },
  { code:"MAR", flag:"🇲🇦", country:"Maroc", prefix:"MAR" },
  { code:"LBY", flag:"🇱🇾", country:"Libye", prefix:"LBY" },
  { code:"EGY", flag:"🇪🇬", country:"Égypte", prefix:"EGY" },
  { code:"FRA", flag:"🇫🇷", country:"France", prefix:"FRA" },
  { code:"GBR", flag:"🇬🇧", country:"Royaume-Uni", prefix:"GBR" },
  { code:"USA", flag:"🇺🇸", country:"États-Unis", prefix:"USA" },
  { code:"CAN", flag:"🇨🇦", country:"Canada", prefix:"CAN" },
  { code:"DEU", flag:"🇩🇪", country:"Allemagne", prefix:"DEU" },
  { code:"ITA", flag:"🇮🇹", country:"Italie", prefix:"ITA" },
  { code:"ESP", flag:"🇪🇸", country:"Espagne", prefix:"ESP" },
];

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
    border-color:#fca5a5!important;
    background:#fff8f8!important;
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

  .in-row-2cols {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:16px;
  }

  .in-doc-row {
    display:flex;
    gap:8px;
  }

  .in-doc-select {
    height:46px;
    border:1.5px solid #e4ecf4;
    border-radius:12px;
    background:#f7faff;
    color:#0d2b5e;
    font-size:12px;
    font-family:inherit;
    padding:0 10px;
    min-width:155px;
    outline:none;
  }

  .in-doc-select:focus {
    border-color:#1252aa;
    background:#fff;
    box-shadow:0 0 0 3px rgba(18,82,170,0.08);
  }

  @media (max-width: 768px) {
    .in-card-img { display:none!important; }
    .in-card-form { padding:34px 24px!important; }
    .in-row-2cols { grid-template-columns:1fr!important; }
  }

  @media (max-width: 480px) {
    .in-page-body { padding:20px 12px!important; }
    .in-card-form { padding:28px 18px!important; }
    .in-form-title { font-size:24px!important; }
    .in-doc-row { flex-direction:column; }
    .in-doc-select { width:100%; }
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
  const [phoneCountry, setPhoneCountry] = useState("TN");
  const [address, setAddress] = useState("");
  const [cin, setCin] = useState("");
  const [cinType, setCinType] = useState("TN");
  const [passportCountry, setPassportCountry] = useState("TUN");
  const [passportNumber, setPassportNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [touched, setTouched] = useState({
    nom: false,
    email: false,
    telephone: false,
    password: false,
    address: false,
    cin: false,
  });

  const navigate = useNavigate();

  const selectedPhone = COUNTRIES.find(c => c.code === phoneCountry) || COUNTRIES[0];
  const selectedPassport = PASSPORT_PREFIXES.find(p => p.code === passportCountry) || PASSPORT_PREFIXES[0];

  useEffect(() => {
    if (localStorage.getItem("in_nom")) setNom(localStorage.getItem("in_nom"));
    if (localStorage.getItem("in_email")) setEmail(localStorage.getItem("in_email"));
    if (localStorage.getItem("in_tel")) setTelephone(localStorage.getItem("in_tel"));
    if (localStorage.getItem("in_addr")) setAddress(localStorage.getItem("in_addr"));
  }, []);

  useEffect(() => { localStorage.setItem("in_nom", nom); }, [nom]);
  useEffect(() => { localStorage.setItem("in_email", email); }, [email]);
  useEffect(() => { localStorage.setItem("in_tel", telephone); }, [telephone]);
  useEffect(() => { localStorage.setItem("in_addr", address); }, [address]);

  const nomError = useMemo(() => {
    if (!touched.nom) return "";
    if (!nom.trim()) return "Le nom complet est obligatoire.";
    if (nom.trim().length < 2) return "Le nom doit contenir au moins 2 caractères.";
    return "";
  }, [nom, touched.nom]);

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "L'adresse e-mail est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Adresse e-mail invalide.";
    return "";
  }, [email, touched.email]);

  const telephoneError = useMemo(() => {
    if (!touched.telephone) return "";
    if (!telephone.trim()) return "Le numéro de téléphone est obligatoire.";
    if (telephone.replace(/\D/g, "").length !== selectedPhone.digits) {
      return `${selectedPhone.digits} chiffres requis.`;
    }
    return "";
  }, [telephone, selectedPhone.digits, touched.telephone]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password.trim()) return "Le mot de passe est obligatoire.";
    if (password.trim().length < 6) return "Minimum 6 caractères.";
    return "";
  }, [password, touched.password]);

  const addressError = useMemo(() => {
    if (!touched.address) return "";
    if (!address.trim()) return "L'adresse est obligatoire.";
    if (address.trim().length < 3) return "L'adresse doit contenir au moins 3 caractères.";
    return "";
  }, [address, touched.address]);

  const cinError = useMemo(() => {
    if (!touched.cin) return "";
    if (!cin.trim() && !passportNumber.trim()) {
      return "Renseignez votre CIN ou votre numéro de passeport.";
    }
    if (cinType === "TN" && cin.trim() && !/^\d{8}$/.test(cin.trim())) {
      return "La CIN tunisienne doit contenir 8 chiffres.";
    }
    return "";
  }, [cin, cinType, passportNumber, touched.cin]);

  const isFormValid =
    nom.trim() &&
    email.trim() &&
    telephone.trim() &&
    password.trim() &&
    address.trim() &&
    (cin.trim() || passportNumber.trim()) &&
    !nomError &&
    !emailError &&
    !telephoneError &&
    !passwordError &&
    !addressError &&
    !cinError;

  const handleBlur = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    setTouched({
      nom: true,
      email: true,
      telephone: true,
      password: true,
      address: true,
      cin: true,
    });

    if (!isFormValid) return;

    const fullPassportNumber = passportNumber.trim()
      ? `${selectedPassport.prefix}-${passportNumber.trim().toUpperCase()}`
      : "";

    setIsLoading(true);

    try {
      await registerUser({
        name: nom,
        email,
        password,
        telephone: `${selectedPhone.dial} ${telephone}`,
        address,
        cin: cin || undefined,
        passportNumber: fullPassportNumber || undefined,
      });

      ["in_nom", "in_email", "in_tel", "in_addr"].forEach((k) =>
        localStorage.removeItem(k)
      );

      setSuccessMessage("Compte créé avec succès ! Redirection vers la connexion…");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      if (error?.response?.data?.details?.fieldErrors) {
        const msgs = Object.values(error.response.data.details.fieldErrors).flat().join(" | ");
        setErrorMessage(msgs || "Erreur de validation.");
      } else if (error?.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Une erreur est survenue. Vérifiez que le serveur est démarré.");
      }
    } finally {
      setIsLoading(false);
    }
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
                Créez votre compte pour accéder à une gestion moderne, fluide et intelligente.
              </p>
            </div>
          </div>

          <div className="in-card-form" style={s.cardForm}>
            <div style={s.formBadge}>
              <span style={s.badgeDot} />
              ESPACE MEMBRE
            </div>

            <h1 className="in-form-title" style={s.formTitle}>Inscription</h1>

            <p className="in-form-subtitle" style={s.formSubtitle}>
              Veuillez remplir le formulaire pour créer votre compte.
            </p>

            {successMessage && <div style={s.successBox}>{successMessage}</div>}
            {errorMessage && <div style={s.errorBox}>{errorMessage}</div>}

            <form onSubmit={handleSubmit} style={s.form}>
              <div className="in-row-2cols">
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
                  {touched.nom && nomError && <p style={s.fieldError}>{nomError}</p>}
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
                  {touched.email && emailError && <p style={s.fieldError}>{emailError}</p>}
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>
                  Numéro de téléphone <span style={s.optTag}>({selectedPhone.digits} chiffres)</span>
                </label>

                <div className="in-doc-row">
                  <select
                    className="in-doc-select"
                    value={phoneCountry}
                    onChange={(e) => {
                      setPhoneCountry(e.target.value);
                      setTelephone("");
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dial} ({c.name})
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, selectedPhone.digits);
                      setTelephone(v);
                    }}
                    onBlur={() => handleBlur("telephone")}
                    placeholder={"0".repeat(selectedPhone.digits)}
                    className={`in-input${touched.telephone && telephoneError ? " in-input-error" : ""}`}
                  />
                </div>

                {touched.telephone && telephoneError && <p style={s.fieldError}>{telephoneError}</p>}
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Adresse</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => handleBlur("address")}
                  placeholder="Ville, pays…"
                  className={`in-input${touched.address && addressError ? " in-input-error" : ""}`}
                />
                {touched.address && addressError && <p style={s.fieldError}>{addressError}</p>}
              </div>

              <div className="in-row-2cols">
                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    CIN <span style={s.optTag}>(ou passeport)</span>
                  </label>

                  <div className="in-doc-row">
                    <select
                      className="in-doc-select"
                      value={cinType}
                      onChange={(e) => {
                        setCinType(e.target.value);
                        setCin("");
                      }}
                    >
                      <option value="TN">🇹🇳 CIN Tunisie</option>
                      <option value="OTHER">🌍 Identité étrangère</option>
                    </select>

                    <input
                      type="text"
                      value={cin}
                      onChange={(e) => {
                        const v = cinType === "TN"
                          ? e.target.value.replace(/\D/g, "").slice(0, 8)
                          : e.target.value.toUpperCase();
                        setCin(v);
                      }}
                      onBlur={() => handleBlur("cin")}
                      placeholder={cinType === "TN" ? "12345678" : "Numéro identité"}
                      className={`in-input${touched.cin && cinError ? " in-input-error" : ""}`}
                    />
                  </div>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    N° Passeport <span style={s.optTag}>(ou CIN)</span>
                  </label>

                  <div className="in-doc-row">
                    <select
                      className="in-doc-select"
                      value={passportCountry}
                      onChange={(e) => setPassportCountry(e.target.value)}
                    >
                      {PASSPORT_PREFIXES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.flag} {p.prefix} ({p.country})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                      placeholder="0000000"
                      className="in-input"
                    />
                  </div>
                </div>
              </div>

              {touched.cin && cinError && (
                <p style={{ ...s.fieldError, marginTop: "-10px" }}>{cinError}</p>
              )}

              {passportNumber.trim() && (
                <p style={{ fontSize: 12, color: "#1252aa", fontWeight: 600, marginTop: "-8px" }}>
                  {selectedPassport.flag} Numéro complet : {selectedPassport.prefix}-{passportNumber.trim().toUpperCase()}
                </p>
              )}

              <div style={s.fieldGroup}>
                <label style={s.label}>Mot de passe</label>

                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    placeholder="Minimum 6 caractères"
                    style={{ paddingRight: "48px" }}
                    className={`in-input${touched.password && passwordError ? " in-input-error" : ""}`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

                {touched.password && passwordError && <p style={s.fieldError}>{passwordError}</p>}
              </div>

              <button type="submit" disabled={!isFormValid || isLoading} className="in-submit">
                {isLoading ? "Création en cours..." : "Créer un compte"}
                {isFormValid && !isLoading && (
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                )}
              </button>
            </form>

            <p style={s.loginText}>
              Vous avez déjà un compte ?{" "}
              <a href="/login" style={s.loginLink}>Connectez-vous ici</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    minHeight:"100vh",
    display:"flex",
    flexDirection:"column",
    fontFamily:"'DM Sans','Segoe UI',sans-serif",
    background:"#f0f5fb",
    overflowX:"hidden",
  },
  pageBody: {
    flex:1,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    padding:"40px clamp(12px,4vw,40px)",
    minHeight:"100vh",
  },
  card: {
    width:"100%",
    maxWidth:"1180px",
    background:"#fff",
    borderRadius:"24px",
    boxShadow:"0 8px 40px rgba(18,82,170,0.10)",
    border:"1px solid #e4ecf4",
    overflow:"hidden",
    display:"flex",
    minHeight:"620px",
  },
  cardImg: {
    width:"38%",
    position:"relative",
    overflow:"hidden",
    flexShrink:0,
  },
  cardImgTag: {
    position:"absolute",
    inset:0,
    width:"100%",
    height:"100%",
    objectFit:"cover",
    transition:"transform 0.5s ease",
  },
  cardImgOverlay: {
    position:"absolute",
    inset:0,
    background:"linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(10,35,100,0.85) 100%)",
  },
  cardImgContent: {
    position:"relative",
    zIndex:2,
    height:"100%",
    display:"flex",
    flexDirection:"column",
    justifyContent:"flex-end",
    padding:"36px",
  },
  dots: {
    display:"flex",
    gap:"6px",
    marginBottom:"18px",
  },
  dotActive: {
    width:"28px",
    height:"7px",
    borderRadius:"4px",
    background:"#fff",
  },
  dotInactive: {
    width:"7px",
    height:"7px",
    borderRadius:"50%",
    background:"rgba(255,255,255,0.35)",
  },
  cardImgTitle: {
    fontSize:"26px",
    fontWeight:800,
    color:"#fff",
    lineHeight:1.2,
    marginBottom:"10px",
  },
  cardImgText: {
    fontSize:"13px",
    color:"rgba(200,220,255,0.9)",
    lineHeight:1.65,
  },
  cardForm: {
    flex:1,
    padding:"40px 44px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    overflowY:"auto",
  },
  formBadge: {
    display:"inline-flex",
    alignItems:"center",
    gap:"7px",
    background:"rgba(18,82,170,0.08)",
    border:"1px solid rgba(18,82,170,0.18)",
    color:"#1252aa",
    fontSize:"11px",
    fontWeight:700,
    letterSpacing:"1.2px",
    padding:"5px 14px",
    borderRadius:"24px",
    marginBottom:"16px",
    alignSelf:"flex-start",
  },
  badgeDot: {
    width:"6px",
    height:"6px",
    borderRadius:"50%",
    background:"#1252aa",
    display:"inline-block",
    flexShrink:0,
  },
  formTitle: {
    fontSize:"28px",
    fontWeight:800,
    color:"#0d2b5e",
    letterSpacing:"-0.5px",
    marginBottom:"4px",
  },
  formSubtitle: {
    fontSize:"14px",
    color:"#5a6e88",
    lineHeight:1.6,
    marginBottom:"20px",
  },
  successBox: {
    background:"#eefaf1",
    border:"1.5px solid #9dd8aa",
    color:"#1f7a36",
    padding:"12px 16px",
    borderRadius:"12px",
    fontSize:"13px",
    marginBottom:"14px",
  },
  errorBox: {
    background:"#fff8f8",
    border:"1.5px solid #fca5a5",
    color:"#c53030",
    padding:"12px 16px",
    borderRadius:"12px",
    fontSize:"13px",
    marginBottom:"14px",
  },
  form: {
    display:"flex",
    flexDirection:"column",
    gap:"16px",
  },
  fieldGroup: {
    display:"flex",
    flexDirection:"column",
    gap:"6px",
  },
  label: {
    fontSize:"13px",
    fontWeight:600,
    color:"#0d2b5e",
  },
  optTag: {
    fontWeight:400,
    color:"#8a9abf",
    fontSize:"12px",
  },
  fieldError: {
    fontSize:"12px",
    color:"#e74c3c",
    margin:0,
  },
  eyeBtn: {
    position:"absolute",
    right:"14px",
    top:"50%",
    transform:"translateY(-50%)",
    background:"none",
    border:"none",
    cursor:"pointer",
    padding:"2px",
    display:"flex",
    alignItems:"center",
  },
  loginText: {
    textAlign:"center",
    fontSize:"13px",
    color:"#5a6e88",
    marginTop:"18px",
  },
  loginLink: {
    color:"#1252aa",
    fontWeight:700,
    textDecoration:"none",
  },
};