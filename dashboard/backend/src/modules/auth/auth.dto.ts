import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }).min(2, "Name must be at least 2 characters"),
    phone: z
      .string({ required_error: "Phone number is required" })
      .min(8, "Phone number must be at least 8 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string({ required_error: "Phone number is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
