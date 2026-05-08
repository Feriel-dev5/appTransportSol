const {
  createAvis,
  listAvis,
  countAvis,
  updateAvisStatut,
  listAvisAcceptes,
} = require("../Repository/avis.repository");

const normalizeCategorie = (categorie) =>
  categorie === "chauffeurr" ? "chauffeur" : categorie;

const createAvisEntry = async (payload) =>
  createAvis({
    userId: payload.userId,
    categorie: normalizeCategorie(payload.categorie),
    note: payload.note,
    message: payload.message,
  });

const getAvis = async (pagination, filters = {}) =>
  listAvis({
    skip: pagination.skip,
    take: pagination.limit,
    categorie: filters.categorie ? normalizeCategorie(filters.categorie) : undefined,
    statut: filters.statut || undefined,
    userId: filters.userId || undefined,
  });

const countAvisEntries = async (filters = {}) =>
  countAvis({
    categorie: filters.categorie ? normalizeCategorie(filters.categorie) : undefined,
    statut: filters.statut || undefined,
    userId: filters.userId || undefined,
  });

const moderateAvis = async (id, statut) => {
  if (!["ACCEPTER", "REFUSER"].includes(statut))
    throw new Error("Statut invalide : doit être ACCEPTER ou REFUSER");
  return updateAvisStatut(id, statut);
};

const getAvisAcceptes = async () => listAvisAcceptes();

module.exports = {
  createAvisEntry,
  getAvis,
  countAvisEntries,
  moderateAvis,
  getAvisAcceptes,
};