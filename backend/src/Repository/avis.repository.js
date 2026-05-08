const Avis = require("./models/avis.model");

const createAvis = (data) => Avis.create(data);

const listAvis = ({ skip, take, categorie, statut, userId }) =>
  Avis.find({
    ...(categorie ? { categorie } : {}),
    ...(statut ? { statut } : {}),
    ...(userId ? { userId } : {}),
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .populate("userId", "name email photo")
    .exec();

const countAvis = ({ categorie, statut, userId } = {}) =>
  Avis.countDocuments({
    ...(categorie ? { categorie } : {}),
    ...(statut ? { statut } : {}),
    ...(userId ? { userId } : {}),
  });

const findAvisById = (id) =>
  Avis.findById(id).populate("userId", "name email photo").exec();

const updateAvisStatut = (id, statut) =>
  Avis.findByIdAndUpdate(id, { statut }, { new: true })
    .populate("userId", "name email")
    .exec();

const listAvisAcceptes = () =>
  Avis.find({ statut: "ACCEPTER" })
    .sort({ createdAt: -1 })
    .populate("userId", "name email photo")
    .exec();

module.exports = {
  createAvis,
  listAvis,
  countAvis,
  findAvisById,
  updateAvisStatut,
  listAvisAcceptes,
};