import { Request, Response, NextFunction } from "express";
import { customerService, CustomerService } from "./customer.service";
import { UnauthorizedError } from "../../errors/app-error";

export class CustomerController {
  private service: CustomerService;

  constructor(service: CustomerService = customerService) {
    this.service = service;
  }

  createCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;
      
      const result = await this.service.createCustomer(shopId, req.body);
      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;

      const result = await this.service.getCustomers(shopId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCustomerById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;
      const { id } = req.params;

      const result = await this.service.getCustomerById(shopId, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const customerController = new CustomerController();
