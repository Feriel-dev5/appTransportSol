import { useState, useEffect, useCallback, useRef } from "react";
import { fetchNotifications } from "./chauffeurService";

/* ══════════════════════════════════════════════════════════════
   useChauffeurNotifications
   Hook partagé pour synchroniser le badge de notifications
   sur toutes les pages chauffeur.
   
   Optimisations :
   - Cache en mémoire pour éviter les appels multiples
     lors de navigations rapides entre pages
   - Rafraîchissement automatique toutes les 60 secondes
   - Mise à jour instantanée via l'événement "airops-notif-update"
══════════════════════════════════════════════════════════════ */

// Cache global partagé entre toutes les instances du hook
let cachedCount = 0;
let lastFetchTime = 0;
const CACHE_DURATION = 10_000; // 10 secondes de cache minimum entre les fetches

export function useChauffeurNotifications() {
  const [unreadCount, setUnreadCount] = useState(cachedCount);
  const isMounted = useRef(true);

  const updateCount = useCallback(async (force = false) => {
    const now = Date.now();
    // Si le cache est encore valide et qu'on ne force pas, on utilise le cache
    if (!force && now - lastFetchTime < CACHE_DURATION) {
      setUnreadCount(cachedCount);
      return;
    }

    try {
      const res = await fetchNotifications({ limit: 50 });
      const count = (res.data || []).filter(n => !n.isRead).length;
      cachedCount = count;
      lastFetchTime = Date.now();
      if (isMounted.current) setUnreadCount(count);
    } catch {
      // En cas d'erreur (429, réseau…), on garde le cache existant
      if (isMounted.current) setUnreadCount(cachedCount);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    updateCount();

    // Rafraîchir toutes les 60 secondes
    const timer = setInterval(() => updateCount(true), 60_000);

    // Écouter les événements de mise à jour (quand on marque comme lu, etc.)
    const onUpdate = () => {
      lastFetchTime = 0; // Invalider le cache
      updateCount(true);
    };
    window.addEventListener("airops-notif-update", onUpdate);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
      window.removeEventListener("airops-notif-update", onUpdate);
    };
  }, [updateCount]);

  return { unreadCount, updateCount: () => updateCount(true) };
}
