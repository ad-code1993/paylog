import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  // Handle Prisma unique constraint error
  if (err.constructor.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Duplicate entry found. A record with this information already exists.",
        target: prismaErr.meta?.target,
      });
      return;
    }
  }

  // Unexpected errors
  console.error("[Unexpected Error]:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
