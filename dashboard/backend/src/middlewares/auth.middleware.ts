import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/app-error";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is missing or invalid");
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "your-super-secret-jwt-key";

  try {
    const decoded = jwt.verify(token, jwtSecret) as {
      id: string;
      name: string;
      phone: string;
    };

    req.user = {
      id: decoded.id,
      name: decoded.name,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    throw new UnauthorizedError("Authentication token is expired or invalid");
  }
};
