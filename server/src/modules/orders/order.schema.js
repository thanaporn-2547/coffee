const { z } = require('zod');

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1),
  notes: z.string().optional(),
});

const createOrderSchema = z.object({
  reservationId: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'served', 'completed', 'cancelled']),
});

module.exports = { createOrderSchema, updateStatusSchema };