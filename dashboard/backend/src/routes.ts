import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import customerRoutes from "./modules/customer/customer.routes";
import creditRoutes from "./modules/credit/credit.routes";
import reviewRoutes from "./modules/review/review.routes";

const router = Router();

// API Modules registration
router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/credits", creditRoutes);
router.use("/reviews", reviewRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Digital Credit Tracking System MVP API is healthy",
    timestamp: new Date(),
  });
});

export default router;
