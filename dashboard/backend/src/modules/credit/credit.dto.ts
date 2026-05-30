import { z } from "zod";
import { CreditStatus } from "@prisma/client";

export const createCreditSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: "Customer ID is required" }).uuid("Invalid customer ID format"),
    amount: z
      .number({ required_error: "Amount is required" })
      .positive("Amount must be greater than zero"),
    dueDate: z
      .string({ required_error: "Due date is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Due date must be a valid ISO date string",
      }),
  }),
});

export const getCreditByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid credit ID format"),
  }),
});

export const patchCreditStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid credit ID format"),
  }),
  body: z.object({
    status: z.nativeEnum(CreditStatus, {
      required_error: "Status is required",
      invalid_type_error: "Invalid status value. Must be ACTIVE, OVERDUE, or CLOSED",
    }),
  }),
});

export type CreateCreditInput = z.infer<typeof createCreditSchema>["body"];
export type PatchCreditStatusInput = z.infer<typeof patchCreditStatusSchema>["body"];
