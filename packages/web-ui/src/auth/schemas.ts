// Client-side rules mirror the contract (openapi.yaml): messages are i18n keys, resolved at render.
import { z } from 'zod';

/** E.164, as in every writable `phone` in the contract. */
export const E164 = /^\+[1-9][0-9]{7,14}$/;

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'validation:required').email('validation:email'),
  password: z.string().min(1, 'validation:required'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, 'validation:required').max(150, 'validation:tooLong'),
  email: z
    .string()
    .trim()
    .min(1, 'validation:required')
    .max(255, 'validation:tooLong')
    .email('validation:email'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || E164.test(v), 'validation:phone'),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;
export interface ProfileValues {
  full_name: string;
  email: string;
  phone: string | null;
}

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'validation:required'),
    new_password: z.string().min(8, 'validation:passwordMin'),
    confirm: z.string().min(1, 'validation:required'),
  })
  .refine((v) => v.new_password === v.confirm, { path: ['confirm'], message: 'password:mismatch' });
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export interface ChangePasswordValues {
  current_password: string;
  new_password: string;
}
