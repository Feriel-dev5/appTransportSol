import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/authentification/Login";
import Inscription from "./pages/authentification/Inscription";
import DashbordCH from "./pages/chauffeur/DashbordCH";
import DashbordR from "./pages/responsable/DashbordR";
import DashbordADMIN from "./pages/admin/DashbordADMIN";
import DashbordP from "./pages/passager/DashbordP";
import HistoriqueM from "./pages/chauffeur/HistoriqueM";
import NotificationM from "./pages/chauffeur/NotificationM";
import ProfilCH from "./pages/chauffeur/ProfilCH";
import ProfilR from "./pages/responsable/ProfilR";
import ReserverD from "./pages/passager/ReserverD";
import NotificationP from "./pages/passager/NotificationP";
import ProfilP from "./pages/passager/ProfilP";
import ListeU from "./pages/admin/ListeU";
import ProfilA from "./pages/admin/ProfilA";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/dashbordchauffeur" element={<DashbordCH />} />
        <Route path="/dashbordRES" element={<DashbordR />} />
        <Route path="/dashbordADMIN" element={<DashbordADMIN />} />
        <Route path="/dashbordP" element={<DashbordP />} />
        <Route path="/historiqueM" element={<HistoriqueM />} />
        <Route path="/notificationM" element={<NotificationM />} />
        <Route path="/profilCH" element={<ProfilCH />} />
        <Route path="/profilR" element={<ProfilR />} />
        <Route path="/reserverD" element={<ReserverD />} />
        <Route path="/notificationP" element={<NotificationP />} />
        <Route path="/profilP" element={<ProfilP />} />
        <Route path="/listeU" element={<ListeU/>} />
        <Route path="/profilA" element={<ProfilA />} />

        
      </Routes>
    </Router>
  );
}

export default App;