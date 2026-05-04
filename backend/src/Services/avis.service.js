const { createAvis, listAvis } = require("../Repository/avis.repository");

const normalizeCategorie = (categorie) =>
  categorie === "chauffeurr" ? "chauffeur" : categorie;

const createAvisEntry = async (payload) =>
  createAvis({
    categorie: normalizeCategorie(payload.categorie),
    note: payload.note,
    message: payload.message,
  });

const getAvis = async (pagination, categorie) =>
  listAvis({
    skip: pagination.skip,
    take: pagination.limit,
    categorie: categorie ? normalizeCategorie(categorie) : undefined,
  });

module.exports = { createAvisEntry, getAvis };
