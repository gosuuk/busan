import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password must be 100 characters or shorter.")
  .regex(/[A-Za-z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.");

const phoneNumberSchema = z
  .string()
  .trim()
  .min(9)
  .max(30)
  .regex(/^[0-9+\-\s()]+$/);

export const signupRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    nickname: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    phoneNumber: phoneNumberSchema,
    email: z.string().trim().email().max(255),
    password: passwordSchema,
    passwordConfirm: z.string().min(1),
    acceptedRequiredTerms: z.boolean().refine(Boolean),
    acceptedServiceTerms: z.boolean().refine(Boolean),
    acceptedPrivacy: z.boolean().refine(Boolean),
  })
  .superRefine((value, context) => {
    if (value.password !== value.passwordConfirm) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["passwordConfirm"],
      });
    }
  });

export const loginRequestSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(100),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
}
