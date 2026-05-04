const { asyncHandler } = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/pagination");
const { createAvisEntry, getAvis } = require("../Services/avis.service");

const createAvis = asyncHandler(async (req, res) => {
  const avis = await createAvisEntry(req.body);
  res.status(201).json({ avis });
});

const listAvis = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const avis = await getAvis(pagination, req.query.categorie);
  res.json({ page: pagination.page, limit: pagination.limit, data: avis });
});

module.exports = { createAvis, listAvis };
