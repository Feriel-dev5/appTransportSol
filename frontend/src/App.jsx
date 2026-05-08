import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import APropos from "./pages/APropos";
import Navettes from "./pages/Navettes";
import Contact from "./pages/Contact";
import Login from "./pages/authentification/Login";
import Inscription from "./pages/authentification/Inscription";
import ForgotPassword from "./pages/authentification/ForgotPassword";
import ResetPassword from "./pages/authentification/ResetPassword";
import DashbordCH from "./pages/chauffeur/DashbordCH";
import DashbordR from "./pages/responsable/DashbordR";
import DashbordADMIN from "./pages/admin/DashbordADMIN";
import DashbordP from "./pages/passager/DashbordP";
import HistoriqueM from "./pages/chauffeur/HistoriqueM";
import NotificationM from "./pages/chauffeur/NotificationM";
import NavigationCH from "./pages/chauffeur/NavigationCH";
import IncidentsPage from "./pages/chauffeur/IncidentsPage";
import AjouterChauffeur from "./pages/responsable/AjouterChauffeur";
import AjouterPassager from "./pages/responsable/AjouterPassager";
import NotificationR from "./pages/responsable/NotificationR";
import ReserverD from "./pages/passager/ReserverD";
import NotificationP from "./pages/passager/NotificationP";
import ProfilP from "./pages/passager/ProfilP";
import ListeU from "./pages/admin/ListeU";
import ProfilA from "./pages/admin/ProfilA";
import AvisP from "./pages/passager/AvisP";
import AjouterUtilisateur from "./pages/admin/AjouterUtilisateur";
import AjouterVehicule from "./pages/admin/AjouterVehicule";
import AvisAdmin from "./pages/admin/AvisAdmin";
import ListeVehicules from "./pages/admin/ListeVehicules";


/* ── Auth guards ── */
function getAuth() {
  try {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function PrivateRoute({ children, roles }) {
  const { token, user } = getAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && user?.role && !roles.includes(user.role)) {
    const dest = user.role === "ADMIN" ? "/dashbordADMIN"
      : user.role === "RESPONSABLE" ? "/dashbordRES"
      : user.role === "CHAUFFEUR"   ? "/dashbordchauffeur"
      : "/dashbordP";
    return <Navigate to={dest} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Pages Visiteur ── */}
        <Route path="/"         element={<Home />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/navettes" element={<Navettes />} />
        <Route path="/contact"  element={<Contact />} />

        {/* ── Authentification ── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/inscription"     element={<Inscription />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Chauffeur ── */}
        <Route path="/dashbordchauffeur" element={<PrivateRoute roles={["CHAUFFEUR"]}><DashbordCH /></PrivateRoute>} />
        <Route path="/historiqueM"       element={<PrivateRoute roles={["CHAUFFEUR"]}><HistoriqueM /></PrivateRoute>} />
        <Route path="/notificationM"     element={<PrivateRoute roles={["CHAUFFEUR"]}><NotificationM /></PrivateRoute>} />
        <Route path="/navigationCH"      element={<PrivateRoute roles={["CHAUFFEUR"]}><NavigationCH /></PrivateRoute>} />
        <Route path="/incidentsCH"       element={<PrivateRoute roles={["CHAUFFEUR"]}><IncidentsPage /></PrivateRoute>} />
        {/* ── Responsable ── */}
        <Route path="/dashbordRES"      element={<PrivateRoute roles={["RESPONSABLE"]}><DashbordR /></PrivateRoute>} />
        <Route path="/notificationR"    element={<PrivateRoute roles={["RESPONSABLE"]}><NotificationR /></PrivateRoute>} />
        <Route path="/ajouterChauffeur" element={<PrivateRoute roles={["RESPONSABLE"]}><AjouterChauffeur /></PrivateRoute>} />
        <Route path="/ajouterPassager"  element={<PrivateRoute roles={["RESPONSABLE"]}><AjouterPassager /></PrivateRoute>} />

        {/* ── Admin ── */}
        <Route path="/dashbordADMIN"   element={<PrivateRoute roles={["ADMIN"]}><DashbordADMIN /></PrivateRoute>} />
        <Route path="/listeU"          element={<PrivateRoute roles={["ADMIN"]}><ListeU /></PrivateRoute>} />
        <Route path="/listeV"          element={<PrivateRoute roles={["ADMIN"]}><ListeVehicules /></PrivateRoute>} />
        <Route path="/profilA"         element={<PrivateRoute roles={["ADMIN"]}><ProfilA /></PrivateRoute>} />
        <Route path="/ajouterU"        element={<PrivateRoute roles={["ADMIN"]}><AjouterUtilisateur /></PrivateRoute>} />
        <Route path="/ajouterVehicule" element={<PrivateRoute roles={["ADMIN"]}><AjouterVehicule /></PrivateRoute>} />
        <Route path="/avisAdmin" element={<PrivateRoute roles={["ADMIN"]}><AvisAdmin /></PrivateRoute>} />

        {/* ── Passager ── */}
        <Route path="/dashbordP"     element={<PrivateRoute roles={["PASSAGER"]}><DashbordP /></PrivateRoute>} />
        <Route path="/reserverD"     element={<PrivateRoute roles={["PASSAGER"]}><ReserverD /></PrivateRoute>} />
        <Route path="/notificationP" element={<PrivateRoute roles={["PASSAGER"]}><NotificationP /></PrivateRoute>} />
        <Route path="/profilP"       element={<PrivateRoute roles={["PASSAGER"]}><ProfilP /></PrivateRoute>} />
        <Route path="/avisP"         element={<PrivateRoute roles={["PASSAGER"]}><AvisP /></PrivateRoute>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;