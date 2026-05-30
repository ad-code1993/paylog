import { creditRepository, CreditRepository } from "./credit.repository";
import { customerRepository, CustomerRepository } from "../customer/customer.repository";
import { CreateCreditInput, PatchCreditStatusInput } from "./credit.dto";
import { NotFoundError, BadRequestError } from "../../errors/app-error";
import { Credit, CreditStatus } from "@prisma/client";

export class CreditService {
  private repository: CreditRepository;
  private customerRepo: CustomerRepository;

  constructor(
    repository: CreditRepository = creditRepository,
    customerRepo: CustomerRepository = customerRepository
  ) {
    this.repository = repository;
    this.customerRepo = customerRepo;
  }

  async createCredit(shopId: string, input: CreateCreditInput): Promise<Credit> {
    // Verify customer exists and belongs to the shop
    const customer = await this.customerRepo.findCustomerById(shopId, input.customerId);
    if (!customer) {
      throw new NotFoundError("Customer not found under this shop.");
    }

    const dueDate = new Date(input.dueDate);
    return this.repository.createCredit(shopId, input.customerId, input.amount, dueDate);
  }

  async getCredits(shopId: string): Promise<Credit[]> {
    // Lazily update all overdue credits for this shop first
    await this.repository.updateOverdueCredits(shopId);
    return this.repository.findAllCredits(shopId);
  }

  async getCreditById(shopId: string, id: string): Promise<Credit> {
    await this.repository.updateOverdueCredits(shopId);
    const credit = await this.repository.findCreditById(shopId, id);
    if (!credit) {
      throw new NotFoundError("Credit record not found.");
    }
    return credit;
  }

  async updateCreditStatus(
    shopId: string,
    id: string,
    input: PatchCreditStatusInput
  ): Promise<Credit> {
    const credit = await this.repository.findCreditById(shopId, id);
    if (!credit) {
      throw new NotFoundError("Credit record not found.");
    }

    // State transition rules:
    // 1. If credit is already CLOSED, prevent changing its status.
    if (credit.status === CreditStatus.CLOSED) {
      throw new BadRequestError("Cannot change status of a closed credit. It is already settled.");
    }

    // 2. Prevent setting from OVERDUE back to ACTIVE (unsettled) if due date is already past
    if (
      credit.status === CreditStatus.OVERDUE &&
      input.status === CreditStatus.ACTIVE &&
      new Date(credit.dueDate) < new Date()
    ) {
      throw new BadRequestError("Cannot activate an overdue credit whose due date has passed.");
    }

    return this.repository.updateCreditStatus(id, input.status);
  }
}

export const creditService = new CreditService();
