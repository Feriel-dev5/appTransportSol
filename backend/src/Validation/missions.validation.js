const { z } = require("zod");
const { objectIdRegex } = require("../utils/objectId");

const listMissionsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z
      .enum(["EN_ATTENTE", "EN_COURS", "TERMINEE", "ANNULEE"])
      .optional(),
    date: z.string().optional(),
    scope: z
      .enum(["24h", "48h", "tout", "today", "upcoming", "history"])
      .optional(),
  }),
});

const missionActionSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
});

const createMissionSchema = z.object({
  body: z.object({
    passengerId: z.string().regex(objectIdRegex, "Invalid id"),
    driverId: z.string().regex(objectIdRegex, "Invalid id"),
    vehicleId: z.string().regex(objectIdRegex, "Invalid id"),
    from: z.string().min(2),
    to: z.string().min(2),
    date: z.string().min(1),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
      .optional(),
    passengers: z.number().int().min(1),
    comment: z.string().max(500).optional(),
  }),
});

const updateMissionSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
  body: z
    .object({
      status: z
        .enum(["EN_ATTENTE", "EN_COURS", "TERMINEE", "ANNULEE"])
        .optional(),
      driverId: z.string().regex(objectIdRegex, "Invalid id").optional(),
      vehicleId: z.string().regex(objectIdRegex, "Invalid id").optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      {
        message: "At least one field is required",
      },
    ),
});

module.exports = {
  listMissionsSchema,
  missionActionSchema,
  createMissionSchema,
  updateMissionSchema,
};
