import { Request, Response, NextFunction } from "express";
import { reviewService, ReviewService } from "./review.service";
import { UnauthorizedError } from "../../errors/app-error";

export class ReviewController {
  private service: ReviewService;

  constructor(service: ReviewService = reviewService) {
    this.service = service;
  }

  createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;

      const result = await this.service.createReview(shopId, req.body);
      res.status(201).json({
        success: true,
        message: "Review added successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsByCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;
      const { customerId } = req.params;

      const result = await this.service.getReviewsByCustomer(shopId, customerId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const reviewController = new ReviewController();
