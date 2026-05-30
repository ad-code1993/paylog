import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository, AuthRepository } from "./auth.repository";
import { RegisterInput, LoginInput } from "./auth.dto";
import { ConflictError, UnauthorizedError } from "../../errors/app-error";

export class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository = authRepository) {
    this.repository = repository;
  }

  async register(input: RegisterInput) {
    const existingUser = await this.repository.findByPhone(input.phone);
    if (existingUser) {
      throw new ConflictError("A shop user with this phone number already exists.");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const user = await this.repository.createUser({
      name: input.name,
      phone: input.phone,
      password_hash: passwordHash,
    });

    const token = this.generateToken(user.id, user.name, user.phone);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await this.repository.findByPhone(input.phone);
    if (!user) {
      throw new UnauthorizedError("Invalid phone number or password.");
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError("Invalid phone number or password.");
    }

    const token = this.generateToken(user.id, user.name, user.phone);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    };
  }

  private generateToken(id: string, name: string, phone: string): string {
    const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key";
    return jwt.sign({ id, name, phone }, jwtSecret, {
      expiresIn: "7d",
    });
  }
}

export const authService = new AuthService();
