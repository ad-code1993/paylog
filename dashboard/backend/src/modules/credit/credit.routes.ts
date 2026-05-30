import { Router } from "express";
import { creditController } from "./credit.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  createCreditSchema,
  getCreditByIdSchema,
  patchCreditStatusSchema,
} from "./credit.dto";

const router = Router();

router.use(authenticate);

router.post("/", validate(createCreditSchema), creditController.createCredit);
router.get("/", creditController.getCredits);
router.get("/:id", validate(getCreditByIdSchema), creditController.getCreditById);
router.patch("/:id/status", validate(patchCreditStatusSchema), creditController.patchCreditStatus);

export default router;
