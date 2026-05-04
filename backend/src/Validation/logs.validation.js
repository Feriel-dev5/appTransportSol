const { z } = require("zod");

const listLogsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

module.exports = { listLogsSchema };
