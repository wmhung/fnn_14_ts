import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address' })
    .max(254, { message: 'Email is too long' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(1, { message: 'Full name is required' }).trim(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'Invalid email address' })
      .max(254, { message: 'Email is too long' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .max(72, { message: 'Password must be at most 72 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .max(72, { message: 'Password must be at most 72 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const updateUserSchema = z.object({
  num_of_kids: z.enum(['', '1', '2', '3', 'over3']).nullable().optional(),
  gender: z.enum(['', 'male', 'female']).nullable().optional(),
});

export const requestResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email address' })
    .max(254, { message: 'Email is too long' }),
});

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, { message: 'This link is invalid or has expired.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' })
      .max(72, { message: 'Password must be at most 72 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
