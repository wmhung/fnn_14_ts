import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: '電子郵件地址無效' })
    .max(254, { message: '電子郵件過長' }),
  password: z
    .string()
    .min(8, { message: '密碼至少需要 8 個字元' }),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(1, { message: '姓名為必填' }).trim(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: '電子郵件地址無效' })
      .max(254, { message: '電子郵件過長' }),
    password: z
      .string()
      .min(8, { message: '密碼至少需要 8 個字元' })
      .max(72, { message: '密碼最多 72 個字元' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: '密碼至少需要 8 個字元' })
      .max(72, { message: '密碼最多 72 個字元' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
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
    .email({ message: '電子郵件地址無效' })
    .max(254, { message: '電子郵件過長' }),
});

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, { message: '此連結無效或已過期。' }),
    password: z
      .string()
      .min(8, { message: '密碼至少需要 8 個字元' })
      .max(72, { message: '密碼最多 72 個字元' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  });
