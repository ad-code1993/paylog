import { Router } from "express";
import { customerController } from "./customer.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { createCustomerSchema, getCustomerByIdSchema } from "./customer.dto";

const router = Router();

router.use(authenticate);

router.post("/", validate(createCustomerSchema), customerController.createCustomer);
router.get("/", customerController.getCustomers);
router.get("/:id", validate(getCustomerByIdSchema), customerController.getCustomerById);

export default router;
