const fs = require('fs');

const content = fs.readFileSync('src/pages/responsable/NotificationR.jsx', 'utf-8');

// NotificationP
let content_p = content.replace(/responsableService/g, 'passengerService');
content_p = content_p.replace(/ESPACE RESPONSABLE/g, 'ESPACE PASSAGER');
content_p = content_p.replace(/Responsable/g, 'Passager');
content_p = content_p.replace(/NotificationR/g, 'NotificationP');
content_p = content_p.replace(/notificationR/g, 'notificationP');
content_p = content_p.replace(/airops-notifr2-css/g, 'airops-notifp2-css');
content_p = content_p.replace(/\/dashbordRES/g, '/dashbordP');

const nav_p = `  const navItems = [
    {
      label: "Tableau de bord",
      to: "/dashbordP",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    },
    {
      label: "Réserver demande",
      to: "/reserverD",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>,
    },
    {
      label: "Notifications",
      to: "/notificationP",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    },
    {
      label: "Ajouter avis",
      to: "/avisP",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    },
    {
      label: "Profile",
      to: "/profilP",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    },
  ];`;

content_p = content_p.replace(/const navItems = \[[\s\S]*?\];/, nav_p);

fs.writeFileSync('src/pages/passager/NotificationP.jsx', content_p, 'utf-8');

// NotificationM
let content_m = content.replace(/responsableService/g, 'chauffeurService');
content_m = content_m.replace(/ESPACE RESPONSABLE/g, 'ESPACE CHAUFFEUR');
content_m = content_m.replace(/Responsable/g, 'Chauffeur');
content_m = content_m.replace(/NotificationR/g, 'NotificationM');
content_m = content_m.replace(/notificationR/g, 'notificationM');
content_m = content_m.replace(/airops-notifr2-css/g, 'airops-notifm2-css');
content_m = content_m.replace(/\/dashbordRES/g, '/dashbordM');

const nav_m = `  const navItems = [
    {
      label: "Tableau de bord",
      to: "/dashbordM",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    },
    {
      label: "Missions",
      to: "/missionM",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>,
    },
    {
      label: "Notifications",
      to: "/notificationM",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    },
    {
      label: "Profile",
      to: "/profilM",
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    },
  ];`;

content_m = content_m.replace(/const navItems = \[[\s\S]*?\];/, nav_m);

fs.writeFileSync('src/pages/chauffeur/NotificationM.jsx', content_m, 'utf-8');

console.log('Done');
