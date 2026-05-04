const { z } = require("zod");

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["ADMIN", "RESPONSABLE", "CHAUFFEUR", "PASSAGER"]),
    phone: z.string().optional(),
    passportNumber: z.string().min(3).optional(),
    cin: z.string().min(3).optional(),
    address: z.string().min(3).optional(),
  }),
});

const listUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    role: z.enum(["ADMIN", "RESPONSABLE", "CHAUFFEUR", "PASSAGER"]).optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      phone: z.string().optional(),
      passportNumber: z.string().min(3).optional(),
      cin: z.string().min(3).optional(),
      address: z.string().min(3).optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      {
        message: "At least one field is required",
      },
    ),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      phone: z.string().optional(),
      passportNumber: z.string().min(3).optional(),
      cin: z.string().min(3).optional(),
      address: z.string().min(3).optional(),
      role: z
        .enum(["ADMIN", "RESPONSABLE", "CHAUFFEUR", "PASSAGER"])
        .optional(),
      availability: z.enum(["DISPONIBLE", "OCCUPE"]).optional(),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      {
        message: "At least one field is required",
      },
    ),
});

module.exports = {
  createUserSchema,
  listUsersSchema,
  updateProfileSchema,
  updateUserSchema,
};
