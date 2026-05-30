import { customerRepository, CustomerRepository } from "./customer.repository";
import { CreateCustomerInput } from "./customer.dto";
import { ConflictError, NotFoundError } from "../../errors/app-error";
import { reputationService, ReputationService } from "../reputation/reputation.service";

export class CustomerService {
  private repository: CustomerRepository;
  private reputation: ReputationService;

  constructor(
    repository: CustomerRepository = customerRepository,
    reputation: ReputationService = reputationService
  ) {
    this.repository = repository;
    this.reputation = reputation;
  }

  async createCustomer(shopId: string, input: CreateCustomerInput) {
    const existingCustomer = await this.repository.findByPhoneInShop(shopId, input.phone);
    if (existingCustomer) {
      throw new ConflictError("A customer with this phone number already exists in this shop.");
    }

    const customer = await this.repository.createCustomer(shopId, input);
    
    // An initial customer has 100 score and LOW RISK
    const initialReputation = this.reputation.calculateReputation([], []);

    return {
      ...customer,
      reputation: initialReputation,
    };
  }

  async getCustomers(shopId: string) {
    const customers = await this.repository.findAllCustomersWithRelations(shopId);

    return customers.map((customer) => {
      const repProfile = this.reputation.calculateReputation(
        customer.credits,
        customer.reviews
      );

      // Return customer without nesting all raw credits/reviews inside get-all list
      // to keep response light, but include score and risk status
      return {
        id: customer.id,
        shopId: customer.shopId,
        name: customer.name,
        phone: customer.phone,
        createdAt: customer.createdAt,
        reputation: {
          score: repProfile.score,
          riskStatus: repProfile.riskStatus,
          totalOutstandingAmount: repProfile.metrics.totalOutstandingAmount,
        },
      };
    });
  }

  async getCustomerById(shopId: string, id: string) {
    const customer = await this.repository.findCustomerByIdWithRelations(shopId, id);
    if (!customer) {
      throw new NotFoundError("Customer not found.");
    }

    const repProfile = this.reputation.calculateReputation(
      customer.credits,
      customer.reviews
    );

    return {
      id: customer.id,
      shopId: customer.shopId,
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.createdAt,
      reputation: repProfile,
      credits: customer.credits,
      reviews: customer.reviews,
    };
  }
}

export const customerService = new CustomerService();
