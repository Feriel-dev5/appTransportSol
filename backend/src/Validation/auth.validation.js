const { z } = require("zod");

const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z
        .enum(["ADMIN", "RESPONSABLE", "CHAUFFEUR", "PASSAGER"])
        .optional(),
      phone: z.string().optional(),
      passportNumber: z.string().min(3).optional(),
      cin: z.string().min(3).optional(),
      address: z.string().min(3),
      numeroPermis: z.string().optional(),
    })
    .refine((data) => data.passportNumber || data.cin, {
      message: "passportNumber or cin is required",
      path: ["passportNumber"],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

module.exports = { registerSchema, loginSchema, resetPasswordSchema };
