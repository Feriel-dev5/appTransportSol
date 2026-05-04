const Avis = require("./models/avis.model");

const createAvis = (data) => Avis.create(data);

const listAvis = ({ skip, take, categorie }) =>
  Avis.find(categorie ? { categorie } : {})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(take)
    .exec();

module.exports = { createAvis, listAvis };
