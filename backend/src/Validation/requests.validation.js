const { z } = require("zod");
const { objectIdRegex } = require("../utils/objectId");

const createRequestSchema = z.object({
  body: z.object({
    from: z.string().min(2),
    to: z.string().min(2),
    date: z.string().min(1),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
      .optional(),
    passengers: z.number().int().min(1),
    comment: z.string().max(500).optional(),
    type: z.enum(["standard", "vip"]).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    passengerList: z.array(z.any()).optional(),
  }),
});

const listRequestsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z
      .enum(["EN_ATTENTE", "APPROUVEE", "REJETEE", "ANNULEE"])
      .optional(),
    date: z.string().optional(),
  }),
});

const requestActionSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
});

const assignRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
  body: z.object({
    driverId: z.string().regex(objectIdRegex, "Invalid id"),
    vehicleId: z.string().regex(objectIdRegex, "Invalid id"),
  }),
});

const updateRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
  body: z
    .object({
      from: z.string().min(2).optional(),
      to: z.string().min(2).optional(),
      date: z.string().min(1).optional(),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format")
        .optional(),
      passengers: z.number().int().min(1).optional(),
      comment: z.string().max(500).optional(),
      type: z.enum(["standard", "vip"]).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      passengerList: z.array(z.any()).optional(),
    
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      {
        message: "At least one field is required",
      },
    ),
});

const cancelRequestSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid id"),
  }),
});

module.exports = {
  createRequestSchema,
  listRequestsSchema,
  requestActionSchema,
  assignRequestSchema,
  updateRequestSchema,
  cancelRequestSchema,
};
