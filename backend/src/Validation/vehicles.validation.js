const { z } = require("zod");
const { objectIdRegex } = require("../utils/objectId");

const createVehicleSchema = z.object({
  body: z.object({
    plate: z.string().min(1, "Immatriculation requise"),
    model: z.string().min(1, "Modèle requis"),
    type: z
      .string()
      .transform((v) => v.toUpperCase())
      .refine((v) => ["BUS", "MINIBUS", "BERLINE"].includes(v), {
        message: "Type invalide",
      }),
    capacity: z.number().int().min(1, "Capacité minimum 1"),
    year: z.number().optional(),
    color: z.string().optional(),
    fuelType: z.string().optional(),
    mileage: z.number().optional(),
    status: z.enum(["DISPONIBLE", "MAINTENANCE", "OCCUPE"]).optional(),
  }),
});

const listVehiclesSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
  body: z.object({
    plate: z.string().min(1).optional(),
    model: z.string().min(1).optional(),
    type: z
      .string()
      .transform((v) => v.toUpperCase())
      .refine((v) => ["BUS", "MINIBUS", "BERLINE"].includes(v), {
        message: "Type invalide",
      })
      .optional(),
    capacity: z.number().int().min(1).optional(),
    year: z.number().optional(),
    color: z.string().optional(),
    fuelType: z.string().optional(),
    mileage: z.number().optional(),
    status: z.enum(["DISPONIBLE", "MAINTENANCE", "OCCUPE"]).optional(),
  }),
});

module.exports = {
  createVehicleSchema,
  listVehiclesSchema,
  updateVehicleSchema,
};
