const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const {
  createAvisEntry,
  getAvis,
  countAvisEntries,
  moderateAvis,
  getAvisAcceptes,
} = require("../Services/avis.service");

const createAvis = asyncHandler(async (req, res) => {
  const avis = await createAvisEntry({
    ...req.body,
    userId: req.user._id || req.user.id,
  });
  res.status(201).json({ avis });
});

const listAvis = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const filters = {
    categorie: req.query.categorie,
    statut: req.query.statut,
  };

  // Si c'est un passager, on ne montre que ses avis
  if (req.user.role === "PASSAGER") {
    filters.userId = req.user._id || req.user.id;
  }

  const [data, total] = await Promise.all([
    getAvis(pagination, filters),
    countAvisEntries(filters),
  ]);
  res.json({ page: pagination.page, limit: pagination.limit, total, data });
});

const modererAvis = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  if (!statut)
    return res.status(400).json({ message: "Le champ 'statut' est requis." });
  const avis = await moderateAvis(req.params.id, statut);
  if (!avis) return res.status(404).json({ message: "Avis introuvable." });
  res.json({ avis });
});

const getAcceptedAvis = asyncHandler(async (req, res) => {
  const data = await getAvisAcceptes();
  res.json({ data });
});

module.exports = { createAvis, listAvis, modererAvis, getAcceptedAvis };