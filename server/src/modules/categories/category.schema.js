const { z } = require('zod');
const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
});
const updateCategorySchema = createCategorySchema.partial().extend({ isActive: z.boolean().optional() });
module.exports = { createCategorySchema, updateCategorySchema };