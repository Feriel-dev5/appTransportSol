const { z } = require("zod");

const listNotificationsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

const notificationActionSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

module.exports = { listNotificationsSchema, notificationActionSchema };
