const { z } = require('zod');

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

module.exports = { updateProfileSchema, changePasswordSchema, updateRoleSchema };