import prisma from "../../config/prisma";
import { Review } from "@prisma/client";

export class ReviewRepository {
  async createReview(
    shopId: string,
    customerId: string,
    rating: number,
    comment: string
  ): Promise<Review> {
    return prisma.review.create({
      data: {
        shopId,
        customerId,
        rating,
        comment,
      },
      include: {
        customer: true,
      },
    });
  }

  async findReviewsByCustomer(shopId: string, customerId: string): Promise<Review[]> {
    return prisma.review.findMany({
      where: {
        shopId,
        customerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();
