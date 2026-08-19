const { z } = require('zod');

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required').max(128),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(128),
    username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50).optional(),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(128)
      .optional(),
  })
  .refine((data) => data.username !== undefined || data.newPassword !== undefined, {
    message: 'Provide a new username and/or a new password.',
    path: ['username'],
  });

module.exports = { loginSchema, changePasswordSchema };
