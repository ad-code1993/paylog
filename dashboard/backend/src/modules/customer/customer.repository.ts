import prisma from "../../config/prisma";
import { Customer, Credit, Review } from "@prisma/client";
import { CreateCustomerInput } from "./customer.dto";

export type CustomerWithRelations = Customer & {
  credits: Credit[];
  reviews: Review[];
};

export class CustomerRepository {
  async findByPhoneInShop(shopId: string, phone: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: {
        shopId_phone: {
          shopId,
          phone,
        },
      },
    });
  }

  async createCustomer(shopId: string, data: CreateCustomerInput): Promise<Customer> {
    return prisma.customer.create({
      data: {
        shopId,
        name: data.name,
        phone: data.phone,
      },
    });
  }

  async findAllCustomers(shopId: string): Promise<Customer[]> {
    return prisma.customer.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findCustomerById(shopId: string, id: string): Promise<Customer | null> {
    return prisma.customer.findFirst({
      where: {
        id,
        shopId,
      },
    });
  }

  async findAllCustomersWithRelations(shopId: string): Promise<CustomerWithRelations[]> {
    return prisma.customer.findMany({
      where: { shopId },
      include: {
        credits: true,
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findCustomerByIdWithRelations(shopId: string, id: string): Promise<CustomerWithRelations | null> {
    return prisma.customer.findFirst({
      where: {
        id,
        shopId,
      },
      include: {
        credits: {
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }
}

export const customerRepository = new CustomerRepository();
