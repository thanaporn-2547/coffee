const { z } = require('zod');
const createMenuSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
});
const updateMenuSchema = createMenuSchema.partial().extend({ isAvailable: z.boolean().optional() });
module.exports = { createMenuSchema, updateMenuSchema };