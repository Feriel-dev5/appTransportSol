import { useState, useEffect } from "react";

/* ══════════════════════════════════════════════
   CLÉS localStorage partagées
══════════════════════════════════════════════ */
export const STORAGE_FORM  = "airops_profil_form_v2";
export const STORAGE_PHOTO = "airops_profil_photo_v2";

/* Lecture directe (sans hook) */
export function getStoredName() {
  try {
    const s = localStorage.getItem(STORAGE_FORM);
    return s ? (JSON.parse(s).nom || "Ahmed Ben Ali") : "Ahmed Ben Ali";
  } catch { return "Ahmed Ben Ali"; }
}

export function getStoredPhoto() {
  try { return localStorage.getItem(STORAGE_PHOTO) || ""; }
  catch { return ""; }
}

export function getInitials(nom) {
  return (nom || "AB").trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "AB";
}

/* ══════════════════════════════════════════════
   HOOK — useProfileSync
   Retourne { nom, photo, initials }
   Se met à jour automatiquement quand ProfilP
   dispatch l'event "airops-profile-update"
   ou quand localStorage change dans un autre onglet.
══════════════════════════════════════════════ */
export function useProfileSync() {
  const [nom,   setNom]   = useState(getStoredName);
  const [photo, setPhoto] = useState(getStoredPhoto);

  useEffect(() => {
    const refresh = () => {
      setNom(getStoredName());
      setPhoto(getStoredPhoto());
    };

    /* Changement dans le même onglet (dispatché par ProfilP) */
    window.addEventListener("airops-profile-update", refresh);
    /* Changement depuis un autre onglet */
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("airops-profile-update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { nom, photo, initials: getInitials(nom) };
}