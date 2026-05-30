import { reviewRepository, ReviewRepository } from "./review.repository";
import { customerRepository, CustomerRepository } from "../customer/customer.repository";
import { CreateReviewInput } from "./review.dto";
import { NotFoundError } from "../../errors/app-error";
import { Review } from "@prisma/client";

export class ReviewService {
  private repository: ReviewRepository;
  private customerRepo: CustomerRepository;

  constructor(
    repository: ReviewRepository = reviewRepository,
    customerRepo: CustomerRepository = customerRepository
  ) {
    this.repository = repository;
    this.customerRepo = customerRepo;
  }

  async createReview(shopId: string, input: CreateReviewInput): Promise<Review> {
    // Verify customer exists and belongs to the shop
    const customer = await this.customerRepo.findCustomerById(shopId, input.customerId);
    if (!customer) {
      throw new NotFoundError("Customer not found under this shop.");
    }

    return this.repository.createReview(
      shopId,
      input.customerId,
      input.rating,
      input.comment
    );
  }

  async getReviewsByCustomer(shopId: string, customerId: string): Promise<Review[]> {
    // Verify customer exists and belongs to the shop
    const customer = await this.customerRepo.findCustomerById(shopId, customerId);
    if (!customer) {
      throw new NotFoundError("Customer not found under this shop.");
    }

    return this.repository.findReviewsByCustomer(shopId, customerId);
  }
}

export const reviewService = new ReviewService();
