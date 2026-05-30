import { Router } from "express";
import { reviewController } from "./review.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createReviewSchema, getReviewsByCustomerSchema } from "./review.dto";

const router = Router();

router.use(authenticate);

router.post("/", validate(createReviewSchema), reviewController.createReview);
router.get("/:customerId", validate(getReviewsByCustomerSchema), reviewController.getReviewsByCustomer);

export default router;
