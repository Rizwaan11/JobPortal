import { z, ZodSchema, ZodError } from 'zod';
import mongoose from 'mongoose';

export class ValidationError extends Error {
  constructor(public readonly zodError: ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export function validateBody<T extends ZodSchema>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error);
  return result.data;
}

export function validateQuery<T extends ZodSchema>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error);
  return result.data;
}

export function validateParam<T extends ZodSchema>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) throw new ValidationError(result.error);
  return result.data;
}


export const objectIdParam = z
  .string()
  .refine((val) => mongoose.isValidObjectId(val), { message: 'Invalid ID format' });
