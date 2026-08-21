import { z } from 'zod';

export const registerSchema = z.object({
  email:    z.string().email('Must be a valid email address').transform(v => v.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password must be fewer than 72 characters'),
  role:     z.enum(['recruiter', 'applicant'], { errorMap: () => ({ message: 'Invalid role' }) }),
});

export const loginSchema = z.object({
  email:    z.string().email('Must be a valid email address').transform(v => v.toLowerCase()),
  password: z.string().min(1, 'Password is required').max(1000, 'Password too long'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Must be a valid email address').transform(v => v.toLowerCase()),
  otp:   z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Verification code must be numeric'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Must be a valid email address').transform(v => v.toLowerCase()),
});

export type RegisterInput           = z.infer<typeof registerSchema>;
export type LoginInput              = z.infer<typeof loginSchema>;
export type RefreshInput            = z.infer<typeof refreshSchema>;
export type LogoutInput             = z.infer<typeof logoutSchema>;
export type VerifyEmailInput        = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
