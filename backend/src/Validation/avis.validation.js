const { z } = require("zod");

const avisCategories = ["chauffeur", "services", "application", "chauffeurr"];

const createAvisSchema = z.object({
  body: z.object({
    categorie: z.enum(avisCategories),
    note: z.number().min(1).max(5),
    message: z.string().min(3).max(1000),
  }),
});

const listAvisSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    categorie: z.enum(avisCategories).optional(),
    statut: z.enum(["EN_ATTENTE", "ACCEPTER", "REFUSER"]).optional(),
  }),
});

const modererAvisSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    statut: z.enum(["ACCEPTER", "REFUSER"]),
  }),
});

module.exports = { createAvisSchema, listAvisSchema, modererAvisSchema };