const { z } = require('zod');

const createReservationSchema = z.object({
  tableId: z.string().min(1),
  reservationDate: z.string().datetime(),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  guestCount: z.number().int().min(1).max(20),
  specialRequest: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

module.exports = { createReservationSchema, updateStatusSchema };