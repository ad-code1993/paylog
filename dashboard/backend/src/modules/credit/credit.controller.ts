import { Request, Response, NextFunction } from "express";
import { creditService, CreditService } from "./credit.service";
import { UnauthorizedError } from "../../errors/app-error";

export class CreditController {
  private service: CreditService;

  constructor(service: CreditService = creditService) {
    this.service = service;
  }

  createCredit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;

      const result = await this.service.createCredit(shopId, req.body);
      res.status(201).json({
        success: true,
        message: "Credit entry created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCredits = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;

      const result = await this.service.getCredits(shopId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCreditById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;
      const { id } = req.params;

      const result = await this.service.getCreditById(shopId, id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  patchCreditStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const shopId = req.user.id;
      const { id } = req.params;

      const result = await this.service.updateCreditStatus(shopId, id, req.body);
      res.status(200).json({
        success: true,
        message: "Credit status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const creditController = new CreditController();
