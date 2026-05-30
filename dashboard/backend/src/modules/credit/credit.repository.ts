import prisma from "../../config/prisma";
import { Credit, CreditStatus } from "@prisma/client";

export class CreditRepository {
  async createCredit(
    shopId: string,
    customerId: string,
    amount: number,
    dueDate: Date
  ): Promise<Credit> {
    // Decide initial status: if dueDate is already in the past, start as OVERDUE, else ACTIVE
    const initialStatus = dueDate < new Date() ? CreditStatus.OVERDUE : CreditStatus.ACTIVE;

    return prisma.credit.create({
      data: {
        shopId,
        customerId,
        amount,
        dueDate,
        status: initialStatus,
      },
      include: {
        customer: true,
      },
    });
  }

  async findCreditById(shopId: string, id: string): Promise<Credit | null> {
    return prisma.credit.findFirst({
      where: {
        id,
        shopId,
      },
      include: {
        customer: true,
      },
    });
  }

  async findAllCredits(shopId: string): Promise<Credit[]> {
    return prisma.credit.findMany({
      where: { shopId },
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateCreditStatus(id: string, status: CreditStatus): Promise<Credit> {
    return prisma.credit.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
      },
    });
  }

  async updateOverdueCredits(shopId: string): Promise<number> {
    const result = await prisma.credit.updateMany({
      where: {
        shopId,
        status: CreditStatus.ACTIVE,
        dueDate: {
          lt: new Date(),
        },
      },
      data: {
        status: CreditStatus.OVERDUE,
      },
    });
    return result.count;
  }
}

export const creditRepository = new CreditRepository();
