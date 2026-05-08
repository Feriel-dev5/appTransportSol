import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════════════════════════
   useProfileSync — Service de synchronisation du profil passager
   Fichier : src/services/useProfileSync.js

   Expose :
   - getAuthUser()    → objet user depuis localStorage "user"
   - getStoredName()  → nom du compte connecté
   - getStoredPhoto() → photo de profil locale
   - getInitials(nom) → initiales (ex: "MA" pour "Mohamed Ali")
   - useProfileSync() → hook React  { nom, email, photo, initials, authUser }

   Synchronisation automatique via :
   - Event custom "airops-profile-update" (même onglet)
   - Event "storage" (autre onglet)
══════════════════════════════════════════════════════════════ */

export const STORAGE_FORM  = "airops_profil_form_v2";
export const STORAGE_PHOTO = "airops_profil_photo_v2";

/**
 * Retourne l'objet user stocké lors du login
 * { id, name, email, role, phone, address, ... }
 */
export function getAuthUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retourne le nom du compte connecté.
 * Priorité : user.name (depuis le login) → formulaire local → "Passager"
 */
export function getStoredName() {
  const authUser = getAuthUser();
  if (authUser?.name) return authUser.name;

  try {
    const s = localStorage.getItem(STORAGE_FORM);
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed.nom) return parsed.nom;
    }
  } catch {/* ignore */}

  return "Passager";
}

/**
 * Retourne la photo de profil stockée localement (base64 ou URL).
 */
export function getStoredPhoto() {
  try {
    const u = getAuthUser();
    const uid = u?._id || u?.id || u?.email || "default";
    const key = `${STORAGE_PHOTO}_${uid}`;
    const p = localStorage.getItem(key) || sessionStorage.getItem("airops_photo_current");
    if (p) return p;
  } catch {/* ignore */}
  return "";
}

/**
 * Génère les initiales depuis un nom complet.
 * Ex: "Mohamed Ali" → "MA" | "Passager" → "P"
 */
export function getInitials(nom) {
  return (nom || "P")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "P";
}

/**
 * Hook React — useProfileSync
 *
 * Retourne { nom, email, photo, initials, authUser }
 * Se met à jour automatiquement quand :
 *  - ProfilP appelle updateMyProfile() et dispatch "airops-profile-update"
 *  - localStorage change dans un autre onglet (event "storage")
 *
 * @example
 *   const { nom, photo, initials } = useProfileSync();
 */
export function useProfileSync() {
  const [nom,   setNom]   = useState(getStoredName);
  const [photo, setPhoto] = useState(getStoredPhoto);
  const [email, setEmail] = useState(() => getAuthUser()?.email || "");
  const [unreadCount, setUnreadCount] = useState(0);

  // Gestion des notifications (définie en dehors du useEffect pour être exportée)
  const refreshNotifs = useCallback(async () => {
    try {
      const user = getAuthUser();
      if (!user) return;
      
      const { fetchNotifications } = await import("./responsableService");
      const resp = await fetchNotifications({ limit: 50 });
      const unread = (resp.data || []).filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Erreur sync notifications:", err);
    }
  }, []);

  useEffect(() => {
    const refresh = () => {
      setNom(getStoredName());
      setPhoto(getStoredPhoto());
      setEmail(getAuthUser()?.email || "");
    };


    refresh();
    refreshNotifs();

    // Changement déclenché dans le même onglet (ProfilP après save)
    window.addEventListener("airops-profile-update", refresh);
    // On écoute aussi les mises à jour de notifications (custom event)
    window.addEventListener("airops-notif-update", refreshNotifs);
    // Changement depuis un autre onglet du navigateur
    window.addEventListener("storage", refresh);

    // Intervalle de rafraîchissement des notifications (optionnel, ex: toutes les 2 min)
    const interval = setInterval(refreshNotifs, 120000);

    // ✅ VERIFICATION DE SESSION (Sécurité renforcée)
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // On appelle le backend pour vérifier le token et le rôle
        const { verifySession } = await import("./authService");
        const user = await verifySession();

        // Si le rôle a changé et n'est plus compatible, on déconnecte (optionnel mais recommandé)
        const currentRole = JSON.parse(localStorage.getItem("user") || "{}").role;
        if (user && user.role !== currentRole) {
          window.location.href = "/login";
        }
      } catch (err) {
        // L'intercepteur axios gère déjà la redirection en cas de 401
      }
    };

    checkSession();

    return () => {
      window.removeEventListener("airops-profile-update", refresh);
      window.removeEventListener("airops-notif-update", refreshNotifs);
      window.removeEventListener("storage", refresh);
      clearInterval(interval);
    };
  }, [refreshNotifs]);

  return {
    nom,
    email,
    photo,
    unreadCount,
    initials: getInitials(nom),
    authUser: getAuthUser(),
    refreshNotifs,
  };
}