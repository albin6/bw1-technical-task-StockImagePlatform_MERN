import { Router } from "express";
import asyncHandler from "express-async-handler";

import { login, refreshToken, register } from "controllers/auth.controller";
import { loginSchema, registerSchema } from "validators/user.validator";
import { validate } from "middlewares/validate.middlerware";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));

router.post("/login", validate(loginSchema), asyncHandler(login));

router.post("/refresh-token", asyncHandler(refreshToken));

export default router;
