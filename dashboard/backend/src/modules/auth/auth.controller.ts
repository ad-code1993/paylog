import { Request, Response, NextFunction } from "express";
import { authService, AuthService } from "./auth.service";

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService = authService) {
    this.service = service;
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({
        success: true,
        message: "Shop registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.service.login(req.body);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
