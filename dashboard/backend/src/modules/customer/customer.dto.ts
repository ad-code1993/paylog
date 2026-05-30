import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Customer name is required" }).min(2, "Name must be at least 2 characters"),
    phone: z
      .string({ required_error: "Customer phone number is required" })
      .min(8, "Phone number must be at least 8 characters"),
  }),
});

export const getCustomerByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid customer ID format"),
  }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>["body"];
