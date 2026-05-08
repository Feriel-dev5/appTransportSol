const { z } = require("zod");
const { objectIdRegex } = require("../utils/objectId");

const createIncidentSchema = z.object({
  body: z.object({
    missionId: z.string().regex(objectIdRegex, "Invalid id").optional(),
    description: z.string().min(5).max(1000),
    priority: z.enum(["low", "medium", "high"]).optional(),
  }),
});

// Réclamation passager
const createPassagerIncidentSchema = z.object({
  body: z.object({
    categorie: z.enum(["APPLICATION", "CHAUFFEUR", "SERVICE"]),
    description: z.string().min(5).max(1000),
    missionId: z.string().regex(objectIdRegex, "Invalid id").optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  }),
});

const listIncidentsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(["OUVERT", "RESOLU"]).optional(),
  }),
});

module.exports = { createIncidentSchema, createPassagerIncidentSchema, listIncidentsSchema };