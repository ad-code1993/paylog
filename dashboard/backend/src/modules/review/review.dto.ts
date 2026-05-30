import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: "Customer ID is required" }).uuid("Invalid customer ID format"),
    rating: z
      .number({ required_error: "Rating is required" })
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),
    comment: z
      .string({ required_error: "Comment is required" })
      .min(3, "Comment must be at least 3 characters"),
  }),
});

export const getReviewsByCustomerSchema = z.object({
  params: z.object({
    customerId: z.string().uuid("Invalid customer ID format"),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
export type GetReviewsByCustomerInput = z.infer<typeof getReviewsByCustomerSchema>["params"];
