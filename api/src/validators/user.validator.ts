import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .regex(/^\d{10}$/, { message: "Phone number must be 10 digits" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one digit" })
    .regex(/[@$!%*?&]/, {
      message: "Password must contain at least one special character",
    }),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
