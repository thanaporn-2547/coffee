const { z } = require('zod');

const createTableSchema = z.object({
  tableNumber: z.number().int().positive(),
  capacity: z.number().int().min(1).max(20),
  location: z.string().optional(),
  description: z.string().optional(),
});

const updateTableSchema = createTableSchema.partial().extend({
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createTableSchema, updateTableSchema };