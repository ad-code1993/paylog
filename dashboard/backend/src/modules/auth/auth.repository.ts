import prisma from "../../config/prisma";
import { User } from "@prisma/client";

export class AuthRepository {
  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: {
    name: string;
    phone: string;
    password_hash: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}
export const authRepository = new AuthRepository();
