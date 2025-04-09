import { Router } from "express";
import asyncHandler from "express-async-handler";

import {
  login,
  refreshToken,
  register,
  resetPassword,
  verifyCurrentPassword,
} from "../controllers/auth.controller";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyCurrentPasswordSchema,
} from "../validators/user.validator";
import { validate } from "../middlewares/validate.middlerware";
import { userDetails } from "../controllers/user.controller";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));

router.post("/login", validate(loginSchema), asyncHandler(login));

router.post("/refresh-token", asyncHandler(refreshToken));

router.post(
  "/verify-current-password",
  validate(verifyCurrentPasswordSchema),
  asyncHandler(verifyCurrentPassword)
);

router.patch(
  "/reset-password",
  validate(resetPasswordSchema),
  asyncHandler(resetPassword)
);

router.get("/details", asyncHandler(userDetails));

export default router;
